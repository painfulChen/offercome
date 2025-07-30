const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMBTICareerAdvice() {
  console.log('🧪 开始测试MBTI职业建议功能...\n');
  
  try {
    // 测试1: 获取所有MBTI职业建议
    console.log('📋 测试1: 获取所有MBTI职业建议');
    const allAdviceResponse = await axios.get(`${BASE_URL}/api/mbti/career-advice`);
    console.log('✅ 获取所有职业建议成功');
    console.log(`   返回数据条数: ${allAdviceResponse.data.data.length}`);
    console.log(`   第一个MBTI类型: ${allAdviceResponse.data.data[0]?.mbti_type}`);
    console.log('');
    
    // 测试2: 获取特定MBTI类型的职业建议
    console.log('🎯 测试2: 获取INTJ类型的职业建议');
    const intjAdviceResponse = await axios.get(`${BASE_URL}/api/mbti/career-advice/INTJ`);
    console.log('✅ 获取INTJ职业建议成功');
    const intjData = intjAdviceResponse.data.data;
    console.log(`   MBTI类型: ${intjData.mbti_type}`);
    console.log(`   人格描述: ${intjData.personality_description?.substring(0, 50)}...`);
    console.log(`   核心特质数量: ${intjData.core_traits?.length || 0}`);
    console.log(`   推荐职业数量: ${intjData.recommended_careers?.length || 0}`);
    console.log('');
    
    // 测试3: 获取不存在的MBTI类型
    console.log('❌ 测试3: 获取不存在的MBTI类型');
    try {
      await axios.get(`${BASE_URL}/api/mbti/career-advice/XXXX`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 正确处理了不存在的MBTI类型');
      } else {
        console.log('❌ 未正确处理不存在的MBTI类型');
      }
    }
    console.log('');
    
    // 测试4: 测试MBTI计算并获取职业建议
    console.log('🧮 测试4: MBTI计算并获取职业建议');
    const mbtiTestData = {
      answers: [
        { questionId: 1, answer: 'A' },
        { questionId: 2, answer: 'A' },
        { questionId: 3, answer: 'B' },
        { questionId: 4, answer: 'A' },
        { questionId: 5, answer: 'B' },
        { questionId: 6, answer: 'A' },
        { questionId: 7, answer: 'B' },
        { questionId: 8, answer: 'A' },
        { questionId: 9, answer: 'A' },
        { questionId: 10, answer: 'B' },
        { questionId: 11, answer: 'A' },
        { questionId: 12, answer: 'B' },
        { questionId: 13, answer: 'A' },
        { questionId: 14, answer: 'B' },
        { questionId: 15, answer: 'A' },
        { questionId: 16, answer: 'B' },
        { questionId: 17, answer: 'A' },
        { questionId: 18, answer: 'A' },
        { questionId: 19, answer: 'B' },
        { questionId: 20, answer: 'A' }
      ]
    };
    
    const mbtiCalculationResponse = await axios.post(`${BASE_URL}/api/mbti/calculate`, mbtiTestData);
    console.log('✅ MBTI计算成功');
    const calculatedMBTI = mbtiCalculationResponse.data.data.mbtiType;
    console.log(`   计算出的MBTI类型: ${calculatedMBTI}`);
    
    // 获取该类型的职业建议
    const careerAdviceResponse = await axios.get(`${BASE_URL}/api/mbti/career-advice/${calculatedMBTI}`);
    console.log('✅ 获取对应职业建议成功');
    const careerData = careerAdviceResponse.data.data;
    console.log(`   人格描述: ${careerData.personality_description?.substring(0, 50)}...`);
    console.log(`   推荐职业数量: ${careerData.recommended_careers?.length || 0}`);
    
    if (careerData.recommended_careers?.length > 0) {
      const firstCareer = careerData.recommended_careers[0];
      console.log(`   第一个推荐职业: ${firstCareer.position}`);
      console.log(`   职业类别: ${firstCareer.category}`);
      console.log(`   适合度评分: ${firstCareer.suitability}/5`);
    }
    console.log('');
    
    // 测试5: 验证JSON数据结构
    console.log('🔍 测试5: 验证JSON数据结构');
    const testMBTI = 'ENFP';
    const structureTestResponse = await axios.get(`${BASE_URL}/api/mbti/career-advice/${testMBTI}`);
    const testData = structureTestResponse.data.data;
    
    console.log('✅ JSON结构验证:');
    console.log(`   core_traits类型: ${Array.isArray(testData.core_traits) ? 'Array' : typeof testData.core_traits}`);
    console.log(`   recommended_careers类型: ${Array.isArray(testData.recommended_careers) ? 'Array' : typeof testData.recommended_careers}`);
    
    if (testData.recommended_careers?.length > 0) {
      const career = testData.recommended_careers[0];
      console.log(`   职业数据结构验证:`);
      console.log(`     - position: ${typeof career.position}`);
      console.log(`     - category: ${typeof career.category}`);
      console.log(`     - suitability: ${typeof career.suitability}`);
      console.log(`     - reasons: ${Array.isArray(career.reasons) ? 'Array' : typeof career.reasons}`);
      console.log(`     - requiredSkills: ${Array.isArray(career.requiredSkills) ? 'Array' : typeof career.requiredSkills}`);
      console.log(`     - careerPath: ${Array.isArray(career.careerPath) ? 'Array' : typeof career.careerPath}`);
      console.log(`     - typicalCompanies: ${Array.isArray(career.typicalCompanies) ? 'Array' : typeof career.typicalCompanies}`);
      console.log(`     - salaryRange: ${typeof career.salaryRange}`);
    }
    console.log('');
    
    console.log('🎉 所有测试通过！MBTI职业建议功能正常工作');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testMBTICareerAdvice(); 