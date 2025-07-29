const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 辅导会话模式
const sessionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  coach: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['初步评估', '简历辅导', '面试准备', '模拟面试', '谈薪辅导', '职业规划', '入职准备', '其他'],
    required: true
  },
  format: {
    type: String,
    enum: ['线上', '线下', '电话', '视频', '文字'],
    default: '线上'
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
  duration: {
    type: Number, // 分钟
    min: 0
  },
  status: {
    type: String,
    enum: ['已安排', '已确认', '进行中', '已完成', '已取消', '已推迟', '未出席'],
    default: '已安排'
  },
  location: {
    online: {
      type: Boolean,
      default: true
    },
    platform: String, // 如Zoom, Teams等
    link: String,
    address: String
  },
  agenda: [{
    topic: String,
    duration: Number, // 分钟
    description: String,
    materials: [{
      title: String,
      url: String
    }]
  }],
  notes: {
    beforeSession: String,
    duringSession: String,
    afterSession: String
  },
  recording: {
    url: String,
    duration: Number, // 秒
    transcript: String
  },
  feedback: {
    studentFeedback: {
      content: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      helpful: [String],
      improvements: [String]
    },
    coachFeedback: {
      content: String,
      studentEngagement: {
        type: Number,
        min: 1,
        max: 5
      },
      progress: {
        type: Number,
        min: 1,
        max: 5
      },
      strengths: [String],
      weaknesses: [String],
      nextSteps: [String]
    }
  },
  followUpTasks: [{
    description: String,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['待处理', '进行中', '已完成', '已逾期'],
      default: '待处理'
    }
  }]
}, {
  timestamps: true
});

// 任务模式
const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['低', '中', '高', '紧急'],
    default: '中'
  },
  category: {
    type: String,
    enum: ['简历准备', '面试准备', '技能提升', '行业研究', '公司研究', '职位申请', '谈薪准备', '其他'],
    required: true
  },
  status: {
    type: String,
    enum: ['待处理', '进行中', '已提交', '已完成', '已逾期', '已取消'],
    default: '待处理'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  submission: {
    content: String,
    submittedDate: Date,
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadDate: Date
    }]
  },
  feedback: {
    content: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    providedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    providedDate: Date,
    status: {
      type: String,
      enum: ['通过', '需修改', '不通过'],
      default: '通过'
    }
  },
  relatedSession: {
    type: Schema.Types.ObjectId,
    ref: 'Session'
  },
  relatedApplication: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
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
  }],
  reminders: [{
    time: Date,
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }]
}, {
  timestamps: true
});

// 学习资源模式
const resourceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['文章', '视频', '书籍', '课程', '工具', '模板', '案例', '其他'],
    required: true
  },
  category: {
    type: String,
    enum: ['简历准备', '面试技巧', '行业知识', '职位分析', '谈薪技巧', '职场技能', '其他'],
    required: true
  },
  tags: [String],
  url: String,
  file: {
    name: String,
    url: String,
    size: Number,
    type: String
  },
  content: String, // 如果是直接存储的内容
  author: String,
  source: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  targetAudience: [{
    type: String,
    enum: ['实习生', '应届生', '经验1-3年', '经验3-5年', '经验5年以上', '管理层']
  }],
  industries: [String],
  positions: [String],
  difficulty: {
    type: String,
    enum: ['入门', '基础', '中级', '高级', '专家'],
    default: '基础'
  },
  estimatedTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['分钟', '小时', '天', '周'],
      default: '分钟'
    }
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
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 学习进度模式
const learningProgressSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  resource: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  status: {
    type: String,
    enum: ['未开始', '进行中', '已完成', '已放弃'],
    default: '未开始'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: Date,
  completionDate: Date,
  timeSpent: {
    value: Number,
    unit: {
      type: String,
      enum: ['分钟', '小时', '天', '周'],
      default: '分钟'
    }
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 创建模型
const Session = mongoose.model('Session', sessionSchema);
const Task = mongoose.model('Task', taskSchema);
const Resource = mongoose.model('Resource', resourceSchema);
const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

module.exports = {
  Session,
  Task,
  Resource,
  LearningProgress
};