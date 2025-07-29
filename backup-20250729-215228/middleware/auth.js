const jwt = require('jsonwebtoken');
const db = require('../config/database-cloud');

// JWT认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'offercome_secret');
    
    // 从数据库获取用户信息
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
    
  } catch (error) {
    console.error('认证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '认证令牌已过期'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: '认证失败'
    });
  }
};

// 可选认证中间件（不强制要求认证）
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'offercome_secret');
      const user = await db.getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败不影响请求继续
    next();
  }
};

// 角色验证中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '需要认证'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: '权限不足'
      });
    }
    
    next();
  };
};

// 速率限制中间件
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // 清理过期的请求记录
    if (requests.has(ip)) {
      const userRequests = requests.get(ip);
      const validRequests = userRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= max) {
        return res.status(429).json({
          success: false,
          error: '请求过于频繁，请稍后再试'
        });
      }
      
      validRequests.push(now);
      requests.set(ip, validRequests);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  rateLimit
}; 