const mongoose = require('mongoose');
const { connectDB } = require('./server/config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔌 正在连接数据库...');
        
        // 尝试连接数据库
        await connectDB();
        console.log('✅ 数据库连接成功');
        
        // 检查连接状态
        const connectionState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        console.log(`📊 连接状态: ${states[connectionState]}`);
        
        // 获取数据库信息
        const dbName = mongoose.connection.name;
        const dbHost = mongoose.connection.host;
        const dbPort = mongoose.connection.port;
        
        console.log(`🗄️  数据库信息:`);
        console.log(`   - 名称: ${dbName}`);
        console.log(`   - 主机: ${dbHost}`);
        console.log(`   - 端口: ${dbPort}`);
        
        // 测试集合操作
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 现有集合: ${collections.length}个`);
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        console.log('\n🎉 数据库连接测试完成！');
        
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        console.log('\n💡 可能的解决方案:');
        console.log('1. 检查MongoDB服务是否运行');
        console.log('2. 检查连接字符串是否正确');
        console.log('3. 检查网络连接');
        console.log('4. 检查防火墙设置');
    } finally {
        // 关闭连接
        await mongoose.connection.close();
        console.log('🔌 数据库连接已关闭');
    }
}

// 运行测试
testDatabaseConnection(); 