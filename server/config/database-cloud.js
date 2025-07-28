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

// 数据库操作方法
async function getUsers() {
    return await query('SELECT * FROM users');
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

async function getLeads() {
    return await query('SELECT * FROM leads ORDER BY created_at DESC');
}

async function createLead(name, phone, email, source) {
    return await query(
        'INSERT INTO leads (name, phone, email, source) VALUES (?, ?, ?, ?)',
        [name, phone, email, source]
    );
}

async function getPackages() {
    return await query('SELECT * FROM packages WHERE status = "active"');
}

async function createOrder(leadId, packageId, amount) {
    return await query(
        'INSERT INTO orders (lead_id, package_id, amount) VALUES (?, ?, ?)',
        [leadId, packageId, amount]
    );
}

async function getTasks() {
    return await query('SELECT * FROM tasks ORDER BY due_date ASC');
}

async function createTask(leadId, title, description, priority, dueDate) {
    return await query(
        'INSERT INTO tasks (lead_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
        [leadId, title, description, priority, dueDate]
    );
}

module.exports = {
    connect,
    disconnect,
    query,
    config: dbConfig,
    // 业务方法
    getUsers,
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    updateUser,
    getLeads,
    createLead,
    getPackages,
    createOrder,
    getTasks,
    createTask
}; 