const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { RAGDocument } = require('../models/RAGDocument');
const { getMongoConnection, healthCheck: dbHealthCheck } = require('../config/db-connection');
const { addToQueue, getQueueStatus } = require('./sync-queue');

class RAGService {
    constructor() {
        this.kimiApiKey = process.env.KIMI_API_KEY;
        this.kimiApiUrl = 'https://kimi.moonshot.cn/api/chat-messages';
        this.vectorStore = new Map(); // 简单的内存向量存储，生产环境建议使用专业的向量数据库
        this.documentStore = new Map(); // 文档元数据存储
        this.dbConnected = false; // 添加数据库连接状态
        
        this.initializeDatabase();
        
        logger.info('RAG服务初始化完成', {
            hasApiKey: !!this.kimiApiKey,
            vectorStoreSize: this.vectorStore.size,
            documentStoreSize: this.documentStore.size,
            dbConnected: this.dbConnected
        });
    }

    // 初始化数据库连接
    async initializeDatabase() {
        try {
            // 测试数据库连接
            const health = await dbHealthCheck();
            if (health.status === 'healthy') {
                this.dbConnected = true; // 设置连接状态
                // 从数据库加载现有文档到内存
                await this.loadDocumentsFromDatabase();
                logger.info('数据库连接成功，已加载现有文档');
            } else {
                this.dbConnected = false; // 设置连接状态
                logger.warn('数据库连接失败，将使用内存存储', { health });
            }
        } catch (error) {
            this.dbConnected = false; // 设置连接状态
            logger.error('数据库初始化失败', { error: error.message });
        }
    }

    // 确保数据库连接
    async ensureDatabaseConnection() {
        try {
            // 如果已经连接，直接返回
            if (this.dbConnected) {
                const health = await dbHealthCheck();
                if (health.status === 'healthy') {
                    return true;
                } else {
                    this.dbConnected = false;
                }
            }
            
            // 重新尝试连接
            const health = await dbHealthCheck();
            if (health.status === 'healthy') {
                this.dbConnected = true;
                return true;
            } else {
                this.dbConnected = false;
                logger.warn('数据库连接不健康', { health });
                return false;
            }
        } catch (error) {
            this.dbConnected = false;
            logger.error('确保数据库连接失败', { error: error.message });
            return false;
        }
    }

    // 从数据库加载文档到内存
    async loadDocumentsFromDatabase() {
        try {
            const documents = await RAGDocument.find({ status: 'active' });
            
            for (const doc of documents) {
                this.documentStore.set(doc.documentId, {
                    id: doc.documentId,
                    type: doc.type,
                    fileName: doc.fileName,
                    filePath: doc.filePath,
                    content: doc.content,
                    metadata: doc.metadata,
                    vectors: doc.vectors
                });
                
                this.vectorStore.set(doc.documentId, doc.vectors);
            }
            
            logger.info('从数据库加载文档完成', { count: documents.length });
        } catch (error) {
            logger.error('从数据库加载文档失败', { error: error.message });
        }
    }

    // 文档类型检测
    detectDocumentType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
        const docExts = ['.pdf', '.doc', '.docx'];
        const textExts = ['.txt', '.md'];
        
        if (imageExts.includes(ext)) return 'image';
        if (docExts.includes(ext)) return 'document';
        if (textExts.includes(ext)) return 'text';
        return 'unknown';
    }

    // 处理飞书文档
    async processFeishuDocument(feishuUrl, metadata = {}) {
        try {
            logger.ragLog('process_feishu_document_start', { feishuUrl, metadata });
            
            const prompt = `请解析这个飞书文档的内容，提取所有有用的信息，包括：
1. 文档标题和主要章节
2. 关键内容和要点
3. 数据表格内容
4. 重要知识点和技巧
5. 求职相关的建议和指导

请以结构化的方式输出，便于后续检索和使用。

文档链接：${feishuUrl}`;

            const response = await this.callKimiAPI(prompt);
            
            const documentId = uuidv4();
            const documentData = {
                id: documentId,
                type: 'feishu',
                url: feishuUrl,
                content: response.content,
                metadata: {
                    ...metadata,
                    processedAt: new Date().toISOString(),
                    source: 'feishu'
                },
                vectors: await this.generateVectors(response.content)
            };

            this.documentStore.set(documentId, documentData);
            this.vectorStore.set(documentId, documentData.vectors);

            // 同步到数据库
            await this.syncToDatabase(documentData);

            logger.ragLog('process_feishu_document_success', { documentId, feishuUrl }, { success: true });
            
            return {
                success: true,
                documentId,
                message: '飞书文档处理成功'
            };
        } catch (error) {
            logger.error('处理飞书文档失败', { feishuUrl, error: error.message, stack: error.stack });
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 处理飞书表格
    async processFeishuSpreadsheet(feishuUrl, metadata = {}) {
        try {
            const prompt = `请解析这个飞书表格的内容，提取所有数据和分析：

1. 表格结构和列名
2. 所有行数据内容
3. 数据统计和分析
4. 关键指标和趋势
5. 求职相关的数据洞察

请以结构化的JSON格式输出，包含表格数据和相关分析。

表格链接：${feishuUrl}`;

            const response = await this.callKimiAPI(prompt);
            
            const documentId = uuidv4();
            const documentData = {
                id: documentId,
                type: 'feishu_spreadsheet',
                url: feishuUrl,
                content: response.content,
                metadata: {
                    ...metadata,
                    processedAt: new Date().toISOString(),
                    source: 'feishu_spreadsheet'
                },
                vectors: await this.generateVectors(response.content)
            };

            this.documentStore.set(documentId, documentData);
            this.vectorStore.set(documentId, documentData.vectors);

            return {
                success: true,
                documentId,
                message: '飞书表格处理成功'
            };
        } catch (error) {
            console.error('处理飞书表格失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 处理本地文件
    async processLocalFile(filePath, metadata = {}) {
        try {
            logger.ragLog('process_local_file_start', { filePath, metadata });
            
            const documentType = this.detectDocumentType(filePath);
            const fileName = path.basename(filePath);
            
            logger.ragLog('file_detected', { fileName, documentType });
            
            let content = '';
            let prompt = '';

            if (documentType === 'image') {
                // 处理图片文件
                const imageBuffer = await fs.readFile(filePath);
                const base64Image = imageBuffer.toString('base64');
                
                prompt = `请分析这张图片的内容，提取所有有用的信息：

1. 图片中的文字内容
2. 图表和数据信息
3. 求职相关的建议和指导
4. 重要知识点和技巧
5. 可操作的建议

请以结构化的方式输出分析结果。

图片文件名：${fileName}`;

                content = await this.callKimiAPIWithImage(prompt, base64Image);
            } else if (documentType === 'document') {
                // 处理PDF和Word文档
                const fileBuffer = await fs.readFile(filePath);
                const base64File = fileBuffer.toString('base64');
                
                prompt = `请解析这个文档的内容，提取所有有用的信息：

1. 文档标题和结构
2. 主要内容和要点
3. 求职相关的建议和指导
4. 重要知识点和技巧
5. 可操作的建议

请以结构化的方式输出分析结果。

文档文件名：${fileName}`;

                content = await this.callKimiAPIWithFile(prompt, base64File, fileName);
            } else if (documentType === 'text') {
                // 处理文本文件
                content = await fs.readFile(filePath, 'utf-8');
            } else {
                throw new Error(`不支持的文件类型: ${documentType}`);
            }

            const documentId = uuidv4();
            const documentData = {
                id: documentId,
                type: documentType,
                filePath,
                fileName,
                content,
                metadata: {
                    ...metadata,
                    processedAt: new Date().toISOString(),
                    source: 'local_file',
                    fileType: documentType
                },
                vectors: await this.generateVectors(content)
            };

            this.documentStore.set(documentId, documentData);
            this.vectorStore.set(documentId, documentData.vectors);

            // 同步到数据库
            await this.syncToDatabase(documentData);

            logger.ragLog('process_local_file_success', { documentId, fileName, documentType }, { success: true });
            
            return {
                success: true,
                documentId,
                message: '本地文件处理成功'
            };
        } catch (error) {
            logger.error('处理本地文件失败', { filePath, error: error.message, stack: error.stack });
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 调用Kimi API
    async callKimiAPI(prompt) {
        try {
            const response = await axios.post(this.kimiApiUrl, {
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                model: 'moonshot-v1-8k',
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                content: response.data.choices[0].message.content
            };
        } catch (error) {
            console.error('Kimi API调用失败:', error);
            throw new Error(`Kimi API调用失败: ${error.message}`);
        }
    }

    // 调用Kimi API处理图片
    async callKimiAPIWithImage(prompt, base64Image) {
        try {
            const response = await axios.post(this.kimiApiUrl, {
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`
                            }
                        }
                    ]
                }],
                model: 'moonshot-v1-8k',
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Kimi API图片处理失败:', error);
            throw new Error(`Kimi API图片处理失败: ${error.message}`);
        }
    }

    // 调用Kimi API处理文件
    async callKimiAPIWithFile(prompt, base64File, fileName) {
        try {
            const response = await axios.post(this.kimiApiUrl, {
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'file',
                            file: {
                                url: `data:application/octet-stream;base64,${base64File}`,
                                filename: fileName
                            }
                        }
                    ]
                }],
                model: 'moonshot-v1-8k',
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Kimi API文件处理失败:', error);
            throw new Error(`Kimi API文件处理失败: ${error.message}`);
        }
    }

    // 生成文档向量（简化版本，实际应该使用专业的向量化模型）
    async generateVectors(content) {
        // 这里使用简单的文本分块和哈希作为向量表示
        // 生产环境建议使用专业的向量化模型如OpenAI Embeddings
        const chunks = this.chunkText(content, 1000);
        return chunks.map(chunk => ({
            text: chunk,
            hash: this.simpleHash(chunk)
        }));
    }

    // 文本分块
    chunkText(text, maxLength) {
        const sentences = text.split(/[。！？.!?]/).filter(s => s.trim());
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence + '。';
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    // 简单哈希函数
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash;
    }

    // 语义检索
    async searchDocuments(query, limit = 5) {
        try {
            logger.ragLog('search_documents_start', { query, limit });
            
            // 使用Kimi进行语义检索
            const prompt = `请根据以下查询，从我的知识库中找到最相关的信息：

查询：${query}

请返回最相关的5个文档片段，每个片段包含：
1. 文档标题或来源
2. 相关内容的摘要
3. 与查询的相关性说明
4. 可操作的建议

请以结构化的方式输出结果。`;

            const response = await this.callKimiAPI(prompt);
            
            // 从本地存储中检索相关文档
            const relevantDocs = this.findRelevantDocuments(query);
            
            logger.ragLog('search_documents_success', { query, limit }, { 
                totalFound: relevantDocs.length, 
                returnedCount: Math.min(relevantDocs.length, limit) 
            });
            
            return {
                success: true,
                query,
                results: relevantDocs.slice(0, limit),
                aiAnalysis: response.content
            };
        } catch (error) {
            logger.error('文档检索失败', { query, error: error.message, stack: error.stack });
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 查找相关文档
    findRelevantDocuments(query) {
        const results = [];
        
        for (const [docId, docData] of this.documentStore) {
            const relevance = this.calculateRelevance(query, docData.content);
            if (relevance > 0.1) { // 相关性阈值
                results.push({
                    documentId: docId,
                    title: docData.fileName || docData.url || '未知文档',
                    content: docData.content.substring(0, 500) + '...',
                    relevance,
                    metadata: docData.metadata
                });
            }
        }

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    // 计算相关性（简化版本）
    calculateRelevance(query, content) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        
        let matchCount = 0;
        for (const word of queryWords) {
            if (contentWords.includes(word)) {
                matchCount++;
            }
        }
        
        return matchCount / queryWords.length;
    }

    // 获取所有文档列表
    async getAllDocuments() {
        try {
            // 确保数据库连接
            const dbConnected = await this.ensureDatabaseConnection();
            
            logger.info('获取文档列表，数据库连接状态:', { dbConnected });
            
            if (dbConnected) {
                // 优先从数据库获取
                const mongoConn = await getMongoConnection();
                const collection = mongoConn.collection('rag_documents');
                const dbDocuments = await collection.find({ status: 'active' }).toArray();
                
                logger.info('从数据库查询到文档', { count: dbDocuments.length });
                
                const documents = dbDocuments.map(doc => ({
                    id: doc.documentId,
                    title: doc.fileName || doc.title || '未知文档',
                    type: doc.type,
                    content: doc.content,
                    metadata: doc.metadata,
                    contentLength: doc.content?.length || 0
                }));
                
                // 同时更新内存存储
                for (const doc of documents) {
                    this.documentStore.set(doc.id, {
                        id: doc.id,
                        fileName: doc.title,
                        type: doc.type,
                        content: doc.content,
                        metadata: doc.metadata
                    });
                }
                
                logger.info('从数据库加载文档', { count: documents.length });
                return documents;
            } else {
                // 如果数据库未连接，从内存获取
                const documents = [];
                for (const [docId, docData] of this.documentStore) {
                    documents.push({
                        id: docId,
                        title: docData.fileName || docData.url || '未知文档',
                        type: docData.type,
                        content: docData.content,
                        metadata: docData.metadata,
                        contentLength: docData.content?.length || 0
                    });
                }
                logger.info('从内存加载文档', { count: documents.length });
                return documents;
            }
        } catch (error) {
            logger.error('获取文档列表失败', { error: error.message, stack: error.stack });
            // 出错时从内存获取
            const documents = [];
            for (const [docId, docData] of this.documentStore) {
                documents.push({
                    id: docId,
                    title: docData.fileName || docData.url || '未知文档',
                    type: docData.type,
                    content: docData.content,
                    metadata: docData.metadata,
                    contentLength: docData.content?.length || 0
                });
            }
            return documents;
        }
    }

    // 删除文档
    async deleteDocument(documentId) {
        const deleted = this.documentStore.delete(documentId);
        this.vectorStore.delete(documentId);
        
        // 从数据库删除
        await this.deleteFromDatabase(documentId);
        
        return deleted;
    }

    // 同步文档到数据库
    async syncToDatabase(documentData) {
        try {
            logger.info('开始同步文档到数据库', { 
                documentId: documentData.id,
                fileName: documentData.fileName,
                type: documentData.type
            });
            
            // 确保数据库连接
            const dbConnected = await this.ensureDatabaseConnection();
            if (!dbConnected) {
                throw new Error('数据库连接失败，无法同步文档');
            }
            
            // 准备文档数据
            const docData = {
                documentId: documentData.id,
                title: documentData.fileName || documentData.url || '未知文档',
                type: documentData.type,
                fileName: documentData.fileName,
                filePath: documentData.filePath,
                fileSize: documentData.metadata?.fileSize || 0,
                mimeType: documentData.metadata?.mimetype,
                content: documentData.content,
                vectors: documentData.vectors,
                vectorDimension: documentData.vectors?.length || 0,
                metadata: documentData.metadata,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            // 直接保存到数据库
            const result = await RAGDocument.findOneAndUpdate(
                { documentId: documentData.id },
                docData,
                { upsert: true, new: true }
            );
            
            if (!result) {
                throw new Error('文档保存失败，未返回结果');
            }
            
            logger.info('文档同步成功', { 
                documentId: documentData.id,
                resultId: result._id,
                fileName: documentData.fileName
            });
            
            // 同时添加到同步队列作为备份
            const success = addToQueue(documentData);
            if (success) {
                logger.info('文档已添加到同步队列作为备份', { 
                    documentId: documentData.id,
                    queueStatus: getQueueStatus()
                });
            }
            
        } catch (error) {
            logger.error('同步到数据库失败', { 
                documentId: documentData.id, 
                error: error.message,
                stack: error.stack,
                documentData: {
                    fileName: documentData.fileName,
                    type: documentData.type,
                    contentLength: documentData.content?.length || 0
                }
            });
            throw error; // 重新抛出错误，让调用者知道失败
        }
    }

    // 从数据库删除文档
    async deleteFromDatabase(documentId) {
        if (!this.dbConnected) {
            logger.warn('数据库未连接，跳过删除', { documentId });
            return;
        }

        try {
            await RAGDocument.findOneAndUpdate(
                { documentId: documentId },
                { status: 'inactive' }
            );

            logger.ragLog('delete_from_database_success', { documentId });
        } catch (error) {
            logger.error('从数据库删除失败', { 
                documentId, 
                error: error.message 
            });
        }
    }

    // 获取文档统计信息
    async getDocumentStats() {
        try {
            if (this.dbConnected) {
                // 从数据库获取统计信息
                const stats = await RAGDocument.getStats();
                const dbStats = stats[0] || {
                    totalDocuments: 0,
                    totalSize: 0,
                    avgContentLength: 0,
                    categories: [],
                    types: []
                };

                return {
                    totalDocuments: dbStats.totalDocuments,
                    totalSize: dbStats.totalSize || 0,
                    avgContentLength: Math.round(dbStats.avgContentLength || 0),
                    categories: dbStats.categories || [],
                    types: dbStats.types || [],
                    lastUpdate: new Date().toISOString(),
                    dbConnected: true
                };
            } else {
                // 从内存获取统计信息
                const totalDocuments = this.documentStore.size;
                const totalSize = Array.from(this.documentStore.values()).reduce((sum, doc) => {
                    return sum + (doc.metadata?.fileSize || 0);
                }, 0);
                
                const categories = new Set();
                const types = new Set();
                
                for (const doc of this.documentStore.values()) {
                    if (doc.metadata?.category) {
                        categories.add(doc.metadata.category);
                    }
                    if (doc.type) {
                        types.add(doc.type);
                    }
                }
                
                return {
                    totalDocuments,
                    totalSize,
                    categories: Array.from(categories),
                    types: Array.from(types),
                    lastUpdate: new Date().toISOString(),
                    dbConnected: false
                };
            }
        } catch (error) {
            logger.error('获取文档统计信息失败', { error: error.message });
            return {
                totalDocuments: 0,
                totalSize: 0,
                categories: [],
                types: [],
                lastUpdate: new Date().toISOString(),
                dbConnected: false,
                error: error.message
            };
        }
    }

    // 根据ID获取文档详情
    async getDocumentById(documentId) {
        try {
            // 优先从内存获取
            const doc = this.documentStore.get(documentId);
            if (doc) {
                return {
                    id: doc.id,
                    title: doc.fileName,
                    type: doc.type,
                    content: doc.content,
                    contentLength: doc.content?.length || 0,
                    metadata: doc.metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
            
            // 如果内存中没有，且数据库已连接，则从数据库获取
            if (this.dbConnected) {
                const dbDoc = await RAGDocument.findOne({ 
                    documentId: documentId, 
                    status: 'active' 
                });
                
                if (dbDoc) {
                    return {
                        id: dbDoc.documentId,
                        title: dbDoc.fileName,
                        type: dbDoc.type,
                        content: dbDoc.content,
                        contentLength: dbDoc.content?.length || 0,
                        metadata: dbDoc.metadata,
                        createdAt: dbDoc.createdAt,
                        updatedAt: dbDoc.updatedAt
                    };
                }
            }
            
            return null;
        } catch (error) {
            logger.error('获取文档详情失败', { documentId, error: error.message });
            return null;
        }
    }

    // 获取日志
    async getLogs(level = 'all') {
        try {
            // 这里可以实现从数据库或文件系统获取日志
            // 暂时返回模拟日志
            const logs = [
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'RAG系统运行正常',
                    data: { uptime: process.uptime() }
                },
                {
                    timestamp: new Date(Date.now() - 60000),
                    level: 'info',
                    message: '文档处理完成',
                    data: { documentId: 'test-doc-1', type: 'text' }
                }
            ];
            
            if (level !== 'all') {
                return logs.filter(log => log.level === level);
            }
            
            return logs;
        } catch (error) {
            logger.error('获取日志失败', { error: error.message });
            return [];
        }
    }

    // 清理日志
    async clearLogs() {
        try {
            // 这里可以实现清理日志的逻辑
            logger.info('日志清理完成');
            return true;
        } catch (error) {
            logger.error('清理日志失败', { error: error.message });
            return false;
        }
    }
}

module.exports = RAGService; 