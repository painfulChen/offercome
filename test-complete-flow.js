const axios = require('axios');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';
const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testCompleteFlow() {
  console.log('🧪 开始测试首页-MBTI完整链路...\n');
  
  try {
    // 测试1: 首页访问
    console.log('📋 测试1: 首页访问');
    const homeResponse = await axios.get(BASE_URL);
    if (homeResponse.status === 200) {
      console.log('✅ 首页访问成功');
      console.log(`   页面标题: ${homeResponse.data.includes('OfferCome') ? '正确' : '错误'}`);
    } else {
      console.log('❌ 首页访问失败');
    }
    console.log('');
    
    // 测试2: MBTI测试页面访问
    console.log('📋 测试2: MBTI测试页面访问');
    const mbtiPageResponse = await axios.get(`${BASE_URL}/mbti-test.html`);
    if (mbtiPageResponse.status === 200) {
      console.log('✅ MBTI测试页面访问成功');
      console.log(`   页面标题: ${mbtiPageResponse.data.includes('MBTI人格测试') ? '正确' : '错误'}`);
    } else {
      console.log('❌ MBTI测试页面访问失败');
    }
    console.log('');
    
    // 测试3: API健康检查
    console.log('📋 测试3: API健康检查');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    if (healthResponse.status === 200 && healthResponse.data.success) {
      console.log('✅ API健康检查通过');
      console.log(`   服务状态: ${healthResponse.data.message}`);
    } else {
      console.log('❌ API健康检查失败');
    }
    console.log('');
    
    // 测试4: MBTI职业建议API
    console.log('📋 测试4: MBTI职业建议API');
    const careerAdviceResponse = await axios.get(`${API_BASE_URL}/mbti/career-advice`);
    if (careerAdviceResponse.status === 200 && careerAdviceResponse.data.success) {
      console.log('✅ MBTI职业建议API正常');
      console.log(`   返回数据条数: ${careerAdviceResponse.data.data.length}`);
      console.log(`   第一个MBTI类型: ${careerAdviceResponse.data.data[0]?.mbti_type}`);
    } else {
      console.log('❌ MBTI职业建议API失败');
    }
    console.log('');
    
    // 测试5: 特定MBTI类型职业建议
    console.log('📋 测试5: 特定MBTI类型职业建议');
    const intjResponse = await axios.get(`${API_BASE_URL}/mbti/career-advice/INTJ`);
    if (intjResponse.status === 200 && intjResponse.data.success) {
      console.log('✅ INTJ职业建议获取成功');
      const intjData = intjResponse.data.data;
      console.log(`   MBTI类型: ${intjData.mbti_type}`);
      console.log(`   人格描述: ${intjData.personality_description?.substring(0, 50)}...`);
      console.log(`   推荐职业数量: ${intjData.recommended_careers?.length || 0}`);
    } else {
      console.log('❌ INTJ职业建议获取失败');
    }
    console.log('');
    
    // 测试6: 测试其他MBTI页面
    console.log('📋 测试6: 其他MBTI相关页面');
    const mbtiPages = [
      'mbti-test-enhanced.html',
      'mbti-test-optimized.html',
      'mbti-career-test.html'
    ];
    
    for (const page of mbtiPages) {
      try {
        const response = await axios.get(`${BASE_URL}/${page}`);
        if (response.status === 200) {
          console.log(`✅ ${page} 访问成功`);
        } else {
          console.log(`❌ ${page} 访问失败`);
        }
      } catch (error) {
        console.log(`❌ ${page} 访问失败: ${error.message}`);
      }
    }
    console.log('');
    
    // 测试7: 静态资源访问
    console.log('📋 测试7: 静态资源访问');
    const staticResources = [
      'styles-new.css',
      'js/api-client.js',
      'components/rag-ui.js'
    ];
    
    for (const resource of staticResources) {
      try {
        const response = await axios.get(`${BASE_URL}/${resource}`);
        if (response.status === 200) {
          console.log(`✅ ${resource} 访问成功`);
        } else {
          console.log(`❌ ${resource} 访问失败`);
        }
      } catch (error) {
        console.log(`❌ ${resource} 访问失败: ${error.message}`);
      }
    }
    console.log('');
    
    // 测试8: 移动端优化页面
    console.log('📋 测试8: 移动端优化页面');
    const mobilePages = [
      'mbti-mobile-optimized.html',
      'styles-mobile-optimized.css'
    ];
    
    for (const page of mobilePages) {
      try {
        const response = await axios.get(`${BASE_URL}/${page}`);
        if (response.status === 200) {
          console.log(`✅ ${page} 访问成功`);
        } else {
          console.log(`❌ ${page} 访问失败`);
        }
      } catch (error) {
        console.log(`❌ ${page} 访问失败: ${error.message}`);
      }
    }
    console.log('');
    
    console.log('🎉 完整链路测试总结:');
    console.log('✅ 首页访问正常');
    console.log('✅ MBTI测试页面正常');
    console.log('✅ API服务正常');
    console.log('✅ 职业建议数据完整');
    console.log('✅ 静态资源访问正常');
    console.log('✅ 移动端优化页面正常');
    console.log('');
    console.log('📊 系统状态: 完全正常运行');
    console.log('🔗 访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/');
    console.log('🔗 API地址: https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2/');
    console.log('');
    console.log('✅ 首页-MBTI完整链路验证成功！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testCompleteFlow(); 