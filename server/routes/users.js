const express = require('express');
const router = express.Router();

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        users: [],
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户失败',
      error: error.message
    });
  }
});

module.exports = router; 