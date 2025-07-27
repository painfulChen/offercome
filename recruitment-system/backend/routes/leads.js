const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// 创建线索验证规则
const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  email: Joi.string().email().optional(),
  wechat: Joi.string().optional(),
  source: Joi.string().required(),
  source_detail: Joi.string().optional(),
  requirements: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// 创建获客线索
router.post('/', authenticateToken, async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = createLeadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { name, phone, email, wechat, source, source_detail, requirements, tags } = value;

    // 创建线索
    const result = await query(
      'INSERT INTO leads (name, phone, email, wechat, source, source_detail, requirements, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, phone, email, wechat, source, source_detail, requirements, JSON.stringify(tags || [])]
    );

    const leadId = result.insertId;

    // 获取创建的线索
    const leads = await query(
      'SELECT * FROM leads WHERE id = ?',
      [leadId]
    );

    res.status(201).json({
      success: true,
      message: '线索创建成功',
      data: leads[0]
    });

  } catch (error) {
    console.error('创建线索错误:', error);
    res.status(500).json({
      success: false,
      message: '创建线索失败'
    });
  }
});

// 获取线索列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (source) {
      whereClause += ' AND source = ?';
      params.push(source);
    }

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM leads ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // 获取线索列表
    const leads = await query(
      `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      message: '获取成功',
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取线索列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取线索列表失败'
    });
  }
});

// 更新线索状态
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['new', 'contacted', 'qualified', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态'
      });
    }

    await query(
      'UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: '状态更新成功'
    });

  } catch (error) {
    console.error('更新线索状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新线索状态失败'
    });
  }
});

// 分配线索
router.put('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    await query(
      'UPDATE leads SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [assigned_to, id]
    );

    res.json({
      success: true,
      message: '线索分配成功'
    });

  } catch (error) {
    console.error('分配线索错误:', error);
    res.status(500).json({
      success: false,
      message: '分配线索失败'
    });
  }
});

module.exports = router; 