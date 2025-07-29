const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.initLogDirectory();
    }

    async initLogDirectory() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error('创建日志目录失败:', error);
        }
    }

    async writeLog(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            pid: process.pid
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        
        try {
            // 写入到对应的日志文件
            const logFile = path.join(this.logDir, `${level}.log`);
            await fs.appendFile(logFile, logLine);
            
            // 同时输出到控制台
            console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
        } catch (error) {
            console.error('写入日志失败:', error);
        }
    }

    async info(message, data = {}) {
        await this.writeLog('info', message, data);
    }

    async error(message, data = {}) {
        await this.writeLog('error', message, data);
    }

    async warn(message, data = {}) {
        await this.writeLog('warn', message, data);
    }

    async debug(message, data = {}) {
        await this.writeLog('debug', message, data);
    }

    // 专门用于文件上传的日志
    async uploadLog(action, fileInfo, result) {
        await this.info(`文件上传 - ${action}`, {
            fileInfo,
            result,
            timestamp: new Date().toISOString()
        });
    }

    // 专门用于RAG操作的日志
    async ragLog(action, data, result) {
        await this.info(`RAG操作 - ${action}`, {
            data,
            result,
            timestamp: new Date().toISOString()
        });
    }

    // 专门用于API调用的日志
    async apiLog(method, path, requestData, responseData, duration) {
        await this.info(`API调用 - ${method} ${path}`, {
            requestData,
            responseData,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
    }

    // 获取日志文件内容
    async getLogs(level = 'info', limit = 100) {
        try {
            const logFile = path.join(this.logDir, `${level}.log`);
            const content = await fs.readFile(logFile, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line);
            return lines.slice(-limit).map(line => JSON.parse(line));
        } catch (error) {
            return [];
        }
    }

    // 清理旧日志
    async cleanOldLogs(days = 7) {
        try {
            const files = await fs.readdir(this.logDir);
            const now = Date.now();
            const maxAge = days * 24 * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(this.logDir, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`已删除旧日志文件: ${file}`);
                }
            }
        } catch (error) {
            console.error('清理旧日志失败:', error);
        }
    }
}

module.exports = new Logger(); 