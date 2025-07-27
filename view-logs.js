const fs = require('fs');
const path = require('path');

class LogViewer {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
    }
    
    // 查看最近的请求日志
    viewRecentRequests(limit = 10) {
        const logFile = path.join(this.logDir, 'request-tracker.log');
        
        if (!fs.existsSync(logFile)) {
            console.log('❌ 请求日志文件不存在');
            return [];
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const logs = content.split('='.repeat(80)).filter(log => log.trim());
        
        console.log(`📝 最近的 ${Math.min(limit, logs.length)} 条请求日志:`);
        console.log('='.repeat(80));
        
        logs.slice(-limit).reverse().forEach((log, index) => {
            try {
                const lines = log.split('\n');
                const header = lines[0];
                
                // 找到JSON数据的开始位置
                let jsonStart = -1;
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('{')) {
                        jsonStart = i;
                        break;
                    }
                }
                
                if (jsonStart !== -1) {
                    const data = lines.slice(jsonStart).join('\n');
                    const parsed = JSON.parse(data);
                    
                    console.log(`${index + 1}. ${header}`);
                    console.log(`   方法: ${parsed.method}`);
                    console.log(`   URL: ${parsed.url}`);
                    console.log(`   状态码: ${parsed.statusCode}`);
                    console.log(`   响应时间: ${parsed.responseTime}ms`);
                    console.log(`   IP: ${parsed.ip || 'N/A'}`);
                    console.log(`   用户代理: ${parsed.userAgent || 'N/A'}`);
                    
                    // 显示请求参数
                    if (parsed.body && Object.keys(parsed.body).length > 0) {
                        console.log(`   请求体: ${JSON.stringify(parsed.body)}`);
                    }
                    if (parsed.query && Object.keys(parsed.query).length > 0) {
                        console.log(`   查询参数: ${JSON.stringify(parsed.query)}`);
                    }
                    
                    // 显示响应数据摘要
                    if (parsed.responseData) {
                        if (typeof parsed.responseData === 'string') {
                            console.log(`   响应: ${parsed.responseData.substring(0, 100)}...`);
                        } else {
                            console.log(`   响应: ${JSON.stringify(parsed.responseData).substring(0, 100)}...`);
                        }
                    }
                } else {
                    console.log(`${index + 1}. ${header}`);
                    console.log(`   ❌ 无法解析JSON数据`);
                }
                console.log('-'.repeat(40));
            } catch (error) {
                console.log(`❌ 解析日志失败: ${error.message}`);
                console.log(`   原始日志: ${log.substring(0, 200)}...`);
            }
        });
    }
    
    // 查看错误日志
    viewErrors(limit = 10) {
        const logFile = path.join(this.logDir, 'error-tracker.log');
        
        if (!fs.existsSync(logFile)) {
            console.log('❌ 错误日志文件不存在');
            return [];
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const logs = content.split('='.repeat(80)).filter(log => log.trim());
        
        console.log(`❌ 最近的 ${Math.min(limit, logs.length)} 条错误日志:`);
        console.log('='.repeat(80));
        
        logs.slice(-limit).reverse().forEach((log, index) => {
            try {
                const lines = log.split('\n');
                const header = lines[0];
                const data = lines.slice(1, -1).join('\n');
                
                console.log(`${index + 1}. ${header}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    console.log(`   错误: ${parsed.error.message}`);
                    console.log(`   类型: ${parsed.error.name}`);
                    console.log(`   上下文: ${parsed.context}`);
                    if (parsed.request) {
                        console.log(`   请求: ${parsed.request.method} ${parsed.request.url}`);
                    }
                }
                console.log('-'.repeat(40));
            } catch (error) {
                console.log(`❌ 解析错误日志失败: ${error.message}`);
            }
        });
    }
    
    // 查看性能日志
    viewPerformance(limit = 10) {
        const logFile = path.join(this.logDir, 'performance-tracker.log');
        
        if (!fs.existsSync(logFile)) {
            console.log('❌ 性能日志文件不存在');
            return [];
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const logs = content.split('\n').filter(log => log.trim());
        
        console.log(`⚡ 最近的 ${Math.min(limit, logs.length)} 条性能日志:`);
        console.log('='.repeat(80));
        
        logs.slice(-limit).reverse().forEach((log, index) => {
            try {
                const parsed = JSON.parse(log);
                console.log(`${index + 1}. 操作: ${parsed.operation}`);
                console.log(`   耗时: ${parsed.duration}ms`);
                console.log(`   时间: ${parsed.timestamp}`);
                if (parsed.details) {
                    console.log(`   详情: ${JSON.stringify(parsed.details)}`);
                }
                console.log('-'.repeat(40));
            } catch (error) {
                console.log(`❌ 解析性能日志失败: ${error.message}`);
            }
        });
    }
    
    // 统计日志信息
    getStats() {
        const stats = {
            requests: 0,
            errors: 0,
            performance: 0
        };
        
        const files = [
            { name: 'requests', file: 'request-tracker.log' },
            { name: 'errors', file: 'error-tracker.log' },
            { name: 'performance', file: 'performance-tracker.log' }
        ];
        
        files.forEach(({ name, file }) => {
            const logFile = path.join(this.logDir, file);
            if (fs.existsSync(logFile)) {
                const content = fs.readFileSync(logFile, 'utf8');
                if (name === 'performance') {
                    stats[name] = content.split('\n').filter(line => line.trim()).length;
                } else {
                    stats[name] = content.split('='.repeat(80)).filter(log => log.trim()).length;
                }
            }
        });
        
        return stats;
    }
}

// 命令行接口
if (require.main === module) {
    const viewer = new LogViewer();
    const command = process.argv[2] || 'requests';
    const limit = parseInt(process.argv[3]) || 10;
    
    console.log('📊 日志查看工具');
    console.log('='.repeat(50));
    
    switch (command) {
        case 'requests':
            viewer.viewRecentRequests(limit);
            break;
        case 'errors':
            viewer.viewErrors(limit);
            break;
        case 'performance':
            viewer.viewPerformance(limit);
            break;
        case 'stats':
            const stats = viewer.getStats();
            console.log('📈 日志统计:');
            console.log(`   请求日志: ${stats.requests} 条`);
            console.log(`   错误日志: ${stats.errors} 条`);
            console.log(`   性能日志: ${stats.performance} 条`);
            break;
        default:
            console.log('用法: node view-logs.js [requests|errors|performance|stats] [limit]');
            console.log('示例:');
            console.log('  node view-logs.js requests 20');
            console.log('  node view-logs.js errors 5');
            console.log('  node view-logs.js performance 10');
            console.log('  node view-logs.js stats');
    }
}

module.exports = LogViewer; 