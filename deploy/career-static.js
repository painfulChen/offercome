// 静态的职业建议处理器，不依赖数据库
exports.getMBTICareerAdviceHandler = async () => {
  console.log('🔄 获取MBTI职业建议（静态版本）...');
  
  try {
    // 静态职业建议数据
    const staticCareerAdvice = [
      {
        mbti_type: 'INTJ',
        personality_description: '建筑师型人格 - 富有想象力和战略性的思考者',
        core_traits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
        recommended_careers: [
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
        strengths: '强大的战略思维和系统化思考能力，独立自主，能够深度思考复杂问题',
        challenges: '可能过于完美主义，影响效率，独立性强，团队协作需要改进',
        development_advice: '培养团队协作能力，学会倾听他人意见，在追求完美的同时注意效率平衡'
      },
      {
        mbti_type: 'INFP',
        personality_description: '调停者型人格 - 诗意的，善良的利他主义者',
        core_traits: ['理想主义', '同理心', '创造力', '适应性', '价值观驱动'],
        recommended_careers: [
          {
            position: '用户体验设计师',
            category: '产品设计',
            suitability: 5,
            reasons: ['INFP的同理心和创造力非常适合理解用户需求并设计优秀的用户体验'],
            requiredSkills: ['用户研究', '交互设计', '视觉设计', '原型制作'],
            careerPath: [
              { level: '初级', positions: ['UI设计师'] },
              { level: '中级', positions: ['UX设计师'] },
              { level: '高级', positions: ['用户体验设计师'] }
            ],
            typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动'],
            salaryRange: { junior: { min: 12000, max: 20000 }, senior: { min: 30000, max: 60000 } }
          }
        ],
        strengths: '富有同理心和创造力，能够理解他人需求，适应性强',
        challenges: '可能过于理想主义，决策时容易受情感影响',
        development_advice: '在保持理想主义的同时，学会理性分析，平衡情感和逻辑'
      }
    ];
    
    console.log(`📊 返回 ${staticCareerAdvice.length} 个静态职业建议`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: staticCareerAdvice,
        message: 'MBTI职业建议获取成功（静态数据）'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业建议失败:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业建议失败',
        error: error.message
      })
    };
  }
};

// 静态的职业类别处理器
exports.getMBTICareerCategoriesHandler = async () => {
  console.log('🔄 获取MBTI职业类别（静态版本）...');
  
  try {
    // 静态职业类别数据
    const staticCategories = [
      '技术开发',
      '产品设计', 
      '用户体验',
      '数据分析',
      '运营营销',
      '内容创作',
      '项目管理',
      '行政管理',
      '客户服务'
    ];
    
    console.log(`📊 返回 ${staticCategories.length} 个静态职业类别`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: staticCategories,
        message: 'MBTI职业类别获取成功（静态数据）'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业类别失败:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业类别失败',
        error: error.message
      })
    };
  }
};

// 静态的职业建议按类型处理器
exports.getMBTICareerAdviceByTypeHandler = async ({ params }) => {
  console.log('🔄 获取MBTI职业建议（按类型，静态版本）...');
  
  try {
    const { mbtiType } = params;
    console.log(`📋 请求的MBTI类型: ${mbtiType}`);
    
    // 静态职业建议数据
    const staticCareerAdvice = {
      'INTJ': {
        mbti_type: 'INTJ',
        personality_description: '建筑师型人格 - 富有想象力和战略性的思考者',
        core_traits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
        recommended_careers: [
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
        strengths: '强大的战略思维和系统化思考能力，独立自主，能够深度思考复杂问题',
        challenges: '可能过于完美主义，影响效率，独立性强，团队协作需要改进',
        development_advice: '培养团队协作能力，学会倾听他人意见，在追求完美的同时注意效率平衡'
      },
      'INFP': {
        mbti_type: 'INFP',
        personality_description: '调停者型人格 - 诗意的，善良的利他主义者',
        core_traits: ['理想主义', '同理心', '创造力', '适应性', '价值观驱动'],
        recommended_careers: [
          {
            position: '用户体验设计师',
            category: '产品设计',
            suitability: 5,
            reasons: ['INFP的同理心和创造力非常适合理解用户需求并设计优秀的用户体验'],
            requiredSkills: ['用户研究', '交互设计', '视觉设计', '原型制作'],
            careerPath: [
              { level: '初级', positions: ['UI设计师'] },
              { level: '中级', positions: ['UX设计师'] },
              { level: '高级', positions: ['用户体验设计师'] }
            ],
            typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动'],
            salaryRange: { junior: { min: 12000, max: 20000 }, senior: { min: 30000, max: 60000 } }
          }
        ],
        strengths: '富有同理心和创造力，能够理解他人需求，适应性强',
        challenges: '可能过于理想主义，决策时容易受情感影响',
        development_advice: '在保持理想主义的同时，学会理性分析，平衡情感和逻辑'
      }
    };
    
    const advice = staticCareerAdvice[mbtiType];
    
    if (!advice) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: `未找到 ${mbtiType} 类型的职业建议`
        })
      };
    }
    
    console.log(`📊 返回 ${mbtiType} 的职业建议`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: advice,
        message: '获取职业建议成功（静态数据）'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI职业建议失败:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '获取MBTI职业建议失败',
        error: error.message
      })
    };
  }
}; 