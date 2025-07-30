// server/router.js
const rawRoutes = require('./routes');

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

// 调试：打印编译后的路由
console.log('编译后的路由:');
routes.forEach(r => {
  console.log(`${r.method} ${r.path} -> ${r.regex.source}`);
});

function matchRoute(path, method = 'GET') {
  console.log(`尝试匹配路径: ${path}, 方法: ${method}`);
  
  for (const r of routes) {
    if (r.method !== method) {
      console.log(`方法不匹配: ${r.method} !== ${method}`);
      continue;
    }
    
    const cleanPath = path.replace(/\/+$/, '');
    const m = cleanPath.match(r.regex);
    console.log(`测试路由: ${r.path} (${r.regex.source}) -> ${m ? '匹配' : '不匹配'}`);
    
    if (!m) continue;
    
    const params = {};
    r.keys.forEach((k, idx) => (params[k] = decodeURIComponent(m[idx + 1])));
    console.log(`匹配成功: ${r.handler}, 参数:`, params);
    return { handler: r.handler, params };
  }
  
  console.log('没有找到匹配的路由');
  return null;
}

module.exports = { matchRoute }; 