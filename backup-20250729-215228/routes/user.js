const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// 获取用户资料
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// 更新用户资料
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { username, email, avatar, preferences } = req.body;
  const updateData = {};

  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (avatar) updateData.avatar = avatar;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: '用户资料更新成功',
    data: user
  });
}));

// 获取用户历史记录
router.get('/history', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const skip = (page - 1) * limit;
  
  const query = { userId: req.user.userId };
  if (type) query.type = type;

  const history = await ChatHistory.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'username avatar');

  const total = await ChatHistory.countDocuments(query);

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// 获取API使用统计
router.get('/api-usage', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }

  // 检查并更新使用限制
  user.checkApiLimit();

  res.json({
    success: true,
    data: {
      totalRequests: user.apiUsage.totalRequests,
      monthlyLimit: user.apiUsage.monthlyLimit,
      remaining: user.apiUsage.monthlyLimit - user.apiUsage.totalRequests,
      lastResetAt: user.apiUsage.lastResetAt
    }
  });
}));

// 管理员：获取所有用户列表
router.get('/admin/users', auth, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (page - 1) * limit;
  
  const query = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) query.role = role;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// 管理员：更新用户状态
router.put('/admin/users/:userId', auth, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive, role, monthlyLimit } = req.body;
  
  const updateData = {};
  if (typeof isActive === 'boolean') updateData.isActive = isActive;
  if (role) updateData.role = role;
  if (monthlyLimit) updateData['apiUsage.monthlyLimit'] = monthlyLimit;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }

  res.json({
    success: true,
    message: '用户状态更新成功',
    data: user
  });
}));

// 管理员：删除用户
router.delete('/admin/users/:userId', auth, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }

  res.json({
    success: true,
    message: '用户删除成功'
  });
}));

// 获取用户统计信息
router.get('/stats', auth, requireRole(['admin']), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });

  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      roleStats
    }
  });
}));

module.exports = router; 