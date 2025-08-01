const mongoose = require('mongoose');

// 案例分类Schema
const caseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '分类名称不能为空'],
    maxlength: [100, '分类名称不能超过100个字符'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, '分类描述不能超过500个字符']
  },
  icon: {
    type: String,
    maxlength: [100, '图标名称不能超过100个字符']
  },
  color: {
    type: String,
    default: '#667eea',
    maxlength: [20, '颜色值不能超过20个字符']
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, '排序权重不能为负数']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: [true, '状态不能为空']
  },
  caseCount: {
    type: Number,
    default: 0,
    min: [0, '案例数量不能为负数']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：案例列表
caseCategorySchema.virtual('cases', {
  ref: 'SuccessCase',
  localField: '_id',
  foreignField: 'categoryId',
  justOne: false
});

// 索引
caseCategorySchema.index({ status: 1 });
caseCategorySchema.index({ sortOrder: 1 });
caseCategorySchema.index({ name: 1 });

// 静态方法：获取活跃分类
caseCategorySchema.statics.getActiveCategories = async function() {
  return await this.find({ status: 'active' })
    .sort({ sortOrder: 1, name: 1 });
};

// 静态方法：获取分类及其案例数量
caseCategorySchema.statics.getCategoriesWithCount = async function() {
  return await this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $lookup: {
        from: 'successcases',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'cases'
      }
    },
    {
      $addFields: {
        caseCount: { $size: '$cases' }
      }
    },
    {
      $project: {
        cases: 0
      }
    },
    {
      $sort: { sortOrder: 1, name: 1 }
    }
  ]);
};

// 实例方法：更新案例数量
caseCategorySchema.methods.updateCaseCount = async function() {
  const SuccessCase = mongoose.model('SuccessCase');
  const count = await SuccessCase.countDocuments({ 
    categoryId: this._id,
    status: 'published'
  });
  this.caseCount = count;
  return await this.save();
};

// 中间件：保存前处理
caseCategorySchema.pre('save', function(next) {
  // 确保颜色值格式正确
  if (this.color && !this.color.startsWith('#')) {
    this.color = '#' + this.color;
  }
  
  next();
});

// 中间件：保存后处理
caseCategorySchema.post('save', async function(doc) {
  // 更新案例数量
  await doc.updateCaseCount();
});

module.exports = mongoose.model('CaseCategory', caseCategorySchema); 