// 测试模块导入
console.log('🧪 测试模块导入...\n');

try {
  console.log('📦 导入handlers...');
  const handlers = require('./server/api16/handlers/index.js');
  console.log('✅ handlers导入成功');
  
  console.log('\n📋 可用的handlers:');
  Object.keys(handlers).forEach(key => {
    if (key.includes('Mbti') || key.includes('mbti')) {
      console.log(`  - ${key}`);
    }
  });
  
  console.log('\n🔍 检查特定handlers:');
  const requiredHandlers = [
    'getMbtiHistoryHandler',
    'getMbtiStatsHandler',
    'calculateMBTIHandler'
  ];
  
  requiredHandlers.forEach(handler => {
    if (handlers[handler]) {
      console.log(`✅ ${handler} 存在`);
    } else {
      console.log(`❌ ${handler} 不存在`);
    }
  });
  
} catch (error) {
  console.error('❌ 模块导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
} 