const mysql = require('mysql2/promise');

const config = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false
};

async function setupDatabase() {
    let connection;
    try {
        console.log('🔗 连接MySQL服务器...');
        connection = await mysql.createConnection(config);
        console.log('✅ 连接成功！');
        
        // 创建数据库
        console.log('📝 创建数据库...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`offercome\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 数据库创建成功');
        
        // 使用数据库
        await connection.execute('USE `offercome`');
        console.log('✅ 切换到offercome数据库');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询测试成功:', rows);
        
        // 创建基本表结构
        console.log('📋 创建基本表结构...');
        
        // 用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 用户表创建成功');
        
        // 测试数据
        console.log('📊 插入测试数据...');
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash) 
            VALUES ('admin', 'admin@offercome.com', 'test_hash')
        `);
        console.log('✅ 测试数据插入成功');
        
        // 查询测试数据
        const [users] = await connection.execute('SELECT * FROM users');
        console.log('📋 用户数据:', users);
        
        console.log('🎉 数据库设置完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 设置失败:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 连接已关闭');
        }
    }
}

setupDatabase();
