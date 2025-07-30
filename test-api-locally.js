#!/usr/bin/env node

/**
 * 本地API测试脚本
 * 模拟CloudBase函数调用
 */

const { main } = require('./server/index.js');

async function testAPILocally() {
  console.log('🧪 开始本地API测试...\n');
  
  const tests = [
    {
      name: '健康检查',
      event: {
        path: '/api-v2/health',
        httpMethod: 'GET'
      }
    },
    {
      name: 'MBTI问题获取',
      event: {
        path: '/api-v2/mbti/questions',
        httpMethod: 'GET'
      }
    },
    {
      name: 'MBTI计算测试',
      event: {
        path: '/api-v2/mbti/calculate',
        httpMethod: 'POST',
        body: JSON.stringify({
          answers: Array.from({ length: 32 }, (_, i) => ({
            questionId: i + 1,
            selectedOption: i % 2
          }))
        })
      }
    },
    {
      name: 'MBTI职业建议获取',
      event: {
        path: '/api-v2/mbti/career-advice',
        httpMethod: 'GET'
      }
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`📋 测试: ${test.name}`);
      
      const result = await main(test.event, {});
      
      if (result.statusCode === 200) {
        console.log(`   ✅ 通过 (${result.statusCode})`);
        passedTests++;
        
        // 检查响应格式
        try {
          const data = JSON.parse(result.body);
          console.log(`   📊 响应格式: JSON`);
          if (data.success) {
            console.log(`   📋 响应成功`);
          } else {
            console.log(`   ⚠️  响应失败: ${data.message}`);
          }
        } catch (parseError) {
          console.log(`   ❌ 响应格式错误: 非JSON格式`);
          console.log(`   📋 响应内容: ${result.body.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ 失败 - 状态码 ${result.statusCode}`);
        console.log(`   📋 响应: ${result.body}`);
      }
      
    } catch (error) {
      console.log(`   ❌ 异常 - ${error.message}`);
    }
    
    console.log('');
  }
  
  // 测试结果总结
  console.log('📊 本地测试结果总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有本地测试通过！');
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
testAPILocally().catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
}); 