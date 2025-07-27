// 最小健康检查函数
exports.main = async (event) => ({
  statusCode: 200,
  headers: { 
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    ok: true,
    echoPath: event.path,              // 确认路由透传
    runtime: process.version,
    commit: process.env.GIT_COMMIT || 'dev',
    timestamp: new Date().toISOString(),
    message: 'OfferCome智能求职辅导平台API服务正常运行'
  }),
}); 