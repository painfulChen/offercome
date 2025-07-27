const fs = require('fs');
const path = require('path');

class LoggingService {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.requestLogFile = path.join(this.logDir, 'request-tracker.log');
        this.errorLogFile = path.join(this.logDir, 'error-tracker.log');
        this.performanceLogFile = path.join(this.logDir, 'performance-tracker.log');
        
        // 确保日志目录存在
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    // 记录请求日志
    logRequest(req, res, responseTime, statusCode, responseData) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params,
            responseTime,
            statusCode,
            responseData,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };
        
        const logLine = `[REQUEST] ${timestamp} - ${req.method} ${req.url} - ${statusCode} - ${responseTime}ms\n${JSON.stringify(logEntry, null, 2)}\n${'='.repeat(80)}\n`;
        
        fs.appendFileSync(this.requestLogFile, logLine);
        console.log(`📝 请求日志: ${req.method} ${req.url} - ${statusCode} - ${responseTime}ms`);
    }
    
    // 记录错误日志
    logError(error, req, context = '') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            request: {
                method: req?.method,
                url: req?.url,
                headers: req?.headers,
                body: req?.body
            },
            context
        };
        
        const logLine = `[ERROR] ${timestamp} - ${error.message}\n${JSON.stringify(logEntry, null, 2)}\n${'='.repeat(80)}\n`;
        
        fs.appendFileSync(this.errorLogFile, logLine);
        console.error(`❌ 错误日志: ${error.message}`);
    }
    
    // 记录性能日志
    logPerformance(operation, duration, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            operation,
            duration,
            details
        };
        
        const logLine = `[PERFORMANCE] ${timestamp} - ${operation} - ${duration}ms\n${JSON.stringify(logEntry, null, 2)}\n`;
        
        fs.appendFileSync(this.performanceLogFile, logLine);
        console.log(`⚡ 性能日志: ${operation} - ${duration}ms`);
    }
    
    // 获取最近的日志
    getRecentLogs(type = 'request', limit = 50) {
        const logFile = type === 'error' ? this.errorLogFile : 
                       type === 'performance' ? this.performanceLogFile : 
                       this.requestLogFile;
        
        if (!fs.existsSync(logFile)) {
            return [];
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const logs = content.split('='.repeat(80)).filter(log => log.trim());
        return logs.slice(-limit).reverse();
    }
    
    // 清理旧日志
    cleanupOldLogs(daysToKeep = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        [this.requestLogFile, this.errorLogFile, this.performanceLogFile].forEach(logFile => {
            if (fs.existsSync(logFile)) {
                const content = fs.readFileSync(logFile, 'utf8');
                const logs = content.split('='.repeat(80)).filter(log => log.trim());
                
                const recentLogs = logs.filter(log => {
                    const match = log.match(/\[.*?\] (.*?) -/);
                    if (match) {
                        const logDate = new Date(match[1]);
                        return logDate > cutoffDate;
                    }
                    return true;
                });
                
                fs.writeFileSync(logFile, recentLogs.join('='.repeat(80) + '\n'));
            }
        });
        
        console.log(`🧹 清理了${daysToKeep}天前的日志`);
    }
}

module.exports = LoggingService; 