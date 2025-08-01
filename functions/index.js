const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求ID追踪
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// 健康检查路由
app.get('/api/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      stage: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 用户认证路由
app.use('/api/auth', require('../server/routes/auth'));

// AI服务路由
app.use('/api/ai', require('../server/routes/ai'));

// 案例管理路由
app.use('/api/cases', require('../server/routes/cases'));

// 辅导会话路由
app.use('/api/coaching', require('../server/routes/coaching'));

// 用户管理路由
app.use('/api/users', require('../server/routes/users'));

// 数据备份路由
app.use('/api/backup', require('../server/routes/backup'));

// 性能监控路由
app.use('/api/monitor', require('../server/routes/monitor'));

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'CloudBase AI API Service',
    version: '1.0.0',
    status: 'running',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    stage: process.env.NODE_ENV
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    requestId: req.requestId
  });
});

// 统一入口处理函数
exports.main_handler = async (event, context) => {
  const { httpMethod, path, headers, body, queryString } = event;
  
  // 构建Express请求对象
  const req = {
    method: httpMethod,
    url: path,
    headers: headers || {},
    body: body ? JSON.parse(body) : {},
    query: queryString || {},
    originalUrl: path
  };
  
  // 构建Express响应对象
  let responseBody = '';
  let responseStatus = 200;
  let responseHeaders = {};
  
  const res = {
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseBody = JSON.stringify(data);
      responseHeaders['Content-Type'] = 'application/json';
      return res;
    },
    send: (data) => {
      responseBody = data;
      return res;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return res;
    }
  };
  
  // 处理请求
  try {
    // 模拟Express中间件链
    await new Promise((resolve, reject) => {
      const next = (error) => {
        if (error) reject(error);
        else resolve();
      };
      
      // 执行路由匹配
      app._router.handle(req, res, next);
    });
    
    return {
      statusCode: responseStatus,
      headers: responseHeaders,
      body: responseBody
    };
  } catch (error) {
    console.error('CloudBase函数错误:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        requestId: context.requestId
      })
    };
  }
}; 