const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const KimiService = require('./services/kimi-real');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '招生管理系统API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'AI聊天服务 (真实Kimi API)',
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
    const { message, context = '' } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    const result = await KimiService.chat(message, context);
    
    res.json(result);
  } catch (error) {
    console.error('AI聊天错误:', error);
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
    
    if (!studentInfo) {
      return res.status(400).json({
        success: false,
        error: '学生信息不能为空'
      });
    }

    const result = await KimiService.generateAdmissionAdvice(studentInfo);
    
    res.json(result);
  } catch (error) {
    console.error('招生建议生成错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// AI服务状态接口
app.get('/api/ai/status', async (req, res) => {
  try {
    const result = await KimiService.getServiceStatus();
    res.json(result);
  } catch (error) {
    console.error('服务状态检查错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
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
  console.log(`✨ 使用真实Kimi API (新Key)`);
});

module.exports = app; 