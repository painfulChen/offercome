const { getPool } = require('../config/database-persistent');
const fs = require('fs').promises;
const path = require('path');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../../database-backups');
    this.pool = null;
  }

  async getPool() {
    if (!this.pool) {
      this.pool = await getPool();
    }
    return this.pool;
  }

  // 创建备份目录
  async ensureBackupDir() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  // 备份单个表
  async backupTable(tableName) {
    const pool = await this.getPool();
    await this.ensureBackupDir();

    try {
      // 获取表数据
      const [rows] = await pool.execute(`SELECT * FROM ${tableName}`);
      
      // 获取表结构
      const [structure] = await pool.execute(`SHOW CREATE TABLE ${tableName}`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `${tableName}_${timestamp}.json`);
      
      const backupData = {
        tableName,
        structure: structure[0]['Create Table'],
        data: rows,
        backupTime: new Date().toISOString(),
        recordCount: rows.length
      };
      
      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
      
      console.log(`✅ 表 ${tableName} 备份完成: ${backupFile} (${rows.length} 条记录)`);
      return backupFile;
    } catch (error) {
      console.error(`❌ 表 ${tableName} 备份失败:`, error.message);
      throw error;
    }
  }

  // 备份所有表
  async backupAllTables() {
    const pool = await this.getPool();
    await this.ensureBackupDir();

    try {
      // 获取所有表名
      const [tables] = await pool.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      console.log(`📋 开始备份 ${tableNames.length} 个表...`);
      
      const backupFiles = [];
      for (const tableName of tableNames) {
        try {
          const backupFile = await this.backupTable(tableName);
          backupFiles.push(backupFile);
        } catch (error) {
          console.error(`❌ 表 ${tableName} 备份失败，跳过`);
        }
      }
      
      // 创建完整备份信息
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullBackupFile = path.join(this.backupDir, `full_backup_${timestamp}.json`);
      
      const fullBackupInfo = {
        backupTime: new Date().toISOString(),
        tables: tableNames,
        backupFiles,
        totalTables: tableNames.length,
        successfulBackups: backupFiles.length
      };
      
      await fs.writeFile(fullBackupFile, JSON.stringify(fullBackupInfo, null, 2));
      
      console.log(`🎉 完整备份完成: ${fullBackupFile}`);
      console.log(`📊 备份统计: ${backupFiles.length}/${tableNames.length} 个表成功`);
      
      return { fullBackupFile, backupFiles };
    } catch (error) {
      console.error('❌ 完整备份失败:', error.message);
      throw error;
    }
  }

  // 从备份文件恢复表
  async restoreTable(backupFile) {
    const pool = await this.getPool();

    try {
      const backupData = JSON.parse(await fs.readFile(backupFile, 'utf8'));
      const { tableName, structure, data } = backupData;
      
      console.log(`🔄 开始恢复表 ${tableName}...`);
      
      // 删除现有表（如果存在）
      await pool.execute(`DROP TABLE IF EXISTS ${tableName}`);
      
      // 创建表结构
      await pool.execute(structure);
      console.log(`✅ 表结构恢复完成: ${tableName}`);
      
      // 恢复数据
      if (data.length > 0) {
        const fields = Object.keys(data[0]);
        const values = data.map(row => Object.values(row));
        const placeholders = fields.map(() => '?').join(',');
        
        const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;
        await pool.execute(sql, values);
        
        console.log(`✅ 数据恢复完成: ${tableName} (${data.length} 条记录)`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ 表恢复失败:`, error.message);
      throw error;
    }
  }

  // 从完整备份恢复
  async restoreFromFullBackup(fullBackupFile) {
    try {
      const fullBackupInfo = JSON.parse(await fs.readFile(fullBackupFile, 'utf8'));
      const { backupFiles } = fullBackupInfo;
      
      console.log(`🔄 开始从完整备份恢复 ${backupFiles.length} 个表...`);
      
      for (const backupFile of backupFiles) {
        try {
          await this.restoreTable(backupFile);
        } catch (error) {
          console.error(`❌ 恢复失败: ${backupFile}`);
        }
      }
      
      console.log('🎉 完整恢复完成！');
    } catch (error) {
      console.error('❌ 完整恢复失败:', error.message);
      throw error;
    }
  }

  // 列出所有备份
  async listBackups() {
    await this.ensureBackupDir();
    
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      console.log('📋 可用备份文件:');
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        const backupData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        console.log(`  📄 ${file}`);
        console.log(`     大小: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`     时间: ${backupData.backupTime || '未知'}`);
        
        if (backupData.tableName) {
          console.log(`     表名: ${backupData.tableName}`);
          console.log(`     记录数: ${backupData.recordCount || 0}`);
        } else if (backupData.tables) {
          console.log(`     表数量: ${backupData.tables.length}`);
          console.log(`     成功备份: ${backupData.successfulBackups}/${backupData.totalTables}`);
        }
        console.log('');
      }
    } catch (error) {
      console.error('❌ 列出备份失败:', error.message);
    }
  }

  // 清理旧备份
  async cleanupOldBackups(daysToKeep = 30) {
    await this.ensureBackupDir();
    
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysToKeep);
      
      let deletedCount = 0;
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffTime) {
          await fs.unlink(filePath);
          console.log(`🗑️ 删除旧备份: ${file}`);
          deletedCount++;
        }
      }
      
      console.log(`✅ 清理完成，删除了 ${deletedCount} 个旧备份文件`);
    } catch (error) {
      console.error('❌ 清理备份失败:', error.message);
    }
  }
}

// 命令行接口
async function main() {
  const backup = new DatabaseBackup();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'backup':
        if (args[0]) {
          await backup.backupTable(args[0]);
        } else {
          await backup.backupAllTables();
        }
        break;
        
      case 'restore':
        if (!args[0]) {
          console.error('❌ 请指定备份文件路径');
          process.exit(1);
        }
        await backup.restoreTable(args[0]);
        break;
        
      case 'restore-full':
        if (!args[0]) {
          console.error('❌ 请指定完整备份文件路径');
          process.exit(1);
        }
        await backup.restoreFromFullBackup(args[0]);
        break;
        
      case 'list':
        await backup.listBackups();
        break;
        
      case 'cleanup':
        const days = parseInt(args[0]) || 30;
        await backup.cleanupOldBackups(days);
        break;
        
      default:
        console.log('📋 数据备份和恢复工具');
        console.log('');
        console.log('用法:');
        console.log('  node backup-restore.js backup [表名]     # 备份表或所有表');
        console.log('  node backup-restore.js restore <文件>    # 恢复单个表');
        console.log('  node backup-restore.js restore-full <文件> # 恢复完整备份');
        console.log('  node backup-restore.js list             # 列出所有备份');
        console.log('  node backup-restore.js cleanup [天数]   # 清理旧备份');
        break;
    }
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseBackup; 