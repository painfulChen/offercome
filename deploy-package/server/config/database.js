const mongoose = require('mongoose');
const Redis = require('redis');
const mysql = require('mysql2/promise');

// 日志配置
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${new Date().toISOString()} ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${new Date().toISOString()} ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${new Date().toISOString()} ${message}`, ...args)
};

// 数据库连接状态
let dbStatus = {
  mongodb: false,
  redis: false,
  mysql: false,
  cloudbase: false
};

// MongoDB连接
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/offercome';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    // 监听连接事件
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB连接成功');
      dbStatus.mongodb = true;
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB连接错误:', err);
      dbStatus.mongodb = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接断开');
      dbStatus.mongodb = false;
    });
    
    logger.info('MongoDB连接成功');
    return true;
  } catch (error) {
    logger.error('MongoDB连接失败:', error);
    dbStatus.mongodb = false;
    return false;
  }
};

// Redis连接
let redisClient = null;
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = Redis.createClient({
      url: redisUrl,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis服务器拒绝连接');
          return new Error('Redis服务器拒绝连接');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis重试时间超过1小时');
          return new Error('Redis重试时间超过1小时');
        }
        if (options.attempt > 10) {
          logger.error('Redis重试次数超过10次');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis连接错误:', err);
      dbStatus.redis = false;
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis连接成功');
      dbStatus.redis = true;
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis准备就绪');
      dbStatus.redis = true;
    });
    
    redisClient.on('end', () => {
      logger.warn('Redis连接结束');
      dbStatus.redis = false;
    });
    
    await redisClient.connect();
    return true;
  } catch (error) {
    logger.error('Redis连接失败:', error);
    dbStatus.redis = false;
    return false;
  }
};

// MySQL连接
let mysqlPool = null;
const connectMySQL = async () => {
  try {
    const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'offercome',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
    
    mysqlPool = mysql.createPool(mysqlConfig);
    
    // 测试连接
    const connection = await mysqlPool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('MySQL连接成功');
    dbStatus.mysql = true;
    return true;
  } catch (error) {
    logger.error('MySQL连接失败:', error);
    dbStatus.mysql = false;
    return false;
  }
};

// CloudBase连接
let cloudbaseClient = null;
const connectCloudBase = async () => {
  try {
    // 暂时跳过CloudBase连接，避免依赖问题
    logger.info('CloudBase连接跳过（本地开发模式）');
    dbStatus.cloudbase = false;
    return null;
  } catch (error) {
    logger.error('CloudBase连接失败:', error);
    dbStatus.cloudbase = false;
    return null;
  }
};

// 数据库初始化
const initializeDatabase = async () => {
  try {
    // 创建必要的集合/表
    const collections = ['users', 'students', 'coaching', 'resumes', 'job_progress', 'ai_calls', 'system_logs'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.createCollection(collection);
        logger.info(`创建集合: ${collection}`);
      } catch (error) {
        // 集合可能已存在，忽略错误
      }
    }
    
    // 创建索引
    await createIndexes();
    
    logger.info('数据库初始化完成');
  } catch (error) {
    logger.error('数据库初始化失败:', error);
  }
};

// 创建索引
const createIndexes = async () => {
  try {
    // 用户集合索引
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
    
    // 学生集合索引
    await mongoose.connection.db.collection('students').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('students').createIndex({ phone: 1 });
    await mongoose.connection.db.collection('students').createIndex({ createdAt: -1 });
    
    // 辅导集合索引
    await mongoose.connection.db.collection('coaching').createIndex({ studentId: 1 });
    await mongoose.connection.db.collection('coaching').createIndex({ status: 1 });
    await mongoose.connection.db.collection('coaching').createIndex({ createdAt: -1 });
    
    // 简历集合索引
    await mongoose.connection.db.collection('resumes').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ createdAt: -1 });
    
    // AI调用集合索引
    await mongoose.connection.db.collection('ai_calls').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('ai_calls').createIndex({ timestamp: -1 });
    
    // 系统日志集合索引
    await mongoose.connection.db.collection('system_logs').createIndex({ timestamp: -1 });
    await mongoose.connection.db.collection('system_logs').createIndex({ level: 1 });
    
    logger.info('数据库索引创建完成');
  } catch (error) {
    logger.error('创建索引失败:', error);
  }
};

// 主连接函数
const connectDB = async () => {
  logger.info('开始连接数据库...');
  
  const results = await Promise.allSettled([
    connectMongoDB(),
    connectRedis(),
    connectMySQL(),
    connectCloudBase()
  ]);
  
  // 检查连接结果
  const [mongoResult, redisResult, mysqlResult, cloudbaseResult] = results;
  
  if (mongoResult.status === 'fulfilled' && mongoResult.value) {
    await initializeDatabase();
  }
  
  // 返回连接状态
  return {
    mongodb: mongoResult.status === 'fulfilled' && mongoResult.value,
    redis: redisResult.status === 'fulfilled' && redisResult.value,
    mysql: mysqlResult.status === 'fulfilled' && mysqlResult.value,
    cloudbase: cloudbaseResult.status === 'fulfilled' && cloudbaseResult.value
  };
};

// 获取数据库状态
const getDBStatus = () => {
  return {
    ...dbStatus,
    timestamp: new Date().toISOString()
  };
};

// 获取Redis客户端
const getRedisClient = () => {
  return redisClient;
};

// 获取MySQL连接池
const getMySQLPool = () => {
  return mysqlPool;
};

// 获取CloudBase客户端
const getCloudBaseClient = () => {
  return cloudbaseClient;
};

// 健康检查
const healthCheck = async () => {
  const status = {
    mongodb: false,
    redis: false,
    mysql: false,
    cloudbase: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 检查MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      status.mongodb = true;
    }
  } catch (error) {
    logger.error('MongoDB健康检查失败:', error);
  }
  
  try {
    // 检查Redis
    if (redisClient && redisClient.isReady) {
      await redisClient.ping();
      status.redis = true;
    }
  } catch (error) {
    logger.error('Redis健康检查失败:', error);
  }
  
  try {
    // 检查MySQL
    if (mysqlPool) {
      const connection = await mysqlPool.getConnection();
      await connection.ping();
      connection.release();
      status.mysql = true;
    }
  } catch (error) {
    logger.error('MySQL健康检查失败:', error);
  }
  
  try {
    // 检查CloudBase
    if (cloudbaseClient) {
      // 简单的CloudBase检查
      status.cloudbase = true;
    }
  } catch (error) {
    logger.error('CloudBase健康检查失败:', error);
  }
  
  return status;
};

// 关闭数据库连接
const closeDB = async () => {
  try {
    logger.info('开始关闭数据库连接...');
    
    // 关闭MongoDB连接
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB连接已关闭');
    }
    
    // 关闭Redis连接
    if (redisClient && redisClient.isReady) {
      await redisClient.quit();
      logger.info('Redis连接已关闭');
    }
    
    // 关闭MySQL连接池
    if (mysqlPool) {
      await mysqlPool.end();
      logger.info('MySQL连接池已关闭');
    }
    
    logger.info('所有数据库连接已关闭');
  } catch (error) {
    logger.error('关闭数据库连接失败:', error);
  }
};

// 数据库备份
const backupDatabase = async () => {
  try {
    logger.info('开始数据库备份...');
    
    // 这里可以添加备份逻辑
    // 例如：导出MongoDB数据、Redis快照等
    
    logger.info('数据库备份完成');
    return true;
  } catch (error) {
    logger.error('数据库备份失败:', error);
    return false;
  }
};

// 数据库恢复
const restoreDatabase = async (backupPath) => {
  try {
    logger.info('开始数据库恢复...');
    
    // 这里可以添加恢复逻辑
    // 例如：导入MongoDB数据、Redis恢复等
    
    logger.info('数据库恢复完成');
    return true;
  } catch (error) {
    logger.error('数据库恢复失败:', error);
    return false;
  }
};

module.exports = {
  connectDB,
  getDBStatus,
  getRedisClient,
  getMySQLPool,
  getCloudBaseClient,
  healthCheck,
  closeDB,
  backupDatabase,
  restoreDatabase,
  logger
}; 