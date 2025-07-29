const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
    required: true,
    default: 'INFO'
  },
  module: {
    type: String,
    required: true,
    enum: ['API', 'Auth', 'Database', 'AI', 'Cost', 'System', 'User', 'Admin']
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: String,
  ipAddress: String,
  userAgent: String,
  requestId: String,
  endpoint: String,
  method: String,
  statusCode: Number,
  responseTime: Number,
  error: {
    name: String,
    message: String,
    stack: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// 索引
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ module: 1, createdAt: -1 });
systemLogSchema.index({ userId: 1, createdAt: -1 });
systemLogSchema.index({ createdAt: -1 });

// 静态方法：获取日志统计
systemLogSchema.statics.getLogStats = async function(startDate, endDate) {
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
          level: '$level',
          module: '$module'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.level',
        modules: {
          $push: {
            module: '$_id.module',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// 静态方法：获取错误日志
systemLogSchema.statics.getErrorLogs = async function(limit = 100) {
  return this.find({ level: { $in: ['ERROR', 'FATAL'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

// 静态方法：清理旧日志
systemLogSchema.statics.cleanOldLogs = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('SystemLog', systemLogSchema); 