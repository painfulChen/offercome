exports.main_handler = async (event, context) => {
  try {
    console.log('=== 云函数开始执行 ===');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    
    // 简单的健康检查响应
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        message: '招生管理系统API服务正常运行',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production',
        path: event.path || 'unknown',
        method: event.httpMethod || 'unknown'
      })
    };
    
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== 云函数执行完成 ===');
    
    return response;
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: '云函数执行错误',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
