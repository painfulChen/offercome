#!/usr/bin/env node

// 测试部署的代码是否包含新路由系统
const https = require('https');

async function testAPI(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = `https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com${path}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
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

async function main() {
    console.log('🧪 测试部署的代码');
    console.log('=' * 50);

    // 测试健康检查
    console.log('\n1. 测试健康检查');
    try {
        const healthResult = await testAPI('/api-v2/health');
        console.log('健康检查结果:', healthResult.data);
    } catch (error) {
        console.error('健康检查失败:', error.message);
    }

    // 测试MBTI问题
    console.log('\n2. 测试MBTI问题');
    try {
        const mbtiResult = await testAPI('/api-v2/mbti/questions');
        console.log('MBTI问题结果:', mbtiResult.data);
    } catch (error) {
        console.error('MBTI问题失败:', error.message);
    }

    // 测试AI聊天
    console.log('\n3. 测试AI聊天');
    try {
        const chatResult = await testAPI('/api-v2/ai/chat', 'POST', {
            message: '你好',
            model: 'kimi'
        });
        console.log('AI聊天结果:', chatResult.data);
    } catch (error) {
        console.error('AI聊天失败:', error.message);
    }

    // 测试用户注册
    console.log('\n4. 测试用户注册');
    try {
        const registerResult = await testAPI('/api-v2/auth/register', 'POST', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass123'
        });
        console.log('用户注册结果:', registerResult.data);
    } catch (error) {
        console.error('用户注册失败:', error.message);
    }

    // 测试不存在的路径
    console.log('\n5. 测试不存在的路径');
    try {
        const notFoundResult = await testAPI('/api-v2/nonexistent');
        console.log('404结果:', notFoundResult.data);
    } catch (error) {
        console.error('404测试失败:', error.message);
    }
}

main().catch(console.error); 