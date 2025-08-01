const https = require('https');

// 测试数据库连接
async function testDBConnection() {
  const baseUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api16';
  
  console.log('🔍 测试数据库连接...\n');

  try {
    // 测试健康检查
    console.log('📡 1. 测试健康检查...');
    const healthResponse = await makeRequest(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (healthResponse.success) {
      console.log('✅ 健康检查通过');
    } else {
      console.log('❌ 健康检查失败:', healthResponse.message);
    }

    // 测试MBTI计算（包含数据库保存）
    console.log('\n💾 2. 测试MBTI计算和数据库保存...');
    const testData = {
      answers: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      userInfo: {
        major: "计算机科学/软件工程",
        school: "985",
        email: "test@example.com"
      }
    };

    const calculateResponse = await makeRequest(`${baseUrl}/mbti/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (calculateResponse.success) {
      console.log('✅ MBTI计算成功');
      console.log(`   测试ID: ${calculateResponse.data.testId}`);
      console.log(`   MBTI类型: ${calculateResponse.data.mbtiType}`);
      
      // 检查是否有数据库错误信息
      if (calculateResponse.data.testId === undefined) {
        console.log('⚠️  警告: 测试ID未生成，可能是数据库连接问题');
      }
    } else {
      console.log('❌ MBTI计算失败:', calculateResponse.message);
      if (calculateResponse.error) {
        console.log('   错误详情:', calculateResponse.error);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 发送HTTP请求的通用函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// 运行测试
testDBConnection(); 