// 最简单的CloudBase云函数
exports.main_handler = async (event, context) => {
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
}; 