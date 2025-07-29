const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [2, '用户名至少2个字符'],
    maxlength: [30, '用户名最多30个字符']
  },
  phone: {
    type: String,
    required: [true, '手机号是必填项'],
    unique: true,
    trim: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // 允许空值
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少6个字符']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'zh-CN'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  apiUsage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastResetAt: {
      type: Date,
      default: Date.now
    },
    monthlyLimit: {
      type: Number,
      default: 1000
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新登录信息
userSchema.methods.updateLoginInfo = async function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// 检查API使用限制
userSchema.methods.checkApiLimit = function() {
  const now = new Date();
  const lastReset = new Date(this.apiUsage.lastResetAt);
  
  // 如果超过一个月，重置计数
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.apiUsage.totalRequests = 0;
    this.apiUsage.lastResetAt = now;
  }
  
  return this.apiUsage.totalRequests < this.apiUsage.monthlyLimit;
};

// 增加API使用计数
userSchema.methods.incrementApiUsage = async function() {
  this.apiUsage.totalRequests += 1;
  return this.save();
};

// 静态方法：根据邮箱查找用户
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// 静态方法：根据用户名查找用户
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// 静态方法：根据手机号查找用户
userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema); 