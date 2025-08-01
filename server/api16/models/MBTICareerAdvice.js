const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MBTI职业建议模式
const mbtiCareerAdviceSchema = new Schema({
  // MBTI类型
  mbtiType: {
    type: String,
    required: true,
    enum: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
           'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
    unique: true
  },
  
  // 人格描述
  personalityDescription: {
    type: String,
    required: true
  },
  
  // 核心特质
  coreTraits: [{
    type: String,
    required: true
  }],
  
  // 互联网企业岗位建议
  internetCareers: [{
    // 岗位名称
    position: {
      type: String,
      required: true
    },
    // 岗位类别
    category: {
      type: String,
      enum: ['技术开发', '产品设计', '运营营销', '数据分析', '项目管理', '用户体验', '商务拓展', '内容创作'],
      required: true
    },
    // 适合程度 (1-5星)
    suitability: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    // 推荐理由
    reasons: [{
      type: String,
      required: true
    }],
    // 技能要求
    requiredSkills: [{
      type: String,
      required: true
    }],
    // 发展路径
    careerPath: [{
      level: {
        type: String,
        enum: ['初级', '中级', '高级', '专家', '总监', 'VP', 'CTO/CEO'],
        required: true
      },
      positions: [{
        type: String,
        required: true
      }]
    }],
    // 典型公司
    typicalCompanies: [{
      type: String,
      required: true
    }],
    // 薪资范围
    salaryRange: {
      junior: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'CNY'
        }
      },
      senior: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'CNY'
        }
      }
    }
  }],
  
  // 优势分析
  strengths: [{
    type: String,
    required: true
  }],
  
  // 潜在挑战
  challenges: [{
    type: String,
    required: true
  }],
  
  // 发展建议
  developmentAdvice: [{
    type: String,
    required: true
  }],
  
  // 工作环境偏好
  workEnvironment: {
    teamSize: {
      type: String,
      enum: ['独立工作', '小团队(2-5人)', '中等团队(6-15人)', '大团队(15人以上)'],
      required: true
    },
    workStyle: {
      type: String,
      enum: ['高度结构化', '适度灵活', '高度灵活', '创新导向'],
      required: true
    },
    communicationStyle: {
      type: String,
      enum: ['直接高效', '温和协作', '创意发散', '逻辑分析'],
      required: true
    }
  },
  
  // 创建和更新时间
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
mbtiCareerAdviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引
mbtiCareerAdviceSchema.index({ mbtiType: 1 });
mbtiCareerAdviceSchema.index({ 'internetCareers.category': 1 });
mbtiCareerAdviceSchema.index({ 'internetCareers.suitability': -1 });

module.exports = mongoose.model('MBTICareerAdvice', mbtiCareerAdviceSchema); 