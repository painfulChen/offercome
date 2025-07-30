// server/handlers/index.js

// 导入MySQL数据库配置
const db = require('../config/database-cloud');
const mbtiHandlers = require('./mbti');

// MBTI相关handlers
exports.getMBTIQuestionsHandler = async () => {
  try {
    console.log('🔄 开始获取MBTI问题...');
    
    // 从MySQL数据库获取所有问题
    console.log('🔍 查询MySQL数据库中的MBTI问题...');
    const questions = await db.query(`
      SELECT * FROM mbti_questions 
      WHERE is_active = TRUE 
      ORDER BY dimension, question_number
    `);
    
    console.log(`📊 从数据库获取到 ${questions.length} 个MBTI问题`);
    
    if (questions.length === 0) {
      console.log('⚠️ 数据库中没有找到MBTI问题，返回模拟数据');
      // 返回模拟数据作为备用
      const mockQuestions = [
        {
          id: 1,
          text: "在社交场合中，你更倾向于：",
          dimension: "EI",
          category: "社交偏好",
          options: [
            { text: "与很多人交谈，认识新朋友", score: { E: 1, I: 0 } },
            { text: "与少数几个熟悉的人深入交谈", score: { E: 0, I: 1 } }
          ]
        },
        {
          id: 2,
          text: "在团队工作中，你更喜欢：",
          dimension: "EI",
          category: "社交偏好",
          options: [
            { text: "积极参与讨论，分享想法", score: { E: 1, I: 0 } },
            { text: "先思考后发言，确保想法成熟", score: { E: 0, I: 1 } }
          ]
        },
        {
          id: 3,
          text: "当您需要充电时，您会选择：",
          dimension: "EI",
          category: "社交偏好",
          options: [
            { text: "和朋友一起出去活动", score: { E: 1, I: 0 } },
            { text: "独自待在家里或安静的地方", score: { E: 0, I: 1 } }
          ]
        },
        {
          id: 4,
          text: "您更喜欢的决策方式是：",
          dimension: "TF",
          category: "决策方式",
          options: [
            { text: "基于逻辑和客观分析", score: { T: 1, F: 0 } },
            { text: "基于价值观和人际关系", score: { T: 0, F: 1 } }
          ]
        },
        {
          id: 5,
          text: "您更倾向于：",
          dimension: "SN",
          category: "信息处理",
          options: [
            { text: "关注具体的事实和细节", score: { S: 1, N: 0 } },
            { text: "关注可能性和未来趋势", score: { S: 0, N: 1 } }
          ]
        }
      ];
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: mockQuestions,
          message: 'MBTI问题获取成功（模拟数据）'
        })
      };
    }
    
    // 转换为前端需要的格式
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.question_text,
      dimension: q.dimension,
      category: getCategoryByDimension(q.dimension),
      options: generateOptionsByDimension(q.dimension, q.id)
    }));
    
    console.log('✅ MBTI问题格式化完成');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: formattedQuestions,
        message: 'MBTI问题获取成功'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI问题失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '获取MBTI问题失败',
        error: error.message
      })
    };
  }
};

// 辅助函数：根据维度获取类别
function getCategoryByDimension(dimension) {
  const categoryMap = {
    'EI': '社交偏好',
    'SN': '信息处理',
    'TF': '决策方式',
    'JP': '生活方式'
  };
  return categoryMap[dimension] || '其他';
}

// 辅助函数：根据维度生成选项
function generateOptionsByDimension(dimension, questionId) {
  const optionsMap = {
    'EI': [
      { text: '倾向于外向', score: { E: 1, I: 0 } },
      { text: '倾向于内向', score: { E: 0, I: 1 } }
    ],
    'SN': [
      { text: '倾向于感觉', score: { S: 1, N: 0 } },
      { text: '倾向于直觉', score: { S: 0, N: 1 } }
    ],
    'TF': [
      { text: '倾向于思考', score: { T: 1, F: 0 } },
      { text: '倾向于情感', score: { T: 0, F: 1 } }
    ],
    'JP': [
      { text: '倾向于判断', score: { J: 1, P: 0 } },
      { text: '倾向于感知', score: { J: 0, P: 1 } }
    ]
  };
  
  return optionsMap[dimension] || [
    { text: '选项A', score: {} },
    { text: '选项B', score: {} }
  ];
}

exports.calculateMBTIHandler = mbtiHandlers.calculateMBTIHandler;

exports.testMBTIHandler = async ({ body }) => {
  console.log('🧪 测试MBTI处理器...');
  
  const response = {
    success: true,
    data: { 
      test: 'success',
      message: '测试处理器正常工作'
    },
    message: '测试成功'
  };
  
  console.log('📤 返回测试响应:', JSON.stringify(response));
  
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
};

exports.getMBTICareerAdviceHandler = async () => {
  try {
    console.log('🔄 获取MBTI职业建议...');
    
    // 从MySQL获取职业建议数据
    const careerAdvice = await db.query(`
      SELECT * FROM mbti_career_advice 
      WHERE is_active = TRUE 
      ORDER BY mbti_type
    `);
    
    // 解析JSON字段，添加错误处理
    const processedData = careerAdvice.map(advice => {
      let coreTraits = [];
      let recommendedCareers = [];
      
      try {
        coreTraits = JSON.parse(advice.core_traits || '[]');
      } catch (error) {
        console.warn('⚠️ core_traits JSON解析失败:', error.message);
        // 如果解析失败，尝试将字符串按逗号分割
        if (advice.core_traits && typeof advice.core_traits === 'string') {
          coreTraits = advice.core_traits.split(',').map(s => s.trim()).filter(s => s);
        }
      }
      
      try {
        recommendedCareers = JSON.parse(advice.recommended_careers || '[]');
      } catch (error) {
        console.warn('⚠️ recommended_careers JSON解析失败:', error.message);
        // 如果解析失败，返回空数组
        recommendedCareers = [];
      }
      
      return {
        ...advice,
        core_traits: coreTraits,
        recommended_careers: recommendedCareers
      };
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: processedData,
        message: '获取MBTI职业建议成功'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业建议失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业建议失败',
        error: error.message
      })
    };
  }
};

exports.getMBTICareerCategoriesHandler = async () => {
  try {
    console.log('🔄 获取MBTI职业类别...');
    
    const categories = await db.query(`
      SELECT DISTINCT category FROM mbti_career_advice 
      WHERE is_active = TRUE 
      ORDER BY category
    `);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: categories.map(c => c.category),
        message: '获取岗位类别成功'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业类别失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业类别失败',
        error: error.message
      })
    };
  }
};

exports.getMBTICareerAdviceByTypeHandler = async ({ params }) => {
  try {
    const { mbtiType } = params;
    console.log(`🔄 获取 ${mbtiType} 职业建议...`);
    
    const careerAdvice = await db.query(`
      SELECT * FROM mbti_career_advice 
      WHERE mbti_type = ? AND is_active = TRUE
    `, [mbtiType]);
    
    if (careerAdvice.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: `未找到 ${mbtiType} 类型的职业建议`
        })
      };
    }
    
    // 解析JSON字段，添加错误处理
    const advice = careerAdvice[0];
    let coreTraits = [];
    let recommendedCareers = [];
    
    try {
      coreTraits = JSON.parse(advice.core_traits || '[]');
    } catch (error) {
      console.warn('⚠️ core_traits JSON解析失败:', error.message);
      // 如果解析失败，尝试将字符串按逗号分割
      if (advice.core_traits && typeof advice.core_traits === 'string') {
        coreTraits = advice.core_traits.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    try {
      recommendedCareers = JSON.parse(advice.recommended_careers || '[]');
    } catch (error) {
      console.warn('⚠️ recommended_careers JSON解析失败:', error.message);
      // 如果解析失败，返回空数组
      recommendedCareers = [];
    }
    
    const processedData = {
      ...advice,
      core_traits: coreTraits,
      recommended_careers: recommendedCareers
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: processedData,
        message: '获取职业建议成功'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业建议失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业建议失败',
        error: error.message
      })
    };
  }
};

exports.getMBTIRecommendationsHandler = async ({ params }) => {
  try {
    const { mbtiType } = params;
    console.log(`🔄 获取 ${mbtiType} 推荐职业...`);
    
    const recommendations = await db.query(`
      SELECT * FROM mbti_career_recommendations 
      WHERE mbti_type = ? AND is_active = TRUE
      ORDER BY suitability_score DESC
    `, [mbtiType]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          mbtiType,
          recommendations: recommendations
        },
        message: '获取推荐职业成功'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI推荐职业失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '获取MBTI推荐职业失败',
        error: error.message
      })
    };
  }
};

// 健康检查
exports.healthHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'API服务正常运行',
      timestamp: new Date().toISOString()
    })
  };
};

// AI相关handlers
exports.aiChatHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        response: '你好！我是你的人工智能助手，擅长中英文对话。',
        model: 'kimi',
        timestamp: new Date().toISOString()
      },
      message: 'AI回复成功'
    })
  };
};

exports.aiRagHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        answer: '基于知识库的回复：这是一个RAG系统的示例回复。',
        context: 'RAG相关文档',
        timestamp: new Date().toISOString()
      },
      message: 'RAG查询成功'
    })
  };
};

// 用户认证handlers
exports.loginHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '登录成功'
    })
  };
};

exports.registerHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '注册成功'
    })
  };
};

exports.logoutHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '登出成功'
    })
  };
};

// 用户管理handlers
exports.getUserProfileHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        profile: {
          id: 1,
          name: '测试用户',
          email: 'test@example.com',
          phone: '13800138000'
        }
      },
      message: '用户资料获取成功'
    })
  };
};

exports.updateUserProfileHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '用户资料更新成功'
    })
  };
};

// 案例管理handlers
exports.getCasesHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        cases: [
          { id: 1, title: '案例1', description: '这是第一个案例' },
          { id: 2, title: '案例2', description: '这是第二个案例' }
        ]
      },
      message: '案例列表获取成功'
    })
  };
};

exports.getCaseByIdHandler = async ({ params }) => {
  const { id } = params;
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: { id, title: `案例${id}`, description: `这是第${id}个案例的详细描述` },
      message: '案例详情获取成功'
    })
  };
};

exports.createCaseHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '案例创建成功'
    })
  };
};

// 案例分类handlers
exports.getCategoriesHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: ['技术', '管理', '设计', '运营'],
      message: '分类列表获取成功'
    })
  };
};

// 聊天记录handlers
exports.getChatHistoryHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        history: [
          { id: 1, message: '你好', timestamp: new Date().toISOString() },
          { id: 2, message: '你好！有什么可以帮助你的吗？', timestamp: new Date().toISOString() }
        ]
      },
      message: '聊天历史获取成功'
    })
  };
};

exports.clearChatHistoryHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '聊天历史清空成功'
    })
  };
};

// 手机认证handlers
exports.sendPhoneCodeHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        code: '123456',
        expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      },
      message: '验证码发送成功'
    })
  };
};

exports.verifyPhoneCodeHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: '验证码验证成功'
    })
  };
};

// RAG管理handlers
exports.uploadRagDocumentHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        document: {
          id: Date.now(),
          title: '测试文档',
          content: '这是一个测试文档的内容',
          category: '技术'
        }
      },
      message: '文档上传成功'
    })
  };
};

exports.getRagDocumentsHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        documents: [
          { id: 1, title: '文档1', category: '技术', uploadTime: new Date().toISOString() },
          { id: 2, title: '文档2', category: '管理', uploadTime: new Date().toISOString() }
        ]
      },
      message: '文档列表获取成功'
    })
  };
};

exports.deleteRagDocumentHandler = async ({ params }) => {
  const { id } = params;
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: { deletedId: id },
      message: '文档删除成功'
    })
  };
}; 