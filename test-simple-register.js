const db = require('./server/config/database-cloud');
const bcrypt = require('bcryptjs');

async function testRegister() {
    try {
        console.log('🔍 测试用户注册...');
        
        // 1. 检查用户是否已存在
        const existingUser = await db.getUserByEmail('newuser123@example.com');
        if (existingUser) {
            console.log('⚠️  用户已存在，跳过创建');
            return;
        }
        
        // 2. 加密密码
        const passwordHash = await bcrypt.hash('test123', 10);
        console.log('✅ 密码加密成功');
        
        // 3. 创建用户
        const result = await db.createUser('newuser123', 'newuser123@example.com', passwordHash);
        console.log('✅ 用户创建成功:', result);
        
        // 4. 验证用户
        const user = await db.getUserByEmail('newuser123@example.com');
        console.log('✅ 用户验证成功:', user);
        
    } catch (error) {
        console.error('❌ 注册测试失败:', error.message);
    } finally {
        await db.disconnect();
    }
}

testRegister(); 