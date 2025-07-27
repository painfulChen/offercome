// CloudBase云函数 - API代理
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 本地API地址
const LOCAL_API_URL = 'http://10.0.4.234:3000';

exports.main = async (event, context) => {
  const { path, method = 'GET', data } = event;
  
  try {
    // 构建请求URL
    const url = `${LOCAL_API_URL}${path}`;
    
    // 设置请求选项
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CloudBase-Proxy/1.0'
      }
    };
    
    // 如果有数据，添加到请求体
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    // 发送请求到本地API
    const response = await cloud.callContainer({
      config: {
        env: 'offercome2025-9g14jitp22f4ddfc'
      },
      path: path,
      header: options.headers,
      method: method,
      data: data
    });
    
    return {
      success: true,
      data: response.data,
      status: response.statusCode
    };
    
  } catch (error) {
    console.error('API代理错误:', error);
    return {
      success: false,
      error: error.message,
      message: '网络错误，请检查网络连接。'
    };
  }
}; 