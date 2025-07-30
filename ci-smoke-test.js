#!/usr/bin/env node

/**
 * CI烟雾测试脚本
 * 用于验证MBTI API的基本功能
 */

const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function smokeTest() {
  console.log('🧪 开始CI烟雾测试...\n');
  
  const tests = [
    {
      name: '健康检查',
      url: '/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'MBTI问题获取',
      url: '/mbti/questions',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'MBTI职业建议获取',
      url: '/mbti/career-advice',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'MBTI计算测试',
      url: '/mbti/calculate',
      method: 'POST',
      data: {
        answers: Array.from({ length: 32 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: i % 2
        }))
      },
      expectedStatus: 200
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`📋 测试: ${test.name}`);
      
      const config = {
        method: test.method,
        url: `${API_BASE_URL}${test.url}`,
        timeout: 10000, // 10秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.data) {
        config.data = test.data;
      }
      
      const response = await axios(config);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ 通过 (${response.status})`);
        passedTests++;
      } else {
        console.log(`   ❌ 失败 - 期望状态码 ${test.expectedStatus}，实际 ${response.status}`);
      }
      
      // 检查响应格式
      if (response.data && typeof response.data === 'object') {
        console.log(`   📊 响应格式: JSON`);
      } else {
        console.log(`   ⚠️  响应格式: 非JSON`);
      }
      
    } catch (error) {
      console.log(`   ❌ 失败 - ${error.message}`);
      if (error.response) {
        console.log(`   📊 状态码: ${error.response.status}`);
        console.log(`   📋 响应数据: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
    }
    
    console.log('');
  }
  
  // 测试结果总结
  console.log('📊 测试结果总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分测试失败，需要检查！');
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

// 运行测试
smokeTest().catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
}); 