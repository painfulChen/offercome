const express = require('express');
const router = express.Router();
const CaseCategory = require('../models/CaseCategory');
const { auth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await CaseCategory.getActiveCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 获取分类及其案例数量
router.get('/with-count', async (req, res) => {
  try {
    const categories = await CaseCategory.getCategoriesWithCount();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败',
      error: error.message
    });
  }
});

// 获取单个分类详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await CaseCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('获取分类详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message
    });
  }
});

// 管理员功能：创建分类
router.post('/', auth, async (req, res) => {
  try {
    const categoryData = req.body;
    
    const newCategory = new CaseCategory(categoryData);
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: newCategory
    });
  } catch (error) {
    logger.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
});

// 管理员功能：更新分类
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await CaseCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      message: '分类更新成功',
      data: updatedCategory
    });
  } catch (error) {
    logger.error('更新分类失败:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
});

// 管理员功能：删除分类
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCategory = await CaseCategory.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    logger.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
});

// 管理员功能：获取所有分类（包括非活跃）
router.get('/admin/all', auth, async (req, res) => {
  try {
    const categories = await CaseCategory.find()
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('获取所有分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有分类失败',
      error: error.message
    });
  }
});

// 管理员功能：更新分类排序
router.put('/admin/sort', auth, async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: '分类数据格式错误'
      });
    }

    const updatePromises = categories.map(({ id, sortOrder }) => 
      CaseCategory.findByIdAndUpdate(id, { sortOrder })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: '分类排序更新成功'
    });
  } catch (error) {
    logger.error('更新分类排序失败:', error);
    res.status(500).json({
      success: false,
      message: '更新分类排序失败',
      error: error.message
    });
  }
});

module.exports = router; 