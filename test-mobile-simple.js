const axios = require('axios');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';

async function testMobileSimple() {
  console.log('🧪 简单测试移动端MBTI页面...\n');
  
  try {
    // 获取移动端页面内容
    console.log('📋 获取移动端页面内容');
    const response = await axios.get(`${BASE_URL}/mbti-mobile-optimized.html`);
    const html = response.data;
    
    console.log('✅ 页面获取成功');
    console.log(`   页面大小: ${html.length} 字符`);
    
    // 简单检查关键内容
    const simpleChecks = [
      { name: 'submitAnswers函数', text: 'submitAnswers()' },
      { name: 'showResult函数', text: 'showResult(result)' },
      { name: 'mockResult数据', text: 'mockResult' },
      { name: 'showLoading函数', text: 'showLoading()' },
      { name: 'hideLoading函数', text: 'hideLoading()' },
      { name: 'MbtiMobileApp类', text: 'class MbtiMobileApp' },
      { name: '结果页面显示', text: 'result-page' },
      { name: 'MBTI类型显示', text: 'mbtiType' },
      { name: 'MBTI描述显示', text: 'mbtiDescription' }
    ];
    
    console.log('\n📊 简单检查结果:');
    simpleChecks.forEach(check => {
      const found = html.includes(check.text);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    // 检查JavaScript代码完整性
    const jsChecks = [
      { name: 'async submitAnswers', text: 'async submitAnswers()' },
      { name: 'mockResult定义', text: 'const mockResult = {' },
      { name: 'showResult调用', text: 'this.showResult(mockResult)' },
      { name: '错误处理', text: 'catch (error)' },
      { name: 'finally块', text: 'finally {' },
      { name: 'showResult函数定义', text: 'showResult(result) {' },
      { name: '结果页面显示', text: 'result-page.*display.*block' }
    ];
    
    console.log('\n📊 JavaScript代码检查:');
    jsChecks.forEach(check => {
      const found = html.includes(check.text);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    // 检查HTML结构
    const htmlChecks = [
      { name: '问题容器', text: 'question-container' },
      { name: '答案选项', text: 'answerOptions' },
      { name: '加载页面', text: 'loading-page' },
      { name: '结果页面', text: 'result-page' },
      { name: 'MBTI类型显示', text: 'mbtiType' },
      { name: 'MBTI描述显示', text: 'mbtiDescription' },
      { name: '分数网格', text: 'scoresGrid' },
      { name: '重新测试按钮', text: 'restartTest' }
    ];
    
    console.log('\n📊 HTML结构检查:');
    htmlChecks.forEach(check => {
      const found = html.includes(check.text);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? '存在' : '缺失'}`);
    });
    
    console.log('\n🎯 简单测试完成！');
    
    // 总结
    const totalChecks = simpleChecks.length + jsChecks.length + htmlChecks.length;
    const passedChecks = simpleChecks.filter(c => html.includes(c.text)).length +
                        jsChecks.filter(c => html.includes(c.text)).length +
                        htmlChecks.filter(c => html.includes(c.text)).length;
    
    console.log(`\n📊 总体结果: ${passedChecks}/${totalChecks} 项检查通过`);
    
    if (passedChecks >= totalChecks * 0.8) {
      console.log('✅ 移动端页面基本正常');
    } else {
      console.log('❌ 移动端页面存在问题');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
    }
  }
}

// 运行测试
testMobileSimple(); 