const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mbtiResultSchema = new Schema({
  // 测试唯一标识
  testId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // 用户信息
  userInfo: {
    major: {
      type: String,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  
  // MBTI测试结果
  mbtiType: {
    type: String,
    required: true,
    enum: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  },
  
  // 各维度分数
  scores: {
    E: { type: Number, min: 0, max: 8 },
    I: { type: Number, min: 0, max: 8 },
    S: { type: Number, min: 0, max: 8 },
    N: { type: Number, min: 0, max: 8 },
    T: { type: Number, min: 0, max: 8 },
    F: { type: Number, min: 0, max: 8 },
    J: { type: Number, min: 0, max: 8 },
    P: { type: Number, min: 0, max: 8 }
  },
  
  // 原始答案数组
  answers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 32 && v.every(answer => answer === 0 || answer === 1);
      },
      message: '答案数组必须包含32个0或1的值'
    }
  },
  
  // 职业建议
  careerAdvice: {
    suitable: [{
      industry: String,
      positions: [String],
      reason: String
    }],
    unsuitable: [{
      industry: String,
      positions: [String],
      reason: String
    }]
  },
  
  // 优势分析
  strengths: [String],
  
  // 改进建议
  improvements: [String],
  
  // 测试元数据
  metadata: {
    userAgent: String,
    ipAddress: String,
    testDuration: Number, // 测试耗时（秒）
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // 状态标记
  status: {
    type: String,
    enum: ['completed', 'abandoned'],
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// 索引优化
mbtiResultSchema.index({ 'userInfo.email': 1 });
mbtiResultSchema.index({ 'mbtiType': 1 });
mbtiResultSchema.index({ 'metadata.completedAt': -1 });
mbtiResultSchema.index({ 'testId': 1 });

// 静态方法：根据邮箱查找用户的测试历史
mbtiResultSchema.statics.findByEmail = function(email) {
  return this.find({ 'userInfo.email': email.toLowerCase() })
    .sort({ 'metadata.completedAt': -1 });
};

// 静态方法：获取MBTI类型分布统计
mbtiResultSchema.statics.getMbtiDistribution = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$mbtiType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// 静态方法：获取专业分布统计
mbtiResultSchema.statics.getMajorDistribution = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$userInfo.major',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// 实例方法：获取测试结果摘要
mbtiResultSchema.methods.getSummary = function() {
  return {
    testId: this.testId,
    mbtiType: this.mbtiType,
    major: this.userInfo.major,
    school: this.userInfo.school,
    completedAt: this.metadata.completedAt,
    suitableIndustries: this.careerAdvice.suitable.map(s => s.industry),
    strengthsCount: this.strengths.length,
    improvementsCount: this.improvements.length
  };
};

const MbtiResult = mongoose.model('MbtiResult', mbtiResultSchema);

module.exports = MbtiResult; 