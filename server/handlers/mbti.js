// MBTI专用处理器
const db = require('../config/database-cloud');

exports.calculateMBTIHandler = async ({ body }) => {
  console.log('🔄 开始计算MBTI结果...');
  
  try {
    // 验证输入数据
    const { answers } = JSON.parse(body);
    
    // 数据校验
    if (!Array.isArray(answers) || answers.length !== 32) {
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
    
    // 验证答案格式
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
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
    for (const answer of answers) {
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
    
    const response = {
      success: true,
      data: { 
        mbtiType,
        scores,
        type: mbtiType,
        description: `${mbtiType}型人格描述`
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