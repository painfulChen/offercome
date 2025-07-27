const https = require('https');

// 测试token验证
async function testTokenVerify() {
    // 先登录获取token
    console.log('🔑 先登录获取token...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
    });

    if (!loginResult.success) {
        console.log('❌ 登录失败:', loginResult.message);
        return;
    }

    console.log('✅ 登录成功，获取到token:', loginResult.token);

    // 测试token验证
    console.log('\n🔍 测试token验证...');
    const verifyResult = await verifyToken(loginResult.token);

    if (verifyResult.success) {
        console.log('✅ Token验证成功！');
        console.log('👤 用户信息:', verifyResult.user.username);
    } else {
        console.log('❌ Token验证失败:', verifyResult.message);
    }
}

// 验证token
async function verifyToken(token) {
    const options = {
        hostname: 'offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com',
        port: 443,
        path: '/api/auth/verify',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
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
                    resolve(result);
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// 通用请求函数
async function makeRequest(path, method, data) {
    const postData = JSON.stringify(data);

    const options = {
        hostname: 'offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com',
        port: 443,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (method === 'POST') {
            req.write(postData);
        }
        req.end();
    });
}

// 执行测试
testTokenVerify().catch(console.error); 