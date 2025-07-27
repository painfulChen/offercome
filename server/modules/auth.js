const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CloudBaseError, logger, validateSchema } = require('../utils/logger');
const envManager = require('../config/env');

// 认证模块处理器
const authHandler = (req, res, next) => {
    const { method, url } = req;
    
    // 处理登录
    if (method === 'POST' && url.includes('/login')) {
        return handleLogin(req, res);
    }
    
    // 处理注册
    if (method === 'POST' && url.includes('/register')) {
        return handleRegister(req, res);
    }
    
    // 处理登出
    if (method === 'POST' && url.includes('/logout')) {
        return handleLogout(req, res);
    }
    
    // 处理token验证
    if (method === 'GET' && url.includes('/verify')) {
        return handleTokenVerify(req, res);
    }
    
    // 默认返回404
    throw new CloudBaseError('Auth endpoint not found', 'AUTH_ENDPOINT_NOT_FOUND', 404);
};

// 处理用户登录
const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 参数验证
        if (!username || !password) {
            throw new CloudBaseError('用户名和密码不能为空', 'MISSING_CREDENTIALS', 400);
        }
        
        logger.info('User login attempt', { username });
        
        // 模拟用户验证（实际项目中应该查询数据库）
        const mockUser = {
            id: 'user_123',
            username: 'testuser',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10)
        };
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, mockUser.password);
        if (!isValidPassword) {
            throw new CloudBaseError('用户名或密码错误', 'INVALID_CREDENTIALS', 401);
        }
        
        // 生成JWT token
        const token = jwt.sign(
            { userId: mockUser.id, username: mockUser.username },
            envManager.get('JWT_SECRET', 'default-secret'),
            { expiresIn: '24h' }
        );
        
        logger.info('User login successful', { userId: mockUser.id, username });
        
        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email
                }
            }
        });
        
    } catch (error) {
        if (error instanceof CloudBaseError) {
            throw error;
        }
        logger.error('Login error', { error: error.message });
        throw new CloudBaseError('登录失败', 'LOGIN_ERROR', 500);
    }
};

// 处理用户注册
const handleRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 参数验证
        if (!username || !email || !password) {
            throw new CloudBaseError('用户名、邮箱和密码不能为空', 'MISSING_REGISTRATION_DATA', 400);
        }
        
        if (password.length < 6) {
            throw new CloudBaseError('密码长度至少6位', 'PASSWORD_TOO_SHORT', 400);
        }
        
        logger.info('User registration attempt', { username, email });
        
        // 模拟用户创建（实际项目中应该保存到数据库）
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: `user_${Date.now()}`,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        // 生成JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            envManager.get('JWT_SECRET', 'default-secret'),
            { expiresIn: '24h' }
        );
        
        logger.info('User registration successful', { userId: newUser.id, username });
        
        res.json({
            success: true,
            message: '注册成功',
            data: {
                token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            }
        });
        
    } catch (error) {
        if (error instanceof CloudBaseError) {
            throw error;
        }
        logger.error('Registration error', { error: error.message });
        throw new CloudBaseError('注册失败', 'REGISTRATION_ERROR', 500);
    }
};

// 处理用户登出
const handleLogout = (req, res) => {
    try {
        logger.info('User logout', { userId: req.user?.id });
        
        res.json({
            success: true,
            message: '登出成功'
        });
        
    } catch (error) {
        logger.error('Logout error', { error: error.message });
        throw new CloudBaseError('登出失败', 'LOGOUT_ERROR', 500);
    }
};

// 处理token验证
const handleTokenVerify = (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            throw new CloudBaseError('Token不能为空', 'MISSING_TOKEN', 401);
        }
        
        // 验证token
        const decoded = jwt.verify(token, envManager.get('JWT_SECRET', 'default-secret'));
        
        logger.info('Token verification successful', { userId: decoded.userId });
        
        res.json({
            success: true,
            message: 'Token验证成功',
            data: {
                user: {
                    id: decoded.userId,
                    username: decoded.username
                }
            }
        });
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new CloudBaseError('Token无效', 'INVALID_TOKEN', 401);
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new CloudBaseError('Token已过期', 'TOKEN_EXPIRED', 401);
        }
        logger.error('Token verification error', { error: error.message });
        throw new CloudBaseError('Token验证失败', 'TOKEN_VERIFICATION_ERROR', 500);
    }
};

module.exports = authHandler; 