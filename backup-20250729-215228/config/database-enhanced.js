const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'offercome',
            port: process.env.DB_PORT || 3306,
            charset: 'utf8mb4',
            timezone: '+08:00',
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('✅ 数据库连接成功');
            return this.connection;
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }

    async query(sql, params = []) {
        try {
            if (!this.connection) {
                await this.connect();
            }
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ 数据库查询失败:', error.message);
            throw error;
        }
    }

    async initDatabase() {
        try {
            console.log('🚀 开始初始化数据库...');
            
            // 读取SQL文件
            const sqlPath = path.join(__dirname, '../database-schema.sql');
            const sqlContent = await fs.readFile(sqlPath, 'utf8');
            
            // 分割SQL语句
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            // 执行每个SQL语句
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.query(statement);
                    console.log('✅ 执行SQL:', statement.substring(0, 50) + '...');
                }
            }
            
            console.log('🎉 数据库初始化完成！');
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error.message);
            throw error;
        }
    }

    // 用户相关方法
    async createUser(userData) {
        const sql = `
            INSERT INTO users (id, openid, unionid, name, phone, email, avatar, country, university, major, graduation_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            userData.id,
            userData.openid,
            userData.unionid,
            userData.name,
            userData.phone,
            userData.email,
            userData.avatar,
            userData.country,
            userData.university,
            userData.major,
            userData.graduation_year
        ];
        return await this.query(sql, params);
    }

    async getUserByOpenId(openid) {
        const sql = 'SELECT * FROM users WHERE openid = ?';
        const rows = await this.query(sql, [openid]);
        return rows[0];
    }

    async updateUser(userId, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const params = [...Object.values(updateData), userId];
        return await this.query(sql, params);
    }

    // 测评相关方法
    async createAssessment(assessmentData) {
        const sql = `
            INSERT INTO assessments (id, user_id, type, title, description, questions, answers, result, score, feedback, status, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            assessmentData.id,
            assessmentData.user_id,
            assessmentData.type,
            assessmentData.title,
            assessmentData.description,
            JSON.stringify(assessmentData.questions),
            JSON.stringify(assessmentData.answers),
            JSON.stringify(assessmentData.result),
            assessmentData.score,
            assessmentData.feedback,
            assessmentData.status,
            assessmentData.duration
        ];
        return await this.query(sql, params);
    }

    async getAssessmentsByUserId(userId, type = null) {
        let sql = 'SELECT * FROM assessments WHERE user_id = ?';
        let params = [userId];
        
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }
        
        sql += ' ORDER BY created_at DESC';
        return await this.query(sql, params);
    }

    // 潜在客户相关方法
    async createLead(leadData) {
        const sql = `
            INSERT INTO leads (id, user_id, consultant_id, name, phone, email, country, university, major, graduation_year, source, status, priority, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            leadData.id,
            leadData.user_id,
            leadData.consultant_id,
            leadData.name,
            leadData.phone,
            leadData.email,
            leadData.country,
            leadData.university,
            leadData.major,
            leadData.graduation_year,
            leadData.source,
            leadData.status,
            leadData.priority,
            leadData.notes
        ];
        return await this.query(sql, params);
    }

    async getLeadsByConsultantId(consultantId) {
        const sql = `
            SELECT l.*, u.name as user_name, u.avatar as user_avatar
            FROM leads l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.consultant_id = ?
            ORDER BY l.created_at DESC
        `;
        return await this.query(sql, [consultantId]);
    }

    // 订单相关方法
    async createOrder(orderData) {
        const sql = `
            INSERT INTO orders (id, order_no, user_id, consultant_id, package_id, amount, discount_amount, final_amount, currency, status, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            orderData.id,
            orderData.order_no,
            orderData.user_id,
            orderData.consultant_id,
            orderData.package_id,
            orderData.amount,
            orderData.discount_amount,
            orderData.final_amount,
            orderData.currency,
            orderData.status,
            orderData.payment_method,
            orderData.notes
        ];
        return await this.query(sql, params);
    }

    async getOrdersByUserId(userId) {
        const sql = `
            SELECT o.*, p.name as package_name, p.description as package_description
            FROM orders o
            LEFT JOIN packages p ON o.package_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `;
        return await this.query(sql, [userId]);
    }

    // 任务相关方法
    async createTask(taskData) {
        const sql = `
            INSERT INTO tasks (id, user_id, teacher_id, consultant_id, title, description, type, priority, status, progress, due_date, estimated_hours, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            taskData.id,
            taskData.user_id,
            taskData.teacher_id,
            taskData.consultant_id,
            taskData.title,
            taskData.description,
            taskData.type,
            taskData.priority,
            taskData.status,
            taskData.progress,
            taskData.due_date,
            taskData.estimated_hours,
            JSON.stringify(taskData.tags)
        ];
        return await this.query(sql, params);
    }

    async getTasksByUserId(userId) {
        const sql = `
            SELECT t.*, u.name as user_name, u.avatar as user_avatar
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?
            ORDER BY t.due_date ASC, t.priority DESC
        `;
        return await this.query(sql, [userId]);
    }

    // 文件相关方法
    async createFile(fileData) {
        const sql = `
            INSERT INTO files (id, user_id, name, original_name, file_path, file_url, file_size, mime_type, file_type, status, ai_analysis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            fileData.id,
            fileData.user_id,
            fileData.name,
            fileData.original_name,
            fileData.file_path,
            fileData.file_url,
            fileData.file_size,
            fileData.mime_type,
            fileData.file_type,
            fileData.status,
            JSON.stringify(fileData.ai_analysis)
        ];
        return await this.query(sql, params);
    }

    async getFilesByUserId(userId, fileType = null) {
        let sql = 'SELECT * FROM files WHERE user_id = ?';
        let params = [userId];
        
        if (fileType) {
            sql += ' AND file_type = ?';
            params.push(fileType);
        }
        
        sql += ' ORDER BY created_at DESC';
        return await this.query(sql, params);
    }

    // 通知相关方法
    async createNotification(notificationData) {
        const sql = `
            INSERT INTO notifications (id, user_id, consultant_id, teacher_id, type, title, content, level, status, related_id, related_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            notificationData.id,
            notificationData.user_id,
            notificationData.consultant_id,
            notificationData.teacher_id,
            notificationData.type,
            notificationData.title,
            notificationData.content,
            notificationData.level,
            notificationData.status,
            notificationData.related_id,
            notificationData.related_type
        ];
        return await this.query(sql, params);
    }

    async getNotificationsByUserId(userId, status = null) {
        let sql = 'SELECT * FROM notifications WHERE user_id = ?';
        let params = [userId];
        
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY created_at DESC';
        return await this.query(sql, params);
    }

    // 系统配置相关方法
    async getSystemConfig(key) {
        const sql = 'SELECT * FROM system_configs WHERE config_key = ?';
        const rows = await this.query(sql, [key]);
        return rows[0];
    }

    async updateSystemConfig(key, value) {
        const sql = 'UPDATE system_configs SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?';
        return await this.query(sql, [value, key]);
    }

    // 统计相关方法
    async getUserStats(userId) {
        const sql = `
            SELECT 
                COUNT(DISTINCT a.id) as total_assessments,
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT f.id) as total_files,
                AVG(a.score) as avg_assessment_score,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN o.status = 'paid' THEN o.final_amount ELSE 0 END) as total_spent
            FROM users u
            LEFT JOIN assessments a ON u.id = a.user_id
            LEFT JOIN orders o ON u.id = o.user_id
            LEFT JOIN tasks t ON u.id = t.user_id
            LEFT JOIN files f ON u.id = f.user_id
            WHERE u.id = ?
        `;
        const rows = await this.query(sql, [userId]);
        return rows[0];
    }

    // 生成唯一ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 创建单例实例
const dbManager = new DatabaseManager();

module.exports = dbManager; 