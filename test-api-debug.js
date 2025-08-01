const https = require('https');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com',
      port: 443,
      path: '/api16/mbti/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 测试API...');
  
  const testData = {
    answers: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    userInfo: {
      major: '金融学',
      school: '211',
      email: 'test@example.com'
    }
  };

  try {
    const result = await makeRequest(testData);
    console.log('📊 API响应:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('\n🔍 分析结果:');
      console.log(`MBTI类型: ${result.data.mbtiType}`);
      console.log(`测试ID: ${result.data.testId || '无'}`);
      
      if (result.data.careerAdvice) {
        console.log(`适合职业数量: ${result.data.careerAdvice.suitable.length}`);
        console.log(`不适合职业数量: ${result.data.careerAdvice.unsuitable.length}`);
        
        if (result.data.careerAdvice.suitable.length > 0) {
          const first = result.data.careerAdvice.suitable[0];
          console.log(`第一个推荐行业: ${first.industry}`);
          console.log(`推荐岗位: ${first.positions.join(', ')}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testAPI(); 