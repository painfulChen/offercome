exports.main_handler = async (event, context) => {
  console.log('云函数被调用:', event);
  
  return {
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
      event: event,
      context: context ? 'available' : 'not available'
    })
  };
};
