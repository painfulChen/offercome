// 测试AI客户端
const { testAIConnection } = require('./utils/aiClient');

async function testAI() {
  console.log('开始测试AI连接...');
  
  try {
    const result = await testAIConnection();
    console.log('测试结果:', result);
    
    if (result.success) {
      console.log('✅ AI服务连接正常');
    } else {
      console.log('❌ AI服务连接失败:', result.error);
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testAI(); 