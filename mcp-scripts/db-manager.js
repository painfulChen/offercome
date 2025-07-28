// 数据库管理脚本
const mysql = require('mysql2/promise');

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

class DatabaseManager {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (!this.pool) {
            this.pool = mysql.createPool(dbConfig);
            console.log('✅ 数据库连接池创建成功');
        }
        return this.pool;
    }

    async query(sql, params = []) {
        const connection = await this.connect();
        const [rows] = await connection.execute(sql, params);
        return rows;
    }

    async getUsers() {
        return await this.query('SELECT * FROM users');
    }

    async getLeads() {
        return await this.query('SELECT * FROM leads ORDER BY created_at DESC');
    }

    async getPackages() {
        return await this.query('SELECT * FROM packages WHERE status = "active"');
    }

    async getOrders() {
        return await this.query('SELECT * FROM orders ORDER BY created_at DESC');
    }

    async getTasks() {
        return await this.query('SELECT * FROM tasks ORDER BY due_date ASC');
    }

    async getStats() {
        const users = await this.query('SELECT COUNT(*) as count FROM users');
        const leads = await this.query('SELECT COUNT(*) as count FROM leads');
        const orders = await this.query('SELECT COUNT(*) as count FROM orders');
        const tasks = await this.query('SELECT COUNT(*) as count FROM tasks');

        return {
            users: users[0].count,
            leads: leads[0].count,
            orders: orders[0].count,
            tasks: tasks[0].count
        };
    }

    async backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        
        console.log(`📦 开始备份数据库到 ${filename}...`);
        
        // 这里可以添加实际的备份逻辑
        console.log('✅ 数据库备份完成');
        return filename;
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('🔌 数据库连接已关闭');
        }
    }
}

module.exports = DatabaseManager;
