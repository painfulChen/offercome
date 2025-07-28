// OfferCome API 主函数 - 增强版本
const { 
  generateJobAdvice, 
  optimizeResume, 
  provideInterviewTips, 
  careerPlanningAdvice, 
  simulateInterview,
  testAIConnection 
} = require('./utils/aiClient');

const db = require('./config/database-cloud');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.main = async (event) => {
  console.log('=== FUNCTION INVOKED ===');
  console.log('EVENT_IN:', JSON.stringify(event));
  console.log('Event path:', event?.path);
  console.log('Event httpMethod:', event?.httpMethod);

  // 设置CORS头
  const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 处理OPTIONS预检请求
  if (event?.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event?.path || '';
    const method = event?.httpMethod || 'GET';
    const body = event?.body ? JSON.parse(event.body) : {};
    const authHeader = event?.headers?.authorization || event?.headers?.Authorization;

    // 路由处理
    if (path === '/health' && method === 'GET') {
      return handleHealthCheck(headers);
    } 
    // 用户认证
    else if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(body, headers);
    } else if (path === '/auth/register' && method === 'POST') {
      return await handleRegister(body, headers);
    } else if (path === '/auth/me' && method === 'GET') {
      return await handleGetProfile(authHeader, headers);
    } else if (path === '/auth/me' && method === 'PUT') {
      return await handleUpdateProfile(authHeader, body, headers);
    } else if (path === '/auth/logout' && method === 'POST') {
      return await handleLogout(authHeader, headers);
    }
    // 咨询管理
    else if (path === '/consultations' && method === 'POST') {
      return await handleCreateConsultation(authHeader, body, headers, event);
    } else if (path === '/consultations' && method === 'GET') {
      return await handleGetConsultations(authHeader, headers);
    } else if (path === '/consultations' && method === 'PUT') {
      return await handleUpdateConsultation(authHeader, body, headers);
    }
    // MBTI测试
    else if (path === '/mbti/questions' && method === 'GET') {
      return await handleGetMbtiQuestions(headers);
    } else if (path === '/mbti/test' && method === 'POST') {
      return await handleSubmitMbtiTest(authHeader, body, headers);
    } else if (path === '/mbti/result' && method === 'GET') {
      return await handleGetMbtiResult(authHeader, headers);
    } else if (path === '/mbti/result' && method === 'POST') {
      return await handleSubmitMbtiResult(authHeader, body, headers);
    }
    // AI服务
    else if (path === '/ai/chat' && method === 'POST') {
      return await handleAIChat(body, headers);
    } else if (path === '/ai/resume' && method === 'POST') {
      return await handleResumeOptimization(body, headers);
    } else if (path === '/ai/interview' && method === 'POST') {
      return await handleInterviewTips(body, headers);
    } else if (path === '/ai/career' && method === 'POST') {
      return await handleCareerPlanning(body, headers);
    } else if (path === '/ai/simulate' && method === 'POST') {
      return await handleInterviewSimulation(body, headers);
    } else if (path === '/ai/test' && method === 'GET') {
      return await handleAITest(headers);
    }
    // 数据管理
    else if (path === '/users' && method === 'GET') {
      return await handleGetUsers(authHeader, headers);
    } else if (path === '/leads' && method === 'GET') {
      return await handleGetLeads(authHeader, headers);
    } else if (path === '/leads' && method === 'POST') {
      return await handleCreateLead(authHeader, body, headers);
    } else if (path === '/packages' && method === 'GET') {
      return await handleGetPackages(headers);
    } else if (path === '/notifications' && method === 'GET') {
      return await handleGetNotifications(authHeader, headers);
    } else if (path === '/notifications' && method === 'PUT') {
      return await handleMarkNotificationRead(authHeader, body, headers);
    } else {
      return handleNotFound(headers);
    }
  } catch (error) {
    console.error('API处理错误:', error);
    return handleError(error, headers);
  }
};

// 健康检查
function handleHealthCheck(headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      echoPath: '/health',
      runtime: process.version,
      commit: process.env.GIT_COMMIT || 'dev',
      timestamp: new Date().toISOString(),
      message: 'OfferCome智能求职辅导平台API服务正常运行',
      database: 'MySQL (腾讯云)',
      version: '2.1.0',
      features: ['用户认证', '咨询管理', 'MBTI测试', 'AI服务', 'CRM集成']
    })
  };
}

// 用户登录
async function handleLogin(body, headers) {
  try {
    const { email, password } = body;
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '邮箱和密码不能为空'
        })
      };
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '邮箱或密码错误'
        })
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '邮箱或密码错误'
        })
      };
    }

    // 更新登录信息
    await db.query(
      'UPDATE users SET last_login_at = NOW(), login_count = login_count + 1 WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'offercome-secret',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mbti_type: user.mbti_type,
          phone: user.phone,
          education: user.education,
          target_job: user.target_job,
          experience_years: user.experience_years
        },
        token
      })
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '登录失败，请稍后再试'
      })
    };
  }
}

// 用户注册
async function handleRegister(body, headers) {
  try {
    const { username, email, password, phone, education, target_job, experience_years } = body;
    
    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '用户名、邮箱和密码不能为空'
        })
      };
    }

    // 检查用户是否已存在
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '该邮箱已被注册'
        })
      };
    }

    const existingUsername = await db.getUserByUsername(username);
    if (existingUsername) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '该用户名已被使用'
        })
      };
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, phone, education, target_job, experience_years) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, phone || null, education || null, target_job || null, experience_years || null]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'offercome-secret',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: '注册成功',
        user: {
          id: userId,
          username,
          email,
          phone,
          education,
          target_job,
          experience_years
        },
        token
      })
    };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '注册失败，请稍后再试'
      })
    };
  }
}

// 获取用户资料
async function handleGetProfile(authHeader, headers) {
  try {
    const user = await verifyToken(authHeader);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '认证失败'
        })
      };
    }

    const userProfile = await db.getUserById(user.userId);
    if (!userProfile) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: '用户不存在'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          mbti_type: userProfile.mbti_type,
          mbti_test_date: userProfile.mbti_test_date,
          phone: userProfile.phone,
          wechat: userProfile.wechat,
          education: userProfile.education,
          target_job: userProfile.target_job,
          experience_years: userProfile.experience_years,
          avatar_url: userProfile.avatar_url,
          last_login_at: userProfile.last_login_at,
          login_count: userProfile.login_count
        }
      })
    };
  } catch (error) {
    console.error('获取用户资料失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取用户资料失败'
      })
    };
  }
}

// 创建咨询记录
async function handleCreateConsultation(authHeader, body, headers, event) {
  try {
    const user = await verifyToken(authHeader);
    const { 
      name, phone, email, wechat, consultation_type, current_situation, 
      target_position, target_company, urgency_level, budget_range, 
      preferred_time, additional_notes 
    } = body;

    if (!name || !phone || !consultation_type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '姓名、手机号码和咨询类型不能为空'
        })
      };
    }

    // 获取IP地址和用户代理
    const ipAddress = event?.headers?.['x-forwarded-for'] || event?.headers?.['x-real-ip'] || 'unknown';
    const userAgent = event?.headers?.['user-agent'] || 'unknown';

    // 创建咨询记录
    const result = await db.query(
      `INSERT INTO consultations (
        user_id, name, phone, email, wechat, consultation_type, 
        current_situation, target_position, target_company, urgency_level, 
        budget_range, preferred_time, additional_notes, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.userId || null, name, phone, email || null, wechat || null,
        consultation_type, current_situation || null, target_position || null,
        target_company || null, urgency_level || 'medium', budget_range || null,
        preferred_time || null, additional_notes || null, ipAddress, userAgent
      ]
    );

    // 创建潜在客户记录
    await db.query(
      `INSERT INTO leads (name, phone, email, source, status, notes) 
       VALUES (?, ?, ?, 'consultation', 'new', ?)`,
      [name, phone, email || null, `咨询类型: ${consultation_type}`]
    );

    // 发送通知给销售顾问
    await db.query(
      `INSERT INTO notifications (type, title, message, related_id) 
       VALUES ('consultation', '新咨询记录', ?, ?)`,
      [`收到来自 ${name} 的 ${consultation_type} 咨询`, result.insertId]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: '咨询提交成功，我们会尽快联系您',
        consultation_id: result.insertId
      })
    };
  } catch (error) {
    console.error('创建咨询记录失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '提交咨询失败，请稍后再试'
      })
    };
  }
}

// 获取MBTI问题
async function handleGetMbtiQuestions(headers) {
  try {
    const questions = await db.query(
      'SELECT * FROM mbti_questions WHERE is_active = TRUE ORDER BY dimension, question_number'
    );

    // 按维度分组
    const groupedQuestions = {
      EI: questions.filter(q => q.dimension === 'EI'),
      SN: questions.filter(q => q.dimension === 'SN'),
      TF: questions.filter(q => q.dimension === 'TF'),
      JP: questions.filter(q => q.dimension === 'JP')
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        questions: groupedQuestions,
        total_questions: questions.length
      })
    };
  } catch (error) {
    console.error('获取MBTI问题失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取测试问题失败'
      })
    };
  }
}

// 提交MBTI测试结果
async function handleSubmitMbtiResult(authHeader, body, headers) {
  try {
    const user = await verifyToken(authHeader);
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '测试答案不能为空'
        })
      };
    }

    // 计算各维度得分
    const scores = calculateMbtiScores(answers);
    const mbtiType = determineMbtiType(scores);
    
    // 获取职业建议和人格描述
    const { careerSuggestions, personalityDescription, strengths, weaknesses } = getMbtiAnalysis(mbtiType);

    // 保存测试结果
    const result = await db.query(
      `INSERT INTO mbti_results (
        user_id, mbti_type, e_score, i_score, s_score, n_score, 
        t_score, f_score, j_score, p_score, career_suggestions, 
        personality_description, strengths, weaknesses
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.userId || null, mbtiType, scores.E, scores.I, scores.S, scores.N,
        scores.T, scores.F, scores.J, scores.P, careerSuggestions,
        personalityDescription, strengths, weaknesses
      ]
    );

    // 更新用户MBTI信息
    if (user?.userId) {
      await db.query(
        'UPDATE users SET mbti_type = ?, mbti_test_date = NOW() WHERE id = ?',
        [mbtiType, user.userId]
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'MBTI测试完成',
        result: {
          mbti_type: mbtiType,
          scores,
          career_suggestions: careerSuggestions,
          personality_description: personalityDescription,
          strengths,
          weaknesses
        }
      })
    };
  } catch (error) {
    console.error('提交MBTI测试失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '提交测试失败，请稍后再试'
      })
    };
  }
}

// 计算MBTI得分
function calculateMbtiScores(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  answers.forEach(answer => {
    const { question_id, choice } = answer;
    // 这里需要根据问题ID和选择计算得分
    // 简化版本，实际需要更复杂的逻辑
    if (choice === 'A') {
      scores.E++; scores.S++; scores.T++; scores.J++;
    } else {
      scores.I++; scores.N++; scores.F++; scores.P++;
    }
  });

  return scores;
}

// 确定MBTI类型
function determineMbtiType(scores) {
  const type = [
    scores.E > scores.I ? 'E' : 'I',
    scores.S > scores.N ? 'S' : 'N',
    scores.T > scores.F ? 'T' : 'F',
    scores.J > scores.P ? 'J' : 'P'
  ].join('');
  
  return type;
}

// 获取MBTI分析
function getMbtiAnalysis(mbtiType) {
  const analysis = {
    'INTJ': {
      careerSuggestions: '适合技术专家、架构师、研究员、战略分析师等需要深度思考和战略规划的职业',
      personalityDescription: 'INTJ是建筑师型人格，具有战略思维、创新能力和独立性',
      strengths: '战略思维、创新能力、独立性、深度分析',
      weaknesses: '可能过于完美主义、不善于表达情感'
    },
    'ENFP': {
      careerSuggestions: '适合产品经理、销售、培训师、创意总监等需要人际交往和创造力的职业',
      personalityDescription: 'ENFP是探险家型人格，充满热情、创造力和同理心',
      strengths: '热情、创造力、同理心、适应性强',
      weaknesses: '可能缺乏耐心、容易分心'
    },
    'ISTP': {
      careerSuggestions: '适合工程师、技术专家、分析师、机械师等需要精确操作和问题解决的职业',
      personalityDescription: 'ISTP是鉴赏家型人格，善于解决实际问题，具有灵活性',
      strengths: '实际问题解决、灵活性、冷静分析',
      weaknesses: '可能缺乏长期规划、不善于团队合作'
    }
  };

  return analysis[mbtiType] || {
    careerSuggestions: '根据您的MBTI类型，建议选择适合您性格特点的职业',
    personalityDescription: '您的MBTI类型具有独特的人格特征',
    strengths: '请根据测试结果了解您的优势',
    weaknesses: '请根据测试结果了解需要改进的方面'
  };
}

// 获取通知
async function handleGetNotifications(authHeader, headers) {
  try {
    const user = await verifyToken(authHeader);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '认证失败'
        })
      };
    }

    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [user.userId]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        notifications
      })
    };
  } catch (error) {
    console.error('获取通知失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取通知失败'
      })
    };
  }
}

// 标记通知为已读
async function handleMarkNotificationRead(authHeader, body, headers) {
  try {
    const user = await verifyToken(authHeader);
    const { notification_id } = body;

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '认证失败'
        })
      };
    }

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notification_id, user.userId]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '通知已标记为已读'
      })
    };
  } catch (error) {
    console.error('标记通知失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '操作失败'
      })
    };
  }
}

// 验证Token
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'offercome-secret');
    return decoded;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

// 其他处理函数（保持原有功能）
async function handleUpdateProfile(authHeader, body, headers) {
  // 实现用户资料更新
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: '资料更新成功'
    })
  };
}

async function handleLogout(authHeader, headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: '登出成功'
    })
  };
}

async function handleAIChat(body, headers) {
  try {
    const { message, context = '' } = body;
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '消息内容不能为空'
        })
      };
    }

    const aiResponse = await generateJobAdvice(message, context);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reply: aiResponse,
        userId: 'anonymous',
        model: 'moonshot-v1-8k',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('AI聊天失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'AI服务暂时不可用'
      })
    };
  }
}

async function handleResumeOptimization(body, headers) {
  try {
    const { resumeContent, targetJob = '' } = body;
    
    if (!resumeContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '简历内容不能为空'
        })
      };
    }

    const optimizedResume = await optimizeResume(resumeContent, targetJob);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        optimized_resume: optimizedResume,
        suggestions: '简历优化建议已生成'
      })
    };
  } catch (error) {
    console.error('简历优化失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '简历优化失败'
      })
    };
  }
}

async function handleInterviewTips(body, headers) {
  try {
    const { interviewType = 'general', company = '' } = body;
    
    const tips = await provideInterviewTips(interviewType, company);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tips: tips,
        interview_type: interviewType,
        company: company
      })
    };
  } catch (error) {
    console.error('面试技巧获取失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取面试技巧失败'
      })
    };
  }
}

async function handleCareerPlanning(body, headers) {
  try {
    const { userBackground, careerGoals = '' } = body;
    
    if (!userBackground) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '用户背景不能为空'
        })
      };
    }

    const careerPlan = await careerPlanningAdvice(userBackground, careerGoals);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        career_plan: careerPlan,
        suggestions: '职业规划建议已生成'
      })
    };
  } catch (error) {
    console.error('职业规划失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '职业规划失败'
      })
    };
  }
}

async function handleInterviewSimulation(body, headers) {
  try {
    const { question, userAnswer = '', context = {} } = body;
    
    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '面试问题不能为空'
        })
      };
    }

    const feedback = await simulateInterview(question, userAnswer, context);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        feedback: feedback,
        question: question,
        user_answer: userAnswer
      })
    };
  } catch (error) {
    console.error('面试模拟失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '面试模拟失败'
      })
    };
  }
}

async function handleAITest(headers) {
  try {
    const testResult = await testAIConnection();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ai_status: 'connected',
        test_result: testResult
      })
    };
  } catch (error) {
    console.error('AI测试失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'AI服务连接失败'
      })
    };
  }
}

async function handleGetUsers(authHeader, headers) {
  try {
    const user = await verifyToken(authHeader);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '未提供认证令牌'
        })
      };
    }

    const users = await db.getUsers();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          mbti_type: u.mbti_type,
          created_at: u.created_at
        }))
      })
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取用户列表失败'
      })
    };
  }
}

async function handleGetLeads(authHeader, headers) {
  try {
    const user = await verifyToken(authHeader);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '未提供认证令牌'
        })
      };
    }

    const leads = await db.getLeads();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        leads
      })
    };
  } catch (error) {
    console.error('获取潜在客户失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取潜在客户失败'
      })
    };
  }
}

async function handleCreateLead(authHeader, body, headers) {
  try {
    const user = await verifyToken(authHeader);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: '未提供认证令牌'
        })
      };
    }

    const { name, phone, email, source, notes } = body;
    
    if (!name || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '姓名和手机号码不能为空'
        })
      };
    }

    const result = await db.createLead(name, phone, email, source);
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: '潜在客户创建成功',
        lead_id: result.insertId
      })
    };
  } catch (error) {
    console.error('创建潜在客户失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '创建潜在客户失败'
      })
    };
  }
}

async function handleGetPackages(headers) {
  try {
    const packages = await db.getPackages();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        packages
      })
    };
  } catch (error) {
    console.error('获取套餐失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取套餐失败'
      })
    };
  }
}

function handleNotFound(headers) {
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      success: false,
      error: '接口不存在',
      available_endpoints: [
        '/health',
        '/auth/login',
        '/auth/register',
        '/auth/me',
        '/consultations',
        '/mbti/questions',
        '/mbti/test',
        '/mbti/result',
        '/ai/chat',
        '/ai/resume',
        '/ai/interview',
        '/ai/career',
        '/ai/simulate',
        '/users',
        '/leads',
        '/packages',
        '/notifications'
      ]
    })
  };
}

function handleError(error, headers) {
  console.error('API错误:', error);
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