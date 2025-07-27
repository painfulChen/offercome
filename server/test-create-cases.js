const { connectDB } = require('./config/database.js');
const SuccessCase = require('./models/SuccessCase.js');
const CaseCategory = require('./models/CaseCategory.js');

async function createTestCases() {
  try {
    console.log('🔄 开始创建测试案例...');
    
    // 连接数据库
    await connectDB();
    
    // 获取分类
    const categories = await CaseCategory.find();
    console.log(`📂 找到 ${categories.length} 个分类`);
    
    if (categories.length === 0) {
      console.log('❌ 没有找到分类，无法创建案例');
      return;
    }
    
    // 创建测试案例
    const testCases = [
      {
        title: '从实习生到高级前端工程师',
        subtitle: '3年薪资翻倍，技术能力全面提升',
        description: '张同学原本是一名前端实习生，通过OfferCome的AI辅导，系统学习了React、Vue等主流框架，掌握了前端工程化、性能优化等高级技能。经过3个月的求职准备，成功入职某知名互联网公司，薪资从实习期的8K提升到25K，实现了职业生涯的重要突破。',
        industry: '技术开发',
        position: '高级前端工程师',
        salaryRange: '25K-35K',
        company: '字节跳动',
        location: '北京',
        duration: '3个月',
        beforeSalary: '8K',
        afterSalary: '25K',
        improvementRate: '212%',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        tags: ['前端开发', 'React', 'Vue', '薪资翻倍'],
        categoryId: categories[0]._id,
        status: 'published',
        featured: true,
        viewCount: 1250,
        likeCount: 89,
        createdBy: '507f1f77bcf86cd799439011'
      },
      {
        title: '产品经理转型成功案例',
        subtitle: '从运营到产品，薪资提升150%',
        description: '李同学原本从事运营工作，对产品设计有浓厚兴趣。通过OfferCome的AI指导，系统学习了产品设计方法论、用户研究、数据分析等核心技能。经过6个月的准备，成功转型为产品经理，薪资从12K提升到30K，实现了职业转型的成功。',
        industry: '产品设计',
        position: '产品经理',
        salaryRange: '30K-45K',
        company: '腾讯',
        location: '深圳',
        duration: '6个月',
        beforeSalary: '12K',
        afterSalary: '30K',
        improvementRate: '150%',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        tags: ['产品经理', '职业转型', '用户研究', '数据分析'],
        categoryId: categories[1]._id,
        status: 'published',
        featured: true,
        viewCount: 980,
        likeCount: 67,
        createdBy: '507f1f77bcf86cd799439011'
      },
      {
        title: '市场营销总监晋升案例',
        subtitle: '从专员到总监，管理能力全面提升',
        description: '王同学原本是市场营销专员，通过OfferCome的AI辅导，系统学习了品牌策略、数字营销、团队管理等高级技能。经过1年的准备，成功晋升为市场营销总监，薪资从15K提升到45K，实现了管理能力的全面提升。',
        industry: '市场营销',
        position: '市场营销总监',
        salaryRange: '45K-60K',
        company: '阿里巴巴',
        location: '杭州',
        duration: '12个月',
        beforeSalary: '15K',
        afterSalary: '45K',
        improvementRate: '200%',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
        tags: ['市场营销', '品牌策略', '数字营销', '团队管理'],
        categoryId: categories[2]._id,
        status: 'published',
        featured: true,
        viewCount: 1560,
        likeCount: 123,
        createdBy: '507f1f77bcf86cd799439011'
      }
    ];
    
    // 创建案例
    for (const caseData of testCases) {
      const existingCase = await SuccessCase.findOne({ 
        title: caseData.title,
        company: caseData.company 
      });
      
      if (!existingCase) {
        const newCase = new SuccessCase(caseData);
        await newCase.save();
        console.log(`✅ 创建案例: ${caseData.title}`);
      } else {
        console.log(`⏭️ 案例已存在: ${caseData.title}`);
      }
    }
    
    // 更新分类统计
    console.log('📊 更新分类统计...');
    for (const category of categories) {
      await category.updateCaseCount();
    }
    
    console.log('🎉 测试案例创建完成！');
    
    // 显示统计信息
    const totalCases = await SuccessCase.countDocuments();
    const publishedCases = await SuccessCase.countDocuments({ status: 'published' });
    
    console.log('\n📈 统计信息:');
    console.log(`- 案例总数: ${totalCases}`);
    console.log(`- 已发布案例: ${publishedCases}`);
    
  } catch (error) {
    console.error('❌ 创建测试案例失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行测试
createTestCases(); 