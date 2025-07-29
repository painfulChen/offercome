const express = require('express');
const router = express.Router();
const AIService = require('../services/ai');
const { asyncHandler } = require('../middleware/errorHandler');
const auth = require('../middleware/auth');

// AI聊天接口
router.post('/chat', auth, asyncHandler(async (req, res) => {
  const { message, context = [] } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: '消息内容不能为空'
    });
  }

  const result = await AIService.chat(message, context);
  
  res.json({
    success: true,
    data: result
  });
}));

// 图像生成接口
router.post('/image', auth, asyncHandler(async (req, res) => {
  const { prompt, size = '1024x1024' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: '图像描述不能为空'
    });
  }

  const result = await AIService.generateImage(prompt, size);
  
  res.json({
    success: true,
    data: result
  });
}));

// 文本分析接口
router.post('/analyze', auth, asyncHandler(async (req, res) => {
  const { text, type = 'general' } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: '文本内容不能为空'
    });
  }

  const result = await AIService.analyzeText(text, type);
  
  res.json({
    success: true,
    data: result
  });
}));

// 代码生成接口
router.post('/code', auth, asyncHandler(async (req, res) => {
  const { description, language = 'javascript' } = req.body;
  
  if (!description) {
    return res.status(400).json({
      success: false,
      error: '代码描述不能为空'
    });
  }

  const result = await AIService.generateCode(description, language);
  
  res.json({
    success: true,
    data: result
  });
}));

// 文档生成接口
router.post('/documentation', auth, asyncHandler(async (req, res) => {
  const { code, language = 'javascript' } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: '代码内容不能为空'
    });
  }

  const result = await AIService.generateDocumentation(code, language);
  
  res.json({
    success: true,
    data: result
  });
}));

// 问答接口
router.post('/qa', auth, asyncHandler(async (req, res) => {
  const { question, context = [] } = req.body;
  
  if (!question) {
    return res.status(400).json({
      success: false,
      error: '问题内容不能为空'
    });
  }

  const result = await AIService.answerQuestion(question, context);
  
  res.json({
    success: true,
    data: result
  });
}));

// 获取可用模型列表
router.get('/models', auth, asyncHandler(async (req, res) => {
  const models = await AIService.getAvailableModels();
  
  res.json({
    success: true,
    data: models
  });
}));

// 批量处理接口
router.post('/batch', auth, asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      success: false,
      error: '任务列表不能为空'
    });
  }

  const results = await AIService.batchProcess(tasks);
  
  res.json({
    success: true,
    data: results
  });
}));

module.exports = router; 