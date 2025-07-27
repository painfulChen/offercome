const axios = require('axios');

const API_KEY = 'sk-2g...GbM6Q'; // 从图片中看到的新Key

async function testEndpoint(url, requestBody) {
    try {
        console.log(`\n🔍 测试端点: ${url}`);
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        
        const response = await axios.post(url, requestBody, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ 状态码:', response.status);
        console.log('响应头:', response.headers);
        
        if (response.data) {
            if (typeof response.data === 'string') {
                console.log('响应内容 (HTML):', response.data.substring(0, 200) + '...');
            } else {
                console.log('响应内容 (JSON):', JSON.stringify(response.data, null, 2));
            }
        }
        
        return true;
    } catch (error) {
        console.log('❌ 错误:', error.response?.status, error.response?.data || error.message);
        return false;
    }
}

async function testAllEndpoints() {
    console.log('🚀 开始测试Kimi API端点...\n');
    
    const testCases = [
        {
            url: 'https://kimi.moonshot.cn/v1/chat/completions',
            body: {
                model: 'moonshot-v1-8k',
                messages: [
                    { role: 'user', content: '你好' }
                ],
                max_tokens: 100,
                temperature: 0.7,
                stream: false
            }
        },
        {
            url: 'https://kimi.moonshot.cn/api/chat-messages',
            body: {
                name: 'test-chat',
                messages: [
                    { role: 'user', content: '你好' }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 100
            }
        },
        {
            url: 'https://kimi.moonshot.cn/api/chat',
            body: {
                name: 'test-chat',
                messages: [
                    { role: 'user', content: '你好' }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 100
            }
        },
        {
            url: 'https://kimi.moonshot.cn/v1/chat/completions',
            body: {
                model: 'moonshot-v1-8k',
                messages: [
                    { role: 'user', content: '你好' }
                ],
                max_tokens: 100,
                temperature: 0.7
            }
        }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📋 测试用例 ${i + 1}:`);
        await testEndpoint(testCase.url, testCase.body);
    }
    
    console.log('\n✅ 所有端点测试完成！');
}

testAllEndpoints().catch(console.error); 