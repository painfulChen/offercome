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
  
  let pathMatched = false;
  let allowedMethods = [];
  
  for (const r of routes) {
    const cleanPath = path.replace(/\/+$/, '');
    const m = cleanPath.match(r.regex);
    
    if (m) {
      pathMatched = true;
      allowedMethods.push(r.method);
      
      if (r.method === method) {
        const params = {};
        r.keys.forEach((k, idx) => (params[k] = decodeURIComponent(m[idx + 1])));
        console.log(`匹配成功: ${r.handler}, 参数:`, params);
        return { handler: r.handler, params };
      }
    }
  }
  
  // 路径匹配但方法不匹配，返回405
  if (pathMatched) {
    console.log(`路径匹配但方法不匹配，返回405，允许的方法: ${allowedMethods.join(', ')}`);
    return { 
      handler: 'methodNotAllowedHandler', 
      params: { allowedMethods },
      statusCode: 405 
    };
  }
  
  console.log('没有找到匹配的路由');
  return null;
}

module.exports = { matchRoute }; 