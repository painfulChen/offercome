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
    
    // 移除/api或/api-v2前缀
    const cleanPath = path.replace(/^\/api(-v2)?/, '');
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
    // MBTI测试相关路由
    else if (path === '/mbti/questions' && method === 'GET') {
      const questions = [
        {
          id: 1,
          question: "在社交场合中，你更倾向于：",
          options: [
            { id: 'E', text: "主动与他人交谈，享受社交" },
            { id: 'I', text: "保持安静，观察周围环境" }
          ]
        },
        {
          id: 2,
          question: "在做决定时，你更依赖：",
          options: [
            { id: 'T', text: "逻辑分析和客观事实" },
            { id: 'F', text: "个人价值观和他人感受" }
          ]
        },
        {
          id: 3,
          question: "你更喜欢的工作环境是：",
          options: [
            { id: 'J', text: "有明确的计划和截止日期" },
            { id: 'P', text: "灵活多变，可以随时调整" }
          ]
        },
        {
          id: 4,
          question: "你更关注：",
          options: [
            { id: 'S', text: "具体的细节和现实情况" },
            { id: 'N', text: "抽象的概念和未来可能性" }
          ]
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: questions,
          message: '获取MBTI测试题目成功'
        })
      };
    }
    else if (path === '/mbti/submit' && method === 'POST') {
      try {
        const { answers } = body;
        if (!answers || !Array.isArray(answers)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: '答案格式错误'
            })
          };
        }

        // 简单的MBTI计算逻辑
        let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
        
        answers.forEach(answer => {
          switch(answer) {
            case 'E': E++; break;
            case 'I': I++; break;
            case 'S': S++; break;
            case 'N': N++; break;
            case 'T': T++; break;
            case 'F': F++; break;
            case 'J': J++; break;
            case 'P': P++; break;
          }
        });

        const type = [
          E > I ? 'E' : 'I',
          S > N ? 'S' : 'N',
          T > F ? 'T' : 'F',
          J > P ? 'J' : 'P'
        ].join('');

        const typeDescriptions = {
          'INTJ': '建筑师 - 富有想象力和战略性的思考者',
          'INTP': '逻辑学家 - 具有创新性的发明家',
          'ENTJ': '指挥官 - 大胆、富有想象力的领导者',
          'ENTP': '辩论家 - 聪明好奇的思想家',
          'INFJ': '提倡者 - 安静而神秘，富有同情心',
          'INFP': '调停者 - 诗意的、善良的利他主义者',
          'ENFJ': '主人公 - 富有魅力和鼓舞人心的领导者',
          'ENFP': '竞选者 - 热情、有创造力、社交能力强',
          'ISTJ': '物流师 - 实际而注重事实的个体',
          'ISFJ': '守卫者 - 非常专注和温暖的守护者',
          'ESTJ': '总经理 - 优秀的管理者',
          'ESFJ': '执政官 - 非常关心他人的社交蝴蝶',
          'ISTP': '鉴赏家 - 大胆而实用的实验家',
          'ISFP': '探险家 - 灵活而有魅力的艺术家',
          'ESTP': '企业家 - 聪明、精力充沛、非常善于感知',
          'ESFP': '表演者 - 自发的、精力充沛的娱乐者'
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: {
              type: type,
              description: typeDescriptions[type] || '未知类型',
              scores: {
                E, I, S, N, T, F, J, P
              }
            },
            message: 'MBTI测试完成'
          })
        };
      } catch (error) {
        console.error('MBTI测试处理错误:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'MBTI测试处理失败',
            error: error.message
          })
        };
      }
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
            '/mbti/questions',
            '/mbti/submit',
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