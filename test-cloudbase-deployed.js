const https = require('https');

// CloudBase函数的基础URL（需要从控制台获取）
const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';

async function testCloudBaseFunction() {
    console.log('🧪 测试已部署的CloudBase函数...');
    
    // 测试健康检查
    console.log('\n📋 测试健康检查接口...');
    try {
        const healthResponse = await makeRequest(`${BASE_URL}/api/health`, 'GET');
        console.log('健康检查结果:', healthResponse);
    } catch (error) {
        console.error('健康检查失败:', error.message);
    }
    
    // 测试AI聊天
    console.log('\n🤖 测试AI聊天接口...');
    try {
        const chatResponse = await makeRequest(`${BASE_URL}/api/ai/chat`, 'POST', {
            message: '你好，我想申请美国计算机科学硕士'
        });
        console.log('AI聊天结果:', chatResponse);
    } catch (error) {
        console.error('AI聊天失败:', error.message);
    }
    
    // 测试成本统计
    console.log('\n💰 测试成本统计接口...');
    try {
        const statsResponse = await makeRequest(`${BASE_URL}/api/cost/stats`, 'GET');
        console.log('成本统计结果:', statsResponse);
    } catch (error) {
        console.error('成本统计失败:', error.message);
    }
    
    // 测试招生建议
    console.log('\n📚 测试招生建议接口...');
    try {
        const adviceResponse = await makeRequest(`${BASE_URL}/api/ai/admission-advice`, 'GET');
        console.log('招生建议结果:', adviceResponse);
    } catch (error) {
        console.error('招生建议失败:', error.message);
    }
    
    console.log('\n✅ 测试完成！');
}

function makeRequest(url, method, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CloudBase-Test/1.0'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseData
                    });
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

testCloudBaseFunction(); 