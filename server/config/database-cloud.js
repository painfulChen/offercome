const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    ssl: false
};

let pool = null;

async function connect() {
    try {
        if (!pool) {
            pool = mysql.createPool(dbConfig);
            console.log('✅ 数据库连接池创建成功');
        }
        return pool;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        throw error;
    }
}

async function disconnect() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔌 数据库连接已关闭');
    }
}

async function query(sql, params = []) {
    try {
        const connection = await connect();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ 查询执行失败:', error.message);
        throw error;
    }
}

// 用户管理
async function getUsers() {
    return await query('SELECT * FROM users ORDER BY created_at DESC');
}

async function createUser(username, email, passwordHash) {
    return await query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );
}

async function getUserByUsername(username) {
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    return users[0] || null;
}

async function getUserByEmail(email) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
}

async function getUserById(id) {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
}

async function updateUser(id, username, email) {
    return await query(
        'UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?',
        [username, email, id]
    );
}

// 咨询管理
async function getConsultations(userId = null) {
    if (userId) {
        return await query('SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    }
    return await query('SELECT * FROM consultations ORDER BY created_at DESC');
}

async function createConsultation(consultationData) {
    const {
        user_id, name, phone, email, wechat, consultation_type,
        current_situation, target_position, target_company, urgency_level,
        budget_range, preferred_time, additional_notes, ip_address, user_agent
    } = consultationData;

    return await query(
        `INSERT INTO consultations (
            user_id, name, phone, email, wechat, consultation_type,
            current_situation, target_position, target_company, urgency_level,
            budget_range, preferred_time, additional_notes, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, name, phone, email, wechat, consultation_type,
            current_situation, target_position, target_company, urgency_level,
            budget_range, preferred_time, additional_notes, ip_address, user_agent
        ]
    );
}

async function updateConsultation(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    return await query(
        `UPDATE consultations SET ${fields}, updated_at = NOW() WHERE id = ?`,
        values
    );
}

// MBTI测试管理
async function getMbtiQuestions() {
    return await query('SELECT * FROM mbti_questions WHERE is_active = TRUE ORDER BY dimension, question_number');
}

async function createMbtiResult(resultData) {
    const {
        user_id, mbti_type, e_score, i_score, s_score, n_score,
        t_score, f_score, j_score, p_score, career_suggestions,
        personality_description, strengths, weaknesses
    } = resultData;

    return await query(
        `INSERT INTO mbti_results (
            user_id, mbti_type, e_score, i_score, s_score, n_score,
            t_score, f_score, j_score, p_score, career_suggestions,
            personality_description, strengths, weaknesses
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, mbti_type, e_score, i_score, s_score, n_score,
            t_score, f_score, j_score, p_score, career_suggestions,
            personality_description, strengths, weaknesses
        ]
    );
}

async function getMbtiResult(userId) {
    const results = await query(
        'SELECT * FROM mbti_results WHERE user_id = ? ORDER BY test_date DESC LIMIT 1',
        [userId]
    );
    return results[0] || null;
}

async function updateUserMbti(userId, mbtiType) {
    return await query(
        'UPDATE users SET mbti_type = ?, mbti_test_date = NOW() WHERE id = ?',
        [mbtiType, userId]
    );
}

// 通知管理
async function getNotifications(userId) {
    return await query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
}

async function createNotification(notificationData) {
    const { user_id, type, title, message, related_id } = notificationData;
    
    return await query(
        'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, type, title, message, related_id]
    );
}

async function markNotificationRead(notificationId, userId) {
    return await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId]
    );
}

// 潜在客户管理
async function getLeads() {
    return await query('SELECT * FROM leads ORDER BY created_at DESC');
}

async function createLead(name, phone, email, source) {
    return await query(
        'INSERT INTO leads (name, phone, email, source) VALUES (?, ?, ?, ?)',
        [name, phone, email, source]
    );
}

// 套餐管理
async function getPackages() {
    return await query('SELECT * FROM packages WHERE status = "active"');
}

async function createOrder(leadId, packageId, amount) {
    return await query(
        'INSERT INTO orders (lead_id, package_id, amount) VALUES (?, ?, ?)',
        [leadId, packageId, amount]
    );
}

// 任务管理
async function getTasks() {
    return await query('SELECT * FROM tasks ORDER BY due_date ASC');
}

async function createTask(leadId, title, description, priority, dueDate) {
    return await query(
        'INSERT INTO tasks (lead_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
        [leadId, title, description, priority, dueDate]
    );
}

// 统计功能
async function getStats() {
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    const [leads] = await query('SELECT COUNT(*) as count FROM leads');
    const [orders] = await query('SELECT COUNT(*) as count FROM orders');
    const [tasks] = await query('SELECT COUNT(*) as count FROM tasks');
    const [consultations] = await query('SELECT COUNT(*) as count FROM consultations');
    const [mbtiTests] = await query('SELECT COUNT(*) as count FROM mbti_results');

    return {
        users: users.count,
        leads: leads.count,
        orders: orders.count,
        tasks: tasks.count,
        consultations: consultations.count,
        mbti_tests: mbtiTests.count
    };
}

// 销售顾问管理
async function getSalesConsultants() {
    return await query('SELECT * FROM sales_consultants WHERE is_active = TRUE');
}

async function assignConsultationToConsultant(consultationId, consultantId) {
    return await query(
        'UPDATE consultations SET assigned_consultant_id = ? WHERE id = ?',
        [consultantId, consultationId]
    );
}

module.exports = {
    connect,
    disconnect,
    query,
    config: dbConfig,
    // 用户管理
    getUsers,
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    updateUser,
    // 咨询管理
    getConsultations,
    createConsultation,
    updateConsultation,
    // MBTI测试管理
    getMbtiQuestions,
    createMbtiResult,
    getMbtiResult,
    updateUserMbti,
    // 通知管理
    getNotifications,
    createNotification,
    markNotificationRead,
    // 潜在客户管理
    getLeads,
    createLead,
    // 套餐管理
    getPackages,
    createOrder,
    // 任务管理
    getTasks,
    createTask,
    // 统计功能
    getStats,
    // 销售顾问管理
    getSalesConsultants,
    assignConsultationToConsultant
}; 