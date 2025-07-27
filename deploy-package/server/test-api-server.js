const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 内存中的成本跟踪
let costStats = {
  total_cost: 0,
  total_calls: 0,
  api_types: {}
};

// 成本跟踪函数
function logCost(apiType, status, cost = 0) {
  costStats.total_calls += 1;
  costStats.total_cost += cost;
  
  if (!costStats.api_types[apiType]) {
    costStats.api_types[apiType] = { calls: 0, cost: 0 };
  }
  costStats.api_types[apiType].calls += 1;
  costStats.api_types[apiType].cost += cost;
  
  console.log(`💰 成本记录: ${apiType} - ¥${cost.toFixed(2)} - ${status}`);
}

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (req, res) => {
  logCost('health-check', 'SUCCESS', 0);
  
  res.json({
    success: true,
    message: '测试API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 成本统计接口
app.get('/api/cost/stats', (req, res) => {
  res.json({
    success: true,
    ...costStats
  });
});

// 模拟一些数据
logCost('kimi-simulated', 'SUCCESS', 0);
logCost('health-check', 'SUCCESS', 0);
logCost('kimi-simulated', 'SUCCESS', 0);
logCost('health-check', 'SUCCESS', 0);

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 测试API服务运行在端口 ${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💰 成本统计: http://localhost:${PORT}/api/cost/stats`);
  console.log(`📊 当前统计:`, costStats);
}); 