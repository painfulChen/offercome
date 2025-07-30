const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testMBTICalculation() {
  console.log('🧪 测试MBTI计算功能...\n');
  
  try {
    // 测试1: 健康检查
    console.log('📋 测试1: API健康检查');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API健康检查通过:', healthResponse.data.message);
    console.log('');
    
    // 测试2: 获取MBTI问题
    console.log('📋 测试2: 获取MBTI问题');
    const questionsResponse = await axios.get(`${API_BASE_URL}/mbti/questions`);
    if (questionsResponse.data.success) {
      console.log('✅ MBTI问题获取成功');
      console.log(`   问题数量: ${questionsResponse.data.data.length}`);
    } else {
      console.log('❌ MBTI问题获取失败');
    }
    console.log('');
    
    // 测试3: MBTI计算
    console.log('📋 测试3: MBTI计算');
    const testAnswers = [];
    for (let i = 1; i <= 32; i++) {
      testAnswers.push({
        questionId: i,
        selectedOption: i % 2 // 交替选择0和1
      });
    }
    
    console.log('📊 测试答案:', testAnswers.length, '个问题');
    
    const calculateResponse = await axios.post(`${API_BASE_URL}/mbti/calculate`, {
      answers: testAnswers
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (calculateResponse.data.success) {
      console.log('✅ MBTI计算成功');
      console.log(`   MBTI类型: ${calculateResponse.data.data.mbtiType}`);
      console.log(`   得分详情:`, calculateResponse.data.data.scores);
      
      if (calculateResponse.data.data.careerAdvice) {
        console.log(`   职业建议: ${calculateResponse.data.data.careerAdvice.mbtiType}`);
        console.log(`   推荐职业数量: ${calculateResponse.data.data.careerAdvice.recommendedCareers.length}`);
      }
    } else {
      console.log('❌ MBTI计算失败:', calculateResponse.data.message);
      if (calculateResponse.data.error) {
        console.log('   错误详情:', calculateResponse.data.error);
      }
    }
    console.log('');
    
    console.log('🎉 MBTI计算功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testMBTICalculation(); 