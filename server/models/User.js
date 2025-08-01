const PersistentModel = require('./PersistentModel');
const bcrypt = require('bcryptjs');

class User extends PersistentModel {
  constructor() {
    super('users');
  }

  // 创建用户
  async createUser(userData) {
    // 密码加密
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // 设置默认值
    userData.created_at = new Date();
    userData.updated_at = new Date();
    
    return await this.create(userData);
  }

  // 验证用户密码
  async validatePassword(userId, password) {
    const user = await this.findById(userId);
    if (!user) return false;
    
    return await bcrypt.compare(password, user.password);
  }

  // 根据邮箱查找用户
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  // 根据用户名查找用户
  async findByUsername(username) {
    return await this.findOne({ username });
  }

  // 更新用户信息
  async updateUser(userId, updateData) {
    updateData.updated_at = new Date();
    return await this.update({ id: userId }, updateData);
  }

  // 获取用户统计信息
  async getUserStats() {
    const pool = await this.getPool();
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
      FROM ${this.tableName}
    `;
    
    const [rows] = await pool.execute(sql);
    return rows[0];
  }
}

module.exports = new User(); 