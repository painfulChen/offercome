const express = require('express');
const router = express.Router();
const AIService = require('../services/ai');

// 简化的AI聊天接口（无认证）
router.post('/chat', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI服务正常运行',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 