const https = require('https');

// 测试登录API
async function testLoginAPI() {
    const testData = {
        username: 'admin',
        password: 'admin123'
    };

    const postData = JSON.stringify(testData);

    const options = {
        hostname: 'offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        result: result
                    });
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message));
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

// 执行测试
async function runTest() {
    try {
        console.log('🧪 测试登录API...');
        const result = await testLoginAPI();
        
        console.log('📊 响应状态码:', result.statusCode);
        console.log('📄 响应内容:', JSON.stringify(result.result, null, 2));
        
        if (result.result.success) {
            console.log('✅ 登录成功！');
            console.log('👤 用户信息:', result.result.user.username);
            console.log('🔑 Token:', result.result.token);
        } else {
            console.log('❌ 登录失败:', result.result.message);
        }
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

runTest(); 