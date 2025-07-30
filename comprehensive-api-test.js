#!/usr/bin/env node

// 全面API测试脚本 - 测试所有21个路由
const https = require('https');
const { routes, API_PREFIX } = require('./server/routes');

console.log('🧪 开始全面API测试...');
console.log('=' * 60);

// 测试配置
const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com';
const API_BASE = `${BASE_URL}${API_PREFIX}`;

// 测试数据
const testData = {
  mbtiCalculate: {
    type: 'ENTJ',
    scores: {
      E: 12, I: 8,
      S: 6, N: 14,
      T: 15, F: 5,
      J: 13, P: 7
    }
  },
  aiChat: {
    message: '你好，请介绍一下你自己',
    model: 'kimi'
  },
  aiRag: {
    question: '什么是人工智能？',
    context: 'AI相关文档'
  },
  authLogin: {
    username: 'testuser',
    password: 'testpass123'
  },
  authRegister: {
    username: 'newuser',
    password: 'newpass123',
    email: 'test@example.com'
  },
  userProfile: {
    name: '测试用户',
    email: 'test@example.com',
    phone: '13800138000'
  },
  createCase: {
    title: '测试案例',
    description: '这是一个测试案例',
    category: '技术'
  },
  phoneSendCode: {
    phone: '13800138000'
  },
  phoneVerify: {
    phone: '13800138000',
    code: '123456'
  },
  ragUpload: {
    title: '测试文档',
    content: '这是一个测试文档的内容',
    category: '技术'
  }
};

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// HTTP请求函数
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0'
      },
      timeout: 10000
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试单个路由
async function testRoute(route, testData = null) {
  const url = `${API_BASE}${route.path}`;
  const method = route.method;
  
  console.log(`\n🔍 测试: ${method} ${url}`);
  console.log(`   描述: ${route.description}`);
  
  try {
    const response = await makeRequest(url, method, testData);
    
    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const status = isSuccess ? '✅' : '❌';
    
    console.log(`   ${status} 状态码: ${response.statusCode}`);
    
    if (response.data) {
      console.log(`   响应: ${JSON.stringify(response.data).substring(0, 100)}...`);
    }
    
    testResults.total++;
    if (isSuccess) {
      testResults.passed++;
      console.log(`   ✅ 测试通过`);
    } else {
      testResults.failed++;
      console.log(`   ❌ 测试失败`);
    }
    
    testResults.details.push({
      route: route.path,
      method: route.method,
      statusCode: response.statusCode,
      success: isSuccess,
      description: route.description
    });
    
  } catch (error) {
    testResults.total++;
    testResults.failed++;
    console.log(`   ❌ 请求失败: ${error.message}`);
    
    testResults.details.push({
      route: route.path,
      method: route.method,
      statusCode: 0,
      success: false,
      error: error.message,
      description: route.description
    });
  }
}

// 按功能分组测试
async function runGroupedTests() {
  console.log('\n📊 按功能分组测试');
  console.log('=' * 60);
  
  // 1. 健康检查
  console.log('\n🏥 健康检查测试');
  await testRoute(routes.find(r => r.path === '/health'));
  
  // 2. MBTI测试
  console.log('\n🧠 MBTI测试');
  await testRoute(routes.find(r => r.path === '/mbti/questions'));
  await testRoute(routes.find(r => r.path === '/mbti/calculate'), testData.mbtiCalculate);
  
  // 3. AI相关
  console.log('\n🤖 AI功能测试');
  await testRoute(routes.find(r => r.path === '/ai/chat'), testData.aiChat);
  await testRoute(routes.find(r => r.path === '/ai/rag'), testData.aiRag);
  
  // 4. 用户认证
  console.log('\n🔐 用户认证测试');
  await testRoute(routes.find(r => r.path === '/auth/login'), testData.authLogin);
  await testRoute(routes.find(r => r.path === '/auth/register'), testData.authRegister);
  await testRoute(routes.find(r => r.path === '/auth/logout'), {});
  
  // 5. 用户管理
  console.log('\n👤 用户管理测试');
  await testRoute(routes.find(r => r.path === '/user/profile' && r.method === 'GET'));
  await testRoute(routes.find(r => r.path === '/user/profile' && r.method === 'PUT'), testData.userProfile);
  
  // 6. 案例管理
  console.log('\n📋 案例管理测试');
  await testRoute(routes.find(r => r.path === '/cases' && r.method === 'GET'));
  await testRoute(routes.find(r => r.path === '/cases/:id' && r.method === 'GET'));
  await testRoute(routes.find(r => r.path === '/cases' && r.method === 'POST'), testData.createCase);
  
  // 7. 案例分类
  console.log('\n📂 案例分类测试');
  await testRoute(routes.find(r => r.path === '/categories'));
  
  // 8. 聊天记录
  console.log('\n💬 聊天记录测试');
  await testRoute(routes.find(r => r.path === '/chat/history'));
  await testRoute(routes.find(r => r.path === '/chat/clear'), {});
  
  // 9. 手机认证
  console.log('\n📱 手机认证测试');
  await testRoute(routes.find(r => r.path === '/phone/send-code'), testData.phoneSendCode);
  await testRoute(routes.find(r => r.path === '/phone/verify'), testData.phoneVerify);
  
  // 10. RAG管理
  console.log('\n📚 RAG管理测试');
  await testRoute(routes.find(r => r.path === '/rag/upload'), testData.ragUpload);
  await testRoute(routes.find(r => r.path === '/rag/documents'));
  await testRoute(routes.find(r => r.path === '/rag/documents/:id' && r.method === 'DELETE'), { id: 'test-id' });
}

// 生成测试报告
function generateReport() {
  console.log('\n📊 测试报告');
  console.log('=' * 60);
  
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed} ✅`);
  console.log(`失败: ${testResults.failed} ❌`);
  console.log(`成功率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // 按状态码分组
  const statusGroups = {};
  testResults.details.forEach(detail => {
    const status = detail.statusCode;
    if (!statusGroups[status]) statusGroups[status] = 0;
    statusGroups[status]++;
  });
  
  console.log('\n📈 状态码分布:');
  Object.entries(statusGroups).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}个`);
  });
  
  // 失败的测试详情
  const failedTests = testResults.details.filter(d => !d.success);
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`  ${test.method} ${test.route} - ${test.description}`);
      if (test.error) {
        console.log(`    错误: ${test.error}`);
      }
    });
  }
  
  // 成功的测试统计
  const successfulTests = testResults.details.filter(d => d.success);
  console.log('\n✅ 成功的测试:');
  successfulTests.forEach(test => {
    console.log(`  ${test.method} ${test.route} - ${test.description}`);
  });
}

// 主函数
async function main() {
  console.log('🚀 开始全面API测试');
  console.log(`API基础URL: ${API_BASE}`);
  console.log(`总路由数: ${routes.length}`);
  
  try {
    await runGroupedTests();
    generateReport();
    
    if (testResults.failed === 0) {
      console.log('\n🎉 所有测试通过！API系统运行正常。');
    } else {
      console.log(`\n⚠️  有 ${testResults.failed} 个测试失败，需要检查。`);
    }
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  main();
} 