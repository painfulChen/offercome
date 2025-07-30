const axios = require('axios');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';

async function testMobileDebug() {
  console.log('🔍 调试移动端MBTI页面...\n');
  
  try {
    // 获取移动端页面内容
    console.log('📋 获取移动端页面内容');
    const response = await axios.get(`${BASE_URL}/mbti-mobile-optimized.html`);
    const html = response.data;
    
    console.log('✅ 页面获取成功');
    console.log(`   页面大小: ${html.length} 字符`);
    
    // 检查关键函数
    const checks = [
      { name: 'submitAnswers函数', pattern: 'submitAnswers\\(\\)' },
      { name: 'showResult函数', pattern: 'showResult\\(result\\)' },
      { name: 'mockResult数据', pattern: 'mockResult' },
      { name: 'showLoading函数', pattern: 'showLoading\\(\\)' },
      { name: 'hideLoading函数', pattern: 'hideLoading\\(\\)' },
      { name: '错误处理', pattern: 'catch.*error' },
      { name: '结果页面显示', pattern: 'result-page.*display.*block' }
    ];
    
    console.log('\n📊 代码检查结果:');
    checks.forEach(check => {
      const found = html.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    // 检查HTML结构
    const htmlChecks = [
      { name: '问题容器', pattern: 'question-container' },
      { name: '答案选项', pattern: 'answerOptions' },
      { name: '加载页面', pattern: 'loading-page' },
      { name: '结果页面', pattern: 'result-page' },
      { name: 'MBTI类型显示', pattern: 'mbtiType' },
      { name: 'MBTI描述显示', pattern: 'mbtiDescription' },
      { name: '分数网格', pattern: 'scoresGrid' }
    ];
    
    console.log('\n📊 HTML结构检查:');
    htmlChecks.forEach(check => {
      const found = html.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    // 检查CSS样式
    const cssChecks = [
      { name: '移动端样式', pattern: 'mobile.*optimized' },
      { name: '响应式设计', pattern: 'viewport' },
      { name: '触摸优化', pattern: 'touchstart' },
      { name: '动画效果', pattern: 'fade-in' }
    ];
    
    console.log('\n📊 CSS样式检查:');
    cssChecks.forEach(check => {
      const found = html.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    console.log('\n🎯 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
    }
  }
}

// 运行调试
testMobileDebug(); 