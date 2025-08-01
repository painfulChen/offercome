const { createPool } = require('../config/database-persistent');

// 数据库表结构定义
const tableSchemas = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(30) UNIQUE NOT NULL,
      phone VARCHAR(11) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
      avatar VARCHAR(255) DEFAULT '',
      is_active BOOLEAN DEFAULT TRUE,
      last_login_at TIMESTAMP NULL,
      login_count INT DEFAULT 0,
      preferences JSON,
      api_usage JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_username (username),
      INDEX idx_phone (phone),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  ai_calls: `
    CREATE TABLE IF NOT EXISTS ai_calls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      session_id VARCHAR(100),
      prompt TEXT NOT NULL,
      response TEXT,
      model VARCHAR(50),
      tokens_used INT DEFAULT 0,
      cost DECIMAL(10,4) DEFAULT 0,
      status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
      error_message TEXT,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_session_id (session_id),
      INDEX idx_created_at (created_at),
      INDEX idx_status (status),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  case_categories: `
    CREATE TABLE IF NOT EXISTS case_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      parent_id INT NULL,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_parent_id (parent_id),
      INDEX idx_sort_order (sort_order),
      FOREIGN KEY (parent_id) REFERENCES case_categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  cases: `
    CREATE TABLE IF NOT EXISTS cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category_id INT,
      user_id INT,
      tags JSON,
      status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
      view_count INT DEFAULT 0,
      like_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category_id (category_id),
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (category_id) REFERENCES case_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  coaching_sessions: `
    CREATE TABLE IF NOT EXISTS coaching_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      session_type ENUM('career', 'mbti', 'general') DEFAULT 'general',
      status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
      scheduled_at TIMESTAMP NULL,
      started_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      notes TEXT,
      feedback JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_scheduled_at (scheduled_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  rag_documents: `
    CREATE TABLE IF NOT EXISTS rag_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      content_type ENUM('text', 'pdf', 'doc', 'other') DEFAULT 'text',
      file_path VARCHAR(500),
      file_size INT,
      embedding_vector JSON,
      metadata JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_content_type (content_type),
      INDEX idx_is_active (is_active),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `
};

// 初始数据
const initialData = {
  case_categories: [
    { name: '职业规划', description: '职业发展相关案例', sort_order: 1 },
    { name: '面试技巧', description: '面试准备和技巧', sort_order: 2 },
    { name: '技能提升', description: '专业技能提升', sort_order: 3 },
    { name: '行业分析', description: '各行业发展趋势', sort_order: 4 }
  ],
  
  users: [
    {
      username: 'admin',
      phone: '13800138000',
      email: 'admin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      is_active: true
    }
  ]
};

async function initDatabase() {
  try {
    console.log('🚀 开始初始化数据库...');
    
    const pool = await createPool();
    
    // 创建表结构
    console.log('📋 创建数据库表...');
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      try {
        await pool.execute(schema);
        console.log(`✅ 表 ${tableName} 创建成功`);
      } catch (error) {
        console.error(`❌ 表 ${tableName} 创建失败:`, error.message);
      }
    }
    
    // 插入初始数据
    console.log('📝 插入初始数据...');
    for (const [tableName, data] of Object.entries(initialData)) {
      if (data.length > 0) {
        try {
          const fields = Object.keys(data[0]);
          const values = data.map(item => Object.values(item));
          const placeholders = fields.map(() => '?').join(',');
          
          const sql = `INSERT IGNORE INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          console.log(`✅ ${tableName} 初始数据插入成功，影响行数: ${result.affectedRows}`);
        } catch (error) {
          console.error(`❌ ${tableName} 初始数据插入失败:`, error.message);
        }
      }
    }
    
    console.log('🎉 数据库初始化完成！');
    
    // 显示数据库状态
    await showDatabaseStatus(pool);
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

async function showDatabaseStatus(pool) {
  try {
    console.log('\n📊 数据库状态:');
    
    const tables = Object.keys(tableSchemas);
    for (const table of tables) {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${rows[0].count} 条记录`);
    }
    
  } catch (error) {
    console.error('获取数据库状态失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ 数据库初始化脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 数据库初始化脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase, showDatabaseStatus }; 