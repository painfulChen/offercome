const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false
};

async function runMigration() {
    let connection;
    try {
        console.log('🔧 开始数据库迁移...');
        
        // 读取SQL文件
        const sqlContent = fs.readFileSync('database-migration-enhanced.sql', 'utf8');
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        // 连接数据库
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');
        
        // 执行每个SQL语句
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    await connection.execute(statement);
                    console.log(`✅ 执行语句 ${i + 1}/${statements.length}`);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log(`⚠️ 字段已存在，跳过: ${error.message}`);
                    } else if (error.code === 'ER_DUP_KEYNAME') {
                        console.log(`⚠️ 索引已存在，跳过: ${error.message}`);
                    } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log(`⚠️ 表已存在，跳过: ${error.message}`);
                    } else {
                        console.error(`❌ 执行语句失败: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('🎉 数据库迁移完成！');
        
        // 验证迁移结果
        console.log('\n📊 验证迁移结果...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('✅ 数据库表列表:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
    } catch (error) {
        console.error('❌ 数据库迁移失败:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

runMigration(); 