const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 投递记录模式
const applicationSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    name: {
      type: String,
      required: true
    },
    industry: String,
    size: {
      type: String,
      enum: ['初创', '小型', '中型', '大型', '巨型']
    },
    type: {
      type: String,
      enum: ['外企', '国企', '民企', '合资', '事业单位', '政府机构', '其他']
    },
    location: String
  },
  position: {
    title: {
      type: String,
      required: true
    },
    department: String,
    level: String,
    type: {
      type: String,
      enum: ['全职', '兼职', '实习', '校招', '社招', '其他']
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'CNY'
      }
    }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['官网', 'BOSS直聘', '猎聘', '拉勾', '前程无忧', '智联招聘', '校园招聘', '内推', '猎头', '其他']
  },
  referrer: String,
  status: {
    type: String,
    enum: ['已投递', '简历筛选中', '已拒绝', '面试邀约', '面试中', '面试通过', '已发offer', '已接受offer', '已入职', '已放弃'],
    default: '已投递'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['已投递', '简历筛选中', '已拒绝', '面试邀约', '面试中', '面试通过', '已发offer', '已接受offer', '已入职', '已放弃']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// 面试记录模式
const interviewSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  round: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['电话面试', '视频面试', '现场面试', '笔试', '群面', '技术面', 'HR面', '高管面', '其他'],
    required: true
  },
  scheduledTime: {
    start: {
      type: Date,
      required: true
    },
    end: Date
  },
  actualTime: {
    start: Date,
    end: Date
  },
  interviewers: [{
    name: String,
    position: String,
    notes: String
  }],
  location: {
    online: {
      type: Boolean,
      default: false
    },
    platform: String, // 如Zoom, Teams等
    link: String,
    address: String
  },
  preparation: {
    materials: [{
      title: String,
      content: String,
      url: String
    }],
    questions: [{
      question: String,
      preparedAnswer: String,
      actualAnswer: String,
      feedback: String
    }],
    notes: String
  },
  feedback: {
    studentFeedback: {
      content: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      difficulties: [String],
      strengths: [String],
      weaknesses: [String]
    },
    coachFeedback: {
      content: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      strengths: [String],
      improvements: [String],
      nextSteps: [String]
    },
    companyFeedback: {
      content: String,
      result: {
        type: String,
        enum: ['通过', '未通过', '待定', '未知']
      },
      strengths: [String],
      weaknesses: [String]
    }
  },
  recording: {
    url: String,
    duration: Number, // 秒
    transcript: String
  },
  status: {
    type: String,
    enum: ['已安排', '准备中', '已完成', '已取消', '已推迟'],
    default: '已安排'
  },
  nextSteps: [String]
}, {
  timestamps: true
});

// Offer记录模式
const offerSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    name: {
      type: String,
      required: true
    },
    department: String,
    location: String
  },
  position: {
    title: {
      type: String,
      required: true
    },
    level: String,
    type: {
      type: String,
      enum: ['全职', '兼职', '实习', '校招', '社招', '其他']
    }
  },
  compensation: {
    base: {
      amount: Number,
      currency: {
        type: String,
        default: 'CNY'
      },
      period: {
        type: String,
        enum: ['年', '月', '周', '日', '小时'],
        default: '年'
      }
    },
    bonus: {
      amount: Number,
      type: {
        type: String,
        enum: ['签约', '年终', '绩效', '股权', '期权', '其他']
      },
      description: String
    },
    benefits: [{
      type: String,
      enum: ['五险一金', '补充医疗', '年假', '带薪病假', '餐补', '交通补贴', '住房补贴', '通讯补贴', '健身补贴', '其他']
    }],
    otherCompensation: [{
      name: String,
      value: String,
      description: String
    }]
  },
  offerDate: {
    type: Date,
    required: true
  },
  deadlineDate: Date,
  startDate: Date,
  status: {
    type: String,
    enum: ['待考虑', '已接受', '已拒绝', '已过期', '已撤回', '已入职'],
    default: '待考虑'
  },
  negotiation: {
    initialOffer: {
      base: Number,
      bonus: Number,
      other: String
    },
    counterOffer: {
      base: Number,
      bonus: Number,
      other: String,
      date: Date
    },
    finalOffer: {
      base: Number,
      bonus: Number,
      other: String,
      date: Date
    },
    notes: String
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  comparison: [{
    companyName: String,
    positionTitle: String,
    compensation: {
      base: Number,
      bonus: Number,
      other: String
    },
    pros: [String],
    cons: [String],
    overallRating: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  decisionFactors: [{
    factor: String,
    importance: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  notes: String
}, {
  timestamps: true
});

// 创建模型
const Application = mongoose.model('Application', applicationSchema);
const Interview = mongoose.model('Interview', interviewSchema);
const Offer = mongoose.model('Offer', offerSchema);

module.exports = {
  Application,
  Interview,
  Offer
};