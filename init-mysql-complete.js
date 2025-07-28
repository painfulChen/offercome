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

async function initDatabase() {
    let connection;
    try {
        console.log('🔗 连接MySQL服务器...');
        connection = await mysql.createConnection(config);
        console.log('✅ 连接成功！');
        
        // 创建数据库
        console.log('📝 创建数据库...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`offercome\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 数据库创建成功');
        
        // 使用数据库
        await connection.query('USE `offercome`');
        console.log('✅ 切换到offercome数据库');
        
        // 测试查询
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('✅ 查询测试成功:', rows);
        
        // 创建基本表结构
        console.log('📋 创建基本表结构...');
        
        // 用户表
        await connection.query(`
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
        await connection.query(`
            INSERT IGNORE INTO users (username, email, password_hash) 
            VALUES ('admin', 'admin@offercome.com', 'test_hash')
        `);
        console.log('✅ 测试数据插入成功');
        
        // 查询测试数据
        const [users] = await connection.query('SELECT * FROM users');
        console.log('📋 用户数据:', users);
        
        // 创建更多表结构
        console.log('📋 创建完整表结构...');
        
        // 销售顾问表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sales_consultants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(100),
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 销售顾问表创建成功');
        
        // 教师表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(100) NOT NULL,
                specialty VARCHAR(200),
                experience_years INT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 教师表创建成功');
        
        // 潜在客户表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(100),
                source VARCHAR(50),
                status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
                consultant_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 潜在客户表创建成功');
        
        // 评估表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT,
                assessment_type ENUM('resume', 'interview', 'career') NOT NULL,
                score INT,
                feedback TEXT,
                status ENUM('pending', 'completed', 'reviewed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 评估表创建成功');
        
        // 套餐表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                duration_days INT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 套餐表创建成功');
        
        // 订单表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT,
                package_id INT,
                amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'paid', 'completed', 'cancelled') DEFAULT 'pending',
                payment_method VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id),
                FOREIGN KEY (package_id) REFERENCES packages(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 订单表创建成功');
        
        // 任务表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                due_date DATE,
                assigned_to INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 任务表创建成功');
        
        // 插入初始数据
        console.log('📊 插入初始数据...');
        
        // 插入套餐数据
        await connection.query(`
            INSERT IGNORE INTO packages (name, description, price, duration_days) VALUES
            ('基础套餐', '简历优化 + 面试指导', 2999.00, 30),
            ('进阶套餐', '简历优化 + 面试指导 + 职业规划', 4999.00, 60),
            ('高级套餐', '全流程服务 + 一对一指导', 7999.00, 90)
        `);
        console.log('✅ 套餐数据插入成功');
        
        // 查询所有表
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📋 数据库表列表:', tables.map(t => Object.values(t)[0]));
        
        console.log('🎉 数据库初始化完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 初始化失败:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 连接已关闭');
        }
    }
}

initDatabase(); 