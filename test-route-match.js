// 测试路由匹配
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

function matchRoute(path, method = 'GET') {
  console.log(`尝试匹配路径: ${path}, 方法: ${method}`);
  
  for (const r of routes) {
    const cleanPath = path.replace(/\/+$/, '');
    const m = cleanPath.match(r.regex);
    
    if (m && r.method === method) {
      const params = {};
      r.keys.forEach((k, idx) => (params[k] = decodeURIComponent(m[idx + 1])));
      console.log(`✅ 匹配成功: ${r.handler}, 参数:`, params);
      return { handler: r.handler, params };
    }
  }
  
  console.log('❌ 没有找到匹配的路由');
  return null;
}

// 测试路径
const testPaths = [
  '/health',
  '/mbti/questions',
  '/mbti/calculate',
  '/mbti/history',
  '/mbti/stats',
  '/mbti/test'
];

console.log('🧪 测试路由匹配...\n');

testPaths.forEach(path => {
  console.log(`\n📡 测试路径: ${path}`);
  const result = matchRoute(path, 'GET');
  if (result) {
    console.log(`  ✅ 匹配成功: ${result.handler}`);
  } else {
    console.log(`  ❌ 匹配失败`);
  }
});

// 检查特定路由
console.log('\n🔍 检查特定路由:');
const historyRoute = routes.find(r => r.path === '/mbti/history');
if (historyRoute) {
  console.log(`✅ /mbti/history 路由存在`);
  console.log(`   方法: ${historyRoute.method}`);
  console.log(`   处理器: ${historyRoute.handler}`);
  console.log(`   正则: ${historyRoute.regex.source}`);
} else {
  console.log(`❌ /mbti/history 路由不存在`);
}

const statsRoute = routes.find(r => r.path === '/mbti/stats');
if (statsRoute) {
  console.log(`✅ /mbti/stats 路由存在`);
  console.log(`   方法: ${statsRoute.method}`);
  console.log(`   处理器: ${statsRoute.handler}`);
  console.log(`   正则: ${statsRoute.regex.source}`);
} else {
  console.log(`❌ /mbti/stats 路由不存在`);
} 