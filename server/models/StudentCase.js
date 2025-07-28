const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 学生成功案例模式
const studentCaseSchema = new Schema({
  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['男', '女', '保密'],
    default: '保密'
  },
  
  // 教育背景
  education: {
    school: {
      type: String,
      required: true
    },
    major: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      enum: ['本科', '硕士', '博士'],
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    }
  },
  
  // 求职前状态
  beforeJobHunting: {
    experience: {
      type: String,
      enum: ['应届生', '1年以下', '1-3年', '3-5年', '5年以上'],
      required: true
    },
    currentPosition: String,
    currentCompany: String,
    salary: {
      type: Number,
      currency: {
        type: String,
        default: 'CNY'
      }
    },
    challenges: [String], // 面临的挑战
    goals: [String] // 求职目标
  },
  
  // 求职过程
  jobHuntingProcess: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    duration: {
      type: Number, // 天数
      required: true
    },
    applicationsSubmitted: {
      type: Number,
      default: 0
    },
    interviewsAttended: {
      type: Number,
      default: 0
    },
    offersReceived: {
      type: Number,
      default: 0
    },
    finalOffer: {
      company: {
        type: String,
        required: true
      },
      position: {
        type: String,
        required: true
      },
      industry: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      salary: {
        base: {
          type: Number,
          required: true
        },
        bonus: Number,
        total: Number,
        currency: {
          type: String,
          default: 'CNY'
        },
        period: {
          type: String,
          enum: ['年', '月'],
          default: '年'
        }
      },
      benefits: [String],
      startDate: Date
    }
  },
  
  // 辅导服务
  coachingService: {
    package: {
      type: String,
      enum: ['基础版', '标准版', '高级版', '定制版'],
      required: true
    },
    duration: {
      type: Number, // 周数
      required: true
    },
    sessions: {
      type: Number,
      default: 0
    },
    coach: {
      name: String,
      title: String,
      avatar: String
    },
    services: [{
      type: String,
      enum: ['简历优化', '面试准备', '模拟面试', '谈薪指导', '职业规划', '技能提升']
    }],
    keyImprovements: [String] // 关键改进点
  },
  
  // 成功因素
  successFactors: {
    strengths: [String], // 个人优势
    improvements: [String], // 关键改进
    strategies: [String], // 求职策略
    tips: [String] // 经验分享
  },
  
  // 数据统计
  statistics: {
    salaryIncrease: {
      type: Number, // 百分比
      required: true
    },
    positionUpgrade: {
      type: Boolean,
      default: false
    },
    industryChange: {
      type: Boolean,
      default: false
    },
    locationChange: {
      type: Boolean,
      default: false
    }
  },
  
  // 评价和反馈
  feedback: {
    studentRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    studentComment: {
      type: String,
      required: true
    },
    coachRating: {
      type: Number,
      min: 1,
      max: 5
    },
    coachComment: String,
    highlights: [String], // 亮点
    challenges: [String], // 挑战
    recommendations: [String] // 建议
  },
  
  // 案例展示
  showcase: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    tags: [String], // 标签
    category: {
      type: String,
      enum: ['技术', '商业', '设计', '运营', '产品', '其他'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['简单', '中等', '困难'],
      default: '中等'
    },
    story: {
      type: String,
      required: true
    }, // 完整故事
    beforeAfter: {
      before: {
        resume: String,
        skills: [String],
        confidence: {
          type: Number,
          min: 1,
          max: 10
        }
      },
      after: {
        resume: String,
        skills: [String],
        confidence: {
          type: Number,
          min: 1,
          max: 10
        }
      }
    }
  },
  
  // 媒体内容
  media: {
    images: [{
      url: String,
      caption: String,
      type: {
        type: String,
        enum: ['头像', '简历对比', '证书', '其他']
      }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number
    }],
    documents: [{
      name: String,
      url: String,
      type: String
    }]
  },
  
  // 时间线
  timeline: [{
    date: {
      type: Date,
      required: true
    },
    event: {
      type: String,
      required: true
    },
    description: String,
    milestone: {
      type: Boolean,
      default: false
    }
  }],
  
  // 系统信息
  status: {
    type: String,
    enum: ['草稿', '审核中', '已发布', '已下架'],
    default: '草稿'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
studentCaseSchema.index({ 'showcase.isFeatured': 1, 'status': 1 });
studentCaseSchema.index({ 'jobHuntingProcess.finalOffer.industry': 1 });
studentCaseSchema.index({ 'coachingService.package': 1 });
studentCaseSchema.index({ 'showcase.category': 1 });
studentCaseSchema.index({ 'createdAt': -1 });

// 静态方法：获取精选案例
studentCaseSchema.statics.getFeaturedCases = function(limit = 6) {
  return this.find({
    'showcase.isFeatured': true,
    'status': '已发布'
  })
  .sort({ 'createdAt': -1 })
  .limit(limit)
  .exec();
};

// 静态方法：按行业获取案例
studentCaseSchema.statics.getCasesByIndustry = function(industry, limit = 10) {
  return this.find({
    'jobHuntingProcess.finalOffer.industry': industry,
    'status': '已发布'
  })
  .sort({ 'createdAt': -1 })
  .limit(limit)
  .exec();
};

// 静态方法：获取统计数据
studentCaseSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $match: {
        'status': '已发布'
      }
    },
    {
      $group: {
        _id: null,
        totalCases: { $sum: 1 },
        avgSalaryIncrease: { $avg: '$statistics.salaryIncrease' },
        avgDuration: { $avg: '$jobHuntingProcess.duration' },
        avgApplications: { $avg: '$jobHuntingProcess.applicationsSubmitted' },
        avgInterviews: { $avg: '$jobHuntingProcess.interviewsAttended' },
        avgOffers: { $avg: '$jobHuntingProcess.offersReceived' },
        avgRating: { $avg: '$feedback.studentRating' }
      }
    }
  ]);
};

// 方法：增加浏览量
studentCaseSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// 方法：增加点赞
studentCaseSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// 方法：增加分享
studentCaseSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

module.exports = mongoose.model('StudentCase', studentCaseSchema); 