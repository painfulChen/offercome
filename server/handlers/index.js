// server/handlers/index.js

// MBTI相关handlers
exports.getMBTIQuestionsHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: [
        {
          id: 1,
          text: "在社交场合中，你更倾向于：",
          options: [
            { text: "与很多人交谈，认识新朋友", score: { E: 1, I: 0 } },
            { text: "与少数几个熟悉的人深入交谈", score: { E: 0, I: 1 } }
          ]
        },
        {
          id: 2,
          text: "在团队工作中，你更喜欢：",
          options: [
            { text: "积极参与讨论，分享想法", score: { E: 1, I: 0 } },
            { text: "先思考后发言，确保想法成熟", score: { E: 0, I: 1 } }
          ]
        }
      ],
      message: 'MBTI问题获取成功'
    })
  };
};

exports.calculateMBTIHandler = async ({ body }) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: { mbtiType: 'INTJ', scores: { E: 0, I: 1, S: 0, N: 1, T: 1, F: 0, J: 1, P: 0 } },
      message: 'MBTI计算成功'
    })
  };
};

exports.getMBTICareerAdviceHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: [
        {
          mbtiType: 'INTJ',
          personalityDescription: '建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
          coreTraits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
          internetCareers: [
            {
              position: '技术架构师',
              category: '技术开发',
              suitability: 5,
              reasons: ['INTJ的战略思维和系统化思考能力非常适合设计复杂的技术架构'],
              requiredSkills: ['系统设计', '技术选型', '架构模式', '性能优化'],
              careerPath: [
                { level: '初级', positions: ['初级开发工程师'] },
                { level: '中级', positions: ['高级开发工程师'] },
                { level: '高级', positions: ['技术架构师'] }
              ],
              typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动'],
              salaryRange: { junior: { min: 15000, max: 25000 }, senior: { min: 40000, max: 80000 } }
            }
          ],
          strengths: ['强大的战略思维和系统化思考能力', '独立自主，能够深度思考复杂问题'],
          challenges: ['可能过于完美主义，影响效率', '独立性强，团队协作需要改进'],
          developmentAdvice: ['培养团队协作能力，学会倾听他人意见', '在追求完美的同时注意效率平衡']
        }
      ],
      message: '获取MBTI职业建议成功'
    })
  };
};

exports.getMBTICareerCategoriesHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: ['技术开发', '产品设计', '运营营销', '数据分析', '项目管理', '用户体验', '商务拓展', '内容创作'],
      message: '获取岗位类别成功'
    })
  };
};

exports.getMBTICareerAdviceByTypeHandler = async ({ params }) => {
  const { mbtiType } = params;
  const careerData = {
    'INTJ': {
      mbtiType: 'INTJ',
      personalityDescription: '建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
      coreTraits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
      internetCareers: [
        {
          position: '技术架构师',
          category: '技术开发',
          suitability: 5,
          reasons: ['INTJ的战略思维和系统化思考能力非常适合设计复杂的技术架构'],
          requiredSkills: ['系统设计', '技术选型', '架构模式', '性能优化'],
          careerPath: [
            { level: '初级', positions: ['初级开发工程师'] },
            { level: '中级', positions: ['高级开发工程师'] },
            { level: '高级', positions: ['技术架构师'] }
          ],
          typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动'],
          salaryRange: { junior: { min: 15000, max: 25000 }, senior: { min: 40000, max: 80000 } }
        }
      ],
      strengths: ['强大的战略思维和系统化思考能力', '独立自主，能够深度思考复杂问题'],
      challenges: ['可能过于完美主义，影响效率', '独立性强，团队协作需要改进'],
      developmentAdvice: ['培养团队协作能力，学会倾听他人意见', '在追求完美的同时注意效率平衡']
    }
  };

  if (careerData[mbtiType]) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: careerData[mbtiType],
        message: '获取职业建议成功'
      })
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: `未找到MBTI类型 ${mbtiType} 的职业建议`
      })
    };
  }
};

exports.getMBTIRecommendationsHandler = async ({ params }) => {
  const { mbtiType } = params;
  const careerData = {
    'INTJ': {
      mbtiType: 'INTJ',
      personalityDescription: '建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
      coreTraits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
      internetCareers: [
        {
          position: '技术架构师',
          category: '技术开发',
          suitability: 5,
          reasons: ['INTJ的战略思维和系统化思考能力非常适合设计复杂的技术架构'],
          requiredSkills: ['系统设计', '技术选型', '架构模式', '性能优化'],
          careerPath: [
            { level: '初级', positions: ['初级开发工程师'] },
            { level: '中级', positions: ['高级开发工程师'] },
            { level: '高级', positions: ['技术架构师'] }
          ],
          typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动'],
          salaryRange: { junior: { min: 15000, max: 25000 }, senior: { min: 40000, max: 80000 } }
        }
      ],
      strengths: ['强大的战略思维和系统化思考能力', '独立自主，能够深度思考复杂问题'],
      challenges: ['可能过于完美主义，影响效率', '独立性强，团队协作需要改进'],
      developmentAdvice: ['培养团队协作能力，学会倾听他人意见', '在追求完美的同时注意效率平衡']
    }
  };

  const recData = careerData[mbtiType];
  if (recData) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          mbtiType: recData.mbtiType,
          personalityDescription: recData.personalityDescription,
          coreTraits: recData.coreTraits,
          recommendedCareers: recData.internetCareers.sort((a, b) => b.suitability - a.suitability),
          strengths: recData.strengths,
          challenges: recData.challenges,
          developmentAdvice: recData.developmentAdvice
        },
        message: '获取推荐职业成功'
      })
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: `未找到MBTI类型 ${mbtiType} 的职业建议`
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