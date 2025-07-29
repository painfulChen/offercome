const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 简历模式
const resumeSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  title: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['中文', '英文', '双语', '其他'],
    default: '中文'
  },
  targetPosition: {
    title: String,
    industry: String
  },
  status: {
    type: String,
    enum: ['草稿', '审核中', '已审核', '已定稿', '已归档'],
    default: '草稿'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 基本信息
  basicInfo: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    email: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    otherLinks: [{
      name: String,
      url: String
    }]
  },
  
  // 教育经历
  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    major: {
      type: String,
      required: true
    },
    location: String,
    startDate: Date,
    endDate: Date,
    gpa: String,
    highlights: [String],
    courses: [String],
    activities: [String],
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 工作经历
  workExperience: [{
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrentPosition: {
      type: Boolean,
      default: false
    },
    description: String,
    achievements: [{
      content: String,
      isVisible: {
        type: Boolean,
        default: true
      },
      order: Number
    }],
    skills: [String],
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 项目经历
  projects: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    startDate: Date,
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false
    },
    description: String,
    achievements: [{
      content: String,
      isVisible: {
        type: Boolean,
        default: true
      },
      order: Number
    }],
    technologies: [String],
    url: String,
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 技能
  skills: [{
    category: {
      type: String,
      required: true
    },
    items: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: Number,
        min: 1,
        max: 5
      },
      isVisible: {
        type: Boolean,
        default: true
      }
    }],
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 证书和奖项
  certificationsAndAwards: [{
    name: {
      type: String,
      required: true
    },
    issuer: String,
    date: Date,
    description: String,
    url: String,
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 语言能力
  languages: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['初级', '中级', '高级', '母语', '其他'],
      required: true
    },
    certification: String,
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 其他部分
  additionalSections: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    order: Number,
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  
  // 文件信息
  file: {
    url: String,
    name: String,
    size: Number,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // 审核信息
  review: {
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    comments: [{
      section: String,
      content: String,
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      },
      resolvedAt: Date
    }],
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: ['待审核', '审核中', '需修改', '已通过', '已拒绝'],
      default: '待审核'
    }
  },
  
  // 版本控制
  versionHistory: [{
    version: Number,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    changes: [{
      section: String,
      description: String
    }],
    file: {
      url: String,
      name: String
    }
  }],
  
  // ATS分析
  atsAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    keywordMatches: [{
      keyword: String,
      count: Number,
      importance: {
        type: String,
        enum: ['低', '中', '高']
      }
    }],
    missingKeywords: [String],
    formatIssues: [String],
    suggestions: [String],
    analyzedDate: Date
  },
  
  // 使用统计
  stats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    interviews: {
      type: Number,
      default: 0
    },
    offers: {
      type: Number,
      default: 0
    }
  },
  
  // 模板信息
  template: {
    name: String,
    id: String,
    settings: {
      fontFamily: String,
      fontSize: String,
      lineSpacing: String,
      margins: {
        top: Number,
        right: Number,
        bottom: Number,
        left: Number
      },
      colors: {
        primary: String,
        secondary: String,
        text: String,
        background: String
      }
    }
  },
  
  // 标签
  tags: [String],
  
  // 笔记
  notes: [{
    content: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 索引
resumeSchema.index({ 'student': 1, 'version': 1 });
resumeSchema.index({ 'student': 1, 'isActive': 1 });
resumeSchema.index({ 'status': 1 });
resumeSchema.index({ 'targetPosition.title': 1 });
resumeSchema.index({ 'targetPosition.industry': 1 });

// 静态方法：获取学生的最新简历
resumeSchema.statics.getLatestResume = function(studentId) {
  return this.findOne({ student: studentId, isActive: true })
    .sort({ version: -1 })
    .exec();
};

// 静态方法：获取学生的所有简历版本
resumeSchema.statics.getAllVersions = function(studentId) {
  return this.find({ student: studentId })
    .sort({ version: -1 })
    .exec();
};

// 方法：创建新版本
resumeSchema.methods.createNewVersion = async function(userId, changes) {
  // 保存当前版本到历史记录
  this.versionHistory.push({
    version: this.version,
    createdBy: userId,
    changes: changes || [],
    file: this.file
  });
  
  // 增加版本号
  this.version += 1;
  this.status = '草稿';
  
  // 清除审核信息
  this.review = {
    status: '待审核'
  };
  
  return this.save();
};

// 方法：提交审核
resumeSchema.methods.submitForReview = function() {
  this.status = '审核中';
  this.review.status = '待审核';
  return this.save();
};

// 方法：更新ATS分析
resumeSchema.methods.updateATSAnalysis = function(analysisData) {
  this.atsAnalysis = {
    ...analysisData,
    analyzedDate: new Date()
  };
  return this.save();
};

// 简历模板模式
const resumeTemplateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['通用', '技术', '商业', '创意', '学术', '其他'],
    default: '通用'
  },
  industries: [String],
  positions: [String],
  previewImage: String,
  structure: {
    sections: [{
      id: String,
      name: String,
      type: {
        type: String,
        enum: ['basicInfo', 'education', 'workExperience', 'projects', 'skills', 'certificationsAndAwards', 'languages', 'custom'],
        required: true
      },
      isRequired: {
        type: Boolean,
        default: false
      },
      order: Number,
      defaultContent: Schema.Types.Mixed
    }]
  },
  styling: {
    fontFamily: String,
    fontSize: String,
    lineSpacing: String,
    margins: {
      top: Number,
      right: Number,
      bottom: Number,
      left: Number
    },
    colors: {
      primary: String,
      secondary: String,
      text: String,
      background: String
    },
    layout: {
      type: String,
      enum: ['单栏', '双栏', '混合'],
      default: '单栏'
    },
    css: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  usageCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

// 创建模型
const Resume = mongoose.model('Resume', resumeSchema);
const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);

module.exports = {
  Resume,
  ResumeTemplate
};