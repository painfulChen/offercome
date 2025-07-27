const https = require('https');

// 测试完整的注册和登录流程
async function testCompleteRegisterFlow() {
    const timestamp = Date.now();
    const testUser = {
        username: `testuser${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        password: 'testpass123'
    };

    console.log('🧪 开始测试完整注册流程...');
    console.log('📝 测试用户:', testUser.username);

    try {
        // 1. 测试注册
        console.log('\n1️⃣ 测试用户注册...');
        const registerResult = await makeRequest('/api/auth/register', 'POST', testUser);
        
        if (registerResult.success) {
            console.log('✅ 注册成功！');
            console.log('👤 用户ID:', registerResult.user.id);
        } else {
            console.log('❌ 注册失败:', registerResult.message);
            return;
        }

        // 2. 测试登录
        console.log('\n2️⃣ 测试用户登录...');
        const loginResult = await makeRequest('/api/auth/login', 'POST', {
            username: testUser.username,
            password: testUser.password
        });

        if (loginResult.success) {
            console.log('✅ 登录成功！');
            console.log('🔑 Token:', loginResult.token);
        } else {
            console.log('❌ 登录失败:', loginResult.message);
            return;
        }

        // 3. 测试重复注册
        console.log('\n3️⃣ 测试重复注册...');
        const duplicateResult = await makeRequest('/api/auth/register', 'POST', testUser);
        
        if (!duplicateResult.success) {
            console.log('✅ 重复注册被正确阻止:', duplicateResult.message);
        } else {
            console.log('❌ 重复注册未被阻止');
        }

        // 4. 测试错误密码登录
        console.log('\n4️⃣ 测试错误密码登录...');
        const wrongPasswordResult = await makeRequest('/api/auth/login', 'POST', {
            username: testUser.username,
            password: 'wrongpassword'
        });

        if (!wrongPasswordResult.success) {
            console.log('✅ 错误密码被正确拒绝:', wrongPasswordResult.message);
        } else {
            console.log('❌ 错误密码未被拒绝');
        }

        console.log('\n🎉 完整注册流程测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
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
testCompleteRegisterFlow(); 