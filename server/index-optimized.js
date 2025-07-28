// OfferCome API 主函数 - 优化版本
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
    } else if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(body, headers);
    } else if (path === '/auth/register' && method === 'POST') {
      return await handleRegister(body, headers);
    } else if (path === '/auth/me' && method === 'GET') {
      return await handleGetProfile(authHeader, headers);
    } else if (path === '/auth/me' && method === 'PUT') {
      return await handleUpdateProfile(authHeader, body, headers);
    } else if (path === '/auth/logout' && method === 'POST') {
      return await handleLogout(authHeader, headers);
    } else if (path === '/ai/chat' && method === 'POST') {
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
    } else if (path === '/users' && method === 'GET') {
      return await handleGetUsers(authHeader, headers);
    } else if (path === '/leads' && method === 'GET') {
      return await handleGetLeads(authHeader, headers);
    } else if (path === '/leads' && method === 'POST') {
      return await handleCreateLead(authHeader, body, headers);
    } else if (path === '/packages' && method === 'GET') {
      return await handleGetPackages(headers);
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
      version: '2.0.0'
    })
  };
}

// 用户登录
async function handleLogin(body, headers) {
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

  try {
    // 查找用户
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
    
    // 验证密码
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
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'offercome_secret',
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
          email: user.email
        },
        token
      })
    };
  } catch (error) {
    console.error('登录错误:', error);
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
  const { username, email, password } = body;
  
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

  try {
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
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await db.createUser(username, email, passwordHash);
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || 'offercome_secret',
      { expiresIn: '7d' }
    );
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: '注册成功',
        user: {
          id: result.insertId,
          username,
          email
        },
        token
      })
    };
  } catch (error) {
    console.error('注册错误:', error);
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

// 获取用户信息
async function handleGetProfile(authHeader, headers) {
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      })
    };
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取用户信息失败'
      })
    };
  }
}

// 更新用户信息
async function handleUpdateProfile(authHeader, body, headers) {
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
    
    const { username, email } = body;
    if (!username || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '用户名和邮箱不能为空'
        })
      };
    }
    
    // 检查邮箱是否被其他用户使用
    const existingUser = await db.getUserByEmail(email);
    if (existingUser && existingUser.id !== user.id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '该邮箱已被其他用户使用'
        })
      };
    }
    
    // 更新用户信息
    await db.updateUser(user.id, username, email);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '用户信息更新成功',
        user: {
          id: user.id,
          username,
          email
        }
      })
    };
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '更新用户信息失败'
      })
    };
  }
}

// 用户登出
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

// AI聊天处理
async function handleAIChat(body, headers) {
  const { message, userId = 'anonymous', history = [], context = {} } = body;
  
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

  try {
    // 使用Kimi AI生成回复
    const aiResponse = await generateJobAdvice(message, { userId, ...context });
    
    if (aiResponse.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          reply: aiResponse.content,
          userId,
          model: aiResponse.model,
          usage: aiResponse.usage,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: aiResponse.error || 'AI服务暂时不可用，请稍后再试'
        })
      };
    }
  } catch (error) {
    console.error('AI聊天错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'AI服务暂时不可用，请稍后再试'
      })
    };
  }
}

// 简历优化处理
async function handleResumeOptimization(body, headers) {
  const { resumeContent, targetJob = '', userId = 'anonymous' } = body;
  
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

  try {
    const result = await optimizeResume(resumeContent, targetJob);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          advice: result.content,
          userId,
          model: result.model,
          usage: result.usage,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error || '简历优化服务暂时不可用'
        })
      };
    }
  } catch (error) {
    console.error('简历优化错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '简历优化服务暂时不可用，请稍后再试'
      })
    };
  }
}

// 面试技巧处理
async function handleInterviewTips(body, headers) {
  const { interviewType = 'general', company = '', userId = 'anonymous' } = body;

  try {
    const result = await provideInterviewTips(interviewType, company);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          tips: result.content,
          userId,
          model: result.model,
          usage: result.usage,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error || '面试技巧服务暂时不可用'
        })
      };
    }
  } catch (error) {
    console.error('面试技巧错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '面试技巧服务暂时不可用，请稍后再试'
      })
    };
  }
}

// 职业规划处理
async function handleCareerPlanning(body, headers) {
  const { userBackground, careerGoals = '', userId = 'anonymous' } = body;
  
  if (!userBackground) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: '用户背景信息不能为空'
      })
    };
  }

  try {
    const result = await careerPlanningAdvice(userBackground, careerGoals);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          advice: result.content,
          userId,
          model: result.model,
          usage: result.usage,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error || '职业规划服务暂时不可用'
        })
      };
    }
  } catch (error) {
    console.error('职业规划错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '职业规划服务暂时不可用，请稍后再试'
      })
    };
  }
}

// 模拟面试处理
async function handleInterviewSimulation(body, headers) {
  const { question, userAnswer = '', context = {}, userId = 'anonymous' } = body;
  
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

  try {
    const result = await simulateInterview(question, userAnswer, context);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          feedback: result.content,
          userId,
          model: result.model,
          usage: result.usage,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error || '模拟面试服务暂时不可用'
        })
      };
    }
  } catch (error) {
    console.error('模拟面试错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '模拟面试服务暂时不可用，请稍后再试'
      })
    };
  }
}

// AI服务测试
async function handleAITest(headers) {
  try {
    const result = await testAIConnection();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: result.success,
        message: result.message,
        details: result.details,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('AI测试错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'AI服务测试失败',
        message: error.message
      })
    };
  }
}

// 获取用户列表
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
          created_at: u.created_at
        }))
      })
    };
  } catch (error) {
    console.error('获取用户列表错误:', error);
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

// 获取潜在客户列表
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
    console.error('获取潜在客户列表错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取潜在客户列表失败'
      })
    };
  }
}

// 创建潜在客户
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
    
    const { name, phone, email, source } = body;
    
    if (!name || !phone || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '姓名、电话和邮箱不能为空'
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
        lead: {
          id: result.insertId,
          name,
          phone,
          email,
          source
        }
      })
    };
  } catch (error) {
    console.error('创建潜在客户错误:', error);
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

// 获取套餐列表
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
    console.error('获取套餐列表错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '获取套餐列表失败'
      })
    };
  }
}

// 验证JWT token
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'offercome_secret');
    const user = await db.getUserById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Token验证错误:', error);
    return null;
  }
}

// 404处理
function handleNotFound(headers) {
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      success: false,
      error: '接口不存在'
    })
  };
}

// 错误处理
function handleError(error, headers) {
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