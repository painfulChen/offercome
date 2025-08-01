const express = require('express');
const router = express.Router();

// 获取系统状态
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取状态失败',
      error: error.message
    });
  }
});

module.exports = router; 