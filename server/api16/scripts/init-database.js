const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'sh-cdb-l8rfujds.sql.tencentcdb.com',
  port: process.env.DB_PORT || 21736,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Offercome2024!',
  database: process.env.DB_NAME || 'offercome',
  charset: 'utf8mb4'
};

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined // 先不指定数据库
    });
    
    // 直接使用指定数据库
    await connection.query(`USE ${dbConfig.database}`);
    
    // 读取并执行MBTI职业建议初始化SQL
    const mbtiCareerDataPath = path.join(__dirname, 'init-mbti-career-data.sql');
    const mbtiCareerDataSQL = await fs.readFile(mbtiCareerDataPath, 'utf8');
    
    // 分割SQL语句并执行
    const statements = mbtiCareerDataSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('✅ 执行SQL语句成功');
      }
    }
    
    // 验证数据是否插入成功
    const [mbtiCount] = await connection.query('SELECT COUNT(*) as count FROM mbti_career_advice');
    console.log(`✅ MBTI职业建议数据初始化完成，共 ${mbtiCount[0].count} 条记录`);
    
    // 检查其他必要的表
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name IN ('users', 'mbti_career_advice', 'ai_calls')
    `, [dbConfig.database]);
    
    console.log('📊 数据库表状态:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}: ✅ 存在`);
    });
    
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ 数据库初始化脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 数据库初始化脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 