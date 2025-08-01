const axios = require('axios');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com';

async function testDeployedAPI() {
    console.log('🧪 测试部署的API...');
    
    try {
        // 测试网站首页
        console.log('\n1. 测试网站首页...');
        const homeResponse = await axios.get(BASE_URL);
        console.log(`✅ 首页访问成功: ${homeResponse.status}`);
        
        // 测试可能的API路径
        const apiPaths = [
            '/api/health',
            '/api',
            '/health',
            '/api/v1/health',
            '/api/auth/health'
        ];
        
        for (const path of apiPaths) {
            try {
                console.log(`\n2. 测试API路径: ${path}`);
                const response = await axios.get(`${BASE_URL}${path}`);
                console.log(`✅ ${path} 访问成功: ${response.status}`);
                console.log(`响应数据:`, response.data);
            } catch (error) {
                console.log(`❌ ${path} 访问失败: ${error.response?.status || error.message}`);
            }
        }
        
        // 测试MBTI页面
        console.log('\n3. 测试MBTI页面...');
        try {
            const mbtiResponse = await axios.get(`${BASE_URL}/mbti-test.html`);
            console.log(`✅ MBTI页面访问成功: ${mbtiResponse.status}`);
        } catch (error) {
            console.log(`❌ MBTI页面访问失败: ${error.response?.status || error.message}`);
        }
        
    } catch (error) {
        console.error('❌ API测试失败:', error.message);
    }
}

// 运行测试
testDeployedAPI(); 