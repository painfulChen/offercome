const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database-cloud');

class AuthController {
  // 用户注册
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // 验证输入
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: '用户名、邮箱和密码不能为空'
        });
      }
      
      // 检查用户是否已存在
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '该邮箱已被注册'
        });
      }
      
      // 加密密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      const result = await db.createUser(username, email, passwordHash);
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: result.insertId },
        process.env.JWT_SECRET || 'offercome_secret',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: '注册成功',
        user: {
          id: result.insertId,
          username,
          email
        },
        token
      });
      
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        error: '注册失败，请稍后再试'
      });
    }
  }
  
  // 用户登录
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // 验证输入
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: '邮箱和密码不能为空'
        });
      }
      
      // 查找用户
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '邮箱或密码错误'
        });
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: '邮箱或密码错误'
        });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'offercome_secret',
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
      
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        error: '登录失败，请稍后再试'
      });
    }
  }
  
  // 获取用户信息
  static async getProfile(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      });
      
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        error: '获取用户信息失败'
      });
    }
  }
  
  // 更新用户信息
  static async updateProfile(req, res) {
    try {
      const { username, email } = req.body;
      const userId = req.user.id;
      
      // 验证输入
      if (!username || !email) {
        return res.status(400).json({
          success: false,
          error: '用户名和邮箱不能为空'
        });
      }
      
      // 检查邮箱是否被其他用户使用
      const existingUser = await db.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          error: '该邮箱已被其他用户使用'
        });
      }
      
      // 更新用户信息
      await db.updateUser(userId, username, email);
      
      res.json({
        success: true,
        message: '用户信息更新成功',
        user: {
          id: userId,
          username,
          email
        }
      });
      
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({
        success: false,
        error: '更新用户信息失败'
      });
    }
  }
  
  // 用户登出
  static async logout(req, res) {
    try {
      // 在实际应用中，可以将token加入黑名单
      // 这里简单返回成功
      res.json({
        success: true,
        message: '登出成功'
      });
      
    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        error: '登出失败'
      });
    }
  }
}

module.exports = AuthController; 