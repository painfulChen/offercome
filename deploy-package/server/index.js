const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB, healthCheck } = require('./config/database.js');
const User = require('./models/User.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 数据库连接
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('✅ 数据库连接成功');
}).catch(err => {
  console.error('❌ 数据库连接失败:', err);
});

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await healthCheck();
    res.json({
      success: true,
      message: '招生管理系统API服务正常运行',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbStatus,
      features: [
        'AI聊天服务',
        '招生建议生成',
        '合同模板生成',
        '简历优化',
        '面试准备',
        '职业规划'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '健康检查失败',
      message: error.message
    });
  }
});

// 用户认证路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
        message: '用户名、邮箱和密码都是必需的'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用户已存在',
        message: '用户名或邮箱已被注册'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      role,
      isActive: true
    });

    await user.save();

    res.json({
      success: true,
      message: '用户注册成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      error: '注册失败',
      message: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
        message: '用户名和密码都是必需的'
      });
    }

    // 查找用户
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '密码错误',
        message: '用户名或密码错误'
      });
    }

    // 更新登录信息
    await user.updateLoginInfo();

    res.json({
      success: true,
      message: '登录成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        lastLogin: user.lastLogin
      },
      token: `token_${user._id}_${Date.now()}`
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      error: '登录失败',
      message: error.message
    });
  }
});

// AI服务路由
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '缺少消息内容',
        message: '请提供聊天消息'
      });
    }

    // 模拟AI响应
    const responses = [
      '您好！我是招生助手，很高兴为您服务。',
      '关于招生问题，我可以为您提供专业的建议。',
      '请问您想了解哪个方面的招生信息？',
      '我可以帮您分析招生趋势和策略。',
      '有什么具体的招生问题需要咨询吗？'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // 记录API调用
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $inc: { apiCallCount: 1 },
          $set: { lastApiCall: new Date() }
        });
      } catch (error) {
        console.error('记录API调用失败:', error);
      }
    }

    res.json({
      success: true,
      message: 'AI聊天成功',
      data: {
        response: randomResponse,
        timestamp: new Date().toISOString(),
        messageId: Math.random().toString(36).substr(2, 9)
      }
    });
  } catch (error) {
    console.error('AI聊天失败:', error);
    res.status(500).json({
      success: false,
      error: 'AI聊天失败',
      message: error.message
    });
  }
});

app.post('/api/ai/admission-advice', async (req, res) => {
  try {
    const { studentInfo, targetSchool, userId } = req.body;
    
    if (!studentInfo || !targetSchool) {
      return res.status(400).json({
        success: false,
        error: '缺少必要信息',
        message: '请提供学生信息和目标学校'
      });
    }

    // 模拟招生建议
    const advice = {
      strategy: '基于您的背景，建议采取以下策略：',
      recommendations: [
        '加强相关专业的基础知识',
        '准备充分的申请材料',
        '参加相关实习或项目',
        '提升语言能力',
        '建立专业人脉网络'
      ],
      timeline: '建议提前6-12个月开始准备',
      riskFactors: '需要注意的竞争因素和挑战',
      successRate: '根据历史数据分析，成功率约为75%'
    };

    // 记录API调用
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $inc: { apiCallCount: 1 },
          $set: { lastApiCall: new Date() }
        });
      } catch (error) {
        console.error('记录API调用失败:', error);
      }
    }

    res.json({
      success: true,
      message: '招生建议生成成功',
      data: {
        advice,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      }
    });
  } catch (error) {
    console.error('生成招生建议失败:', error);
    res.status(500).json({
      success: false,
      error: '生成招生建议失败',
      message: error.message
    });
  }
});

// 用户管理路由
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      success: true,
      message: '获取用户列表成功',
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败',
      message: error.message
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
        message: '找不到指定的用户'
      });
    }
    
    res.json({
      success: true,
      message: '获取用户信息成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
      message: error.message
    });
  }
});

// 成本统计路由
app.get('/api/cost/stats', (req, res) => {
  res.json({
    success: true,
    message: '成本统计',
    data: {
      totalCost: 0,
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      successRate: 100
    }
  });
});

app.get('/api/cost/recent', (req, res) => {
  res.json({
    success: true,
    message: '最近成本记录',
    data: []
  });
});

app.post('/api/cost/clear', (req, res) => {
  res.json({
    success: true,
    message: '成本记录已清空'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    message: `路径 ${req.originalUrl} 不存在`,
    availableEndpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/ai/chat',
      '/api/ai/admission-advice',
      '/api/users',
      '/api/users/:id',
      '/api/cost/stats',
      '/api/cost/recent',
      '/api/cost/clear'
    ]
  });
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功！`);
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`🌐 API地址: http://localhost:${PORT}/api`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app; 