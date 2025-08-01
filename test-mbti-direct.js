#!/usr/bin/env node

/**
 * 直接测试MBTI函数，不通过API
 */

const mbtiPure = require('./server/handlers/mbti-pure');

async function testDirect() {
  console.log('🧪 直接测试MBTI函数...\n');
  
  try {
    // 模拟CloudBase事件
    const event = {
      body: JSON.stringify({
        answers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
      })
    };
    
    console.log('📋 调用MBTI计算函数...');
    const result = await mbtiPure.calculateMBTIHandler(event);
    
    console.log('✅ 函数调用成功!');
    console.log('📊 状态码:', result.statusCode);
    console.log('📋 响应体:', JSON.parse(result.body));
    
  } catch (error) {
    console.error('❌ 函数调用失败:', error);
  }
}

testDirect(); 