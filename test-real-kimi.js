const axios = require('axios');

const API_KEY = 'sk-0rX6ONsu1lSNL29zE2nwmnh17YQ0lOUShOM2mD4BnxiM39je';

async function testRealKimiAPI() {
    console.log('🚀 测试真实Kimi API...\n');
    
    const testCases = [
        {
            name: '测试 /api/chat 端点',
            url: 'https://kimi.moonshot.cn/api/chat',
            body: {
                name: 'offercome',
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
            name: '测试 /v1/chat/completions 端点',
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
            name: '测试 /api/chat-messages 端点',
            url: 'https://kimi.moonshot.cn/api/chat-messages',
            body: {
                name: 'offercome',
                messages: [
                    { role: 'user', content: '你好' }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 100
            }
        }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📋 ${testCase.name}:`);
        console.log(`URL: ${testCase.url}`);
        console.log('请求体:', JSON.stringify(testCase.body, null, 2));
        
        try {
            const response = await axios.post(testCase.url, testCase.body, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            console.log('✅ 状态码:', response.status);
            console.log('响应头:', response.headers);
            
            if (response.data) {
                if (typeof response.data === 'string') {
                    console.log('❌ 响应内容 (HTML):', response.data.substring(0, 200) + '...');
                } else {
                    console.log('✅ 响应内容 (JSON):', JSON.stringify(response.data, null, 2));
                }
            }
        } catch (error) {
            console.log('❌ 错误:', error.response?.status, error.response?.data || error.message);
        }
    }
    
    console.log('\n✅ 所有端点测试完成！');
}

testRealKimiAPI().catch(console.error); 