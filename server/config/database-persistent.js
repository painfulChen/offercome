const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloudbase_ai',
  charset: 'utf8mb4',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true
};

let pool = null;

async function createPool() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    throw error;
  }
}

const persistenceUtils = {
  async batchInsert(table, data) {
    if (!pool) await createPool();
    try {
      const values = data.map(item => Object.values(item));
      const fields = Object.keys(data[0]);
      const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES ? ON DUPLICATE KEY UPDATE ${fields.map(f => `${f}=VALUES(${f})`).join(',')}`;
      const [result] = await pool.execute(sql, [values]);
      return result;
    } catch (error) {
      console.error('批量插入失败:', error);
      throw error;
    }
  },
  
  async transaction(callback) {
    if (!pool) await createPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = {
  createPool,
  getPool: () => pool,
  persistenceUtils,
  dbConfig
}; 