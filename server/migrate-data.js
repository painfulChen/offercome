const { getMySQLPool } = require('./config/database.js');
const SuccessCase = require('./models/SuccessCase.js');
const CaseCategory = require('./models/CaseCategory.js');
const { connectDB } = require('./config/database.js');

async function migrateData() {
  try {
    console.log('🔄 开始数据迁移...');
    
    // 连接数据库
    await connectDB();
    const mysqlPool = getMySQLPool();
    
    // 1. 迁移分类数据
    console.log('📂 迁移分类数据...');
    const [categories] = await mysqlPool.execute('SELECT * FROM case_categories WHERE status = "active" ORDER BY sort_order, name');
    
    for (const category of categories) {
      const existingCategory = await CaseCategory.findOne({ name: category.name });
      if (!existingCategory) {
        const newCategory = new CaseCategory({
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sortOrder: category.sort_order,
          status: category.status,
          caseCount: 0
        });
        await newCategory.save();
        console.log(`✅ 创建分类: ${category.name}`);
      } else {
        console.log(`⏭️ 分类已存在: ${category.name}`);
      }
    }
    
    // 2. 迁移案例数据
    console.log('📋 迁移案例数据...');
    const [cases] = await mysqlPool.execute(`
      SELECT sc.*, cc.name as category_name, cc.color as category_color, cc.icon as category_icon
      FROM success_cases sc
      LEFT JOIN case_categories cc ON sc.category_id = cc.id
      WHERE sc.status = 'published'
      ORDER BY sc.created_at DESC
    `);
    
    for (const caseData of cases) {
      // 查找对应的分类
      const category = await CaseCategory.findOne({ name: caseData.category_name });
      
      const existingCase = await SuccessCase.findOne({ 
        title: caseData.title,
        company: caseData.company 
      });
      
      if (!existingCase) {
        const newCase = new SuccessCase({
          title: caseData.title,
          subtitle: caseData.subtitle,
          description: caseData.description,
          industry: caseData.industry,
          position: caseData.position,
          salaryRange: caseData.salary_range,
          company: caseData.company,
          location: caseData.location,
          duration: caseData.duration,
          beforeSalary: caseData.before_salary,
          afterSalary: caseData.after_salary,
          improvementRate: caseData.improvement_rate,
          avatarUrl: caseData.avatar_url,
          coverImage: caseData.cover_image,
          images: caseData.images ? JSON.parse(caseData.images) : [],
          tags: caseData.tags ? JSON.parse(caseData.tags) : [],
          categoryId: category ? category._id : null,
          status: caseData.status,
          featured: caseData.featured === 1,
          viewCount: caseData.view_count,
          likeCount: caseData.like_count,
          createdBy: '507f1f77bcf86cd799439011' // 默认管理员ID
        });
        
        await newCase.save();
        console.log(`✅ 创建案例: ${caseData.title}`);
      } else {
        console.log(`⏭️ 案例已存在: ${caseData.title}`);
      }
    }
    
    // 3. 更新分类的案例数量
    console.log('📊 更新分类统计...');
    const allCategories = await CaseCategory.find();
    for (const category of allCategories) {
      await category.updateCaseCount();
    }
    
    console.log('🎉 数据迁移完成！');
    
    // 4. 显示统计信息
    const totalCategories = await CaseCategory.countDocuments();
    const totalCases = await SuccessCase.countDocuments();
    const publishedCases = await SuccessCase.countDocuments({ status: 'published' });
    
    console.log('\n📈 迁移统计:');
    console.log(`- 分类数量: ${totalCategories}`);
    console.log(`- 案例总数: ${totalCases}`);
    console.log(`- 已发布案例: ${publishedCases}`);
    
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行迁移
migrateData(); 