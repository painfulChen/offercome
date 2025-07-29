const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ragManager } = require('../services/rag-manager');

const router = express.Router();

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

// 学生文档上传
router.post('/student/:studentId/upload', upload.single('file'), async (req, res) => {
    try {
        const { studentId } = req.params;
        
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
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            serviceType: req.body.serviceType || 'general',
            moduleId: req.body.moduleId || 'general',
            studentName: req.body.studentName || `学生${studentId}`
        };

        const result = await ragManager.processStudentDocument(studentId, req.file.path, metadata);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                studentId: studentId,
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
        console.error('学生文档上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 模块文档上传
router.post('/module/:moduleId/upload', upload.single('file'), async (req, res) => {
    try {
        const { moduleId } = req.params;
        
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
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            serviceType: req.body.serviceType || 'general',
            studentId: req.body.studentId || 'system',
            moduleName: req.body.moduleName || `模块${moduleId}`
        };

        const result = await ragManager.processModuleDocument(moduleId, req.file.path, metadata);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                moduleId: moduleId,
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
        console.error('模块文档上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 学生模块组合文档上传
router.post('/student/:studentId/module/:moduleId/upload', upload.single('file'), async (req, res) => {
    try {
        const { studentId, moduleId } = req.params;
        
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
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            serviceType: req.body.serviceType || 'general',
            studentName: req.body.studentName || `学生${studentId}`,
            moduleName: req.body.moduleName || `模块${moduleId}`
        };

        const result = await ragManager.processStudentModuleDocument(studentId, moduleId, req.file.path, metadata);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                documentId: result.documentId,
                studentId: studentId,
                moduleId: moduleId,
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
        console.error('学生模块文档上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 搜索学生文档
router.post('/student/:studentId/search', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { query, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: '搜索查询不能为空'
            });
        }

        const result = await ragManager.searchStudentDocuments(studentId, query, limit);

        res.json({
            success: true,
            studentId: studentId,
            query: query,
            results: result.results || [],
            totalFound: result.results ? result.results.length : 0
        });
    } catch (error) {
        console.error('搜索学生文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 搜索模块文档
router.post('/module/:moduleId/search', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { query, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: '搜索查询不能为空'
            });
        }

        const result = await ragManager.searchModuleDocuments(moduleId, query, limit);

        res.json({
            success: true,
            moduleId: moduleId,
            query: query,
            results: result.results || [],
            totalFound: result.results ? result.results.length : 0
        });
    } catch (error) {
        console.error('搜索模块文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 搜索学生模块组合文档
router.post('/student/:studentId/module/:moduleId/search', async (req, res) => {
    try {
        const { studentId, moduleId } = req.params;
        const { query, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: '搜索查询不能为空'
            });
        }

        const result = await ragManager.searchStudentModuleDocuments(studentId, moduleId, query, limit);

        res.json({
            success: true,
            studentId: studentId,
            moduleId: moduleId,
            query: query,
            results: result.results || [],
            totalFound: result.results ? result.results.length : 0
        });
    } catch (error) {
        console.error('搜索学生模块文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取学生所有文档
router.get('/student/:studentId/documents', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const documents = await ragManager.getStudentDocuments(studentId);
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedDocuments = documents.slice(startIndex, endIndex);

        res.json({
            success: true,
            studentId: studentId,
            documents: paginatedDocuments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length,
                totalPages: Math.ceil(documents.length / limit)
            }
        });
    } catch (error) {
        console.error('获取学生文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取模块所有文档
router.get('/module/:moduleId/documents', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const documents = await ragManager.getModuleDocuments(moduleId);
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedDocuments = documents.slice(startIndex, endIndex);

        res.json({
            success: true,
            moduleId: moduleId,
            documents: paginatedDocuments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length,
                totalPages: Math.ceil(documents.length / limit)
            }
        });
    } catch (error) {
        console.error('获取模块文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取学生模块组合所有文档
router.get('/student/:studentId/module/:moduleId/documents', async (req, res) => {
    try {
        const { studentId, moduleId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const documents = await ragManager.getStudentModuleDocuments(studentId, moduleId);
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedDocuments = documents.slice(startIndex, endIndex);

        res.json({
            success: true,
            studentId: studentId,
            moduleId: moduleId,
            documents: paginatedDocuments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: documents.length,
                totalPages: Math.ceil(documents.length / limit)
            }
        });
    } catch (error) {
        console.error('获取学生模块文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取学生统计信息
router.get('/student/:studentId/stats', async (req, res) => {
    try {
        const { studentId } = req.params;
        const stats = await ragManager.getStudentStats(studentId);
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('获取学生统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取模块统计信息
router.get('/module/:moduleId/stats', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const stats = await ragManager.getModuleStats(moduleId);
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('获取模块统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取所有学生列表
router.get('/students', async (req, res) => {
    try {
        const students = await ragManager.getAllStudents();
        
        res.json({
            success: true,
            students: students
        });
    } catch (error) {
        console.error('获取所有学生列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取所有模块列表
router.get('/modules', async (req, res) => {
    try {
        const modules = await ragManager.getAllModules();
        
        res.json({
            success: true,
            modules: modules
        });
    } catch (error) {
        console.error('获取所有模块列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取所有服务类型列表
router.get('/service-types', async (req, res) => {
    try {
        const serviceTypes = await ragManager.getAllServiceTypes();
        
        res.json({
            success: true,
            serviceTypes: serviceTypes
        });
    } catch (error) {
        console.error('获取所有服务类型列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取管理器状态
router.get('/status', async (req, res) => {
    try {
        const status = await ragManager.getManagerStatus();
        
        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        console.error('获取管理器状态失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 