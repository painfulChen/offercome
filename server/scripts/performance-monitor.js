const { getPool } = require('../config/database-persistent');
const fs = require('fs').promises;
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.pool = null;
    this.metrics = {
      database: {},
      application: {},
      system: {}
    };
    this.startTime = Date.now();
  }

  async getPool() {
    if (!this.pool) {
      this.pool = await getPool();
    }
    return this.pool;
  }

  // 获取数据库性能指标
  async getDatabaseMetrics() {
    const pool = await this.getPool();
    
    try {
      const metrics = {};
      
      // 连接池状态
      const poolStatus = pool.pool;
      metrics.connectionPool = {
        totalConnections: poolStatus.config.connectionLimit,
        activeConnections: poolStatus._allConnections.length,
        idleConnections: poolStatus._freeConnections.length,
        waitingConnections: poolStatus._connectionQueue.length
      };
      
      // 数据库状态
      const [statusRows] = await pool.execute('SHOW STATUS');
      const statusMap = {};
      statusRows.forEach(row => {
        statusMap[row.Variable_name] = row.Value;
      });
      
      metrics.databaseStatus = {
        threadsConnected: parseInt(statusMap.Threads_connected || 0),
        threadsRunning: parseInt(statusMap.Threads_running || 0),
        slowQueries: parseInt(statusMap.Slow_queries || 0),
        questions: parseInt(statusMap.Questions || 0),
        uptime: parseInt(statusMap.Uptime || 0)
      };
      
      // 表大小统计
      const [tableRows] = await pool.execute(`
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          (data_length + index_length) as total_size
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      
      metrics.tableSizes = tableRows;
      
      // 慢查询日志（如果启用）
      try {
        const [slowQueryRows] = await pool.execute(`
          SELECT 
            start_time,
            query_time,
            lock_time,
            rows_sent,
            rows_examined,
            sql_text
          FROM mysql.slow_log 
          WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
          ORDER BY start_time DESC 
          LIMIT 10
        `);
        metrics.slowQueries = slowQueryRows;
      } catch (error) {
        // 慢查询日志可能未启用
        metrics.slowQueries = [];
      }
      
      this.metrics.database = metrics;
      return metrics;
    } catch (error) {
      console.error('获取数据库指标失败:', error.message);
      return null;
    }
  }

  // 获取应用性能指标
  getApplicationMetrics() {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    };
    
    this.metrics.application = metrics;
    return metrics;
  }

  // 获取系统性能指标
  async getSystemMetrics() {
    const os = require('os');
    
    const metrics = {
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      networkInterfaces: os.networkInterfaces(),
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname()
    };
    
    this.metrics.system = metrics;
    return metrics;
  }

  // 性能测试
  async runPerformanceTest() {
    const pool = await this.getPool();
    const results = {};
    
    try {
      // 测试查询性能
      const startTime = Date.now();
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const queryTime = Date.now() - startTime;
      
      results.queryPerformance = {
        query: 'SELECT COUNT(*) FROM users',
        executionTime: queryTime,
        resultCount: rows[0].count
      };
      
      // 测试连接池性能
      const connectionTestStart = Date.now();
      const connections = [];
      
      for (let i = 0; i < 10; i++) {
        const connection = await pool.getConnection();
        connections.push(connection);
      }
      
      const connectionTestTime = Date.now() - connectionTestStart;
      
      // 释放连接
      for (const connection of connections) {
        connection.release();
      }
      
      results.connectionPoolPerformance = {
        connectionsCreated: connections.length,
        totalTime: connectionTestTime,
        averageTime: connectionTestTime / connections.length
      };
      
      // 测试批量操作性能
      const batchTestStart = Date.now();
      const testData = Array.from({ length: 100 }, (_, i) => ({
        username: `test_user_${i}`,
        email: `test${i}@example.com`,
        created_at: new Date()
      }));
      
      const fields = Object.keys(testData[0]);
      const values = testData.map(item => Object.values(item));
      const placeholders = fields.map(() => '?').join(',');
      
      const sql = `INSERT INTO users (${fields.join(',')}) VALUES (${placeholders})`;
      const [batchResult] = await pool.execute(sql, values);
      
      const batchTestTime = Date.now() - batchTestStart;
      
      results.batchOperationPerformance = {
        operation: 'INSERT',
        recordsCount: testData.length,
        executionTime: batchTestTime,
        affectedRows: batchResult.affectedRows
      };
      
      // 清理测试数据
      await pool.execute('DELETE FROM users WHERE username LIKE "test_user_%"');
      
    } catch (error) {
      console.error('性能测试失败:', error.message);
      results.error = error.message;
    }
    
    return results;
  }

  // 生成性能报告
  async generatePerformanceReport() {
    console.log('📊 开始生成性能报告...');
    
    // 收集所有指标
    const dbMetrics = await this.getDatabaseMetrics();
    const appMetrics = this.getApplicationMetrics();
    const sysMetrics = await this.getSystemMetrics();
    const perfTest = await this.runPerformanceTest();
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      database: dbMetrics,
      application: appMetrics,
      system: sysMetrics,
      performanceTest: perfTest,
      recommendations: this.generateRecommendations(dbMetrics, appMetrics, sysMetrics, perfTest)
    };
    
    // 保存报告
    const reportFile = path.join(__dirname, `../logs/performance_report_${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`✅ 性能报告已生成: ${reportFile}`);
    
    // 打印摘要
    this.printReportSummary(report);
    
    return report;
  }

  // 生成性能建议
  generateRecommendations(dbMetrics, appMetrics, sysMetrics, perfTest) {
    const recommendations = [];
    
    if (dbMetrics) {
      const pool = dbMetrics.connectionPool;
      
      if (pool.activeConnections > pool.totalConnections * 0.8) {
        recommendations.push({
          type: 'warning',
          category: 'database',
          message: '数据库连接池使用率过高，建议增加连接池大小或优化查询'
        });
      }
      
      if (dbMetrics.databaseStatus.slowQueries > 0) {
        recommendations.push({
          type: 'warning',
          category: 'database',
          message: '检测到慢查询，建议优化SQL语句或添加索引'
        });
      }
    }
    
    const memUsage = appMetrics.memory;
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (memUsagePercent > 80) {
      recommendations.push({
        type: 'warning',
        category: 'application',
        message: '内存使用率过高，建议检查内存泄漏或增加内存限制'
      });
    }
    
    if (perfTest.queryPerformance && perfTest.queryPerformance.executionTime > 1000) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        message: '查询执行时间过长，建议优化数据库索引'
      });
    }
    
    return recommendations;
  }

  // 打印报告摘要
  printReportSummary(report) {
    console.log('\n📋 性能报告摘要:');
    console.log('=' * 50);
    
    if (report.database) {
      console.log('🗄️ 数据库状态:');
      console.log(`  连接池: ${report.database.connectionPool.activeConnections}/${report.database.connectionPool.totalConnections}`);
      console.log(`  慢查询: ${report.database.databaseStatus.slowQueries}`);
      console.log(`  运行线程: ${report.database.databaseStatus.threadsRunning}`);
    }
    
    console.log('\n💻 应用状态:');
    console.log(`  运行时间: ${Math.floor(report.application.uptime / 3600)}小时`);
    console.log(`  内存使用: ${Math.round(report.application.memory.heapUsed / 1024 / 1024)}MB`);
    
    console.log('\n⚡ 性能测试:');
    if (report.performanceTest.queryPerformance) {
      console.log(`  查询时间: ${report.performanceTest.queryPerformance.executionTime}ms`);
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n⚠️ 建议:');
      report.recommendations.forEach(rec => {
        console.log(`  - ${rec.message}`);
      });
    }
  }

  // 实时监控
  async startRealTimeMonitoring(interval = 5000) {
    console.log(`🔄 开始实时监控 (间隔: ${interval}ms)`);
    
    const monitor = setInterval(async () => {
      try {
        const dbMetrics = await this.getDatabaseMetrics();
        const appMetrics = this.getApplicationMetrics();
        
        console.log(`\n[${new Date().toLocaleTimeString()}] 监控数据:`);
        console.log(`  数据库连接: ${dbMetrics?.connectionPool?.activeConnections || 0}`);
        console.log(`  内存使用: ${Math.round(appMetrics.memory.heapUsed / 1024 / 1024)}MB`);
        console.log(`  运行时间: ${Math.floor(appMetrics.uptime / 60)}分钟`);
        
      } catch (error) {
        console.error('监控数据获取失败:', error.message);
      }
    }, interval);
    
    return monitor;
  }
}

// 命令行接口
async function main() {
  const monitor = new PerformanceMonitor();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'report':
        await monitor.generatePerformanceReport();
        break;
        
      case 'monitor':
        const interval = parseInt(args[0]) || 5000;
        const monitorInterval = await monitor.startRealTimeMonitoring(interval);
        
        // 运行30分钟后停止
        setTimeout(() => {
          clearInterval(monitorInterval);
          console.log('\n⏹️ 监控已停止');
          process.exit(0);
        }, 30 * 60 * 1000);
        break;
        
      case 'test':
        const testResults = await monitor.runPerformanceTest();
        console.log('🧪 性能测试结果:');
        console.log(JSON.stringify(testResults, null, 2));
        break;
        
      default:
        console.log('📊 性能监控工具');
        console.log('');
        console.log('用法:');
        console.log('  node performance-monitor.js report              # 生成性能报告');
        console.log('  node performance-monitor.js monitor [间隔ms]   # 实时监控');
        console.log('  node performance-monitor.js test               # 运行性能测试');
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

module.exports = PerformanceMonitor; 