const { logger, logError } = require('../utils/logger');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logError(err, req);
  
  // 默认错误信息
  let error = {
    message: err.message || '服务器内部错误',
    status: err.status || 500
  };
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = '数据验证失败';
    error.details = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    error.status = 400;
    error.message = '无效的数据格式';
  } else if (err.code === 11000) {
    error.status = 409;
    error.message = '数据已存在';
  } else if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = '无效的令牌';
  } else if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = '令牌已过期';
  }
  
  // 开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }
  
  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  });
};

// 异步错误处理包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404错误处理
const notFoundHandler = (req, res, next) => {
  const error = new Error(`接口不存在 - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
}; 