const https = require('https');

// 测试云API
async function testCloudAPI() {
    const apiUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com';
    
    console.log('🧪 测试云API...');
    console.log('API地址:', apiUrl);
    
    // 测试健康检查
    console.log('\n📋 测试健康检查...');
    try {
        const healthResponse = await makeRequest(`${apiUrl}/api/health`, 'GET');
        console.log('健康检查响应:', healthResponse);
    } catch (error) {
        console.error('健康检查失败:', error.message);
    }
    
    // 测试AI聊天
    console.log('\n🤖 测试AI聊天...');
    try {
        const chatResponse = await makeRequest(`${apiUrl}/api/ai/chat`, 'POST', {
            message: '你好，请介绍一下这个系统'
        });
        console.log('AI聊天响应:', chatResponse);
    } catch (error) {
        console.error('AI聊天失败:', error.message);
    }
}

function makeRequest(url, method, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OfferCome-Test/1.0'
            }
        };
        
        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }
        
        const req = https.request(url, options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (error) {
                    resolve(body);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

testCloudAPI().catch(console.error); 