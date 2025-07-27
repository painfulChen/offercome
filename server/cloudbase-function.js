// CloudBase云函数入口文件
const bcrypt = require('bcryptjs');
const tcb = require('@cloudbase/node-sdk');

// 初始化CloudBase
const app = tcb.init({
  env: 'offercome2025-9g14jitp22f4ddfc'
});

// 获取数据库实例
const db = app.database();

exports.main = async (event, context) => {
  console.log('云函数被调用:', JSON.stringify(event));
  
  // 解析请求路径和方法
  const path = event.path || '';
  const method = event.httpMethod || 'GET';
  
  console.log('请求路径:', path);
  console.log('请求方法:', method);
  
  // 设置CORS头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  // 处理OPTIONS预检请求
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  }
  
  try {
    // 路由处理 - 适配HTTP服务路径
    if ((path === '/health' || path === '/api/health') && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '招生管理系统API服务正常运行',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'production',
          features: [
            'AI聊天服务',
            '招生建议生成',
            '合同模板生成',
            '简历优化',
            '面试准备',
            '职业规划'
          ]
        })
      };
    }
    
    if ((path === '/auth/register' || path === '/api/auth/register') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { username, email, password, role = 'user' } = body;
      
      if (!username || !email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: '缺少必要参数',
            message: '用户名、邮箱和密码都是必需的'
          })
        };
      }
      
      try {
        // 检查用户是否已存在
        const existingUser = await db.collection('users').where({
          $or: [
            { username: username },
            { email: email }
          ]
        }).get();
        
        if (existingUser.data.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: '用户已存在',
              message: '用户名或邮箱已被注册'
            })
          };
        }
        
        // 加密密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 创建新用户
        const newUser = {
          username,
          email,
          password: hashedPassword,
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 保存到数据库
        const result = await db.collection('users').add(newUser);
        
        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = newUser;
        userInfo.id = result.id;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '用户注册成功',
            user: userInfo
          })
        };
      } catch (dbError) {
        console.error('数据库操作错误:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: '数据库操作失败',
            message: '注册过程中发生错误，请稍后重试'
          })
        };
      }
    }
    
    if ((path === '/auth/login' || path === '/api/auth/login') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { username, password } = body;
      
      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: '缺少必要参数',
            message: '用户名和密码都是必需的'
          })
        };
      }
      
      try {
        // 查找用户
        const userResult = await db.collection('users').where({
          $or: [
            { username: username },
            { email: username }
          ]
        }).get();
        
        if (userResult.data.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              error: '用户不存在',
              message: '用户名或密码错误'
            })
          };
        }
        
        const user = userResult.data[0];
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              error: '密码错误',
              message: '用户名或密码错误'
            })
          };
        }
        
        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '用户登录成功',
            user: userInfo,
            token: 'mock-jwt-token-' + Date.now()
          })
        };
      } catch (dbError) {
        console.error('数据库操作错误:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: '数据库操作失败',
            message: '登录过程中发生错误，请稍后重试'
          })
        };
      }
    }
    
    if ((path === '/admin/users' || path === '/api/admin/users') && method === 'GET') {
      console.log('处理用户列表请求');
      try {
        // 获取所有用户（仅用于测试，生产环境应该限制访问）
        const usersResult = await db.collection('users').get();
        console.log('数据库查询结果:', usersResult);
        
        // 脱敏处理，不返回密码
        const users = usersResult.data.map(user => {
          const { password, ...userInfo } = user;
          return userInfo;
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '获取用户列表成功',
            data: users,
            total: users.length
          })
        };
      } catch (dbError) {
        console.error('数据库操作错误:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: '数据库操作失败',
            message: '获取用户列表失败'
          })
        };
      }
    }
    
    if ((path === '/ai/chat' || path === '/api/ai/chat') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const message = body.message || '';
      
      // 模拟AI回复
      let response = '您好！我是招生助手，很高兴为您服务。';
      
      if (message.includes('招生') || message.includes('录取')) {
        response = '关于招生政策，我们提供多种专业选择，包括计算机科学、人工智能、数据科学等热门专业。您想了解哪个专业的具体信息？';
      } else if (message.includes('专业') || message.includes('课程')) {
        response = '我们开设的专业包括：计算机科学与技术、软件工程、人工智能、数据科学与大数据技术等。每个专业都有完善的课程体系和实践项目。';
      } else if (message.includes('学费') || message.includes('费用')) {
        response = '学费标准根据专业不同有所差异，一般在8000-12000元/年。我们还提供奖学金和助学金政策，帮助优秀学生完成学业。';
      } else if (message.includes('就业') || message.includes('工作')) {
        response = '我们的毕业生就业率保持在95%以上，主要就业方向包括互联网公司、金融机构、政府部门等。平均起薪在8000-15000元/月。';
      } else if (message.includes('申请') || message.includes('报名')) {
        response = '申请流程：1. 在线注册账号 2. 填写个人信息 3. 上传相关材料 4. 等待审核结果 5. 完成缴费确认。如有疑问，请联系我们的招生办公室。';
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            response: response
          }
        })
      };
    }
    
    // 默认返回
    console.log('未匹配的路径:', path);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: '路径不存在',
        message: `路径 ${path} 不存在`,
        availablePaths: [
          '/api/health',
          '/api/auth/login',
          '/api/auth/register',
          '/api/users',
          '/api/ai/chat'
        ]
      })
    };
    
  } catch (error) {
    console.error('云函数错误:', error);
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