const { getPool } = require('../config/database-persistent');

async function healthCheck(req, res) {
  try {
    const startTime = Date.now();
    
    // 检查数据库连接
    const pool = await getPool();
    const [dbResult] = await pool.execute('SELECT 1 as status');
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbResult[0].status === 1 ? 'connected' : 'error',
        responseTime: Date.now() - startTime
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('健康检查失败:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    });
  }
}

module.exports = healthCheck; 