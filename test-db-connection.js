const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testDatabaseConnection() {
  console.log('🧪 测试数据库连接...\n');
  
  try {
    // 测试1: 健康检查
    console.log('📋 测试1: API健康检查');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API健康检查通过:', healthResponse.data.message);
    console.log('');
    
    // 测试2: 获取MBTI问题（需要数据库查询）
    console.log('📋 测试2: 获取MBTI问题（数据库查询）');
    const questionsResponse = await axios.get(`${API_BASE_URL}/mbti/questions`);
    if (questionsResponse.data.success) {
      console.log('✅ MBTI问题获取成功');
      console.log(`   问题数量: ${questionsResponse.data.data.length}`);
      console.log(`   第一个问题: ${questionsResponse.data.data[0]?.text?.substring(0, 50)}...`);
    } else {
      console.log('❌ MBTI问题获取失败:', questionsResponse.data.message);
    }
    console.log('');
    
    // 测试3: 获取MBTI职业建议（需要数据库查询）
    console.log('📋 测试3: 获取MBTI职业建议（数据库查询）');
    const careerResponse = await axios.get(`${API_BASE_URL}/mbti/career-advice`);
    if (careerResponse.data.success) {
      console.log('✅ MBTI职业建议获取成功');
      console.log(`   职业建议数量: ${careerResponse.data.data.length}`);
      console.log(`   第一个类型: ${careerResponse.data.data[0]?.mbti_type}`);
    } else {
      console.log('❌ MBTI职业建议获取失败:', careerResponse.data.message);
    }
    console.log('');
    
    console.log('🎉 数据库连接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testDatabaseConnection(); 