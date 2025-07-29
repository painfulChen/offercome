console.log('🧪 测试POST API...');
console.log('==================');

const https = require('https');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2';

// 测试POST API
function testPostAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(BASE_URL + endpoint, options, (res) => {
            console.log(`${endpoint}: ${res.statusCode}`);
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    console.log(`响应: ${JSON.stringify(response, null, 2)}`);
                } catch (error) {
                    console.log(`响应: ${body}`);
                }
                resolve({ status: res.statusCode, data: body });
            });
        });
        
        req.on('error', (error) => {
            console.log(`错误: ${error.message}`);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// 测试GET API
function testGetAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const req = https.request(BASE_URL + endpoint, (res) => {
            console.log(`${endpoint}: ${res.statusCode}`);
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    console.log(`响应: ${JSON.stringify(response, null, 2)}`);
                } catch (error) {
                    console.log(`响应: ${body}`);
                }
                resolve({ status: res.statusCode, data: body });
            });
        });
        
        req.on('error', (error) => {
            console.log(`错误: ${error.message}`);
            reject(error);
        });
        
        req.end();
    });
}

// 运行测试
async function runTests() {
    console.log('\n🔗 测试GET API...');
    await testGetAPI('/health');
    await testGetAPI('/mbti/questions');
    await testGetAPI('/rag/documents');
    await testGetAPI('/cases');
    await testGetAPI('/admin/stats');
    
    console.log('\n📝 测试POST API...');
    await testPostAPI('/ai/chat', {
        message: '你好',
        model: 'kimi'
    });
    
    await testPostAPI('/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123'
    });
    
    await testPostAPI('/sms/send', {
        phone: '13800138000',
        template: 'verification',
        params: ['123456']
    });
    
    console.log('\n🎉 所有API测试完成！');
}

runTests().catch(console.error); 