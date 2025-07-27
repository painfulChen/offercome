exports.main = async (event, context) => {
  console.log('云函数被调用:', JSON.stringify(event));
  
  const path = event.path || '';
  const method = event.httpMethod || 'GET';
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  }
  
  try {
    if (path === '/api/cases' && method === 'GET') {
      console.log('处理案例列表请求');
      const cases = [
        {
          _id: "6885a9aef44b06a3b07af7f2",
          title: "市场营销总监晋升案例",
          subtitle: "从专员到总监，管理能力全面提升",
          description: "王同学原本是市场营销专员，通过OfferCome的AI辅导，系统学习了品牌策略、数字营销、团队管理等高级技能。经过1年的准备，成功晋升为市场营销总监，薪资从15K提升到45K，实现了管理能力的全面提升。",
          industry: "市场营销",
          position: "市场营销总监",
          salaryRange: "45K-60K",
          company: "阿里巴巴",
          location: "杭州",
          duration: "12个月",
          beforeSalary: "15K",
          afterSalary: "45K",
          improvementRate: "200%",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
          tags: ["市场营销", "品牌策略", "数字营销", "团队管理"],
          categoryId: "6885a955be748595014f93dd",
          status: "published",
          featured: true,
          viewCount: 1560,
          likeCount: 123,
          createdAt: "2025-07-27T04:23:10.107Z",
          updatedAt: "2025-07-27T04:23:10.107Z"
        },
        {
          _id: "6885a9aef44b06a3b07af7ef",
          title: "产品经理转型成功案例",
          subtitle: "从运营到产品，薪资提升150%",
          description: "李同学原本从事运营工作，对产品设计有浓厚兴趣。通过OfferCome的AI指导，系统学习了产品设计方法论、用户研究、数据分析等核心技能。经过6个月的准备，成功转型为产品经理，薪资从12K提升到30K，实现了职业转型的成功。",
          industry: "产品设计",
          position: "产品经理",
          salaryRange: "30K-45K",
          company: "腾讯",
          location: "深圳",
          duration: "6个月",
          beforeSalary: "12K",
          afterSalary: "30K",
          improvementRate: "150%",
          avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
          tags: ["产品经理", "职业转型", "用户研究", "数据分析"],
          categoryId: "6885a67fa40c096e3aeed511",
          status: "published",
          featured: true,
          viewCount: 980,
          likeCount: 67,
          createdAt: "2025-07-27T04:23:10.105Z",
          updatedAt: "2025-07-27T04:23:10.105Z"
        },
        {
          _id: "6885a9aef44b06a3b07af7ec",
          title: "从实习生到高级前端工程师",
          subtitle: "3年薪资翻倍，技术能力全面提升",
          description: "张同学原本是一名前端实习生，通过OfferCome的AI辅导，系统学习了React、Vue等主流框架，掌握了前端工程化、性能优化等高级技能。经过3个月的求职准备，成功入职某知名互联网公司，薪资从实习期的8K提升到25K，实现了职业生涯的重要突破。",
          industry: "技术开发",
          position: "高级前端工程师",
          salaryRange: "25K-35K",
          company: "字节跳动",
          location: "北京",
          duration: "3个月",
          beforeSalary: "8K",
          afterSalary: "25K",
          improvementRate: "212%",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
          tags: ["前端开发", "React", "Vue", "薪资翻倍"],
          categoryId: "6885a675e1a7978fae059123",
          status: "published",
          featured: true,
          viewCount: 1250,
          likeCount: 89,
          createdAt: "2025-07-27T04:23:10.086Z",
          updatedAt: "2025-07-27T04:23:10.086Z"
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            cases: cases,
            pagination: {
              page: 1,
              limit: 12,
              total: cases.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false
            }
          }
        })
      };
    }

    if (path === '/api/categories' && method === 'GET') {
      console.log('处理分类列表请求');
      const categories = [
        {
          _id: "6885a675e1a7978fae059123",
          name: "技术开发",
          description: "软件开发、前端、后端、移动开发等技术岗位",
          icon: "fas fa-code",
          color: "#667eea",
          sortOrder: 1,
          status: "active",
          caseCount: 1,
          createdAt: "2025-07-27T04:09:25.551Z",
          updatedAt: "2025-07-27T04:09:25.551Z"
        },
        {
          _id: "6885a67fa40c096e3aeed511",
          name: "产品设计",
          description: "产品经理、UI/UX设计师、交互设计等岗位",
          icon: "fas fa-palette",
          color: "#764ba2",
          sortOrder: 2,
          status: "active",
          caseCount: 1,
          createdAt: "2025-07-27T04:09:35.244Z",
          updatedAt: "2025-07-27T04:09:35.244Z"
        },
        {
          _id: "6885a955be748595014f93dd",
          name: "市场营销",
          description: "市场推广、品牌策划、数字营销等岗位",
          icon: "fas fa-bullhorn",
          color: "#f093fb",
          sortOrder: 3,
          status: "active",
          caseCount: 1,
          createdAt: "2025-07-27T04:21:41.789Z",
          updatedAt: "2025-07-27T04:21:41.789Z"
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: categories
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: '路径不存在',
        message: `路径 ${path} 不存在`,
        availablePaths: [
          '/api/cases',
          '/api/categories'
        ]
      })
    };
    
  } catch (error) {
    console.error('云函数错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
}; 