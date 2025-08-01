// 纯计算的MBTI处理器，不依赖数据库
exports.calculateMBTIHandler = async ({ body }) => {
  console.log('🔄 开始计算MBTI结果（纯计算版本）...');
  
  try {
    // 验证输入数据
    const { answers } = JSON.parse(body);
    
    // 数据校验 - 支持两种格式
    let processedAnswers = [];
    
    if (Array.isArray(answers)) {
      if (answers.length !== 32) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案格式错误，需要32个问题的答案',
            error: 'INVALID_ANSWERS_FORMAT'
          })
        };
      }
      
      // 如果是简单数组格式 [0,1,0,1,...]
      if (typeof answers[0] === 'number') {
        processedAnswers = answers.map((option, index) => ({
          questionId: index + 1,
          selectedOption: option
        }));
      } else {
        // 如果是对象数组格式 [{questionId: 1, selectedOption: 0}, ...]
        processedAnswers = answers;
      }
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: '答案格式错误，answers必须是数组',
          error: 'INVALID_ANSWERS_FORMAT'
        })
      };
    }
    
    // 验证答案格式
    for (let i = 0; i < processedAnswers.length; i++) {
      const answer = processedAnswers[i];
      if (!answer.hasOwnProperty('questionId') || !answer.hasOwnProperty('selectedOption')) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案格式错误，每个答案需要包含questionId和selectedOption',
            error: 'INVALID_ANSWER_STRUCTURE'
          })
        };
      }
      
      if (answer.selectedOption !== 0 && answer.selectedOption !== 1) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案选项错误，只能选择0或1',
            error: 'INVALID_OPTION_VALUE'
          })
        };
      }
    }
    
    // 简化的MBTI计算逻辑
    let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // 根据答案计算得分
    for (const answer of processedAnswers) {
      const { questionId, selectedOption } = answer;
      
      if (questionId <= 8) {
        if (selectedOption === 0) scores.E++; else scores.I++;
      } else if (questionId <= 16) {
        if (selectedOption === 0) scores.S++; else scores.N++;
      } else if (questionId <= 24) {
        if (selectedOption === 0) scores.T++; else scores.F++;
      } else {
        if (selectedOption === 0) scores.J++; else scores.P++;
      }
    }
    
    // 确定MBTI类型
    const mbtiType = (scores.E > scores.I ? 'E' : 'I') +
                     (scores.S > scores.N ? 'S' : 'N') +
                     (scores.T > scores.F ? 'T' : 'F') +
                     (scores.J > scores.P ? 'J' : 'P');
    
    console.log('🎯 计算出的MBTI类型:', mbtiType);
    console.log('📊 各维度得分:', scores);
    
    // MBTI类型描述映射
    const MBTI_DESCRIPTIONS = {
      'INTJ': 'INTJ建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
      'INTP': 'INTP逻辑学家型人格 - 富有创造力和好奇心，喜欢探索新理论',
      'ENTJ': 'ENTJ指挥官型人格 - 大胆，富有想象力的强有力领导者',
      'ENTP': 'ENTP辩论家型人格 - 机智、好奇，喜欢挑战常规',
      'INFJ': 'INFJ提倡者型人格 - 富有洞察力和理想主义，关注他人发展',
      'INFP': 'INFP调停者型人格 - 诗意的，善良的利他主义者',
      'ENFJ': 'ENFJ主人公型人格 - 富有魅力的领导者，善于激励他人',
      'ENFP': 'ENFP探险家型人格 - 热情洋溢的创意家，总是能找到理由微笑',
      'ISTJ': 'ISTJ物流师型人格 - 可靠、务实，注重细节和规则',
      'ISFJ': 'ISFJ守卫者型人格 - 细心、忠诚，乐于助人',
      'ESTJ': 'ESTJ总经理型人格 - 组织能力强，注重效率和规则',
      'ESFJ': 'ESFJ执政官型人格 - 热情、合群，乐于服务他人',
      'ISTP': 'ISTP鉴赏家型人格 - 大胆而实际的实验家，擅长使用各种工具',
      'ISFP': 'ISFP探险家型人格 - 灵活、好奇，喜欢探索新体验',
      'ESTP': 'ESTP企业家型人格 - 充满活力，善于应对挑战',
      'ESFP': 'ESFP表演者型人格 - 热情、友好，喜欢成为关注焦点'
    };
    
    const response = {
      success: true,
      data: { 
        mbtiType,
        scores,
        type: mbtiType,
        description: MBTI_DESCRIPTIONS[mbtiType] || `${mbtiType}型人格描述`
      },
      message: 'MBTI计算成功'
    };
    
    console.log('📤 返回响应:', JSON.stringify(response));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('❌ MBTI计算失败:', error);
    const errorResponse = {
      success: false,
      message: 'MBTI计算失败',
      error: error.message
    };
    
    console.log('📤 返回错误响应:', JSON.stringify(errorResponse));
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse)
    };
  }
}; 