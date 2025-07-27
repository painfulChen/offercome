const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const LoggingService = require('./logging-service');
const AutoFixService = require('./auto-fix-service');
const CostTracker = require('./cost-tracker');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化成本跟踪器
const costTracker = new CostTracker();

// 初始化服务
const logger = new LoggingService();
const autoFix = new AutoFixService();

// 中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1h',
    etag: true
}));

// 埋点日志中间件
app.use((req, res, next) => {
    const start = Date.now();
    
    // 保存原始响应方法
    const originalSend = res.send;
    const originalJson = res.json;
    
    // 重写send方法以捕获响应数据
    res.send = function(data) {
        const responseTime = Date.now() - start;
        logger.logRequest(req, res, responseTime, res.statusCode, data);
        return originalSend.call(this, data);
    };
    
    // 重写json方法以捕获响应数据
    res.json = function(data) {
        const responseTime = Date.now() - start;
        logger.logRequest(req, res, responseTime, res.statusCode, data);
        return originalJson.call(this, data);
    };
    
    // 错误处理
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📝 请求日志: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  costTracker.logCost('health-check', 'SUCCESS', 0);
  
  res.json({
    success: true,
    message: '招生管理系统API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: [
      'AI聊天服务',
      '招生建议生成',
      '合同模板生成',
      '简历优化',
      '面试准备',
      '职业规划'
    ]
  });
});

// AI聊天接口
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      costTracker.logCost('ai-chat', 'FAILED', 0);
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空且必须是字符串'
      });
    }

    // 检查消息长度限制
    if (message.length > 1000) {
      costTracker.logCost('ai-chat', 'FAILED', 0);
      return res.status(400).json({
        success: false,
        error: '消息长度不能超过1000字符'
      });
    }

    // 检查Kimi API Key
    const kimiApiKey = process.env.KIMI_API_KEY;
    
    if (!kimiApiKey || kimiApiKey === 'your_kimi_api_key_here') {
      // 如果没有配置Kimi API Key，使用模拟响应
      const responses = {
        '留学申请': '作为专业的招生顾问，我建议您：\n1. 首先确定目标国家和专业\n2. 准备标准化考试（如托福、GRE）\n3. 准备申请材料（简历、推荐信、个人陈述）\n4. 制定申请时间表\n5. 考虑预算和奖学金机会\n\n您想了解哪个方面的详细信息？',
        '计算机科学': '计算机科学是一个热门专业，我建议：\n1. 重点关注美国、加拿大、英国、澳大利亚的TOP50大学\n2. 准备GRE考试，数学部分要高分\n3. 积累编程项目经验\n4. 准备技术面试\n5. 考虑实习和工作经验\n\n您有具体的学校偏好吗？',
        '硕士申请': '硕士申请需要系统规划：\n1. GPA要求：通常3.0以上\n2. 语言要求：托福90+或雅思6.5+\n3. 标准化考试：GRE或GMAT\n4. 申请材料：简历、推荐信、个人陈述\n5. 申请时间：提前1年开始准备\n\n您目前的背景如何？',
        '美国': '美国留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：托福或雅思\n3. 标准化考试：GRE（理工科）或GMAT（商科）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：I-20、DS-160、面签\n\n您想申请哪个专业？',
        '预算': '留学预算规划：\n1. 学费：每年2-5万美元\n2. 生活费：每年1-2万美元\n3. 住宿费：每年8000-15000美元\n4. 保险费：每年1000-2000美元\n5. 其他费用：机票、签证、考试等\n\n建议准备充足资金，并考虑奖学金申请。',
        '你好': '您好！我是您的专属AI招生顾问，可以为您提供：\n\n🎓 留学申请策略\n📚 专业选择建议\n🏫 院校推荐\n📝 文书指导\n💰 预算规划\n\n请告诉我您的具体需求，我会为您提供专业建议！',
        '介绍': '我是OfferCome智能招生顾问，专门为留学生提供全方位的申请指导服务。\n\n我的主要功能包括：\n• 个性化申请策略制定\n• 院校和专业推荐\n• 申请材料指导\n• 预算规划建议\n• 时间规划安排\n\n请告诉我您的具体情况，我会为您量身定制申请方案！'
      };

      let response = '感谢您的咨询！我是专业的招生顾问AI助手，可以为您提供留学申请、职业规划、简历优化等服务。请告诉我您的具体需求。';
      
      // 智能匹配关键词
      for (const [keyword, reply] of Object.entries(responses)) {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
          response = reply;
          break;
        }
      }

      // 如果没有匹配到关键词，提供通用建议
      if (response === '感谢您的咨询！我是专业的招生顾问AI助手，可以为您提供留学申请、职业规划、简历优化等服务。请告诉我您的具体需求。') {
        response = `我理解您的问题。作为专业的招生顾问，我建议您可以从以下几个方面考虑：

1. **明确目标**：确定想要申请的国家、学校和专业
2. **评估背景**：分析自己的学术背景、语言水平和相关经验
3. **制定计划**：制定详细的申请时间表和准备计划
4. **准备材料**：准备标准化考试、申请文书等材料

您想了解哪个方面的具体信息呢？比如：
• 留学申请流程
• 专业选择建议
• 院校推荐
• 预算规划
• 时间安排`;
      }

      costTracker.logCost('kimi-simulated', 'SUCCESS', 0);
      res.json({
        success: true,
        message: response,
        model: 'kimi-simulated',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 调用真实的Kimi API
    try {
      const kimiResponse = await fetch('https://kimi.moonshot.cn/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${kimiApiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `你是专业的留学招生顾问，请为以下问题提供专业的建议：${message}`
            }
          ],
          model: 'moonshot-v1-8k',
          stream: false
        })
      });

      if (!kimiResponse.ok) {
        throw new Error(`Kimi API错误: ${kimiResponse.status}`);
      }

      const kimiData = await kimiResponse.json();
      
      // 记录Kimi API调用成本 (约0.01元/次)
      costTracker.logCost('kimi-chat', 'SUCCESS', 0.01);
      
      res.json({
        success: true,
        message: kimiData.choices[0].message.content,
        model: 'kimi-real',
        timestamp: new Date().toISOString()
      });
    } catch (kimiError) {
      console.error('Kimi API调用失败:', kimiError);
      costTracker.logCost('kimi-chat', 'FAILED', 0);
      res.status(500).json({
        success: false,
        error: 'Kimi API调用失败',
        message: '请检查API Key是否正确，或稍后重试。'
      });
    }
  } catch (error) {
    console.error('AI聊天错误:', error);
    costTracker.logCost('ai-chat', 'FAILED', 0);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 招生建议生成接口
app.post('/api/ai/admission-advice', async (req, res) => {
  try {
    const studentInfo = req.body;
    
    const advice = `基于您提供的信息，我为您制定以下申请建议：

📚 推荐学校和专业：
1. 美国TOP50大学计算机科学硕士
2. 加拿大TOP10大学
3. 英国G5大学
4. 澳大利亚八大名校

⏰ 申请时间规划：
- 6-8月：准备标准化考试
- 9-10月：准备申请材料
- 11-12月：提交申请
- 1-3月：等待录取结果
- 4-5月：选择学校并准备签证

💰 预算建议：
- 学费：每年2-5万美元
- 生活费：每年1-2万美元
- 建议准备充足资金，并考虑奖学金申请

📝 申请材料清单：
1. 成绩单和学历证明
2. 标准化考试成绩
3. 推荐信（2-3封）
4. 个人陈述
5. 简历
6. 作品集（如需要）

🎯 成功策略：
1. 提前规划，充分准备
2. 选择适合的学校和专业
3. 准备高质量的申请材料
4. 考虑多种申请方案
5. 保持积极的心态

祝您申请成功！`;

    costTracker.logCost('advice-generation', 'SUCCESS', 0);
    res.json({
      success: true,
      message: advice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    costTracker.logCost('advice-generation', 'FAILED', 0);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// AI服务状态接口
app.get('/api/ai/status', (req, res) => {
  costTracker.logCost('status-check', 'SUCCESS', 0);
  res.json({
    success: true,
    status: 'available',
    model: process.env.KIMI_API_KEY && process.env.KIMI_API_KEY !== 'your_kimi_api_key_here' ? 'kimi-real' : 'kimi-simulated',
    timestamp: new Date().toISOString()
  });
});

// 成本统计接口
app.get('/api/cost/stats', (req, res) => {
  try {
    const stats = costTracker.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '统计计算失败',
      message: error.message
    });
  }
});

// 清除成本日志接口
app.delete('/api/cost/clear', (req, res) => {
  try {
    const success = costTracker.clearLog();
    res.json({
      success,
      message: success ? '成本日志已清除' : '清除失败'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '清除失败',
      message: error.message
    });
  }
});

// 获取最近记录接口
app.get('/api/cost/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const records = costTracker.getRecentRecords(limit);
    res.json({
      success: true,
      records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取记录失败',
      message: error.message
    });
  }
});

// 监控面板路由
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/cost-dashboard.html'));
});

// 监控面板API路由
app.get('/monitor/api/stats', (req, res) => {
  // 重定向到成本统计接口
  res.redirect('/api/cost/stats');
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('❌ 服务器错误:', err);
    
    // 记录错误日志
    logger.logError(err, req, 'API_ERROR');
    
    // 尝试自动修复
    autoFix.analyzeAndFix(err, 'API_ERROR').then(fixResult => {
        if (fixResult.success) {
            console.log('✅ 自动修复成功:', fixResult.fixes.map(f => f.description).join(', '));
        } else {
            console.log('❌ 自动修复失败');
        }
    });
    
    res.status(500).json({
        success: false,
        error: '服务器内部错误',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// 404处理
app.use((req, res) => {
    const error = new Error(`路径 ${req.path} 不存在`);
    logger.logError(error, req, '404_ERROR');
    
    res.status(404).json({
        success: false,
        error: '接口不存在',
        message: `路径 ${req.path} 不存在`,
        availableEndpoints: [
            '/api/health',
            '/api/cost/stats',
            '/api/cost/recent',
            '/api/cost/clear',
            '/api/ai/chat',
            '/api/ai/admission-advice',
            '/api/ai/status',
            '/monitor'
        ]
    });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 招生管理系统API服务运行在端口 ${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI聊天: http://localhost:${PORT}/api/ai/chat`);
  console.log(`📚 招生建议: http://localhost:${PORT}/api/ai/admission-advice`);
  console.log(`🔍 服务状态: http://localhost:${PORT}/api/ai/status`);
  console.log(`💰 成本统计: http://localhost:${PORT}/api/cost/stats`);
  console.log(`🌐 网络访问: http://10.0.4.234:${PORT}`);
  console.log(`📊 成本跟踪: ${costTracker.getLogFilePath()}`);
  console.log(`📝 埋点日志: logs/request-tracker.log`);
  console.log(`�� 自动修复: 已启用`);
}); 