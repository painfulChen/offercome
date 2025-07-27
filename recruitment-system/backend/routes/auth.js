const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// 注册验证规则
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  real_name: Joi.string().max(50).optional(),
  role: Joi.string().valid('student', 'teacher').default('student')
});

// 登录验证规则
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// 用户注册
router.post('/register', async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { username, email, password, phone, real_name, role } = value;

    // 检查用户名是否已存在
    const existingUsers = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 获取角色ID
    const roles = await query('SELECT id FROM roles WHERE name = ?', [role]);
    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: '无效的角色'
      });
    }

    const roleId = roles[0].id;

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await query(
      'INSERT INTO users (username, email, password_hash, phone, real_name, role_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, phone, real_name, roleId]
    );

    const userId = result.insertId;

    // 生成Token
    const token = generateToken(userId);

    // 获取用户信息
    const users = await query(
      'SELECT id, username, email, role_id, status FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: users[0],
        token
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { username, password } = value;

    // 查找用户
    const users = await query(
      'SELECT id, username, email, password_hash, role_id, status FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成Token
    const token = generateToken(user.id);

    // 移除密码字段
    delete user.password_hash;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user,
        token,
        expires_in: 86400 // 24小时
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 验证Token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '缺少认证Token'
      });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 从数据库获取用户信息
    const users = await query(
      'SELECT id, username, email, role_id, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户账户已被禁用'
      });
    }

    res.json({
      success: true,
      message: 'Token有效',
      data: { user }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token已过期'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Token无效'
    });
  }
});

module.exports = router; 