const func = require('./server/cloudbase-function.js');

async function testFunction() {
    try {
        console.log('🧪 测试CloudBase函数...');
        
        // 测试健康检查
        console.log('\n📋 测试健康检查接口...');
        const healthResult = await func.main({
            httpMethod: 'GET',
            path: '/api/health'
        }, {});
        console.log('健康检查结果:', JSON.stringify(healthResult, null, 2));
        
        // 测试AI聊天
        console.log('\n🤖 测试AI聊天接口...');
        const chatResult = await func.main({
            httpMethod: 'POST',
            path: '/api/ai/chat',
            body: JSON.stringify({
                message: '你好，我想申请美国计算机科学硕士'
            })
        }, {});
        console.log('AI聊天结果:', JSON.stringify(chatResult, null, 2));
        
        // 测试成本统计
        console.log('\n💰 测试成本统计接口...');
        const statsResult = await func.main({
            httpMethod: 'GET',
            path: '/api/cost/stats'
        }, {});
        console.log('成本统计结果:', JSON.stringify(statsResult, null, 2));
        
        console.log('\n✅ 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

testFunction(); 