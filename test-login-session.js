const https = require('https');

// 测试登录会话持久性
async function testLoginSession() {
    console.log('🧪 测试登录会话持久性...');

    try {
        // 1. 登录
        console.log('\n1️⃣ 执行登录...');
        const loginResult = await makeRequest('/api/auth/login', 'POST', {
            username: 'admin',
            password: 'admin123'
        });

        if (!loginResult.success) {
            console.log('❌ 登录失败:', loginResult.message);
            return;
        }

        console.log('✅ 登录成功！');
        console.log('🔑 Token:', loginResult.token);
        console.log('👤 用户:', loginResult.user.username);

        // 2. 验证token
        console.log('\n2️⃣ 验证token...');
        const verifyResult = await verifyToken(loginResult.token);

        if (!verifyResult.success) {
            console.log('❌ Token验证失败:', verifyResult.message);
            return;
        }

        console.log('✅ Token验证成功！');

        // 3. 模拟多次验证（模拟页面刷新或重新访问）
        console.log('\n3️⃣ 模拟多次token验证...');
        for (let i = 1; i <= 3; i++) {
            console.log(`   第${i}次验证...`);
            const verifyResult2 = await verifyToken(loginResult.token);
            
            if (verifyResult2.success) {
                console.log(`   ✅ 第${i}次验证成功`);
            } else {
                console.log(`   ❌ 第${i}次验证失败:`, verifyResult2.message);
                return;
            }
            
            // 模拟间隔
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 4. 测试无效token
        console.log('\n4️⃣ 测试无效token...');
        const invalidTokenResult = await verifyToken('invalid_token_123');
        
        if (!invalidTokenResult.success) {
            console.log('✅ 无效token被正确拒绝:', invalidTokenResult.message);
        } else {
            console.log('❌ 无效token未被拒绝');
        }

        console.log('\n🎉 登录会话测试完成！');
        console.log('📝 结论: 登录后不会自动退出，token验证正常工作');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
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
testLoginSession(); 