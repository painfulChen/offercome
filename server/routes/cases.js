const express = require('express');
const router = express.Router();
const SuccessCase = require('../models/SuccessCase');
const CaseCategory = require('../models/CaseCategory');
const { auth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// 获取案例列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      industry,
      position,
      category,
      featured,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // 构建查询条件
    const query = { status: 'published' };
    
    if (industry) query.industry = industry;
    if (position) query.position = position;
    if (category) query.categoryId = parseInt(category);
    if (featured === 'true') query.featured = true;
    
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { subtitle: regex },
        { description: regex },
        { industry: regex },
        { position: regex },
        { company: regex },
        { tags: regex }
      ];
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    // 执行查询
    const [cases, total] = await Promise.all([
      SuccessCase.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name color icon')
        .populate('creator', 'username avatar'),
      SuccessCase.countDocuments(query)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    });
  } catch (error) {
    logger.error('获取案例列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取案例列表失败',
      error: error.message
    });
  }
});

// 获取案例详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const caseData = await SuccessCase.findById(id)
      .populate('category', 'name color icon')
      .populate('creator', 'username avatar');

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }

    // 增加浏览次数
    await caseData.incrementViewCount();

    res.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    logger.error('获取案例详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取案例详情失败',
      error: error.message
    });
  }
});

// 获取热门案例
router.get('/hot/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const hotCases = await SuccessCase.getHotCases(parseInt(limit));

    res.json({
      success: true,
      data: hotCases
    });
  } catch (error) {
    logger.error('获取热门案例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门案例失败',
      error: error.message
    });
  }
});

// 获取推荐案例
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredCases = await SuccessCase.getFeaturedCases(parseInt(limit));

    res.json({
      success: true,
      data: featuredCases
    });
  } catch (error) {
    logger.error('获取推荐案例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐案例失败',
      error: error.message
    });
  }
});

// 按行业获取案例
router.get('/industry/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { limit = 10 } = req.query;
    
    const cases = await SuccessCase.getCasesByIndustry(industry, parseInt(limit));

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    logger.error('按行业获取案例失败:', error);
    res.status(500).json({
      success: false,
      message: '按行业获取案例失败',
      error: error.message
    });
  }
});

// 搜索案例
router.get('/search/query', async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;
    
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const cases = await SuccessCase.searchCases(keyword.trim(), parseInt(limit));

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    logger.error('搜索案例失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索案例失败',
      error: error.message
    });
  }
});

// 点赞案例
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const caseData = await SuccessCase.findById(id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }

    await caseData.incrementLikeCount();

    res.json({
      success: true,
      message: '点赞成功',
      data: {
        likeCount: caseData.likeCount
      }
    });
  } catch (error) {
    logger.error('点赞案例失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败',
      error: error.message
    });
  }
});

// 获取案例统计
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalCases,
      totalViews,
      totalLikes,
      industryStats,
      categoryStats
    ] = await Promise.all([
      SuccessCase.countDocuments({ status: 'published' }),
      SuccessCase.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } }
      ]),
      SuccessCase.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: '$likeCount' } } }
      ]),
      SuccessCase.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      CaseCategory.getCategoriesWithCount()
    ]);

    res.json({
      success: true,
      data: {
        totalCases,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        industryStats,
        categoryStats
      }
    });
  } catch (error) {
    logger.error('获取案例统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取案例统计失败',
      error: error.message
    });
  }
});

// 管理员功能：创建案例
router.post('/', auth, async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      createdBy: req.user.id
    };

    const newCase = new SuccessCase(caseData);
    await newCase.save();

    res.status(201).json({
      success: true,
      message: '案例创建成功',
      data: newCase
    });
  } catch (error) {
    logger.error('创建案例失败:', error);
    res.status(500).json({
      success: false,
      message: '创建案例失败',
      error: error.message
    });
  }
});

// 管理员功能：更新案例
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const updatedCase = await SuccessCase.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name color icon')
     .populate('creator', 'username avatar');

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }

    res.json({
      success: true,
      message: '案例更新成功',
      data: updatedCase
    });
  } catch (error) {
    logger.error('更新案例失败:', error);
    res.status(500).json({
      success: false,
      message: '更新案例失败',
      error: error.message
    });
  }
});

// 管理员功能：删除案例
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCase = await SuccessCase.findByIdAndDelete(id);
    
    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }

    res.json({
      success: true,
      message: '案例删除成功'
    });
  } catch (error) {
    logger.error('删除案例失败:', error);
    res.status(500).json({
      success: false,
      message: '删除案例失败',
      error: error.message
    });
  }
});

// 管理员功能：获取所有案例（包括草稿）
router.get('/admin/all', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.categoryId = parseInt(category);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [cases, total] = await Promise.all([
      SuccessCase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name color icon')
        .populate('creator', 'username avatar'),
      SuccessCase.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('获取所有案例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有案例失败',
      error: error.message
    });
  }
});

module.exports = router; 