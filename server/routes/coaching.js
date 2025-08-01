const express = require('express');
const router = express.Router();

// 获取辅导会话列表
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        sessions: [],
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取会话失败',
      error: error.message
    });
  }
});

module.exports = router; 