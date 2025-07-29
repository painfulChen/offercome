const fs = require('fs');
const path = require('path');

class CostTracker {
    constructor() {
        this.logFile = process.env.NODE_ENV === 'production' 
            ? '/tmp/cost-tracker.log' 
            : path.join(__dirname, '../logs/cost-tracker.log');
        
        this.ensureLogFile();
    }

    // 确保日志文件存在
    ensureLogFile() {
        try {
            const logDir = path.dirname(this.logFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            // 如果文件不存在，创建文件并写入标题行
            if (!fs.existsSync(this.logFile)) {
                const header = 'date,time,api_type,calls,cost,status\n';
                fs.writeFileSync(this.logFile, header);
            }
        } catch (error) {
            console.error('创建成本日志文件失败:', error);
        }
    }

    // 记录成本
    logCost(apiType, status, cost = 0) {
        try {
            const timestamp = new Date().toISOString().split('T');
            const date = timestamp[0];
            const time = timestamp[1].split('.')[0];
            
            const logEntry = `${date},${time},${apiType},1,${cost.toFixed(2)},${status}\n`;
            
            fs.appendFileSync(this.logFile, logEntry);
            console.log(`💰 成本记录: ${apiType} - ¥${cost.toFixed(2)} - ${status}`);
            
            return true;
        } catch (error) {
            console.error('成本记录失败:', error);
            return false;
        }
    }

    // 获取成本统计
    getStats() {
        try {
            if (!fs.existsSync(this.logFile)) {
                return {
                    success: true,
                    total_cost: 0,
                    total_calls: 0,
                    api_types: {},
                    message: '暂无成本数据'
                };
            }

            const logData = fs.readFileSync(this.logFile, 'utf8').split('\n').filter(line => line.trim());
            
            // 跳过标题行
            const dataLines = logData.slice(1);
            
            if (dataLines.length === 0) {
                return {
                    success: true,
                    total_cost: 0,
                    total_calls: 0,
                    api_types: {},
                    message: '暂无成本数据'
                };
            }

            const stats = {
                total_cost: 0,
                total_calls: 0,
                api_types: {}
            };

            dataLines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 6) {
                    const [date, time, apiType, calls, cost, status] = parts;
                    
                    if (apiType && calls && cost) {
                        const callCount = parseInt(calls) || 0;
                        const costValue = parseFloat(cost) || 0;
                        
                        stats.total_calls += callCount;
                        stats.total_cost += costValue;
                        
                        if (!stats.api_types[apiType]) {
                            stats.api_types[apiType] = { calls: 0, cost: 0 };
                        }
                        stats.api_types[apiType].calls += callCount;
                        stats.api_types[apiType].cost += costValue;
                    }
                }
            });

            return {
                success: true,
                ...stats,
                message: `统计完成，共${stats.total_calls}次调用，总成本¥${stats.total_cost.toFixed(2)}`
            };
        } catch (error) {
            console.error('获取成本统计失败:', error);
            return {
                success: false,
                error: '统计计算失败',
                message: error.message,
                total_cost: 0,
                total_calls: 0,
                api_types: {}
            };
        }
    }

    // 清除成本日志
    clearLog() {
        try {
            if (fs.existsSync(this.logFile)) {
                const header = 'date,time,api_type,calls,cost,status\n';
                fs.writeFileSync(this.logFile, header);
                console.log('✅ 成本日志已清除');
                return true;
            }
            return false;
        } catch (error) {
            console.error('清除成本日志失败:', error);
            return false;
        }
    }

    // 获取日志文件路径
    getLogFilePath() {
        return this.logFile;
    }

    // 获取最近的记录
    getRecentRecords(limit = 10) {
        try {
            if (!fs.existsSync(this.logFile)) {
                return [];
            }

            const logData = fs.readFileSync(this.logFile, 'utf8').split('\n').filter(line => line.trim());
            const dataLines = logData.slice(1); // 跳过标题行
            
            return dataLines.slice(-limit).map(line => {
                const parts = line.split(',');
                if (parts.length >= 6) {
                    return {
                        date: parts[0],
                        time: parts[1],
                        apiType: parts[2],
                        calls: parseInt(parts[3]) || 0,
                        cost: parseFloat(parts[4]) || 0,
                        status: parts[5]
                    };
                }
                return null;
            }).filter(record => record !== null);
        } catch (error) {
            console.error('获取最近记录失败:', error);
            return [];
        }
    }
}

module.exports = CostTracker; 