const mongoose = require('mongoose');

const aiCallSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true,
    enum: ['/api/ai/chat', '/api/ai/admission-advice', '/api/ai/status']
  },
  requestData: {
    message: String,
    context: String,
    model: String
  },
  responseData: {
    message: String,
    model: String,
    cost: Number,
    inputTokens: Number,
    outputTokens: Number,
    totalTokens: Number
  },
  status: {
    type: String,
    enum: ['success', 'error', 'timeout'],
    default: 'success'
  },
  errorMessage: String,
  responseTime: {
    type: Number, // 毫秒
    required: true
  },
  cost: {
    type: Number,
    required: true,
    default: 0
  },
  model: {
    type: String,
    required: true,
    default: 'kimi-moonshot-v1-8k'
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// 索引
aiCallSchema.index({ userId: 1, createdAt: -1 });
aiCallSchema.index({ createdAt: -1 });
aiCallSchema.index({ status: 1 });
aiCallSchema.index({ model: 1 });
aiCallSchema.index({ cost: 1 });

// 静态方法：获取用户调用统计
aiCallSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const matchStage = {
    userId: mongoose.Types.ObjectId(userId)
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        avgResponseTime: { $avg: '$responseTime' },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        errorCount: {
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
        }
      }
    }
  ]);
};

// 静态方法：获取系统总体统计
aiCallSchema.statics.getSystemStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        avgResponseTime: { $avg: '$responseTime' },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        errorCount: {
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        totalCalls: 1,
        totalCost: 1,
        avgResponseTime: 1,
        successCount: 1,
        errorCount: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

// 静态方法：获取每日统计
aiCallSchema.statics.getDailyStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        calls: { $sum: 1 },
        cost: { $sum: '$cost' },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

module.exports = mongoose.model('AICall', aiCallSchema); 