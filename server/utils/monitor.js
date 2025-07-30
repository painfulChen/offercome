// 监控工具 - 实时发现路由问题
const RouteManager = require('./routeManager');

class RouteMonitor {
    constructor() {
        this.routeManager = new RouteManager();
        this.routeMisses = new Map(); // 路径 -> 次数
        this.alertThreshold = 5; // 每分钟超过5次404触发告警
        this.alertWindow = 60000; // 1分钟窗口
        this.lastAlertTime = 0;
    }

    // 记录路由缺失
    recordRouteMiss(path, method) {
        const key = `${method} ${path}`;
        const now = Date.now();
        
        if (!this.routeMisses.has(key)) {
            this.routeMisses.set(key, []);
        }
        
        const misses = this.routeMisses.get(key);
        misses.push(now);
        
        // 清理超过1分钟的记录
        const validMisses = misses.filter(time => now - time < this.alertWindow);
        this.routeMisses.set(key, validMisses);
        
        // 检查是否需要告警
        this.checkAlert(key, validMisses.length);
        
        // 记录到CLS (CloudBase Log Service)
        this.logToCLS(path, method, 'route_miss');
    }

    // 检查告警条件
    checkAlert(path, missCount) {
        const now = Date.now();
        
        if (missCount >= this.alertThreshold && now - this.lastAlertTime > this.alertWindow) {
            this.sendAlert(path, missCount);
            this.lastAlertTime = now;
        }
    }

    // 发送告警
    sendAlert(path, count) {
        const alert = {
            type: 'route_miss_alert',
            path: path,
            count: count,
            threshold: this.alertThreshold,
            timestamp: new Date().toISOString(),
            message: `路由缺失告警: ${path} 在1分钟内被访问 ${count} 次`
        };
        
        console.error('[ROUTE_ALERT]', JSON.stringify(alert));
        
        // 这里可以集成企业微信、钉钉等告警渠道
        this.sendToWeChat(alert);
    }

    // 发送到企业微信
    sendToWeChat(alert) {
        // 企业微信webhook配置
        const webhookUrl = process.env.WECHAT_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn('未配置企业微信webhook，跳过告警发送');
            return;
        }
        
        const message = {
            msgtype: 'text',
            text: {
                content: `🚨 路由缺失告警\n路径: ${alert.path}\n次数: ${alert.count}\n时间: ${alert.timestamp}`
            }
        };
        
        // 这里可以添加实际的HTTP请求发送告警
        console.log('发送企业微信告警:', message);
    }

    // 记录到CLS
    logToCLS(path, method, tag) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            tag: tag,
            path: path,
            method: method,
            message: `路由缺失: ${method} ${path}`
        };
        
        console.log('[CLS_LOG]', JSON.stringify(logEntry));
    }

    // 获取路由缺失统计
    getRouteMissStats() {
        const stats = {};
        for (const [path, misses] of this.routeMisses.entries()) {
            stats[path] = misses.length;
        }
        return stats;
    }

    // 清理过期的路由缺失记录
    cleanup() {
        const now = Date.now();
        for (const [path, misses] of this.routeMisses.entries()) {
            const validMisses = misses.filter(time => now - time < this.alertWindow);
            if (validMisses.length === 0) {
                this.routeMisses.delete(path);
            } else {
                this.routeMisses.set(path, validMisses);
            }
        }
    }

    // 生成监控报告
    generateReport() {
        const stats = this.getRouteMissStats();
        const totalMisses = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        return {
            timestamp: new Date().toISOString(),
            totalMisses: totalMisses,
            uniquePaths: Object.keys(stats).length,
            topMissedPaths: Object.entries(stats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([path, count]) => ({ path, count })),
            alertCount: this.lastAlertTime > 0 ? 1 : 0
        };
    }
}

module.exports = RouteMonitor; 