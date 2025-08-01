// server/handlers/index.js

// 导入MySQL数据库配置
// 移除数据库导入，使用纯静态实现
// 移除mbti.js导入，避免数据库调用
const mbtiPure = require('./mbti-pure');
const questionsStatic = require('./questions-static');
const careerStatic = require('./career-static');

// MBTI相关handlers
// 使用静态版本，不依赖数据库
exports.getMBTIQuestionsHandler = questionsStatic.getMBTIQuestionsHandler;

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

// 使用纯计算版本，不依赖数据库
exports.calculateMBTIHandler = mbtiPure.calculateMBTIHandler;

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

// 使用静态版本，不依赖数据库
exports.getMBTICareerAdviceHandler = careerStatic.getMBTICareerAdviceHandler;
exports.getMBTICareerCategoriesHandler = careerStatic.getMBTICareerCategoriesHandler;
exports.getMBTICareerAdviceByTypeHandler = careerStatic.getMBTICareerAdviceByTypeHandler;
exports.getMBTIRecommendationsHandler = careerStatic.getMBTIRecommendationsHandler;







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

exports.methodNotAllowedHandler = async ({ params }) => {
  console.log('🚫 方法不允许:', params);
  
  return {
    statusCode: 405,
    body: JSON.stringify({
      success: false,
      message: '请求方法不允许',
      allowedMethods: params.allowedMethods || []
    })
  };
};

// CloudBase函数入口 - 重构版本，使用新的路由匹配系统
const { matchRoute } = require('./router');
const routes = require('./routes');

exports.main = async (event, context) => {
  console.log('收到请求:', event);
  
  const rawPath = (event.path || '').replace(/^\/api16/, '') || '/';
  const { httpMethod: method = 'GET', body } = event;

  console.log('处理路径:', rawPath, '方法:', method);

  const route = matchRoute(rawPath, method);
  if (!route) {
    console.log('路由未匹配:', rawPath, method);
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: `路径 ${rawPath} 不存在`,
        availablePaths: routes.map(r => `/api16${r.path}`)
      })
    };
  }

  try {
    console.log('匹配路由:', route.handler, '参数:', route.params);
    const handlerFn = exports[route.handler];
    if (!handlerFn) {
      console.error('Handler未找到:', route.handler);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: `Handler ${route.handler} 未找到`
        })
      };
    }

    const result = await handlerFn({ ...event, params: route.params });
    
    // ---- 统一JSON包装 ----
    if (typeof result === 'object' && result !== null) {
      return {
        statusCode: result.statusCode || 200,
        headers: { 'Content-Type': 'application/json' },
        body: result.body || JSON.stringify(result)
      };
    }
    
    // 字符串 / 数字等原样返回
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result })
    };
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
}; 