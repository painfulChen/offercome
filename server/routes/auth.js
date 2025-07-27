const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// 用户注册
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  // 验证必填字段
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: '用户名、邮箱和密码都是必填项'
    });
  }

  // 检查用户是否已存在
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: '用户名或邮箱已存在'
    });
  }

  // 加密密码
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 创建新用户
  const user = new User({
    username,
    email,
    password: hashedPassword,
    role
  });

  await user.save();

  // 生成JWT令牌
  const token = generateToken({
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  });
}));

// 用户登录
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 验证必填字段
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: '邮箱和密码都是必填项'
    });
  }

  // 查找用户
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: '邮箱或密码错误'
    });
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: '邮箱或密码错误'
    });
  }

  // 更新最后登录时间
  user.lastLoginAt = new Date();
  await user.save();

  // 生成JWT令牌
  const token = generateToken({
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt
      },
      token
    }
  });
}));

// 获取当前用户信息
router.get('/me', auth, asyncHandler(async (req, res) => {
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

// 更新用户信息
router.put('/me', auth, asyncHandler(async (req, res) => {
  const { username, email, avatar } = req.body;
  const updateData = {};

  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: '用户信息更新成功',
    data: user
  });
}));

// 修改密码
router.put('/password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: '当前密码和新密码都是必填项'
    });
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }

  // 验证当前密码
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return res.status(401).json({
      success: false,
      error: '当前密码错误'
    });
  }

  // 加密新密码
  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // 更新密码
  user.password = hashedNewPassword;
  await user.save();

  res.json({
    success: true,
    message: '密码修改成功'
  });
}));

// 用户登出
router.post('/logout', auth, asyncHandler(async (req, res) => {
  // 在实际应用中，可以将token加入黑名单
  // 这里只是返回成功响应
  res.json({
    success: true,
    message: '登出成功'
  });
}));

// 刷新令牌
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: '令牌不能为空'
    });
  }

  try {
    const { refreshToken } = require('../middleware/auth');
    const newToken = refreshToken(token);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '无效的令牌'
    });
  }
}));

module.exports = router; 