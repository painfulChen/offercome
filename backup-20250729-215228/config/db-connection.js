const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// 单例连接缓存
let cachedMongoConn = null;
let cachedRedisConn = null;

class DatabaseConnectionManager {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rag_system';
        this.redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            db: process.env.REDIS_DB || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        };
        
        logger.info('数据库连接管理器初始化', { 
            mongoUri: this.mongoUri,
            redisHost: this.redisConfig.host,
            redisPort: this.redisConfig.port
        });
    }

    // 获取MongoDB连接（单例）
    async getMongoConnection() {
        try {
            // 检查现有连接是否有效
            if (cachedMongoConn && cachedMongoConn.readyState === 1) {
                logger.debug('使用缓存的MongoDB连接');
                return cachedMongoConn;
            }

            // 关闭无效连接
            if (cachedMongoConn) {
                try {
                    await cachedMongoConn.close();
                } catch (error) {
                    logger.warn('关闭无效MongoDB连接时出错', { error: error.message });
                }
            }

            // 创建新连接
            logger.info('创建新的MongoDB连接', { uri: this.mongoUri });
            cachedMongoConn = await mongoose.createConnection(this.mongoUri, {
                maxPoolSize: 5,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 30000,
                bufferCommands: true,
                connectTimeoutMS: 10000
            });
            
            // 等待连接就绪
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('MongoDB连接超时'));
                }, 10000);
                
                cachedMongoConn.once('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                cachedMongoConn.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            // 监听连接事件
            cachedMongoConn.on('connected', () => {
                logger.info('MongoDB连接已建立');
            });

            cachedMongoConn.on('error', (error) => {
                logger.error('MongoDB连接错误', { error: error.message });
                cachedMongoConn = null;
            });

            cachedMongoConn.on('disconnected', () => {
                logger.warn('MongoDB连接已断开');
                cachedMongoConn = null;
            });

            return cachedMongoConn;
        } catch (error) {
            logger.error('获取MongoDB连接失败', { error: error.message });
            cachedMongoConn = null;
            throw error;
        }
    }

    // 获取Redis连接（单例）
    async getRedisConnection() {
        try {
            // 检查现有连接是否有效
            if (cachedRedisConn && cachedRedisConn.status === 'ready') {
                logger.debug('使用缓存的Redis连接');
                return cachedRedisConn;
            }

            // 关闭无效连接
            if (cachedRedisConn) {
                try {
                    await cachedRedisConn.quit();
                } catch (error) {
                    logger.warn('关闭无效Redis连接时出错', { error: error.message });
                }
            }

            // 创建新连接
            logger.info('创建新的Redis连接', { host: this.redisConfig.host, port: this.redisConfig.port });
            cachedRedisConn = new Redis(this.redisConfig);

            // 监听连接事件
            cachedRedisConn.on('connect', () => {
                logger.info('Redis连接已建立');
            });

            cachedRedisConn.on('error', (error) => {
                logger.error('Redis连接错误', { error: error.message });
                cachedRedisConn = null;
            });

            cachedRedisConn.on('close', () => {
                logger.warn('Redis连接已关闭');
                cachedRedisConn = null;
            });

            return cachedRedisConn;
        } catch (error) {
            logger.error('获取Redis连接失败', { error: error.message });
            cachedRedisConn = null;
            throw error;
        }
    }

    // 检查连接状态
    async checkConnections() {
        const mongoStatus = cachedMongoConn && cachedMongoConn.readyState === 1 ? 'connected' : 'disconnected';
        const redisStatus = cachedRedisConn && cachedRedisConn.status === 'ready' ? 'connected' : 'disconnected';
        
        return {
            mongo: mongoStatus,
            redis: redisStatus,
            mongoConn: cachedMongoConn,
            redisConn: cachedRedisConn
        };
    }

    // 关闭所有连接
    async closeAllConnections() {
        try {
            if (cachedMongoConn) {
                await cachedMongoConn.close();
                cachedMongoConn = null;
                logger.info('MongoDB连接已关闭');
            }
            
            if (cachedRedisConn) {
                await cachedRedisConn.quit();
                cachedRedisConn = null;
                logger.info('Redis连接已关闭');
            }
        } catch (error) {
            logger.error('关闭数据库连接失败', { error: error.message });
        }
    }

    // 健康检查
    async healthCheck() {
        try {
            const mongoConn = await this.getMongoConnection();
            const redisConn = await this.getRedisConnection();
            
            // 测试MongoDB连接
            if (mongoConn && mongoConn.readyState === 1) {
                try {
                    await mongoConn.db.admin().ping();
                } catch (pingError) {
                    logger.warn('MongoDB ping失败，但连接状态正常', { error: pingError.message });
                }
            }
            
            // 测试Redis连接
            if (redisConn && redisConn.status === 'ready') {
                try {
                    await redisConn.ping();
                } catch (pingError) {
                    logger.warn('Redis ping失败，但连接状态正常', { error: pingError.message });
                }
            }
            
            const mongoStatus = mongoConn && mongoConn.readyState === 1 ? 'connected' : 'disconnected';
            const redisStatus = redisConn && redisConn.status === 'ready' ? 'connected' : 'disconnected';
            
            const isHealthy = mongoStatus === 'connected';
            
            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                mongo: mongoStatus,
                redis: redisStatus,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('数据库健康检查失败', { error: error.message });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// 导出单例实例
const dbConnectionManager = new DatabaseConnectionManager();

module.exports = {
    dbConnectionManager,
    getMongoConnection: () => dbConnectionManager.getMongoConnection(),
    getRedisConnection: () => dbConnectionManager.getRedisConnection(),
    checkConnections: () => dbConnectionManager.checkConnections(),
    healthCheck: () => dbConnectionManager.healthCheck(),
    closeAllConnections: () => dbConnectionManager.closeAllConnections()
}; 