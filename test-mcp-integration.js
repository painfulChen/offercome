// MCP集成测试脚本
const DatabaseManager = require('./mcp-scripts/db-manager');
const CloudBaseManager = require('./mcp-scripts/cloudbase-manager');
const GitHubManager = require('./mcp-scripts/github-manager');

async function testMCPIntegration() {
    console.log('🧪 开始MCP集成测试...');
    
    try {
        // 测试数据库连接
        console.log('\n📊 测试数据库连接...');
        const db = new DatabaseManager();
        const stats = await db.getStats();
        console.log('✅ 数据库连接成功');
        console.log('   统计信息:', stats);
        
        // 测试GitHub操作
        console.log('\n📝 测试GitHub操作...');
        const github = new GitHubManager();
        const status = await github.getStatus();
        console.log('✅ GitHub操作成功');
        console.log('   Git状态:', status.split('\n')[0]);
        
        // 测试CloudBase操作
        console.log('\n☁️ 测试CloudBase操作...');
        const cloudbase = new CloudBaseManager();
        const envInfo = await cloudbase.getEnvironmentInfo();
        console.log('✅ CloudBase操作成功');
        
        await db.disconnect();
        console.log('\n🎉 MCP集成测试完成！');
        
    } catch (error) {
        console.error('❌ MCP集成测试失败:', error.message);
    }
}

testMCPIntegration();
