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

// 健康检查路由
app.get('/api/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
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

// CloudBase云函数导出
exports.main = async (event, context) => {
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