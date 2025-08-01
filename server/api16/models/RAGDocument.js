const mongoose = require('mongoose');
const logger = require('../utils/logger');

// RAG文档Schema
const ragDocumentSchema = new mongoose.Schema({
    // 文档基本信息
    documentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['local_file', 'feishu_document', 'feishu_spreadsheet', 'image', 'document', 'text'],
        required: true,
        index: true
    },
    
    // 学生和模块分组信息
    studentId: {
        type: String,
        required: true,
        index: true,
        description: '学生ID，用于按学生分组'
    },
    moduleId: {
        type: String,
        required: true,
        index: true,
        description: '模块ID，如：resume, interview, career_planning, skills_training'
    },
    serviceType: {
        type: String,
        enum: ['resume', 'interview', 'career_planning', 'skills_training', 'job_search', 'general'],
        required: true,
        index: true,
        description: '服务类型，用于按服务模块分组'
    },
    
    // 文件信息
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    
    // 内容信息
    content: {
        type: String,
        required: true,
        index: true
    },
    contentLength: {
        type: Number,
        default: 0
    },
    
    // 向量信息
    vectors: {
        type: [Number],
        default: []
    },
    vectorDimension: {
        type: Number,
        default: 0
    },
    
    // 元数据
    metadata: {
        category: {
            type: String,
            default: 'general',
            index: true
        },
        tags: [{
            type: String,
            index: true
        }],
        uploadedBy: {
            type: String,
            default: 'system'
        },
        source: {
            type: String,
            enum: ['local_file', 'feishu', 'api'],
            default: 'local_file'
        },
        url: String,
        originalName: String,
        processedAt: {
            type: Date,
            default: Date.now
        },
        // 新增：学生和模块相关元数据
        studentName: String,
        moduleName: String,
        sessionId: String,
        coachId: String
    },
    
    // 统计信息
    stats: {
        searchCount: {
            type: Number,
            default: 0
        },
        lastSearched: Date,
        relevanceScore: {
            type: Number,
            default: 0
        }
    },
    
    // 状态信息
    status: {
        type: String,
        enum: ['active', 'inactive', 'processing', 'error'],
        default: 'active',
        index: true
    },
    
    // 时间戳
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'rag_documents'
});

// 复合索引
ragDocumentSchema.index({ studentId: 1, moduleId: 1 });
ragDocumentSchema.index({ studentId: 1, serviceType: 1 });
ragDocumentSchema.index({ moduleId: 1, serviceType: 1 });
ragDocumentSchema.index({ 'metadata.category': 1, 'metadata.tags': 1 });
ragDocumentSchema.index({ 'stats.searchCount': -1 });
ragDocumentSchema.index({ 'stats.lastSearched': -1 });
ragDocumentSchema.index({ 'content': 'text', 'title': 'text' });

// 中间件：更新时自动更新updatedAt
ragDocumentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 中间件：保存前计算内容长度
ragDocumentSchema.pre('save', function(next) {
    if (this.content) {
        this.contentLength = this.content.length;
    }
    next();
});

// 静态方法：根据学生ID查找文档
ragDocumentSchema.statics.findByStudent = function(studentId) {
    return this.find({ studentId: studentId, status: 'active' });
};

// 静态方法：根据模块ID查找文档
ragDocumentSchema.statics.findByModule = function(moduleId) {
    return this.find({ moduleId: moduleId, status: 'active' });
};

// 静态方法：根据学生ID和模块ID查找文档
ragDocumentSchema.statics.findByStudentAndModule = function(studentId, moduleId) {
    return this.find({ studentId: studentId, moduleId: moduleId, status: 'active' });
};

// 静态方法：根据学生ID和服务类型查找文档
ragDocumentSchema.statics.findByStudentAndService = function(studentId, serviceType) {
    return this.find({ studentId: studentId, serviceType: serviceType, status: 'active' });
};

// 静态方法：根据服务类型查找文档
ragDocumentSchema.statics.findByServiceType = function(serviceType) {
    return this.find({ serviceType: serviceType, status: 'active' });
};

// 静态方法：根据类型查找文档
ragDocumentSchema.statics.findByType = function(type) {
    return this.find({ type: type, status: 'active' });
};

// 静态方法：根据分类查找文档
ragDocumentSchema.statics.findByCategory = function(category) {
    return this.find({ 'metadata.category': category, status: 'active' });
};

// 静态方法：根据标签查找文档
ragDocumentSchema.statics.findByTags = function(tags) {
    return this.find({ 
        'metadata.tags': { $in: tags },
        status: 'active' 
    });
};

// 静态方法：全文搜索
ragDocumentSchema.statics.fullTextSearch = function(query) {
    return this.find({
        $text: { $search: query },
        status: 'active'
    }, {
        score: { $meta: 'textScore' }
    }).sort({ score: { $meta: 'textScore' } });
};

// 静态方法：获取统计信息
ragDocumentSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalDocuments: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                avgContentLength: { $avg: '$contentLength' },
                categories: { $addToSet: '$metadata.category' },
                types: { $addToSet: '$type' },
                serviceTypes: { $addToSet: '$serviceType' },
                students: { $addToSet: '$studentId' },
                modules: { $addToSet: '$moduleId' }
            }
        }
    ]);
};

// 静态方法：获取学生统计信息
ragDocumentSchema.statics.getStudentStats = function(studentId) {
    return this.aggregate([
        { $match: { studentId: studentId, status: 'active' } },
        {
            $group: {
                _id: '$serviceType',
                count: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                modules: { $addToSet: '$moduleId' }
            }
        }
    ]);
};

// 静态方法：获取模块统计信息
ragDocumentSchema.statics.getModuleStats = function(moduleId) {
    return this.aggregate([
        { $match: { moduleId: moduleId, status: 'active' } },
        {
            $group: {
                _id: '$studentId',
                count: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                serviceTypes: { $addToSet: '$serviceType' }
            }
        }
    ]);
};

// 实例方法：增加搜索次数
ragDocumentSchema.methods.incrementSearchCount = function() {
    this.stats.searchCount += 1;
    this.stats.lastSearched = new Date();
    return this.save();
};

// 实例方法：更新相关性分数
ragDocumentSchema.methods.updateRelevanceScore = function(score) {
    this.stats.relevanceScore = score;
    return this.save();
};

// 实例方法：获取文档摘要
ragDocumentSchema.methods.getSummary = function(maxLength = 200) {
    if (this.content.length <= maxLength) {
        return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
};

// 创建模型
const RAGDocument = mongoose.model('RAGDocument', ragDocumentSchema);

// 初始化集合
const initializeCollection = async () => {
    try {
        // 创建文本索引
        await RAGDocument.collection.createIndex({
            content: 'text',
            title: 'text'
        });
        
        logger.info('RAG文档集合初始化完成');
    } catch (error) {
        logger.error('RAG文档集合初始化失败', { error: error.message });
    }
};

module.exports = {
    RAGDocument,
    initializeCollection
}; 