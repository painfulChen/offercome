// CloudBase数据库配置
const mongoose = require('mongoose');

// 数据库连接配置
const dbConfig = {
  // 开发环境 - 本地MongoDB
  development: {
    uri: 'mongodb://localhost:27017/mbti_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // 生产环境 - CloudBase MongoDB
  production: {
    uri: process.env.MONGODB_URI || 
         process.env.DB_URL || 
         'mongodb://localhost:27017/mbti_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    }
  }
};

// 获取当前环境
const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

// 连接数据库
async function connectDatabase() {
  const env = getEnvironment();
  const config = dbConfig[env];
  
  try {
    console.log(`🔗 连接数据库 (${env})...`);
    console.log(`   连接地址: ${config.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    await mongoose.connect(config.uri, config.options);
    
    console.log('✅ 数据库连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      console.error('❌ 数据库连接错误:', error.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  数据库连接断开');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 数据库重新连接成功');
    });
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    
    // 在CloudBase环境中，如果数据库连接失败，我们仍然可以运行
    // 但会记录错误并继续执行
    if (env === 'production') {
      console.warn('⚠️  生产环境数据库连接失败，将使用内存存储模式');
      return false;
    }
    
    throw error;
  }
}

// 检查数据库连接状态
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

// 关闭数据库连接
async function closeDatabase() {
  if (isDatabaseConnected()) {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

module.exports = {
  connectDatabase,
  isDatabaseConnected,
  closeDatabase,
  getEnvironment
}; 