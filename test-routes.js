const https = require('https');

// 测试路由
async function testRoutes() {
  const baseUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api16';
  
  console.log('🧪 测试路由系统...\n');

  const routes = [
    { path: '/health', method: 'GET', name: '健康检查' },
    { path: '/mbti/questions', method: 'GET', name: 'MBTI问题' },
    { path: '/mbti/calculate', method: 'POST', name: 'MBTI计算', body: '{"answers":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]}' },
    { path: '/mbti/history', method: 'GET', name: 'MBTI历史', query: '?email=test@example.com' },
    { path: '/mbti/stats', method: 'GET', name: 'MBTI统计' }
  ];

  for (const route of routes) {
    console.log(`📡 测试 ${route.name} (${route.method} ${route.path})...`);
    
    try {
      const url = baseUrl + route.path + (route.query || '');
      const options = {
        method: route.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (route.body) {
        options.body = route.body;
      }

      const response = await makeRequest(url, options);
      
      if (response.success !== false) {
        console.log(`✅ ${route.name} 成功`);
      } else {
        console.log(`❌ ${route.name} 失败: ${response.message}`);
      }
    } catch (error) {
      console.log(`❌ ${route.name} 错误: ${error.message}`);
    }
    
    console.log('');
  }
}

// 发送HTTP请求的通用函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// 运行测试
testRoutes(); 