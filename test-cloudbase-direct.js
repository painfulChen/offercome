const func = require('./server/api/index.js');

async function testCloudBaseDirect() {
    console.log('🧪 直接测试CloudBase函数...');
    
    // 测试根路径
    console.log('\n📋 测试根路径...');
    try {
        const rootResult = await func.main({
            httpMethod: 'GET',
            path: '/'
        }, {});
        console.log('根路径结果:', JSON.stringify(rootResult, null, 2));
    } catch (error) {
        console.error('根路径测试失败:', error);
    }
    
    // 测试健康检查
    console.log('\n📋 测试健康检查接口...');
    try {
        const healthResult = await func.main({
            httpMethod: 'GET',
            path: '/api/health'
        }, {});
        console.log('健康检查结果:', JSON.stringify(healthResult, null, 2));
    } catch (error) {
        console.error('健康检查失败:', error);
    }
    
    // 测试AI聊天
    console.log('\n🤖 测试AI聊天接口...');
    try {
        const chatResult = await func.main({
            httpMethod: 'POST',
            path: '/api/ai/chat',
            body: JSON.stringify({
                message: '你好，我想申请美国计算机科学硕士'
            })
        }, {});
        console.log('AI聊天结果:', JSON.stringify(chatResult, null, 2));
    } catch (error) {
        console.error('AI聊天失败:', error);
    }
    
    // 测试成本统计
    console.log('\n💰 测试成本统计接口...');
    try {
        const statsResult = await func.main({
            httpMethod: 'GET',
            path: '/api/cost/stats'
        }, {});
        console.log('成本统计结果:', JSON.stringify(statsResult, null, 2));
    } catch (error) {
        console.error('成本统计失败:', error);
    }
    
    // 测试招生建议
    console.log('\n📚 测试招生建议接口...');
    try {
        const adviceResult = await func.main({
            httpMethod: 'GET',
            path: '/api/ai/admission-advice'
        }, {});
        console.log('招生建议结果:', JSON.stringify(adviceResult, null, 2));
    } catch (error) {
        console.error('招生建议失败:', error);
    }
    
    // 测试不存在的路径
    console.log('\n❌ 测试不存在的路径...');
    try {
        const notFoundResult = await func.main({
            httpMethod: 'GET',
            path: '/api/nonexistent'
        }, {});
        console.log('404结果:', JSON.stringify(notFoundResult, null, 2));
    } catch (error) {
        console.error('404测试失败:', error);
    }
    
    console.log('\n✅ 直接测试完成！');
}

testCloudBaseDirect(); 