#!/usr/bin/env node

/**
 * OfferCome 数据库初始化脚本
 * 用于创建完整的数据库表结构和初始数据
 */

const dbManager = require('./config/database-enhanced');
const path = require('path');

async function initDatabase() {
    try {
        console.log('🚀 开始初始化 OfferCome 数据库...');
        
        // 连接数据库
        await dbManager.connect();
        
        // 初始化数据库表结构
        await dbManager.initDatabase();
        
        console.log('✅ 数据库初始化完成！');
        console.log('📊 已创建以下表结构:');
        console.log('   - users (用户表)');
        console.log('   - sales_consultants (销售顾问表)');
        console.log('   - teachers (老师表)');
        console.log('   - leads (潜在客户表)');
        console.log('   - assessments (测评记录表)');
        console.log('   - packages (套餐表)');
        console.log('   - orders (订单表)');
        console.log('   - tasks (任务表)');
        console.log('   - courses (课程表)');
        console.log('   - interviews (面试记录表)');
        console.log('   - files (文件表)');
        console.log('   - notifications (通知表)');
        console.log('   - referral_codes (推荐码表)');
        console.log('   - referral_records (推荐记录表)');
        console.log('   - system_configs (系统配置表)');
        console.log('   - operation_logs (操作日志表)');
        
        // 验证数据库连接
        const testQuery = await dbManager.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?', [dbManager.config.database]);
        console.log(`📈 数据库中共有 ${testQuery[0].table_count} 个表`);
        
        // 检查初始数据
        const configCount = await dbManager.query('SELECT COUNT(*) as count FROM system_configs');
        const packageCount = await dbManager.query('SELECT COUNT(*) as count FROM packages');
        
        console.log(`⚙️  系统配置: ${configCount[0].count} 条`);
        console.log(`📦 套餐数据: ${packageCount[0].count} 条`);
        
        console.log('\n🎉 数据库初始化成功！可以开始使用 OfferCome 平台了。');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        process.exit(1);
    } finally {
        // 关闭数据库连接
        await dbManager.disconnect();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    initDatabase().then(() => {
        console.log('✅ 脚本执行完成');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = { initDatabase }; 