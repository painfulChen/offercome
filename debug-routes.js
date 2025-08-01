// 路由调试脚本
const rawRoutes = require('./server/api16/routes.js');

function compile(pathTemplate) {
  const keys = [];
  const regex = new RegExp(
    '^' +
    pathTemplate.replace(/\/+$/, '').replace(/:(\w+)/g, (_, k) => {
      keys.push(k);
      return '([^/]+)';
    }) +
    '/?$'
  );
  return { regex, keys };
}

const routes = rawRoutes.map(r => ({
  ...r,
  ...compile(r.path)
}));

console.log('🧪 路由调试...\n');

console.log('📋 原始路由配置:');
rawRoutes.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.method} ${r.path} -> ${r.handler}`);
});

console.log('\n🔧 编译后的路由:');
routes.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.method} ${r.path}`);
  console.log(`     正则: ${r.regex.source}`);
  console.log(`     参数: ${r.keys.join(', ')}`);
  console.log(`     处理器: ${r.handler}`);
  console.log('');
});

// 测试路径匹配
const testPaths = [
  '/health',
  '/mbti/questions',
  '/mbti/calculate',
  '/mbti/history',
  '/mbti/stats',
  '/mbti/test'
];

console.log('🧪 测试路径匹配:');
testPaths.forEach(path => {
  console.log(`\n📡 测试路径: ${path}`);
  
  let pathMatched = false;
  let allowedMethods = [];
  
  for (const r of routes) {
    const cleanPath = path.replace(/\/+$/, '');
    const m = cleanPath.match(r.regex);
    
    if (m) {
      pathMatched = true;
      allowedMethods.push(r.method);
      console.log(`  ✅ 匹配路由: ${r.method} ${r.path} -> ${r.handler}`);
      
      if (r.keys.length > 0) {
        const params = {};
        r.keys.forEach((k, idx) => (params[k] = decodeURIComponent(m[idx + 1])));
        console.log(`     参数:`, params);
      }
    }
  }
  
  if (!pathMatched) {
    console.log(`  ❌ 没有匹配的路由`);
  }
});

// 检查特定处理器是否存在
console.log('\n🔍 检查处理器导出:');
const handlers = require('./server/api16/handlers/index.js');

const requiredHandlers = [
  'healthHandler',
  'getMBTIQuestionsHandler',
  'calculateMBTIHandler',
  'getMbtiHistoryHandler',
  'getMbtiStatsHandler',
  'testMBTIHandler'
];

requiredHandlers.forEach(handler => {
  if (handlers[handler]) {
    console.log(`  ✅ ${handler} 存在`);
  } else {
    console.log(`  ❌ ${handler} 不存在`);
  }
}); 