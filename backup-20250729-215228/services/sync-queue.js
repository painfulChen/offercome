const { getMongoConnection } = require('../config/db-connection');
const { RAGDocument } = require('../models/RAGDocument');
const logger = require('../utils/logger');
const crypto = require('crypto');

class SyncQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.batchSize = 20;
        this.flushInterval = 5000; // 5秒
        this.lastFlush = Date.now();
        
        // 启动定时刷新
        this.startPeriodicFlush();
    }

    // 添加文档到队列
    add(documentData) {
        try {
            // 计算文档哈希
            const documentHash = this.calculateDocumentHash(documentData);
            
            const queueItem = {
                ...documentData,
                documentHash,
                timestamp: new Date(),
                retryCount: 0
            };
            
            this.queue.push(queueItem);
            logger.info('文档已添加到同步队列', { 
                documentId: documentData.id,
                documentHash,
                queueSize: this.queue.length 
            });
            
            // 如果队列达到批量大小，立即刷新
            if (this.queue.length >= this.batchSize) {
                this.flushBatch();
            }
            
            return true;
        } catch (error) {
            logger.error('添加文档到队列失败', { 
                documentId: documentData.id, 
                error: error.message 
            });
            return false;
        }
    }

    // 计算文档哈希
    calculateDocumentHash(documentData) {
        const content = documentData.content || '';
        const metadata = JSON.stringify(documentData.metadata || {});
        const hashInput = `${content}${metadata}${documentData.fileName || ''}`;
        return crypto.createHash('sha256').update(hashInput).digest('hex');
    }

    // 批量刷新队列
    async flushBatch() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const batch = this.queue.splice(0, this.batchSize);
        
        try {
            logger.info('开始批量同步文档', { 
                batchSize: batch.length,
                totalQueueSize: this.queue.length 
            });
            
            const mongoConn = await getMongoConnection();
            const collection = mongoConn.collection('rag_documents');
            
            // 准备批量操作
            const bulkOps = batch.map(item => ({
                updateOne: {
                    filter: { documentHash: item.documentHash },
                    update: {
                        $set: {
                            documentId: item.id,
                            title: item.fileName || item.url || '未知文档',
                            type: item.type,
                            fileName: item.fileName,
                            filePath: item.filePath,
                            fileSize: item.metadata?.fileSize || 0,
                            mimeType: item.metadata?.mimetype,
                            content: item.content,
                            vectors: item.vectors,
                            vectorDimension: item.vectors?.length || 0,
                            metadata: item.metadata,
                            status: 'active',
                            documentHash: item.documentHash,
                            updatedAt: new Date()
                        },
                        $setOnInsert: {
                            createdAt: new Date()
                        }
                    },
                    upsert: true
                }
            }));
            
            // 执行批量操作
            const result = await collection.bulkWrite(bulkOps, { ordered: false });
            
            logger.info('批量同步完成', {
                inserted: result.insertedCount,
                modified: result.modifiedCount,
                upserted: result.upsertedCount,
                totalProcessed: batch.length
            });
            
            this.lastFlush = Date.now();
            
        } catch (error) {
            logger.error('批量同步失败', { 
                error: error.message,
                batchSize: batch.length 
            });
            
            // 重试失败的文档
            for (const item of batch) {
                if (item.retryCount < 3) {
                    item.retryCount++;
                    this.queue.unshift(item);
                    logger.info('文档重新加入队列', { 
                        documentId: item.id, 
                        retryCount: item.retryCount 
                    });
                } else {
                    logger.error('文档同步最终失败', { 
                        documentId: item.id, 
                        retryCount: item.retryCount 
                    });
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // 启动定时刷新
    startPeriodicFlush() {
        setInterval(() => {
            const timeSinceLastFlush = Date.now() - this.lastFlush;
            if (timeSinceLastFlush >= this.flushInterval && this.queue.length > 0) {
                this.flushBatch();
            }
        }, this.flushInterval);
    }

    // 强制刷新所有队列
    async flushAll() {
        logger.info('强制刷新所有队列', { queueSize: this.queue.length });
        while (this.queue.length > 0) {
            await this.flushBatch();
        }
    }

    // 获取队列状态
    getStatus() {
        return {
            queueSize: this.queue.length,
            isProcessing: this.isProcessing,
            lastFlush: this.lastFlush,
            batchSize: this.batchSize,
            flushInterval: this.flushInterval
        };
    }

    // 清空队列
    clear() {
        const clearedCount = this.queue.length;
        this.queue = [];
        logger.info('队列已清空', { clearedCount });
        return clearedCount;
    }
}

// 创建全局单例
const syncQueue = new SyncQueue();

module.exports = {
    syncQueue,
    addToQueue: (doc) => syncQueue.add(doc),
    flushQueue: () => syncQueue.flushAll(),
    getQueueStatus: () => syncQueue.getStatus(),
    clearQueue: () => syncQueue.clear()
}; 