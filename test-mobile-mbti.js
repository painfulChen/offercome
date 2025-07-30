const axios = require('axios');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';

async function testMobileMBTI() {
  console.log('🧪 测试移动端MBTI页面...\n');
  
  try {
    // 测试1: 移动端页面访问
    console.log('📋 测试1: 移动端MBTI页面访问');
    const mobileResponse = await axios.get(`${BASE_URL}/mbti-mobile-optimized.html`);
    if (mobileResponse.status === 200) {
      console.log('✅ 移动端MBTI页面访问成功');
      console.log(`   页面大小: ${mobileResponse.data.length} 字符`);
      console.log(`   包含模拟数据: ${mobileResponse.data.includes('mockResult') ? '是' : '否'}`);
    } else {
      console.log('❌ 移动端MBTI页面访问失败');
    }
    console.log('');
    
    // 测试2: 桌面版MBTI页面访问
    console.log('📋 测试2: 桌面版MBTI页面访问');
    const desktopResponse = await axios.get(`${BASE_URL}/mbti-test.html`);
    if (desktopResponse.status === 200) {
      console.log('✅ 桌面版MBTI页面访问成功');
      console.log(`   页面大小: ${desktopResponse.data.length} 字符`);
    } else {
      console.log('❌ 桌面版MBTI页面访问失败');
    }
    console.log('');
    
    // 测试3: 主页面访问
    console.log('📋 测试3: 主页面访问');
    const homeResponse = await axios.get(BASE_URL);
    if (homeResponse.status === 200) {
      console.log('✅ 主页面访问成功');
      console.log(`   页面大小: ${homeResponse.data.length} 字符`);
    } else {
      console.log('❌ 主页面访问失败');
    }
    console.log('');
    
    console.log('🎉 移动端MBTI测试完成！');
    console.log('');
    console.log('📱 移动端MBTI页面:');
    console.log(`   ${BASE_URL}/mbti-mobile-optimized.html`);
    console.log('');
    console.log('💻 桌面版MBTI页面:');
    console.log(`   ${BASE_URL}/mbti-test.html`);
    console.log('');
    console.log('🏠 主页面:');
    console.log(`   ${BASE_URL}/`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
    }
  }
}

// 运行测试
testMobileMBTI(); 