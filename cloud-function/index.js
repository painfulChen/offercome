// 最简单的CloudBase云函数
exports.main = async (event, context) => {
  console.log('云函数被调用:', JSON.stringify(event));
  
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: '招生管理系统API服务正常运行',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production'
      })
    };
  } catch (error) {
    console.error('云函数错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
}; 