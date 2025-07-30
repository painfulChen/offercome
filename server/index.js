// CloudBase函数 - 重构版本，使用新的路由匹配系统
const { matchRoute } = require('./router');
const handlers = require('./handlers');
const routes = require('./routes');

exports.main = async (event, context) => {
  console.log('收到请求:', event);
  
  const rawPath = (event.path || '').replace(/^\/api-v2/, '') || '/';
  const { httpMethod: method = 'GET', body } = event;

  console.log('处理路径:', rawPath, '方法:', method);

  const route = matchRoute(rawPath, method);
  if (!route) {
    console.log('路由未匹配:', rawPath, method);
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: `路径 ${rawPath} 不存在`,
        availablePaths: routes.map(r => `/api-v2${r.path}`)
      })
    };
  }

  try {
    console.log('匹配路由:', route.handler, '参数:', route.params);
    const handlerFn = handlers[route.handler];
    if (!handlerFn) {
      console.error('Handler未找到:', route.handler);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: `Handler ${route.handler} 未找到`
        })
      };
    }

    const result = await handlerFn({ ...event, params: route.params });
    
    // ---- 统一JSON包装 ----
    if (typeof result === 'object' && result !== null) {
      return {
        statusCode: result.statusCode || 200,
        headers: { 'Content-Type': 'application/json' },
        body: result.body || JSON.stringify(result)
      };
    }
    
    // 字符串 / 数字等原样返回
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result })
    };
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
}; 