const RAGService = require('./rag-service');
const { RAGDocument } = require('../models/RAGDocument');
const logger = require('../utils/logger');

class RAGManager {
    constructor() {
        this.ragServices = new Map(); // 存储不同学生和模块的RAG服务实例
        this.serviceCache = new Map(); // 缓存服务实例
        this.defaultService = new RAGService(); // 默认服务实例
        
        logger.info('RAG管理器初始化完成');
    }

    // 获取或创建学生特定的RAG服务
    getStudentRAGService(studentId) {
        const key = `student_${studentId}`;
        if (!this.ragServices.has(key)) {
            const service = new RAGService();
            service.studentId = studentId;
            this.ragServices.set(key, service);
            logger.info('创建学生RAG服务', { studentId });
        }
        return this.ragServices.get(key);
    }

    // 获取或创建模块特定的RAG服务
    getModuleRAGService(moduleId) {
        const key = `module_${moduleId}`;
        if (!this.ragServices.has(key)) {
            const service = new RAGService();
            service.moduleId = moduleId;
            this.ragServices.set(key, service);
            logger.info('创建模块RAG服务', { moduleId });
        }
        return this.ragServices.get(key);
    }

    // 获取或创建学生和模块组合的RAG服务
    getStudentModuleRAGService(studentId, moduleId) {
        const key = `student_${studentId}_module_${moduleId}`;
        if (!this.ragServices.has(key)) {
            const service = new RAGService();
            service.studentId = studentId;
            service.moduleId = moduleId;
            this.ragServices.set(key, service);
            logger.info('创建学生模块RAG服务', { studentId, moduleId });
        }
        return this.ragServices.get(key);
    }

    // 获取或创建服务类型的RAG服务
    getServiceTypeRAGService(serviceType) {
        const key = `service_${serviceType}`;
        if (!this.ragServices.has(key)) {
            const service = new RAGService();
            service.serviceType = serviceType;
            this.ragServices.set(key, service);
            logger.info('创建服务类型RAG服务', { serviceType });
        }
        return this.ragServices.get(key);
    }

    // 获取学生和模块组合的RAG服务
    getStudentServiceRAGService(studentId, serviceType) {
        const key = `student_${studentId}_service_${serviceType}`;
        if (!this.ragServices.has(key)) {
            const service = new RAGService();
            service.studentId = studentId;
            service.serviceType = serviceType;
            this.ragServices.set(key, service);
            logger.info('创建学生服务RAG服务', { studentId, serviceType });
        }
        return this.ragServices.get(key);
    }

    // 处理学生文档上传
    async processStudentDocument(studentId, filePath, metadata = {}) {
        const service = this.getStudentRAGService(studentId);
        metadata.studentId = studentId;
        metadata.studentName = metadata.studentName || `学生${studentId}`;
        
        const result = await service.processLocalFile(filePath, metadata);
        
        if (result.success) {
            // 同步到数据库
            const documentData = service.documentStore.get(result.documentId);
            if (documentData) {
                documentData.studentId = studentId;
                documentData.serviceType = metadata.serviceType || 'general';
                documentData.moduleId = metadata.moduleId || 'general';
                await service.syncToDatabase(documentData);
            }
        }
        
        return result;
    }

    // 处理模块文档上传
    async processModuleDocument(moduleId, filePath, metadata = {}) {
        const service = this.getModuleRAGService(moduleId);
        metadata.moduleId = moduleId;
        metadata.moduleName = metadata.moduleName || `模块${moduleId}`;
        
        const result = await service.processLocalFile(filePath, metadata);
        
        if (result.success) {
            // 同步到数据库
            const documentData = service.documentStore.get(result.documentId);
            if (documentData) {
                documentData.moduleId = moduleId;
                documentData.serviceType = metadata.serviceType || 'general';
                documentData.studentId = metadata.studentId || 'system';
                await service.syncToDatabase(documentData);
            }
        }
        
        return result;
    }

    // 处理学生和模块组合的文档上传
    async processStudentModuleDocument(studentId, moduleId, filePath, metadata = {}) {
        const service = this.getStudentModuleRAGService(studentId, moduleId);
        metadata.studentId = studentId;
        metadata.moduleId = moduleId;
        metadata.studentName = metadata.studentName || `学生${studentId}`;
        metadata.moduleName = metadata.moduleName || `模块${moduleId}`;
        
        const result = await service.processLocalFile(filePath, metadata);
        
        if (result.success) {
            // 同步到数据库
            const documentData = service.documentStore.get(result.documentId);
            if (documentData) {
                documentData.studentId = studentId;
                documentData.moduleId = moduleId;
                documentData.serviceType = metadata.serviceType || 'general';
                await service.syncToDatabase(documentData);
            }
        }
        
        return result;
    }

    // 搜索学生文档
    async searchStudentDocuments(studentId, query, limit = 5) {
        const service = this.getStudentRAGService(studentId);
        const result = await service.searchDocuments(query, limit);
        
        // 过滤只返回该学生的文档
        if (result.success && result.results) {
            result.results = result.results.filter(doc => 
                doc.metadata && doc.metadata.studentId === studentId
            );
        }
        
        return result;
    }

    // 搜索模块文档
    async searchModuleDocuments(moduleId, query, limit = 5) {
        const service = this.getModuleRAGService(moduleId);
        const result = await service.searchDocuments(query, limit);
        
        // 过滤只返回该模块的文档
        if (result.success && result.results) {
            result.results = result.results.filter(doc => 
                doc.metadata && doc.metadata.moduleId === moduleId
            );
        }
        
        return result;
    }

    // 搜索学生和模块组合的文档
    async searchStudentModuleDocuments(studentId, moduleId, query, limit = 5) {
        const service = this.getStudentModuleRAGService(studentId, moduleId);
        const result = await service.searchDocuments(query, limit);
        
        // 过滤只返回该学生和模块的文档
        if (result.success && result.results) {
            result.results = result.results.filter(doc => 
                doc.metadata && 
                doc.metadata.studentId === studentId && 
                doc.metadata.moduleId === moduleId
            );
        }
        
        return result;
    }

    // 获取学生所有文档
    async getStudentDocuments(studentId) {
        try {
            const documents = await RAGDocument.findByStudent(studentId);
            return documents.map(doc => ({
                id: doc.documentId,
                title: doc.title,
                type: doc.type,
                content: doc.content,
                metadata: doc.metadata,
                studentId: doc.studentId,
                moduleId: doc.moduleId,
                serviceType: doc.serviceType,
                contentLength: doc.contentLength
            }));
        } catch (error) {
            logger.error('获取学生文档失败', { studentId, error: error.message });
            return [];
        }
    }

    // 获取模块所有文档
    async getModuleDocuments(moduleId) {
        try {
            const documents = await RAGDocument.findByModule(moduleId);
            return documents.map(doc => ({
                id: doc.documentId,
                title: doc.title,
                type: doc.type,
                content: doc.content,
                metadata: doc.metadata,
                studentId: doc.studentId,
                moduleId: doc.moduleId,
                serviceType: doc.serviceType,
                contentLength: doc.contentLength
            }));
        } catch (error) {
            logger.error('获取模块文档失败', { moduleId, error: error.message });
            return [];
        }
    }

    // 获取学生和模块组合的所有文档
    async getStudentModuleDocuments(studentId, moduleId) {
        try {
            const documents = await RAGDocument.findByStudentAndModule(studentId, moduleId);
            return documents.map(doc => ({
                id: doc.documentId,
                title: doc.title,
                type: doc.type,
                content: doc.content,
                metadata: doc.metadata,
                studentId: doc.studentId,
                moduleId: doc.moduleId,
                serviceType: doc.serviceType,
                contentLength: doc.contentLength
            }));
        } catch (error) {
            logger.error('获取学生模块文档失败', { studentId, moduleId, error: error.message });
            return [];
        }
    }

    // 获取学生统计信息
    async getStudentStats(studentId) {
        try {
            const stats = await RAGDocument.getStudentStats(studentId);
            return {
                studentId,
                totalDocuments: stats.reduce((sum, stat) => sum + stat.count, 0),
                serviceTypes: stats.map(stat => ({
                    serviceType: stat._id,
                    count: stat.count,
                    totalSize: stat.totalSize,
                    modules: stat.modules
                }))
            };
        } catch (error) {
            logger.error('获取学生统计信息失败', { studentId, error: error.message });
            return { studentId, totalDocuments: 0, serviceTypes: [] };
        }
    }

    // 获取模块统计信息
    async getModuleStats(moduleId) {
        try {
            const stats = await RAGDocument.getModuleStats(moduleId);
            return {
                moduleId,
                totalDocuments: stats.reduce((sum, stat) => sum + stat.count, 0),
                students: stats.map(stat => ({
                    studentId: stat._id,
                    count: stat.count,
                    totalSize: stat.totalSize,
                    serviceTypes: stat.serviceTypes
                }))
            };
        } catch (error) {
            logger.error('获取模块统计信息失败', { moduleId, error: error.message });
            return { moduleId, totalDocuments: 0, students: [] };
        }
    }

    // 获取所有学生列表
    async getAllStudents() {
        try {
            const stats = await RAGDocument.getStats();
            if (stats.length > 0) {
                return stats[0].students || [];
            }
            return [];
        } catch (error) {
            logger.error('获取所有学生列表失败', { error: error.message });
            return [];
        }
    }

    // 获取所有模块列表
    async getAllModules() {
        try {
            const stats = await RAGDocument.getStats();
            if (stats.length > 0) {
                return stats[0].modules || [];
            }
            return [];
        } catch (error) {
            logger.error('获取所有模块列表失败', { error: error.message });
            return [];
        }
    }

    // 获取所有服务类型列表
    async getAllServiceTypes() {
        try {
            const stats = await RAGDocument.getStats();
            if (stats.length > 0) {
                return stats[0].serviceTypes || [];
            }
            return [];
        } catch (error) {
            logger.error('获取所有服务类型列表失败', { error: error.message });
            return [];
        }
    }

    // 获取管理器状态
    async getManagerStatus() {
        const students = await this.getAllStudents();
        const modules = await this.getAllModules();
        const serviceTypes = await this.getAllServiceTypes();
        
        return {
            totalRAGServices: this.ragServices.size,
            students: students.length,
            modules: modules.length,
            serviceTypes: serviceTypes.length,
            activeServices: Array.from(this.ragServices.keys())
        };
    }
}

// 创建全局单例
const ragManager = new RAGManager();

module.exports = {
    RAGManager,
    ragManager
}; 