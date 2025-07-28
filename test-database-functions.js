const db = require('./server/config/database-cloud');

async function testDatabaseFunctions() {
    try {
        console.log('🔍 测试数据库连接...');
        await db.connect();
        console.log('✅ 数据库连接成功');
        
        console.log('🔍 测试创建用户...');
        const createResult = await db.createUser('testuser', 'test@example.com', 'hashedpassword');
        console.log('✅ 创建用户成功:', createResult);
        
        console.log('🔍 测试获取用户...');
        const user = await db.getUserByEmail('test@example.com');
        console.log('✅ 获取用户成功:', user);
        
        console.log('🔍 测试获取套餐...');
        const packages = await db.getPackages();
        console.log('✅ 获取套餐成功:', packages.length, '个套餐');
        
        console.log('🔍 测试获取潜在客户...');
        const leads = await db.getLeads();
        console.log('✅ 获取潜在客户成功:', leads.length, '个客户');
        
        await db.disconnect();
        console.log('✅ 数据库测试完成');
        
    } catch (error) {
        console.error('❌ 数据库测试失败:', error.message);
        console.error('错误详情:', error);
    }
}

testDatabaseFunctions(); 