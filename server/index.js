const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 数据库连接
const { createPool } = require('./config/database-persistent');

// 健康检查路由
app.get('/api/health', async (req, res) => {
  try {
    const pool = await createPool();
    const [result] = await pool.execute('SELECT 1 as status');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result[0].status === 1 ? 'connected' : 'error',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 用户认证路由
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// AI服务路由
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// 案例管理路由
const caseRoutes = require('./routes/cases');
app.use('/api/cases', caseRoutes);

// 辅导会话路由
const coachingRoutes = require('./routes/coaching');
app.use('/api/coaching', coachingRoutes);

// 用户管理路由
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// 数据备份路由
const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

// 性能监控路由
const monitorRoutes = require('./routes/monitor');
app.use('/api/monitor', monitorRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'CloudBase AI API Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API服务器运行在端口 ${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  });
}

// CloudBase云函数导出
const main = async (event, context) => {
  const { httpMethod, path, headers, body, queryString } = event;
  
  // 构建Express请求对象
  const req = {
    method: httpMethod,
    url: path,
    headers: headers || {},
    body: body ? JSON.parse(body) : {},
    query: queryString || {}
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
        message: error.message
      })
    };
  }
};

// 导出main函数
module.exports = { main }; 