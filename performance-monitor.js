const os = require('os');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
    constructor() {
        this.stats = {
            cpu: [],
            memory: [],
            disk: [],
            network: []
        };
        this.logFile = path.join(__dirname, 'logs/performance.log');
    }

    // 获取CPU使用率
    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - (100 * idle / total);

        return Math.round(usage * 100) / 100;
    }

    // 获取内存使用情况
    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        const usagePercent = (used / total) * 100;

        return {
            total: this.formatBytes(total),
            used: this.formatBytes(used),
            free: this.formatBytes(free),
            usagePercent: Math.round(usagePercent * 100) / 100
        };
    }

    // 获取磁盘使用情况
    getDiskUsage() {
        try {
            const stats = fs.statSync(__dirname);
            return {
                available: this.formatBytes(stats.size),
                path: __dirname
            };
        } catch (error) {
            return { error: '无法获取磁盘信息' };
        }
    }

    // 获取网络接口信息
    getNetworkInfo() {
        const interfaces = os.networkInterfaces();
        const result = {};

        Object.keys(interfaces).forEach(name => {
            interfaces[name].forEach(netInterface => {
                if (netInterface.family === 'IPv4' && !netInterface.internal) {
                    result[name] = netInterface.address;
                }
            });
        });

        return result;
    }

    // 格式化字节数
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 记录性能数据
    logPerformance() {
        const timestamp = new Date().toISOString();
        const cpuUsage = this.getCPUUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = this.getDiskUsage();
        const networkInfo = this.getNetworkInfo();

        const logEntry = {
            timestamp,
            cpu: cpuUsage,
            memory: memoryUsage,
            disk: diskUsage,
            network: networkInfo
        };

        // 保存到内存
        this.stats.cpu.push({ timestamp, value: cpuUsage });
        this.stats.memory.push({ timestamp, value: memoryUsage.usagePercent });

        // 限制历史记录数量
        if (this.stats.cpu.length > 100) {
            this.stats.cpu.shift();
            this.stats.memory.shift();
        }

        // 写入日志文件
        try {
            const logDir = path.dirname(this.logFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('写入性能日志失败:', error);
        }

        return logEntry;
    }

    // 获取性能统计
    getStats() {
        const cpuAvg = this.stats.cpu.length > 0 
            ? this.stats.cpu.reduce((sum, item) => sum + item.value, 0) / this.stats.cpu.length 
            : 0;
        
        const memoryAvg = this.stats.memory.length > 0 
            ? this.stats.memory.reduce((sum, item) => sum + item.value, 0) / this.stats.memory.length 
            : 0;

        return {
            current: this.logPerformance(),
            averages: {
                cpu: Math.round(cpuAvg * 100) / 100,
                memory: Math.round(memoryAvg * 100) / 100
            },
            history: {
                cpu: this.stats.cpu.length,
                memory: this.stats.memory.length
            }
        };
    }

    // 生成性能报告
    generateReport() {
        const stats = this.getStats();
        
        console.log('📊 性能监控报告');
        console.log('==================================');
        console.log(`🕐 时间: ${new Date().toLocaleString()}`);
        console.log(`💻 CPU使用率: ${stats.current.cpu}%`);
        console.log(`🧠 内存使用: ${stats.current.memory.usagePercent}%`);
        console.log(`💾 内存详情: ${stats.current.memory.used} / ${stats.current.memory.total}`);
        console.log(`💽 磁盘信息: ${stats.current.disk.available || 'N/A'}`);
        console.log(`🌐 网络接口: ${Object.keys(stats.current.network).join(', ')}`);
        console.log('');
        console.log('📈 平均使用率:');
        console.log(`   CPU: ${stats.averages.cpu}%`);
        console.log(`   内存: ${stats.averages.memory}%`);
        console.log('');
        console.log('📋 历史记录:');
        console.log(`   CPU数据点: ${stats.history.cpu}`);
        console.log(`   内存数据点: ${stats.history.memory}`);
        console.log('==================================');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const monitor = new PerformanceMonitor();
    
    console.log('🚀 启动性能监控...');
    console.log('按 Ctrl+C 停止监控\n');
    
    // 立即生成一次报告
    monitor.generateReport();
    
    // 每30秒生成一次报告
    setInterval(() => {
        monitor.generateReport();
    }, 30000);
}

module.exports = PerformanceMonitor; 