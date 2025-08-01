const { getPool, persistenceUtils } = require('../config/database-persistent');

class PersistentModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = null;
  }

  async getPool() {
    if (!this.pool) {
      this.pool = await getPool();
    }
    return this.pool;
  }

  // 创建记录
  async create(data) {
    const pool = await this.getPool();
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(',');
    
    const sql = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(sql, values);
    
    return { id: result.insertId, ...data };
  }

  // 批量创建
  async createMany(dataArray) {
    return await persistenceUtils.batchInsert(this.tableName, dataArray);
  }

  // 查找记录
  async find(conditions = {}, options = {}) {
    const pool = await this.getPool();
    let sql = `SELECT * FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    const [rows] = await pool.execute(sql, values);
    return rows;
  }

  // 查找单条记录
  async findOne(conditions = {}) {
    const results = await this.find(conditions, { limit: 1 });
    return results[0] || null;
  }

  // 根据ID查找
  async findById(id) {
    return await this.findOne({ id });
  }

  // 更新记录
  async update(conditions, data) {
    const pool = await this.getPool();
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(',');
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(conditions)];
    
    const [result] = await pool.execute(sql, values);
    return result.affectedRows > 0;
  }

  // 删除记录
  async delete(conditions) {
    const pool = await this.getPool();
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
    
    const [result] = await pool.execute(sql, Object.values(conditions));
    return result.affectedRows > 0;
  }

  // 统计记录数
  async count(conditions = {}) {
    const pool = await this.getPool();
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const [rows] = await pool.execute(sql, values);
    return rows[0].count;
  }

  // 分页查询
  async paginate(page = 1, limit = 10, conditions = {}, options = {}) {
    const offset = (page - 1) * limit;
    const pool = await this.getPool();
    
    // 获取总数
    const total = await this.count(conditions);
    
    // 获取数据
    let sql = `SELECT * FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute(sql, values);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // 事务操作
  async transaction(callback) {
    return await persistenceUtils.transaction(callback);
  }
}

module.exports = PersistentModel; 