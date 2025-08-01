const { getPool } = require('../config/database-persistent');
const fs = require('fs').promises;
const path = require('path');

class DataMigration {
  constructor() {
    this.pool = null;
    this.migrationLog = [];
  }

  async getPool() {
    if (!this.pool) {
      this.pool = await getPool();
    }
    return this.pool;
  }

  // 记录迁移日志
  log(message, type = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.migrationLog.push(logEntry);
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // 从JSON文件迁移数据
  async migrateFromJson(jsonFile, tableName) {
    const pool = await this.getPool();
    
    try {
      this.log(`开始迁移表 ${tableName} 从文件 ${jsonFile}`);
      
      // 读取JSON文件
      const data = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
      
      if (!Array.isArray(data) || data.length === 0) {
        this.log(`文件 ${jsonFile} 中没有有效数据`, 'warn');
        return { success: false, reason: 'No valid data' };
      }
      
      // 获取字段名
      const fields = Object.keys(data[0]);
      const values = data.map(item => Object.values(item));
      const placeholders = fields.map(() => '?').join(',');
      
      // 清空现有数据
      await pool.execute(`DELETE FROM ${tableName}`);
      this.log(`已清空表 ${tableName}`);
      
      // 批量插入数据
      const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;
      const [result] = await pool.execute(sql, values);
      
      this.log(`成功迁移 ${result.affectedRows} 条记录到表 ${tableName}`);
      
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      this.log(`迁移表 ${tableName} 失败: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // 从MongoDB迁移数据（如果有）
  async migrateFromMongoDB(collectionName, tableName, fieldMapping = {}) {
    try {
      this.log(`开始从MongoDB集合 ${collectionName} 迁移到表 ${tableName}`);
      
      // 这里需要根据实际的MongoDB连接来调整
      // 示例代码，实际使用时需要替换为真实的MongoDB连接
      const { MongoClient } = require('mongodb');
      
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      
      const db = client.db();
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      if (documents.length === 0) {
        this.log(`MongoDB集合 ${collectionName} 中没有数据`, 'warn');
        return { success: false, reason: 'No data in MongoDB collection' };
      }
      
      // 转换数据格式
      const convertedData = documents.map(doc => {
        const converted = {};
        for (const [mongoField, mysqlField] of Object.entries(fieldMapping)) {
          converted[mysqlField] = doc[mongoField];
        }
        return converted;
      });
      
      // 保存为临时JSON文件
      const tempFile = path.join(__dirname, `../temp/${collectionName}_migration.json`);
      await fs.writeFile(tempFile, JSON.stringify(convertedData, null, 2));
      
      // 迁移到MySQL
      const result = await this.migrateFromJson(tempFile, tableName);
      
      // 清理临时文件
      await fs.unlink(tempFile);
      
      await client.close();
      
      return result;
    } catch (error) {
      this.log(`从MongoDB迁移失败: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // 验证迁移结果
  async validateMigration(tableName, expectedCount) {
    const pool = await this.getPool();
    
    try {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const actualCount = rows[0].count;
      
      if (actualCount === expectedCount) {
        this.log(`✅ 表 ${tableName} 迁移验证成功: ${actualCount} 条记录`);
        return true;
      } else {
        this.log(`❌ 表 ${tableName} 迁移验证失败: 期望 ${expectedCount}, 实际 ${actualCount}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`验证表 ${tableName} 失败: ${error.message}`, 'error');
      return false;
    }
  }

  // 生成迁移报告
  async generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.migrationLog.length,
        success: this.migrationLog.filter(log => log.type === 'info').length,
        warnings: this.migrationLog.filter(log => log.type === 'warn').length,
        errors: this.migrationLog.filter(log => log.type === 'error').length
      },
      logs: this.migrationLog
    };
    
    const reportFile = path.join(__dirname, `../logs/migration_report_${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`迁移报告已生成: ${reportFile}`);
    return report;
  }

  // 执行完整迁移
  async runFullMigration(migrationConfig) {
    this.log('🚀 开始完整数据迁移...');
    
    const results = {};
    
    for (const [tableName, config] of Object.entries(migrationConfig)) {
      try {
        let result;
        
        if (config.source === 'json') {
          result = await this.migrateFromJson(config.file, tableName);
        } else if (config.source === 'mongodb') {
          result = await this.migrateFromMongoDB(config.collection, tableName, config.fieldMapping);
        }
        
        results[tableName] = result;
        
        // 验证迁移结果
        if (result.success && config.expectedCount) {
          await this.validateMigration(tableName, config.expectedCount);
        }
        
      } catch (error) {
        this.log(`迁移表 ${tableName} 时发生错误: ${error.message}`, 'error');
        results[tableName] = { success: false, error: error.message };
      }
    }
    
    // 生成报告
    const report = await this.generateMigrationReport();
    
    this.log('🎉 数据迁移完成！');
    
    return { results, report };
  }
}

// 命令行接口
async function main() {
  const migration = new DataMigration();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'migrate-json':
        if (args.length < 2) {
          console.error('用法: node migrate-data.js migrate-json <json文件> <表名>');
          process.exit(1);
        }
        await migration.migrateFromJson(args[0], args[1]);
        break;
        
      case 'migrate-mongo':
        if (args.length < 3) {
          console.error('用法: node migrate-data.js migrate-mongo <集合名> <表名> <字段映射JSON>');
          process.exit(1);
        }
        const fieldMapping = JSON.parse(args[2]);
        await migration.migrateFromMongoDB(args[0], args[1], fieldMapping);
        break;
        
      case 'validate':
        if (args.length < 2) {
          console.error('用法: node migrate-data.js validate <表名> <期望记录数>');
          process.exit(1);
        }
        await migration.validateMigration(args[0], parseInt(args[1]));
        break;
        
      case 'full-migration':
        // 示例配置
        const config = {
          users: {
            source: 'json',
            file: './backup-20250729-215228/mongodb-backup/offercome/users.bson',
            expectedCount: 100
          },
          ai_calls: {
            source: 'json',
            file: './backup-20250729-215228/mongodb-backup/offercome/ai_calls.bson',
            expectedCount: 500
          }
        };
        await migration.runFullMigration(config);
        break;
        
      default:
        console.log('📋 数据迁移工具');
        console.log('');
        console.log('用法:');
        console.log('  node migrate-data.js migrate-json <文件> <表名>     # 从JSON文件迁移');
        console.log('  node migrate-data.js migrate-mongo <集合> <表名> <映射> # 从MongoDB迁移');
        console.log('  node migrate-data.js validate <表名> <数量>        # 验证迁移结果');
        console.log('  node migrate-data.js full-migration                # 执行完整迁移');
        break;
    }
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DataMigration; 