const express = require('express');
const router = express.Router();

// 获取备份列表
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        backups: [],
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取备份失败',
      error: error.message
    });
  }
});

module.exports = router; 