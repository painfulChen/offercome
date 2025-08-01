const express = require('express');
const router = express.Router();

// AI聊天服务
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: '请提供消息内容'
      });
    }
    
    // 这里可以集成OpenAI API
    const response = {
      message: `AI回复: ${message}`,
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous'
    };
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI聊天错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI服务暂时不可用',
      error: error.message
    });
  }
});

// MBTI测试问题
router.get('/mbti/questions', async (req, res) => {
  try {
    const questions = [
      { id: 1, text: '在社交场合中，你更倾向于：', options: [
        { text: '主动与他人交谈', score: { E: 1 } },
        { text: '等待他人主动接近', score: { I: 1 } }
      ]},
      { id: 2, text: '你更喜欢的工作环境是：', options: [
        { text: '团队合作，有互动', score: { E: 1 } },
        { text: '独立工作，安静专注', score: { I: 1 } }
      ]},
      // 可以添加更多问题...
    ];
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('获取MBTI问题错误:', error);
    res.status(500).json({
      success: false,
      message: '获取问题失败',
      error: error.message
    });
  }
});

module.exports = router; 