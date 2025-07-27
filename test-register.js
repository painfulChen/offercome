const mongoose = require('mongoose');
const { connectDB } = require('./server/config/database');
const User = require('./server/models/User');

async function testRegister() {
    try {
        console.log('🔌 正在连接数据库...');
        await connectDB();
        console.log('✅ 数据库连接成功');

        // 测试用户数据
        const testUser = {
            username: 'testuser123',
            email: 'testuser123@example.com',
            password: 'testpass123'
        };

        console.log('📝 测试注册用户:', testUser.username);

        // 检查用户是否已存在
        const existingUser = await User.findOne({ 
            $or: [{ username: testUser.username }, { email: testUser.email }] 
        });

        if (existingUser) {
            console.log('⚠️  用户已存在，删除旧用户');
            await User.findByIdAndDelete(existingUser._id);
        }

        // 创建新用户
        const newUser = await User.create({
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
            role: 'user',
            isActive: true
        });

        console.log('✅ 用户注册成功:', {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

        // 验证密码
        const isValidPassword = await newUser.comparePassword(testUser.password);
        console.log('🔐 密码验证:', isValidPassword ? '✅ 正确' : '❌ 错误');

        // 清理测试用户
        await User.findByIdAndDelete(newUser._id);
        console.log('🧹 测试用户已清理');

        console.log('\n🎉 注册功能测试完成！');
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('详细错误:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 数据库连接已关闭');
    }
}

testRegister(); 