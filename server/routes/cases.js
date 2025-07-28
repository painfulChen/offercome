const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');

// 获取精选案例
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const cases = await StudentCase.getFeaturedCases(limit);
    
    res.json({
      success: true,
      data: cases,
      message: '获取精选案例成功'
    });
  } catch (error) {
    console.error('获取精选案例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取精选案例失败',
      error: error.message
    });
  }
});

// 获取所有案例
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      industry, 
      package,
      difficulty 
    } = req.query;
    
    const query = { 'status': '已发布' };
    
    if (category) {
      query['showcase.category'] = category;
    }
    
    if (industry) {
      query['jobHuntingProcess.finalOffer.industry'] = industry;
    }
    
    if (package) {
      query['coachingService.package'] = package;
    }
    
    if (difficulty) {
      query['showcase.difficulty'] = difficulty;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cases = await StudentCase.find(query)
      .sort({ 'createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
    
    const total = await StudentCase.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: '获取案例列表成功'
    });
  } catch (error) {
    console.error('获取案例列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取案例列表失败',
      error: error.message
    });
  }
});

// 获取单个案例详情
router.get('/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseData = await StudentCase.findById(caseId);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }
    
    // 增加浏览量
    await caseData.incrementViews();
    
    res.json({
      success: true,
      data: caseData,
      message: '获取案例详情成功'
    });
  } catch (error) {
    console.error('获取案例详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取案例详情失败',
      error: error.message
    });
  }
});

// 获取案例统计数据
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await StudentCase.getStatistics();
    const result = stats[0] || {
      totalCases: 0,
      avgSalaryIncrease: 0,
      avgDuration: 0,
      avgApplications: 0,
      avgInterviews: 0,
      avgOffers: 0,
      avgRating: 0
    };
    
    res.json({
      success: true,
      data: result,
      message: '获取统计数据成功'
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// 获取行业分布统计
router.get('/stats/industries', async (req, res) => {
  try {
    const industryStats = await StudentCase.aggregate([
      {
        $match: {
          'status': '已发布'
        }
      },
      {
        $group: {
          _id: '$jobHuntingProcess.finalOffer.industry',
          count: { $sum: 1 },
          avgSalary: { $avg: '$jobHuntingProcess.finalOffer.salary.base' },
          avgSalaryIncrease: { $avg: '$statistics.salaryIncrease' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      success: true,
      data: industryStats,
      message: '获取行业统计成功'
    });
  } catch (error) {
    console.error('获取行业统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取行业统计失败',
      error: error.message
    });
  }
});

// 获取薪资增长统计
router.get('/stats/salary-increase', async (req, res) => {
  try {
    const salaryStats = await StudentCase.aggregate([
      {
        $match: {
          'status': '已发布',
          'statistics.salaryIncrease': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgIncrease: { $avg: '$statistics.salaryIncrease' },
          maxIncrease: { $max: '$statistics.salaryIncrease' },
          minIncrease: { $min: '$statistics.salaryIncrease' },
          totalCases: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: salaryStats[0] || {
        avgIncrease: 0,
        maxIncrease: 0,
        minIncrease: 0,
        totalCases: 0
      },
      message: '获取薪资增长统计成功'
    });
  } catch (error) {
    console.error('获取薪资增长统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取薪资增长统计失败',
      error: error.message
    });
  }
});

// 获取成功率统计
router.get('/stats/success-rate', async (req, res) => {
  try {
    const successStats = await StudentCase.aggregate([
      {
        $match: {
          'status': '已发布'
        }
      },
      {
        $group: {
          _id: null,
          totalCases: { $sum: 1 },
          avgApplications: { $avg: '$jobHuntingProcess.applicationsSubmitted' },
          avgInterviews: { $avg: '$jobHuntingProcess.interviewsAttended' },
          avgOffers: { $avg: '$jobHuntingProcess.offersReceived' },
          avgDuration: { $avg: '$jobHuntingProcess.duration' }
        }
      }
    ]);
    
    const stats = successStats[0] || {
      totalCases: 0,
      avgApplications: 0,
      avgInterviews: 0,
      avgOffers: 0,
      avgDuration: 0
    };
    
    // 计算成功率
    const successRate = stats.totalCases > 0 ? 
      (stats.avgOffers / stats.avgApplications * 100).toFixed(1) : 0;
    
    const interviewRate = stats.totalCases > 0 ? 
      (stats.avgInterviews / stats.avgApplications * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      data: {
        ...stats,
        successRate: parseFloat(successRate),
        interviewRate: parseFloat(interviewRate)
      },
      message: '获取成功率统计成功'
    });
  } catch (error) {
    console.error('获取成功率统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成功率统计失败',
      error: error.message
    });
  }
});

// 点赞案例
router.post('/:id/like', async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseData = await StudentCase.findById(caseId);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }
    
    await caseData.incrementLikes();
    
    res.json({
      success: true,
      data: { likes: caseData.likes },
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败',
      error: error.message
    });
  }
});

// 分享案例
router.post('/:id/share', async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseData = await StudentCase.findById(caseId);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }
    
    await caseData.incrementShares();
    
    res.json({
      success: true,
      data: { shares: caseData.shares },
      message: '分享成功'
    });
  } catch (error) {
    console.error('分享失败:', error);
    res.status(500).json({
      success: false,
      message: '分享失败',
      error: error.message
    });
  }
});

// 获取推荐案例
router.get('/recommendations/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const currentCase = await StudentCase.findById(caseId);
    
    if (!currentCase) {
      return res.status(404).json({
        success: false,
        message: '案例不存在'
      });
    }
    
    // 基于行业和类别推荐相似案例
    const recommendations = await StudentCase.find({
      _id: { $ne: caseId },
      'status': '已发布',
      $or: [
        { 'jobHuntingProcess.finalOffer.industry': currentCase.jobHuntingProcess.finalOffer.industry },
        { 'showcase.category': currentCase.showcase.category }
      ]
    })
    .sort({ 'createdAt': -1 })
    .limit(3)
    .exec();
    
    res.json({
      success: true,
      data: recommendations,
      message: '获取推荐案例成功'
    });
  } catch (error) {
    console.error('获取推荐案例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐案例失败',
      error: error.message
    });
  }
});

module.exports = router; 