const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const RAGService = require('../services/rag-service');

const router = express.Router();
const ragService = new RAGService();

// 配置文件上传
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB限制
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/markdown'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'));
        }
    }
});

// 上传本地文件
router.post('/upload/local', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '没有上传文件'
            });
        }

        const metadata = {
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedBy: req.user?.id || 'anonymous',
            category: req.body.category || 'general',
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        };

        const result = await ragService.processLocalFile(req.file.path, metadata);

        if (result.success) {
            // 强制同步到数据库
            try {
                const documentData = ragService.documentStore.get(result.documentId);
                if (documentData) {
                    await ragService.syncToDatabase(documentData);
                    console.log(`✅ 文档上传后同步成功: ${result.documentId}`);
                }
            } catch (syncError) {
                console.error(`❌ 文档上传后同步失败: ${result.documentId} - ${syncError.message}`);
                // 不阻止上传成功，但记录错误
            }
            
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                file: {
                    originalName: req.file.originalname,
                    size: req.file.size,
                    path: req.file.path
                }
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 处理飞书文档
router.post('/upload/feishu-document', async (req, res) => {
    try {
        const { feishuUrl, category, tags, description } = req.body;

        if (!feishuUrl) {
            return res.status(400).json({
                success: false,
                error: '飞书文档链接不能为空'
            });
        }

        const metadata = {
            uploadedBy: req.user?.id || 'anonymous',
            category: category || 'feishu_document',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            description: description || ''
        };

        const result = await ragService.processFeishuDocument(feishuUrl, metadata);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                url: feishuUrl
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('飞书文档处理失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 处理飞书表格
router.post('/upload/feishu-spreadsheet', async (req, res) => {
    try {
        const { feishuUrl, category, tags, description } = req.body;

        if (!feishuUrl) {
            return res.status(400).json({
                success: false,
                error: '飞书表格链接不能为空'
            });
        }

        const metadata = {
            uploadedBy: req.user?.id || 'anonymous',
            category: category || 'feishu_spreadsheet',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            description: description || ''
        };

        const result = await ragService.processFeishuSpreadsheet(feishuUrl, metadata);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                url: feishuUrl
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('飞书表格处理失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 批量上传本地文件
router.post('/upload/batch', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: '没有上传文件'
            });
        }

        const results = [];
        const category = req.body.category || 'batch_upload';
        const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];

        for (const file of req.files) {
            const metadata = {
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                uploadedBy: req.user?.id || 'anonymous',
                category: category,
                tags: tags
            };

            const result = await ragService.processLocalFile(file.path, metadata);
            results.push({
                originalName: file.originalname,
                success: result.success,
                documentId: result.documentId,
                message: result.message,
                error: result.error
            });
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        res.json({
            success: true,
            message: `批量上传完成，成功: ${successCount}，失败: ${failCount}`,
            results: results,
            summary: {
                total: results.length,
                success: successCount,
                failed: failCount
            }
        });
    } catch (error) {
        console.error('批量上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 搜索文档
router.post('/search', async (req, res) => {
    try {
        const { query, limit = 5, category, tags } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: '搜索查询不能为空'
            });
        }

        const result = await ragService.searchDocuments(query, limit);

        if (result.success) {
            // 如果指定了分类或标签，进行过滤
            let filteredResults = result.results;
            if (category || tags) {
                filteredResults = result.results.filter(doc => {
                    const docMetadata = doc.metadata;
                    const categoryMatch = !category || docMetadata.category === category;
                    const tagsMatch = !tags || tags.some(tag => docMetadata.tags && docMetadata.tags.includes(tag));
                    return categoryMatch && tagsMatch;
                });
            }

            res.json({
                success: true,
                query: query,
                results: filteredResults,
                aiAnalysis: result.aiAnalysis,
                totalFound: filteredResults.length
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('文档搜索失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取所有文档列表
router.get('/documents', async (req, res) => {
    try {
        const { category, tags, page = 1, limit = 20 } = req.query;
        
        let documents = await ragService.getAllDocuments();

        // 过滤
        if (category) {
            documents = documents.filter(doc => doc.metadata?.category === category);
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            documents = documents.filter(doc => 
                doc.metadata?.tags && tagArray.some(tag => doc.metadata.tags.includes(tag))
            );
        }

        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedDocuments = documents.slice(startIndex, endIndex);

        res.json({
            success: true,
            documents: paginatedDocuments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length,
                totalPages: Math.ceil(documents.length / limit)
            }
        });
    } catch (error) {
        console.error('获取文档列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 强制同步内存文档到数据库
router.post('/sync-to-db', async (req, res) => {
    try {
        console.log('🔄 开始强制同步内存文档到数据库...');
        
        // 获取内存中的所有文档
        const documents = Array.from(ragService.documentStore.values());
        console.log(`📄 找到 ${documents.length} 个内存文档`);
        
        let syncedCount = 0;
        let failedCount = 0;
        const results = [];
        
        // 逐个同步到数据库
        for (const doc of documents) {
            try {
                await ragService.syncToDatabase(doc);
                syncedCount++;
                results.push({
                    documentId: doc.id,
                    fileName: doc.fileName,
                    status: 'success'
                });
                console.log(`✅ 同步成功: ${doc.fileName}`);
            } catch (error) {
                failedCount++;
                results.push({
                    documentId: doc.id,
                    fileName: doc.fileName,
                    status: 'failed',
                    error: error.message
                });
                console.error(`❌ 同步失败: ${doc.fileName} - ${error.message}`);
            }
        }
        
        console.log(`🎉 同步完成: 成功 ${syncedCount} 个，失败 ${failedCount} 个`);
        
        res.json({
            status: 'ok',
            message: `同步完成：成功 ${syncedCount} 个，失败 ${failedCount} 个`,
            syncedCount,
            failedCount,
            totalCount: documents.length,
            results
        });
        
    } catch (error) {
        console.error('强制同步失败:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 重置数据库连接
router.post('/reset-db-connection', async (req, res) => {
    try {
        console.log('🔄 开始重置数据库连接...');
        
        // 重新初始化数据库连接
        await ragService.initializeDatabase();
        
        // 检查连接状态
        const dbConnected = await ragService.ensureDatabaseConnection();
        
        console.log(`📊 数据库连接状态: ${dbConnected ? '已连接' : '未连接'}`);
        
        res.json({
            status: 'ok',
            message: '数据库连接已重置',
            dbConnected,
            documentStoreSize: ragService.documentStore.size,
            vectorStoreSize: ragService.vectorStore.size
        });
        
    } catch (error) {
        console.error('重置数据库连接失败:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 获取文档详情
router.get('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const documents = ragService.getAllDocuments();
        const document = documents.find(doc => doc.id === documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: '文档不存在'
            });
        }

        res.json({
            success: true,
            document: document
        });
    } catch (error) {
        console.error('获取文档详情失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除文档
router.delete('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const deleted = ragService.deleteDocument(documentId);

        if (deleted) {
            res.json({
                success: true,
                message: '文档删除成功'
            });
        } else {
            res.status(404).json({
                success: false,
                error: '文档不存在'
            });
        }
    } catch (error) {
        console.error('删除文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取文档统计信息
router.get('/stats', async (req, res) => {
    try {
        const stats = ragService.getDocumentStats();
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取支持的文档类型
router.get('/supported-types', async (req, res) => {
    try {
        const supportedTypes = {
            images: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
            documents: ['.pdf', '.doc', '.docx'],
            text: ['.txt', '.md'],
            feishu: ['飞书文档', '飞书表格']
        };

        res.json({
            success: true,
            supportedTypes: supportedTypes
        });
    } catch (error) {
        console.error('获取支持类型失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 测试RAG服务状态
router.get('/health', async (req, res) => {
    try {
        const stats = ragService.getDocumentStats();
        res.json({
            success: true,
            status: 'healthy',
            stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('健康检查失败:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router; 