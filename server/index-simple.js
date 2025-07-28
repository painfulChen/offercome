// OfferCome API - 简化版本
// 解决部署缓存和HTTP触发器问题

exports.main = async (event, context) => {
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
    
    console.log('🔍 请求路径:', path);
    console.log('🔍 请求方法:', method);
    
    // 移除/api前缀
    const cleanPath = path.replace(/^\/api/, '');
    console.log('🔍 清理后的路径:', cleanPath);

    // 路由处理
    if (path === '/health' && method === 'GET') {
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
    // 用户认证
    else if (path === '/auth/login' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '登录成功',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
          },
          token: 'mock_token_123'
        })
      };
    } else if (path === '/auth/register' && method === 'POST') {
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: '注册成功',
          user: {
            id: Date.now().toString(),
            username: body.username || 'user',
            email: body.email || 'user@example.com',
            role: 'user'
          },
          token: 'mock_token_' + Date.now()
        })
      };
    }
    // AI服务
    else if (path === '/ai/chat' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          reply: '这是一个模拟的AI回复。在实际部署中，这里会调用真实的AI服务。',
          userId: 'anonymous',
          model: 'moonshot-v1-8k',
          timestamp: new Date().toISOString()
        })
      };
    }
    // 学生案例
    else if (path === '/cases/featured' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              title: '从应届生到BAT产品经理',
              category: '产品经理',
              industry: '互联网',
              salaryIncrease: '150%',
              duration: '3个月',
              difficulty: '中等'
            },
            {
              id: '2',
              title: '金融转行数据分析师',
              category: '数据分析',
              industry: '金融',
              salaryIncrease: '120%',
              duration: '4个月',
              difficulty: '困难'
            }
          ],
          message: '获取精选案例成功'
        })
      };
    } else if (path === '/cases' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            cases: [
              {
                id: '1',
                title: '从应届生到BAT产品经理',
                category: '产品经理',
                industry: '互联网',
                salaryIncrease: '150%',
                duration: '3个月',
                difficulty: '中等'
              }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              pages: 1
            }
          },
          message: '获取案例列表成功'
        })
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: '路径不存在',
          message: `路径 ${path} 不存在`,
          availablePaths: [
            '/health',
            '/auth/login',
            '/auth/register',
            '/ai/chat',
            '/cases/featured',
            '/cases'
          ]
        })
      };
    }
  } catch (error) {
    console.error('API处理错误:', error);
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