// 增强监控系统 - 高优先级优化
class EnhancedMonitor {
    constructor() {
        this.metrics = {
            apiCalls: 0,
            errors: 0,
            responseTimes: [],
            userSessions: new Set(),
            securityEvents: [],
            performanceData: []
        };
        
        // 定期清理过期数据
        setInterval(() => this.cleanupOldData(), 60000); // 每分钟清理
    }
    
    logAPICall(endpoint, duration, status, clientIP) {
        this.metrics.apiCalls++;
        this.metrics.responseTimes.push({
            endpoint,
            duration,
            status,
            timestamp: Date.now(),
            clientIP
        });
        
        // 记录性能数据
        this.metrics.performanceData.push({
            type: 'api_call',
            endpoint,
            duration,
            status,
            timestamp: Date.now()
        });
        
        // 实时监控告警
        if (duration > 1000) { // 超过1秒的请求
            this.logSlowRequest(endpoint, duration);
        }
        
        if (status >= 400) { // 错误请求
            this.logErrorRequest(endpoint, status);
        }
    }
    
    logError(error, context) {
        this.metrics.errors++;
        
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            severity: this.calculateSeverity(error),
            timestamp: Date.now()
        };
        
        this.metrics.securityEvents.push({
            type: 'error',
            ...errorInfo
        });
        
        // 严重错误立即告警
        if (errorInfo.severity === 'critical') {
            this.sendCriticalAlert(errorInfo);
        }
    }
    
    logSecurityEvent(eventType, details) {
        this.metrics.securityEvents.push({
            type: eventType,
            details,
            timestamp: Date.now()
        });
        
        // 安全事件告警
        if (eventType === 'rate_limit_exceeded' || eventType === 'invalid_input') {
            this.sendSecurityAlert(eventType, details);
        }
    }
    
    calculateSeverity(error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return 'critical';
        }
        if (error.status >= 500) {
            return 'high';
        }
        if (error.status >= 400) {
            return 'medium';
        }
        return 'low';
    }
    
    logSlowRequest(endpoint, duration) {
        console.warn(`慢请求警告: ${endpoint} 耗时 ${duration}ms`);
        
        // 可以发送到监控服务
        this.sendToMonitoring({
            type: 'slow_request',
            endpoint,
            duration,
            timestamp: Date.now()
        });
    }
    
    logErrorRequest(endpoint, status) {
        console.error(`错误请求: ${endpoint} 状态码 ${status}`);
        
        this.sendToMonitoring({
            type: 'error_request',
            endpoint,
            status,
            timestamp: Date.now()
        });
    }
    
    sendCriticalAlert(errorInfo) {
        console.error('🚨 严重错误告警:', errorInfo);
        
        // 这里可以集成到告警系统（如钉钉、企业微信等）
        this.sendToMonitoring({
            type: 'critical_alert',
            ...errorInfo
        });
    }
    
    sendSecurityAlert(eventType, details) {
        console.warn('🔒 安全事件告警:', { eventType, details });
        
        this.sendToMonitoring({
            type: 'security_alert',
            eventType,
            details,
            timestamp: Date.now()
        });
    }
    
    sendToMonitoring(data) {
        // 这里可以发送到外部监控服务
        // 例如：腾讯云监控、阿里云监控等
        console.log('📊 监控数据:', JSON.stringify(data));
    }
    
    cleanupOldData() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // 清理1小时前的性能数据
        this.metrics.performanceData = this.metrics.performanceData.filter(
            data => now - data.timestamp < oneHour
        );
        
        // 清理1小时前的安全事件
        this.metrics.securityEvents = this.metrics.securityEvents.filter(
            event => now - event.timestamp < oneHour
        );
        
        // 清理响应时间数据，只保留最近1000条
        if (this.metrics.responseTimes.length > 1000) {
            this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
        }
    }
    
    getMetrics() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        // 计算最近1分钟的平均响应时间
        const recentResponseTimes = this.metrics.responseTimes.filter(
            data => now - data.timestamp < oneMinute
        );
        
        const avgResponseTime = recentResponseTimes.length > 0 
            ? recentResponseTimes.reduce((sum, data) => sum + data.duration, 0) / recentResponseTimes.length
            : 0;
        
        return {
            totalAPICalls: this.metrics.apiCalls,
            totalErrors: this.metrics.errors,
            errorRate: this.metrics.apiCalls > 0 
                ? (this.metrics.errors / this.metrics.apiCalls * 100).toFixed(2) + '%'
                : '0%',
            avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
            activeSessions: this.metrics.userSessions.size,
            recentSecurityEvents: this.metrics.securityEvents.length,
            uptime: this.getUptime()
        };
    }
    
    getUptime() {
        // 这里可以记录启动时间
        return 'running';
    }
    
    // 健康检查
    async healthCheck() {
        const metrics = this.getMetrics();
        
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics,
            checks: [
                {
                    name: 'api_availability',
                    status: 'pass',
                    details: 'API服务正常运行'
                },
                {
                    name: 'error_rate',
                    status: parseFloat(metrics.errorRate) < 5 ? 'pass' : 'warn',
                    details: `错误率: ${metrics.errorRate}`
                },
                {
                    name: 'response_time',
                    status: parseFloat(metrics.avgResponseTime) < 500 ? 'pass' : 'warn',
                    details: `平均响应时间: ${metrics.avgResponseTime}`
                }
            ]
        };
        
        // 如果有警告或失败，更新整体状态
        const failedChecks = healthStatus.checks.filter(check => check.status === 'fail');
        const warningChecks = healthStatus.checks.filter(check => check.status === 'warn');
        
        if (failedChecks.length > 0) {
            healthStatus.status = 'unhealthy';
        } else if (warningChecks.length > 0) {
            healthStatus.status = 'degraded';
        }
        
        return healthStatus;
    }
}

// 性能追踪工具
class PerformanceTracker {
    static async trackAsync(operation, context) {
        const start = Date.now();
        try {
            const result = await operation();
            const duration = Date.now() - start;
            
            this.logPerformance(context, duration, 'success');
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            this.logPerformance(context, duration, 'error', error);
            throw error;
        }
    }
    
    static logPerformance(context, duration, status, error = null) {
        const logData = {
            type: 'performance',
            context,
            duration,
            status,
            timestamp: Date.now()
        };
        
        if (error) {
            logData.error = error.message;
        }
        
        console.log(JSON.stringify(logData));
    }
}

// 创建全局监控实例
const globalMonitor = new EnhancedMonitor();

module.exports = {
    EnhancedMonitor,
    PerformanceTracker,
    globalMonitor
}; 