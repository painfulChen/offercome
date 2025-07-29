const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware, rateLimit } = require('../middleware/auth');

// 用户注册
router.post('/register', rateLimit(15 * 60 * 1000, 5), AuthController.register);

// 用户登录
router.post('/login', rateLimit(15 * 60 * 1000, 5), AuthController.login);

// 获取用户信息（需要认证）
router.get('/me', authMiddleware, AuthController.getProfile);

// 更新用户信息（需要认证）
router.put('/me', authMiddleware, AuthController.updateProfile);

// 用户登出（需要认证）
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router; 