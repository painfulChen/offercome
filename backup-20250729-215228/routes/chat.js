const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const AIService = require('../services/ai');

// 实时聊天接口
router.post('/send', auth, asyncHandler(async (req, res) => {
  const { message, roomId = 'default' } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: '消息内容不能为空'
    });
  }

  // 调用AI服务获取回复
  const aiResponse = await AIService.chat(message);
  
  // 保存聊天记录到数据库（这里可以添加ChatHistory模型）
  
  res.json({
    success: true,
    data: {
      message: aiResponse.message,
      roomId,
      timestamp: new Date().toISOString()
    }
  });
}));

// 获取聊天历史
router.get('/history/:roomId?', auth, asyncHandler(async (req, res) => {
  const { roomId = 'default' } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // 这里应该从数据库获取聊天历史
  // 暂时返回模拟数据
  const mockHistory = [
    {
      id: 1,
      message: '你好！我是AI助手，有什么可以帮助你的吗？',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      roomId
    }
  ];

  res.json({
    success: true,
    data: {
      history: mockHistory,
      roomId,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockHistory.length
      }
    }
  });
}));

// 创建新的聊天房间
router.post('/rooms', auth, asyncHandler(async (req, res) => {
  const { name, type = 'private' } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: '房间名称不能为空'
    });
  }

  // 生成房间ID
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    success: true,
    data: {
      roomId,
      name,
      type,
      createdAt: new Date().toISOString()
    }
  });
}));

// 获取用户的聊天房间列表
router.get('/rooms', auth, asyncHandler(async (req, res) => {
  // 这里应该从数据库获取用户的房间列表
  const mockRooms = [
    {
      roomId: 'default',
      name: '默认聊天室',
      type: 'public',
      lastMessage: '你好！我是AI助手',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    }
  ];

  res.json({
    success: true,
    data: mockRooms
  });
}));

// 删除聊天房间
router.delete('/rooms/:roomId', auth, asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  // 这里应该从数据库删除房间
  
  res.json({
    success: true,
    message: '房间删除成功'
  });
}));

// 获取聊天统计信息
router.get('/stats', auth, asyncHandler(async (req, res) => {
  // 这里应该从数据库获取统计信息
  const mockStats = {
    totalMessages: 150,
    totalRooms: 3,
    activeRooms: 1,
    averageResponseTime: 2.5
  };

  res.json({
    success: true,
    data: mockStats
  });
}));

module.exports = router; 