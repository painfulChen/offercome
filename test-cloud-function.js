// 测试云函数的脚本
const https = require('https');

// 测试URL
const testUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/health';

console.log('🧪 测试云函数API接口...');
console.log('URL:', testUrl);

// 发送GET请求
const req = https.get(testUrl, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应体:', data);
    
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.success) {
        console.log('✅ API接口测试成功!');
      } else {
        console.log('❌ API接口返回错误:', jsonData);
      }
    } catch (e) {
      console.log('❌ 响应解析失败:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求失败:', e.message);
});

req.end(); 