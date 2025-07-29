const { syncQueue, getQueueStatus } = require('./sync-queue');
const { getMongoConnection } = require('../config/db-connection');
const logger = require('../utils/logger');

class SyncCronService {
    constructor() {
        this.isRunning = false;
        this.cronInterval = 5 * 60 * 1000; // 5分钟
        this.lastRun = null;
        this.runCount = 0;
        this.errorCount = 0;
    }

    // 启动定时同步
    start() {
        if (this.isRunning) {
            logger.warn('定时同步服务已在运行');
            return;
        }

        this.isRunning = true;
        logger.info('启动定时同步服务', { interval: this.cronInterval });

        // 立即执行一次
        this.runSync();

        // 设置定时器
        this.timer = setInterval(() => {
            this.runSync();
        }, this.cronInterval);
    }

    // 停止定时同步
    stop() {
        if (!this.isRunning) {
            logger.warn('定时同步服务未在运行');
            return;
        }

        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        logger.info('定时同步服务已停止');
    }

    // 执行同步
    async runSync() {
        if (!this.isRunning) {
            return;
        }

        const startTime = Date.now();
        this.lastRun = new Date();
        this.runCount++;

        try {
            logger.info('开始定时同步任务', { 
                runCount: this.runCount,
                lastRun: this.lastRun 
            });

            // 获取队列状态
            const queueStatus = getQueueStatus();
            
            if (queueStatus.queueSize > 0) {
                logger.info('发现待同步文档', { queueSize: queueStatus.queueSize });
                
                // 强制刷新队列
                await syncQueue.flushAll();
                
                const duration = Date.now() - startTime;
                logger.info('定时同步完成', { 
                    duration,
                    queueSize: queueStatus.queueSize 
                });
            } else {
                logger.debug('队列为空，跳过同步');
            }

        } catch (error) {
            this.errorCount++;
            logger.error('定时同步失败', { 
                error: error.message,
                runCount: this.runCount,
                errorCount: this.errorCount 
            });
        }
    }

    // 手动触发同步
    async manualSync() {
        logger.info('手动触发同步');
        await this.runSync();
    }

    // 获取服务状态
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            runCount: this.runCount,
            errorCount: this.errorCount,
            cronInterval: this.cronInterval,
            queueStatus: getQueueStatus()
        };
    }

    // 健康检查
    async healthCheck() {
        try {
            const status = this.getStatus();
            const queueStatus = status.queueStatus;
            
            // 检查队列是否积压
            const isQueueHealthy = queueStatus.queueSize < 100;
            
            // 检查错误率
            const errorRate = status.runCount > 0 ? status.errorCount / status.runCount : 0;
            const isErrorRateHealthy = errorRate < 0.1; // 错误率小于10%
            
            // 检查最后运行时间
            const timeSinceLastRun = status.lastRun ? Date.now() - status.lastRun.getTime() : Infinity;
            const isTimingHealthy = timeSinceLastRun < this.cronInterval * 2; // 不超过2个周期
            
            const isHealthy = isQueueHealthy && isErrorRateHealthy && isTimingHealthy;
            
            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                isRunning: status.isRunning,
                queueSize: queueStatus.queueSize,
                errorRate: errorRate,
                timeSinceLastRun: timeSinceLastRun,
                details: {
                    queueHealthy: isQueueHealthy,
                    errorRateHealthy: isErrorRateHealthy,
                    timingHealthy: isTimingHealthy
                }
            };
        } catch (error) {
            logger.error('同步服务健康检查失败', { error: error.message });
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

// 创建全局单例
const syncCronService = new SyncCronService();

module.exports = {
    syncCronService,
    startSyncCron: () => syncCronService.start(),
    stopSyncCron: () => syncCronService.stop(),
    manualSync: () => syncCronService.manualSync(),
    getSyncStatus: () => syncCronService.getStatus(),
    healthCheck: () => syncCronService.healthCheck()
}; 