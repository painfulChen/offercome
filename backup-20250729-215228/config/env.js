const dotenvFlow = require('dotenv-flow');
const path = require('path');

class EnvironmentManager {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.config = {};
        this.loaded = false;
    }

    // 加载环境配置
    load() {
        if (this.loaded) return this.config;

        try {
            // 根据NODE_ENV加载对应配置
            const configPath = path.join(__dirname, '../../');
            
            // 加载环境变量
            dotenvFlow.config({
                path: configPath,
                node_env: this.env
            });

            // 构建配置对象
            this.config = {
                // 基础配置
                NODE_ENV: process.env.NODE_ENV || 'development',
                PORT: process.env.PORT || 3000,
                
                // CloudBase配置
                CLOUDBASE_ENV_ID: process.env.CLOUDBASE_ENV_ID || 'offercome2025-9g14jitp22f4ddfc',
                CLOUDBASE_SECRET_ID: process.env.CLOUDBASE_SECRET_ID,
                CLOUDBASE_SECRET_KEY: process.env.CLOUDBASE_SECRET_KEY,
                
                // 数据库配置
                MONGODB_URI: process.env.MONGODB_URI,
                REDIS_URL: process.env.REDIS_URL,
                
                // AI服务配置
                OPENAI_API_KEY: process.env.OPENAI_API_KEY,
                KIMI_API_KEY: process.env.KIMI_API_KEY,
                
                // 日志配置
                LOG_LEVEL: process.env.LOG_LEVEL || 'info',
                LOG_FORMAT: process.env.LOG_FORMAT || 'json',
                
                // 安全配置
                JWT_SECRET: process.env.JWT_SECRET,
                CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
                
                // 功能开关
                FEATURES: {
                    AI_CHAT: process.env.FEATURE_AI_CHAT !== 'false',
                    USER_REGISTRATION: process.env.FEATURE_USER_REGISTRATION !== 'false',
                    DATABASE: process.env.FEATURE_DATABASE !== 'false'
                }
            };

            this.loaded = true;
            console.log(`✅ 环境配置加载完成: ${this.env}`);
            
            return this.config;
        } catch (error) {
            console.error('❌ 环境配置加载失败:', error);
            throw error;
        }
    }

    // 获取配置
    get(key, defaultValue = null) {
        if (!this.loaded) this.load();
        
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    // 获取所有配置
    getAll() {
        if (!this.loaded) this.load();
        return { ...this.config };
    }

    // 检查环境
    isDevelopment() {
        return this.env === 'development';
    }

    isProduction() {
        return this.env === 'production';
    }

    isTest() {
        return this.env === 'test';
    }

    // 验证必需配置
    validate() {
        const required = [
            'CLOUDBASE_ENV_ID',
            'JWT_SECRET'
        ];

        const missing = [];
        
        for (const key of required) {
            if (!this.get(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
        }

        return true;
    }

    // 获取环境信息
    getEnvironmentInfo() {
        return {
            environment: this.env,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            features: this.get('FEATURES'),
            timestamp: new Date().toISOString()
        };
    }
}

// 创建单例实例
const envManager = new EnvironmentManager();

module.exports = envManager; 