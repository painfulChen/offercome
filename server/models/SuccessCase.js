const mongoose = require('mongoose');

// 优秀案例Schema
const successCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '案例标题不能为空'],
    maxlength: [200, '标题长度不能超过200个字符']
  },
  subtitle: {
    type: String,
    maxlength: [500, '副标题长度不能超过500个字符']
  },
  description: {
    type: String,
    required: [true, '案例描述不能为空']
  },
  industry: {
    type: String,
    required: [true, '所属行业不能为空'],
    maxlength: [100, '行业名称不能超过100个字符']
  },
  position: {
    type: String,
    required: [true, '目标职位不能为空'],
    maxlength: [100, '职位名称不能超过100个字符']
  },
  salaryRange: {
    type: String,
    required: [true, '薪资范围不能为空'],
    maxlength: [100, '薪资范围不能超过100个字符']
  },
  company: {
    type: String,
    required: [true, '入职公司不能为空'],
    maxlength: [200, '公司名称不能超过200个字符']
  },
  location: {
    type: String,
    required: [true, '工作地点不能为空'],
    maxlength: [100, '地点名称不能超过100个字符']
  },
  duration: {
    type: String,
    required: [true, '求职周期不能为空'],
    maxlength: [100, '周期描述不能超过100个字符']
  },
  beforeSalary: {
    type: String,
    required: [true, '求职前薪资不能为空'],
    maxlength: [100, '薪资描述不能超过100个字符']
  },
  afterSalary: {
    type: String,
    required: [true, '求职后薪资不能为空'],
    maxlength: [100, '薪资描述不能超过100个字符']
  },
  improvementRate: {
    type: String,
    required: [true, '薪资提升比例不能为空'],
    maxlength: [50, '提升比例不能超过50个字符']
  },
  avatarUrl: {
    type: String,
    required: [true, '学员头像不能为空'],
    maxlength: [500, '头像URL不能超过500个字符']
  },
  coverImage: {
    type: String,
    required: [true, '封面图片不能为空'],
    maxlength: [500, '封面图片URL不能超过500个字符']
  },
  images: [{
    type: String,
    maxlength: [500, '图片URL不能超过500个字符']
  }],
  tags: [{
    type: String,
    maxlength: [50, '标签长度不能超过50个字符']
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseCategory',
    required: [true, '分类ID不能为空']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    required: [true, '发布状态不能为空']
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, '浏览次数不能为负数']
  },
  likeCount: {
    type: Number,
    default: 0,
    min: [0, '点赞次数不能为负数']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '创建者不能为空']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：分类信息
successCaseSchema.virtual('category', {
  ref: 'CaseCategory',
  localField: 'categoryId',
  foreignField: 'id',
  justOne: true
});

// 虚拟字段：创建者信息
successCaseSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// 索引
successCaseSchema.index({ status: 1 });
successCaseSchema.index({ featured: 1 });
successCaseSchema.index({ categoryId: 1 });
successCaseSchema.index({ industry: 1 });
successCaseSchema.index({ position: 1 });
successCaseSchema.index({ company: 1 });
successCaseSchema.index({ createdAt: -1 });
successCaseSchema.index({ viewCount: -1 });
successCaseSchema.index({ likeCount: -1 });
successCaseSchema.index({ tags: 1 });

// 实例方法：增加浏览次数
successCaseSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return await this.save();
};

// 实例方法：增加点赞次数
successCaseSchema.methods.incrementLikeCount = async function() {
  this.likeCount += 1;
  return await this.save();
};

// 静态方法：获取热门案例
successCaseSchema.statics.getHotCases = async function(limit = 10) {
  return await this.find({ status: 'published' })
    .sort({ viewCount: -1, likeCount: -1 })
    .limit(limit)
    .populate('category', 'name color icon')
    .populate('creator', 'username avatar');
};

// 静态方法：获取推荐案例
successCaseSchema.statics.getFeaturedCases = async function(limit = 6) {
  return await this.find({ 
    status: 'published', 
    featured: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name color icon')
    .populate('creator', 'username avatar');
};

// 静态方法：按行业获取案例
successCaseSchema.statics.getCasesByIndustry = async function(industry, limit = 10) {
  return await this.find({ 
    status: 'published', 
    industry: industry 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name color icon')
    .populate('creator', 'username avatar');
};

// 静态方法：搜索案例
successCaseSchema.statics.searchCases = async function(keyword, limit = 20) {
  const regex = new RegExp(keyword, 'i');
  return await this.find({
    status: 'published',
    $or: [
      { title: regex },
      { subtitle: regex },
      { description: regex },
      { industry: regex },
      { position: regex },
      { company: regex },
      { tags: regex }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name color icon')
    .populate('creator', 'username avatar');
};

// 中间件：保存前处理
successCaseSchema.pre('save', function(next) {
  // 确保标签是数组
  if (this.tags && !Array.isArray(this.tags)) {
    this.tags = [this.tags];
  }
  
  // 确保图片是数组
  if (this.images && !Array.isArray(this.images)) {
    this.images = [this.images];
  }
  
  next();
});

// 中间件：保存后处理
successCaseSchema.post('save', function(doc) {
  // 可以在这里添加保存后的处理逻辑
  // 比如：发送通知、更新缓存等
});

module.exports = mongoose.model('SuccessCase', successCaseSchema); 