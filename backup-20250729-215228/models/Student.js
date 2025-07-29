const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  // 基本信息
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, '姓名是必填项'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['男', '女', '其他', '保密'],
    default: '保密'
  },
  birthdate: {
    type: Date
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    wechat: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  // 教育背景
  education: [{
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
      enum: ['高中', '专科', '本科', '硕士', '博士', '其他'],
      required: true
    },
    gpa: {
      type: Number
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    experiences: [{
      title: String,
      description: String,
      startDate: Date,
      endDate: Date
    }]
  }],
  
  // 求职意向
  jobPreference: {
    industries: [{
      type: String
    }],
    positions: [{
      type: String
    }],
    cities: [{
      type: String
    }],
    expectedSalary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'CNY'
      }
    }
  },
  
  // 标签系统
  tags: [{
    category: {
      type: String,
      enum: ['性格特点', '技能', '优势领域', '兴趣爱好', '其他']
    },
    name: String
  }],
  
  // 辅导信息
  coaching: {
    mainCoach: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    assistantCoaches: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    currentStage: {
      type: String,
      enum: ['初步评估', '简历优化', '面试准备', '谈薪阶段', '入职辅导', '已完成'],
      default: '初步评估'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    packageType: {
      type: String,
      enum: ['基础版', '标准版', '高级版', '定制版'],
      default: '标准版'
    }
  },
  
  // 评估信息
  assessment: {
    personalityType: String, // 如MBTI类型
    careerFitResults: [{
      industry: String,
      position: String,
      fitScore: Number,
      comments: String
    }],
    skillAssessment: [{
      skill: String,
      level: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    }],
    overallComments: String,
    assessmentDate: {
      type: Date
    }
  },
  
  // 系统信息
  status: {
    type: String,
    enum: ['活跃', '暂停', '已完成', '已退出'],
    default: '活跃'
  },
  progress: {
    type: Number, // 总体进度百分比
    default: 0,
    min: 0,
    max: 100
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
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// 索引
studentSchema.index({ 'user': 1 });
studentSchema.index({ 'name': 1 });
studentSchema.index({ 'contactInfo.email': 1 });
studentSchema.index({ 'contactInfo.phone': 1 });
studentSchema.index({ 'coaching.currentStage': 1 });
studentSchema.index({ 'status': 1 });
studentSchema.index({ 'coaching.mainCoach': 1 });

// 虚拟字段：年龄
studentSchema.virtual('age').get(function() {
  if (!this.birthdate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// 方法：更新进度
studentSchema.methods.updateProgress = function(newStage) {
  const stageProgressMap = {
    '初步评估': 10,
    '简历优化': 30,
    '面试准备': 60,
    '谈薪阶段': 80,
    '入职辅导': 90,
    '已完成': 100
  };
  
  this.coaching.currentStage = newStage;
  this.progress = stageProgressMap[newStage] || this.progress;
  
  return this.save();
};

// 方法：添加标签
studentSchema.methods.addTag = function(category, name) {
  if (!this.tags.some(tag => tag.category === category && tag.name === name)) {
    this.tags.push({ category, name });
  }
  return this.save();
};

// 方法：添加笔记
studentSchema.methods.addNote = function(content, userId, isPrivate = false) {
  this.notes.push({
    content,
    createdBy: userId,
    isPrivate
  });
  return this.save();
};

// 静态方法：查找需要跟进的学生
studentSchema.statics.findNeedFollowUp = function() {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  return this.find({
    status: '活跃',
    updatedAt: { $lt: twoWeeksAgo }
  }).populate('coaching.mainCoach', 'username email');
};

module.exports = mongoose.model('Student', studentSchema);