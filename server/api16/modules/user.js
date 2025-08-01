const { CloudBaseError, logger } = require('../utils/logger');
const envManager = require('../config/env');

// 用户模块处理器
const userHandler = (req, res, next) => {
    const { method, url } = req;
    
    // 处理用户信息获取
    if (method === 'GET' && url.includes('/profile')) {
        return handleGetProfile(req, res);
    }
    
    // 处理用户信息更新
    if (method === 'PUT' && url.includes('/profile')) {
        return handleUpdateProfile(req, res);
    }
    
    // 处理用户列表获取
    if (method === 'GET' && url.includes('/list')) {
        return handleGetUserList(req, res);
    }
    
    // 处理用户删除
    if (method === 'DELETE' && url.includes('/delete')) {
        return handleDeleteUser(req, res);
    }
    
    // 处理用户统计
    if (method === 'GET' && url.includes('/stats')) {
        return handleGetUserStats(req, res);
    }
    
    // 默认返回404
    throw new CloudBaseError('User endpoint not found', 'USER_ENDPOINT_NOT_FOUND', 404);
};

// 处理获取用户信息
const handleGetProfile = (req, res) => {
    try {
        const userId = req.query.userId || req.user?.id || 'user_123';
        
        logger.info('Get user profile', { userId });
        
        // 模拟用户数据（实际项目中应该查询数据库）
        const userProfile = {
            id: userId,
            username: 'testuser',
            email: 'test@example.com',
            avatar: 'https://via.placeholder.com/150',
            phone: '13800138000',
            location: '北京',
            bio: '热爱技术，追求进步',
            skills: ['JavaScript', 'Node.js', 'React', 'Python'],
            experience: '3年',
            education: '计算机科学学士',
            createdAt: '2024-01-01T00:00:00.000Z',
            lastLogin: new Date().toISOString(),
            preferences: {
                notifications: true,
                privacy: 'public',
                language: 'zh-CN'
            }
        };
        
        res.json({
            success: true,
            message: '获取用户信息成功',
            data: {
                user: userProfile
            }
        });
        
    } catch (error) {
        logger.error('Get profile error', { error: error.message });
        throw new CloudBaseError('获取用户信息失败', 'GET_PROFILE_ERROR', 500);
    }
};

// 处理更新用户信息
const handleUpdateProfile = (req, res) => {
    try {
        const { username, email, phone, location, bio, skills } = req.body;
        const userId = req.user?.id || 'user_123';
        
        logger.info('Update user profile', { userId, updatedFields: Object.keys(req.body) });
        
        // 参数验证
        if (email && !isValidEmail(email)) {
            throw new CloudBaseError('邮箱格式不正确', 'INVALID_EMAIL', 400);
        }
        
        if (phone && !isValidPhone(phone)) {
            throw new CloudBaseError('手机号格式不正确', 'INVALID_PHONE', 400);
        }
        
        // 模拟更新用户信息（实际项目中应该更新数据库）
        const updatedProfile = {
            id: userId,
            username: username || 'testuser',
            email: email || 'test@example.com',
            phone: phone || '13800138000',
            location: location || '北京',
            bio: bio || '热爱技术，追求进步',
            skills: skills || ['JavaScript', 'Node.js', 'React', 'Python'],
            updatedAt: new Date().toISOString()
        };
        
        logger.info('User profile updated successfully', { userId });
        
        res.json({
            success: true,
            message: '更新用户信息成功',
            data: {
                user: updatedProfile
            }
        });
        
    } catch (error) {
        if (error instanceof CloudBaseError) {
            throw error;
        }
        logger.error('Update profile error', { error: error.message });
        throw new CloudBaseError('更新用户信息失败', 'UPDATE_PROFILE_ERROR', 500);
    }
};

// 处理获取用户列表
const handleGetUserList = (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        logger.info('Get user list', { page, limit, search });
        
        // 模拟用户列表数据（实际项目中应该查询数据库）
        const mockUsers = Array.from({ length: 20 }, (_, index) => ({
            id: `user_${index + 1}`,
            username: `user${index + 1}`,
            email: `user${index + 1}@example.com`,
            avatar: `https://via.placeholder.com/150?text=U${index + 1}`,
            status: index % 3 === 0 ? 'active' : 'inactive',
            createdAt: new Date(Date.now() - index * 86400000).toISOString(),
            lastLogin: new Date(Date.now() - index * 3600000).toISOString()
        }));
        
        // 简单的搜索过滤
        const filteredUsers = search 
            ? mockUsers.filter(user => 
                user.username.includes(search) || 
                user.email.includes(search)
              )
            : mockUsers;
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            message: '获取用户列表成功',
            data: {
                users: paginatedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filteredUsers.length,
                    totalPages: Math.ceil(filteredUsers.length / limit)
                }
            }
        });
        
    } catch (error) {
        logger.error('Get user list error', { error: error.message });
        throw new CloudBaseError('获取用户列表失败', 'GET_USER_LIST_ERROR', 500);
    }
};

// 处理删除用户
const handleDeleteUser = (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            throw new CloudBaseError('用户ID不能为空', 'MISSING_USER_ID', 400);
        }
        
        logger.info('Delete user', { userId });
        
        // 模拟删除用户（实际项目中应该从数据库删除）
        // 这里只是返回成功，实际应该检查用户是否存在
        
        logger.info('User deleted successfully', { userId });
        
        res.json({
            success: true,
            message: '删除用户成功',
            data: {
                deletedUserId: userId,
                deletedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        if (error instanceof CloudBaseError) {
            throw error;
        }
        logger.error('Delete user error', { error: error.message });
        throw new CloudBaseError('删除用户失败', 'DELETE_USER_ERROR', 500);
    }
};

// 处理获取用户统计
const handleGetUserStats = (req, res) => {
    try {
        logger.info('Get user statistics');
        
        // 模拟用户统计数据（实际项目中应该查询数据库）
        const stats = {
            totalUsers: 1250,
            activeUsers: 890,
            newUsersThisMonth: 45,
            newUsersThisWeek: 12,
            userGrowth: {
                daily: [120, 135, 142, 138, 145, 150, 148],
                weekly: [850, 870, 890, 920, 950, 980, 1000],
                monthly: [8000, 8200, 8500, 8800, 9200, 9500, 9800]
            },
            topSkills: [
                { skill: 'JavaScript', count: 450 },
                { skill: 'Python', count: 380 },
                { skill: 'React', count: 320 },
                { skill: 'Node.js', count: 280 },
                { skill: 'Java', count: 250 }
            ],
            userLocations: [
                { location: '北京', count: 320 },
                { location: '上海', count: 280 },
                { location: '深圳', count: 250 },
                { location: '广州', count: 180 },
                { location: '杭州', count: 150 }
            ]
        };
        
        res.json({
            success: true,
            message: '获取用户统计成功',
            data: {
                stats,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        logger.error('Get user stats error', { error: error.message });
        throw new CloudBaseError('获取用户统计失败', 'GET_USER_STATS_ERROR', 500);
    }
};

// 验证邮箱格式
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 验证手机号格式
const isValidPhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
};

module.exports = userHandler; 