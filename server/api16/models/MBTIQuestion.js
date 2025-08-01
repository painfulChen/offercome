const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MBTI问题模式
const mbtiQuestionSchema = new Schema({
    questionId: {
        type: Number,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    dimension: {
        type: String,
        enum: ['E-I', 'S-N', 'T-F', 'J-P'],
        required: true
    },
    options: [{
        text: {
            type: String,
            required: true
        },
        score: {
            type: Map,
            of: Number,
            required: true
        }
    }],
    category: {
        type: String,
        enum: ['社交偏好', '信息处理', '决策方式', '生活方式'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间中间件
mbtiQuestionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 索引
mbtiQuestionSchema.index({ questionId: 1 });
mbtiQuestionSchema.index({ dimension: 1 });
mbtiQuestionSchema.index({ category: 1 });

module.exports = mongoose.model('MBTIQuestion', mbtiQuestionSchema); 