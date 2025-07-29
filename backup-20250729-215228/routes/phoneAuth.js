const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const smsService = require('../services/smsService');

// 发送验证码
router.post('/send-code', async (req, res) => {
    try {
        const { phone, type = 'register' } = req.body;

        // 验证手机号格式
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的手机号'
            });
        }

        // 检查手机号是否已注册
        const existingUser = await User.findByPhone(phone);
        
        if (type === 'register' && existingUser) {
            return res.status(400).json({
                success: false,
                message: '该手机号已注册，请直接登录'
            });
        }

        if (type === 'login' && !existingUser) {
            return res.status(400).json({
                success: false,
                message: '该手机号未注册，请先注册'
            });
        }

        // 发送验证码
        const result = await smsService.sendVerificationCode(phone);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                expiresIn: result.expiresIn
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('发送验证码失败:', error);
        res.status(500).json({
            success: false,
            message: '发送验证码失败，请稍后重试'
        });
    }
});

// 手机号注册
router.post('/register', async (req, res) => {
    try {
        const { phone, code, username, password } = req.body;

        // 验证必填字段
        if (!phone || !code || !username || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写完整信息'
            });
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的手机号'
            });
        }

        // 验证用户名格式
        if (username.length < 2 || username.length > 30) {
            return res.status(400).json({
                success: false,
                message: '用户名长度应在2-30个字符之间'
            });
        }

        // 验证密码格式
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码至少6个字符'
            });
        }

        // 验证验证码
        const verifyResult = smsService.verifyCode(phone, code);
        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message
            });
        }

        // 检查用户名是否已存在
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 检查手机号是否已注册
        const existingPhone = await User.findByPhone(phone);
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: '该手机号已注册'
            });
        }

        // 加密密码
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 创建用户
        const user = new User({
            username,
            phone,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        // 生成JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                phone: user.phone,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '7d' }
        );

        // 更新登录信息
        await user.updateLoginInfo();

        res.json({
            success: true,
            message: '注册成功',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({
            success: false,
            message: '注册失败，请稍后重试'
        });
    }
});

// 手机号登录
router.post('/login', async (req, res) => {
    try {
        const { phone, code } = req.body;

        // 验证必填字段
        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: '请填写完整信息'
            });
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的手机号'
            });
        }

        // 验证验证码
        const verifyResult = smsService.verifyCode(phone, code);
        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message
            });
        }

        // 查找用户
        const user = await User.findByPhone(phone);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '该手机号未注册'
            });
        }

        // 检查用户状态
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: '账户已被禁用'
            });
        }

        // 生成JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                phone: user.phone,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '7d' }
        );

        // 更新登录信息
        await user.updateLoginInfo();

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    phone: user.phone,
                    role: user.role,
                    lastLoginAt: user.lastLoginAt,
                    loginCount: user.loginCount
                },
                token
            }
        });

    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    }
});

// 密码登录（备用）
router.post('/login-password', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // 验证必填字段
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写完整信息'
            });
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的手机号'
            });
        }

        // 查找用户
        const user = await User.findByPhone(phone);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '该手机号未注册'
            });
        }

        // 验证密码
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: '密码错误'
            });
        }

        // 检查用户状态
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: '账户已被禁用'
            });
        }

        // 生成JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                phone: user.phone,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '7d' }
        );

        // 更新登录信息
        await user.updateLoginInfo();

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    phone: user.phone,
                    role: user.role,
                    lastLoginAt: user.lastLoginAt,
                    loginCount: user.loginCount
                },
                token
            }
        });

    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    }
});

// 检查验证码状态
router.get('/code-status/:phone', (req, res) => {
    try {
        const { phone } = req.params;
        const status = smsService.getCodeStatus(phone);
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('获取验证码状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取验证码状态失败'
        });
    }
});

module.exports = router; 