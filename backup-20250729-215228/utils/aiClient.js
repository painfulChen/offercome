// AI客户端配置 - 使用Moonshot (Kimi) API
const https = require('https');

// 环境变量配置
const KIMI_KEY = process.env.KIMI_KEY || 'sk-reaTT6uRqEqQPZ7HMXp5gmoingV6cZ2dumU8Y4axl9DHN2Jw'; // 使用默认测试key
const KIMI_BASE_URL = 'api.moonshot.cn';

// 默认模型配置
const DEFAULT_MODEL = 'moonshot-v1-8k';
const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_MAX_TOKENS = 4000;

// HTTP请求函数
function makeHttpRequest(hostname, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: result
          });
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 通用聊天完成函数
async function chatCompletion(prompt, options = {}) {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = DEFAULT_TEMPERATURE,
      maxTokens = DEFAULT_MAX_TOKENS,
      messages = []
    } = options;

    // 构建消息数组
    const messageArray = [
      ...messages,
      { role: 'user', content: prompt }
    ];

    const requestData = {
      model: model,
      messages: messageArray,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false
    };

    const response = await makeHttpRequest(
      KIMI_BASE_URL,
      '/v1/chat/completions',
      requestData
    );

    if (response.statusCode === 200 && response.data.choices && response.data.choices[0]) {
      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } else {
      throw new Error('API响应格式错误');
    }
  } catch (error) {
    console.error('AI聊天完成错误:', error);
    return {
      success: false,
      error: error.message,
      content: '抱歉，我现在无法回答您的问题，请稍后再试。'
    };
  }
}

// 求职相关的AI助手函数
async function generateJobAdvice(message, context = {}) {
  const systemPrompt = `你是一个专业的求职顾问，专门帮助求职者优化简历、准备面试、制定职业规划。
请根据用户的问题提供专业、实用的建议。回答要简洁明了，突出重点。`;

  const userContext = context.userId ? `用户ID: ${context.userId}` : '';
  const fullPrompt = `${systemPrompt}\n\n用户问题: ${message}\n${userContext}`;

  return await chatCompletion(fullPrompt, {
    temperature: 0.7,
    maxTokens: 2000
  });
}

// 简历优化函数
async function optimizeResume(resumeContent, targetJob = '') {
  const systemPrompt = `你是一个专业的简历优化专家。请根据用户提供的简历内容和目标职位，提供具体的优化建议。
建议要具体、可操作，包括格式、内容、关键词等方面的改进。`;

  const prompt = `简历内容: ${resumeContent}\n目标职位: ${targetJob || '通用职位'}\n\n请提供详细的优化建议:`;

  return await chatCompletion(prompt, {
    temperature: 0.6,
    maxTokens: 3000
  });
}

// 面试技巧指导函数
async function provideInterviewTips(interviewType = 'general', company = '') {
  const systemPrompt = `你是一个面试技巧专家，专门为求职者提供面试准备建议。
请根据面试类型和公司特点，提供针对性的面试技巧和注意事项。`;

  const prompt = `面试类型: ${interviewType}\n目标公司: ${company || '通用公司'}\n\n请提供详细的面试准备建议:`;

  return await chatCompletion(prompt, {
    temperature: 0.7,
    maxTokens: 2500
  });
}

// 职业规划咨询函数
async function careerPlanningAdvice(userBackground, careerGoals = '') {
  const systemPrompt = `你是一个职业规划顾问，帮助求职者制定职业发展路径。
请根据用户的背景和职业目标，提供个性化的职业规划建议。`;

  const prompt = `用户背景: ${userBackground}\n职业目标: ${careerGoals || '待明确'}\n\n请提供职业规划建议:`;

  return await chatCompletion(prompt, {
    temperature: 0.8,
    maxTokens: 3000
  });
}

// 模拟面试问答函数
async function simulateInterview(question, userAnswer = '', context = {}) {
  const systemPrompt = `你是一个面试官，正在进行模拟面试。
请根据用户对问题的回答，提供专业的反馈和改进建议。`;

  const prompt = `面试问题: ${question}\n用户回答: ${userAnswer || '用户尚未回答'}\n面试岗位: ${context.position || '通用岗位'}\n\n请提供面试反馈:`;

  return await chatCompletion(prompt, {
    temperature: 0.6,
    maxTokens: 2000
  });
}

// 健康检查函数
async function testAIConnection() {
  try {
    const result = await chatCompletion('你好，请简单介绍一下自己。', {
      temperature: 0.5,
      maxTokens: 100
    });
    
    return {
      success: result.success,
      message: result.success ? 'AI服务连接正常' : 'AI服务连接异常',
      details: result
    };
  } catch (error) {
    return {
      success: false,
      message: 'AI服务连接失败',
      error: error.message
    };
  }
}

module.exports = {
  chatCompletion,
  generateJobAdvice,
  optimizeResume,
  provideInterviewTips,
  careerPlanningAdvice,
  simulateInterview,
  testAIConnection,
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS
}; 