const fetch = require('node-fetch');

async function testApiFormat() {
    console.log('🧪 测试API数据格式');
    console.log('==================');
    
    const apiUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/cost/stats';
    
    try {
        console.log('📡 请求API...');
        const response = await fetch(apiUrl);
        
        console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 返回数据:');
        console.log(JSON.stringify(data, null, 2));
        
        // 验证数据格式
        if (data.success === true) {
            console.log('✅ 数据格式正确');
            
            // 验证必要字段
            const requiredFields = ['total_calls', 'total_cost', 'api_types'];
            for (const field of requiredFields) {
                if (data[field] !== undefined) {
                    console.log(`✅ ${field}: ${data[field]}`);
                } else {
                    console.log(`❌ 缺少字段: ${field}`);
                }
            }
        } else {
            console.log('❌ 数据格式错误');
            console.log('错误信息:', data.error || data.message);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        // 提供模拟数据用于测试
        console.log('\n📝 提供模拟数据用于测试:');
        const mockData = {
            success: true,
            total_calls: 0,
            total_cost: 0,
            api_types: {}
        };
        console.log(JSON.stringify(mockData, null, 2));
    }
}

testApiFormat(); 