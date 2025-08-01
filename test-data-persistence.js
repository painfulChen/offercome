const https = require('https');

// 测试数据
const testData = {
  answers: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  userInfo: {
    major: "计算机科学/软件工程",
    school: "985",
    email: "test@example.com"
  }
};

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

// 测试数据持久化
async function testDataPersistence() {
  const baseUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api16';
  
  console.log('🧪 测试数据持久化功能...\n');

  try {
    // 1. 测试保存MBTI结果
    console.log('📝 1. 测试保存MBTI结果...');
    const saveResponse = await makeRequest(`${baseUrl}/mbti/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (saveResponse.success) {
      console.log('✅ 保存成功');
      console.log(`   测试ID: ${saveResponse.data.testId}`);
      console.log(`   MBTI类型: ${saveResponse.data.mbtiType}`);
      console.log(`   专业: ${testData.userInfo.major}`);
      console.log(`   学校: ${testData.userInfo.school}`);
    } else {
      console.log('❌ 保存失败:', saveResponse.message);
      return;
    }

    // 等待一下确保数据保存完成
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. 测试查询历史记录
    console.log('\n📚 2. 测试查询历史记录...');
    const historyResponse = await makeRequest(`${baseUrl}/mbti/history?email=${testData.userInfo.email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (historyResponse.success) {
      console.log('✅ 查询历史成功');
      console.log(`   总记录数: ${historyResponse.data.total}`);
      if (historyResponse.data.results.length > 0) {
        const latest = historyResponse.data.results[0];
        console.log(`   最新测试: ${latest.mbtiType} (${latest.completedAt})`);
      }
    } else {
      console.log('❌ 查询历史失败:', historyResponse.message);
    }

    // 3. 测试统计数据
    console.log('\n📊 3. 测试统计数据...');
    const statsResponse = await makeRequest(`${baseUrl}/mbti/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.success) {
      console.log('✅ 获取统计成功');
      console.log(`   总测试数: ${statsResponse.data.totalTests}`);
      console.log(`   MBTI分布: ${statsResponse.data.mbtiDistribution.length} 种类型`);
      console.log(`   专业分布: ${statsResponse.data.majorDistribution.length} 种专业`);
    } else {
      console.log('❌ 获取统计失败:', statsResponse.message);
    }

    console.log('\n🎉 数据持久化测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDataPersistence(); 