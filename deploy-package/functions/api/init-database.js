const mongoose = require('mongoose');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const AICall = require('./models/AICall');
const SystemLog = require('./models/SystemLog');

async function initDatabase() {
    try {
        // 连接数据库
        await connectDB();
        console.log('✅ 数据库连接成功');

        // 创建管理员用户
        const adminUser = await User.findOneAndUpdate(
            { username: 'admin' },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ 管理员用户创建成功:', adminUser.username);

        // 创建测试用户
        const testUser = await User.findOneAndUpdate(
            { username: 'user123' },
            {
                username: 'user123',
                email: 'user123@example.com',
                password: 'user123',
                role: 'user',
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ 测试用户创建成功:', testUser.username);

        // 创建一些测试AI调用记录
        const testCalls = [
            {
                userId: adminUser._id,
                username: 'admin',
                endpoint: '/api/ai/chat',
                requestData: { message: '你好，请介绍一下自己' },
                responseData: {
                    message: '你好！我是专业的AI助手，很高兴为您服务。',
                    model: 'kimi-moonshot-v1-8k',
                    cost: 0.0001,
                    inputTokens: 8,
                    outputTokens: 15,
                    totalTokens: 23
                },
                responseTime: 1155,
                cost: 0.0001,
                status: 'success',
                model: 'kimi-moonshot-v1-8k'
            },
            {
                userId: testUser._id,
                username: 'user123',
                endpoint: '/api/ai/chat',
                requestData: { message: '如何学习Java编程？' },
                responseData: {
                    message: '学习Java编程的建议：1. 掌握基础语法 2. 学习面向对象编程 3. 实践项目开发 4. 学习框架和工具',
                    model: 'kimi-moonshot-v1-8k',
                    cost: 0.0002,
                    inputTokens: 10,
                    outputTokens: 45,
                    totalTokens: 55
                },
                responseTime: 1856,
                cost: 0.0002,
                status: 'success',
                model: 'kimi-moonshot-v1-8k'
            }
        ];

        for (const callData of testCalls) {
            await AICall.findOneAndUpdate(
                { 
                    userId: callData.userId,
                    endpoint: callData.endpoint,
                    'requestData.message': callData.requestData.message
                },
                callData,
                { upsert: true }
            );
        }
        console.log('✅ 测试AI调用记录创建成功');

        // 创建一些系统日志
        const testLogs = [
            {
                level: 'INFO',
                module: 'System',
                message: '系统启动成功',
                details: { version: '1.0.0', timestamp: new Date() }
            },
            {
                level: 'INFO',
                module: 'Auth',
                message: '管理员用户登录',
                details: { userId: adminUser._id, username: 'admin' }
            },
            {
                level: 'INFO',
                module: 'AI',
                message: 'AI服务初始化完成',
                details: { model: 'kimi-moonshot-v1-8k', status: 'ready' }
            }
        ];

        for (const logData of testLogs) {
            await SystemLog.findOneAndUpdate(
                { 
                    level: logData.level,
                    module: logData.module,
                    message: logData.message
                },
                logData,
                { upsert: true }
            );
        }
        console.log('✅ 系统日志创建成功');

        console.log('\n🎉 数据库初始化完成！');
        console.log('\n📊 创建的数据：');
        console.log('- 管理员用户: admin / admin123');
        console.log('- 测试用户: user123 / user123');
        console.log('- AI调用记录: 2条');
        console.log('- 系统日志: 3条');

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close();
        console.log('🔌 数据库连接已关闭');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase }; 