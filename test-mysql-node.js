const mysql = require('mysql2/promise');

const config = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false,
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from('Offercome2024!')
    }
};

async function testConnection() {
    try {
        console.log('🔗 尝试连接MySQL...');
        const connection = await mysql.createConnection(config);
        console.log('✅ 连接成功！');
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询成功:', rows);
        
        await connection.end();
        console.log('✅ 连接已关闭');
        return true;
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        return false;
    }
}

testConnection();
