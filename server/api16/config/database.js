const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('../utils/logger');

class DatabaseManager {
    constructor() {
        this.mongoConnection = null;
        this.redisConnection = null;
        this.isConnected = false;
    }

    // 连接MongoDB
    async connectMongo() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rag_system';
            
            this.mongoConnection = await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            logger.info('MongoDB连接成功', { uri: mongoUri });
            return true;
        } catch (error) {
            logger.error('MongoDB连接失败', { error: error.message });
            return false;
        }
    }

    // 连接Redis
    async connectRedis() {
        try {
            const redisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                db: process.env.REDIS_DB || 0,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
            };

            this.redisConnection = new Redis(redisConfig);

            this.redisConnection.on('connect', () => {
                logger.info('Redis连接成功', { host: redisConfig.host, port: redisConfig.port });
            });

            this.redisConnection.on('error', (error) => {
                logger.error('Redis连接错误', { error: error.message });
            });

            return true;
        } catch (error) {
            logger.error('Redis连接失败', { error: error.message });
            return false;
        }
    }

    // 初始化数据库连接
    async initialize() {
        const mongoSuccess = await this.connectMongo();
        const redisSuccess = await this.connectRedis();
        
        // 只要MongoDB连接成功就认为数据库可用
        this.isConnected = mongoSuccess;
        
        if (this.isConnected) {
            logger.info('数据库连接初始化完成');
        } else {
            logger.warn('数据库连接失败，系统将以有限功能运行');
        }
        
        return this.isConnected;
    }

    // 获取MongoDB连接
    getMongoConnection() {
        return this.mongoConnection;
    }

    // 获取Redis连接
    getRedisConnection() {
        return this.redisConnection;
    }

    // 检查连接状态
    isDatabaseConnected() {
        return this.isConnected;
    }

    // 关闭数据库连接
    async close() {
        try {
            if (this.mongoConnection) {
                await mongoose.connection.close();
                logger.info('MongoDB连接已关闭');
            }
            
            if (this.redisConnection) {
                await this.redisConnection.quit();
                logger.info('Redis连接已关闭');
            }
        } catch (error) {
            logger.error('关闭数据库连接失败', { error: error.message });
        }
    }
}

module.exports = new DatabaseManager(); 