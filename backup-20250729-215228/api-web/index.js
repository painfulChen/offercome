// CloudBase Web函数 - 直接HTTP访问版本
const fs = require('fs');

// 简单的成本跟踪
function logCost(apiType, status, cost = 0) {
  try {
    const logFile = '/tmp/cost-tracker.log';
    const timestamp = new Date().toISOString().split('T');
    const date = timestamp[0];
    const time = timestamp[1].split('.')[0];
    
    const logEntry = `${date},${time},${apiType},1,${cost.toFixed(2)},${status}\n`;
    fs.appendFileSync(logFile, logEntry);
    console.log(`💰 成本记录: ${apiType} - ¥${cost.toFixed(2)} - ${status}`);
  } catch (error) {
    console.error('成本记录失败:', error);
  }
}

// 获取成本统计
function getCostStats() {
  try {
    const logFile = '/tmp/cost-tracker.log';
    if (!fs.existsSync(logFile)) {
      return {
        success: true,
        total_cost: 0,
        total_calls: 0,
        api_types: {},
        message: '暂无成本数据'
      };
    }

    const logData = fs.readFileSync(logFile, 'utf8').split('\n').filter(line => line.trim());
    const dataLines = logData.slice(1); // 跳过标题行
    
    if (dataLines.length === 0) {
      return {
        success: true,
        total_cost: 0,
        total_calls: 0,
        api_types: {},
        message: '暂无成本数据'
      };
    }

    const stats = {
      total_cost: 0,
      total_calls: 0,
      api_types: {}
    };

    dataLines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 6) {
        const [date, time, apiType, calls, cost, status] = parts;
        
        if (apiType && calls && cost) {
          const callCount = parseInt(calls) || 0;
          const costValue = parseFloat(cost) || 0;
          
          stats.total_calls += callCount;
          stats.total_cost += costValue;
          
          if (!stats.api_types[apiType]) {
            stats.api_types[apiType] = { calls: 0, cost: 0 };
          }
          stats.api_types[apiType].calls += callCount;
          stats.api_types[apiType].cost += costValue;
        }
      }
    });

    return {
      success: true,
      ...stats,
      message: `统计完成，共${stats.total_calls}次调用，总成本¥${stats.total_cost.toFixed(2)}`
    };
  } catch (error) {
    return {
      success: false,
      error: '统计计算失败',
      message: error.message,
      total_cost: 0,
      total_calls: 0,
      api_types: {}
    };
  }
}

// Web函数入口 - 直接处理HTTP请求
exports.main = async (event, context) => {
  console.log('📝 Web函数被调用:', event);
  
  // 解析请求参数
  const { httpMethod, path, queryString, body, headers } = event;
  
  // 设置响应头
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  try {
    // 处理OPTIONS预检请求
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: ''
      };
    }
    
    // 根路径处理
    if (path === '/' || path === '' || path === '/api') {
      logCost('root-access', 'SUCCESS', 0);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          message: 'CloudBase Web API服务正常运行',
          timestamp: new Date().toISOString(),
          environment: 'cloudbase',
          function: 'api-web',
          availableEndpoints: [
            '/api/health',
            '/api/cost/stats',
            '/api/ai/chat',
            '/api/ai/admission-advice',
            '/api/ai/status'
          ]
        })
      };
    }
    
    // 健康检查接口
    if (path === '/api/health' && httpMethod === 'GET') {
      logCost('health-check', 'SUCCESS', 0);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          message: 'CloudBase Web函数正常运行',
          timestamp: new Date().toISOString(),
          environment: 'cloudbase',
          function: 'api-web'
        })
      };
    }
    
    // AI聊天接口
    if (path === '/api/ai/chat' && httpMethod === 'POST') {
      let requestBody = {};
      
      try {
        if (body) {
          requestBody = typeof body === 'string' ? JSON.parse(body) : body;
        }
      } catch (e) {
        return {
          statusCode: 400,
          headers: responseHeaders,
          body: JSON.stringify({
            success: false,
            error: '请求体格式错误',
            message: 'JSON解析失败'
          })
        };
      }
      
      const { message } = requestBody;
      
      if (!message || typeof message !== 'string') {
        logCost('ai-chat', 'FAILED', 0);
        return {
          statusCode: 400,
          headers: responseHeaders,
          body: JSON.stringify({
            success: false,
            error: '消息内容不能为空且必须是字符串'
          })
        };
      }
      
      // 模拟AI响应
      const response = `感谢您的咨询！我是专业的招生顾问AI助手，可以为您提供留学申请、职业规划、简历优化等服务。您询问的是：${message}`;
      
      logCost('kimi-simulated', 'SUCCESS', 0);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          message: response,
          model: 'kimi-simulated',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 成本统计接口
    if (path === '/api/cost/stats' && httpMethod === 'GET') {
      try {
        const stats = getCostStats();
        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers: responseHeaders,
          body: JSON.stringify({
            success: false,
            error: '统计计算失败',
            message: error.message
          })
        };
      }
    }
    
    // 招生建议接口
    if (path === '/api/ai/admission-advice' && httpMethod === 'GET') {
      const advice = `作为专业的招生顾问，我建议您：

1. **学术准备**
   - 保持良好的GPA（建议3.5+）
   - 准备标准化考试（GRE/GMAT/TOEFL/IELTS）
   - 参与相关研究项目或实习

2. **申请材料**
   - 撰写个人陈述（Personal Statement）
   - 准备推荐信
   - 完善简历

3. **时间规划**
   - 提前1-2年开始准备
   - 关注申请截止日期
   - 合理安排考试时间

4. **选校策略**
   - 研究目标院校要求
   - 制定保底、匹配、冲刺学校组合
   - 考虑地理位置和费用

祝您申请成功！`;
      
      logCost('advice-generation', 'SUCCESS', 0);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          message: advice,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // AI服务状态接口
    if (path === '/api/ai/status' && httpMethod === 'GET') {
      logCost('status-check', 'SUCCESS', 0);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          status: 'available',
          model: 'kimi-simulated',
          timestamp: new Date().toISOString(),
          environment: 'cloudbase'
        })
      };
    }
    
    // 404 - 接口不存在
    return {
      statusCode: 404,
      headers: responseHeaders,
      body: JSON.stringify({
        success: false,
        error: '接口不存在',
        message: `路径 ${path} 不存在`,
        availableEndpoints: [
          '/',
          '/api',
          '/api/health',
          '/api/cost/stats',
          '/api/ai/chat',
          '/api/ai/admission-advice',
          '/api/ai/status'
        ]
      })
    };
    
  } catch (error) {
    console.error('❌ Web函数错误:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        success: false,
        error: '函数执行失败',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 