const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 根路由 - 提供前端页面
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// API路由前缀检查
app.use('/api', (req, res, next) => {
  console.log(`API请求: ${req.method} ${req.path}`);
  next();
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '招生管理系统API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
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

// 简化的AI聊天接口（模拟Kimi响应）
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    // 模拟Kimi AI响应
    const responses = {
      '留学申请': '作为专业的招生顾问，我建议您：\n1. 首先确定目标国家和专业\n2. 准备标准化考试（如托福、GRE）\n3. 准备申请材料（简历、推荐信、个人陈述）\n4. 制定申请时间表\n5. 考虑预算和奖学金机会\n\n您想了解哪个方面的详细信息？',
      '计算机科学': '计算机科学是一个热门专业，我建议：\n1. 重点关注美国、加拿大、英国、澳大利亚的TOP50大学\n2. 准备GRE考试，数学部分要高分\n3. 积累编程项目经验\n4. 准备技术面试\n5. 考虑实习和工作经验\n\n您有具体的学校偏好吗？',
      '硕士申请': '硕士申请需要系统规划：\n1. GPA要求：通常3.0以上\n2. 语言要求：托福90+或雅思6.5+\n3. 标准化考试：GRE或GMAT\n4. 申请材料：简历、推荐信、个人陈述\n5. 申请时间：提前1年开始准备\n\n您目前的背景如何？',
      '美国': '美国留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：托福或雅思\n3. 标准化考试：GRE（理工科）或GMAT（商科）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：I-20、DS-160、面签\n\n您想申请哪个专业？',
      '预算': '留学预算规划：\n1. 学费：每年2-5万美元\n2. 生活费：每年1-2万美元\n3. 住宿费：每年8000-15000美元\n4. 保险费：每年1000-2000美元\n5. 其他费用：机票、签证、考试等\n\n建议准备充足资金，并考虑奖学金申请。'
    };

    let response = '感谢您的咨询！我是专业的招生顾问AI助手，可以为您提供留学申请、职业规划、简历优化等服务。请告诉我您的具体需求。';
    
    for (const [keyword, reply] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        response = reply;
        break;
      }
    }

    res.json({
      success: true,
      message: response,
      model: 'kimi-simulated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
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
- 4-6月：签证准备

💰 预算分配：
- 学费：40-60万人民币
- 生活费：20-30万人民币
- 其他费用：10万人民币

📋 需要准备的材料：
1. 成绩单和学历证明
2. 标准化考试成绩
3. 推荐信（2-3封）
4. 个人陈述
5. 简历
6. 作品集（如需要）

🎯 申请策略：
1. 冲刺学校：2-3所
2. 匹配学校：3-4所
3. 保底学校：2-3所

祝您申请顺利！`;

    res.json({
      success: true,
      message: advice,
      model: 'kimi-simulated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// AI服务状态接口
app.get('/api/ai/status', async (req, res) => {
  res.json({
    success: true,
    service: 'Kimi AI (Simulated)',
    status: 'available',
    apiKey: 'configured',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 招生管理系统API服务运行在端口 ${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI聊天: http://localhost:${PORT}/api/ai/chat`);
  console.log(`📚 招生建议: http://localhost:${PORT}/api/ai/admission-advice`);
  console.log(`🔍 服务状态: http://localhost:${PORT}/api/ai/status`);
});

module.exports = app; 