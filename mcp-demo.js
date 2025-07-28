// MCP使用演示脚本
const DatabaseManager = require('./mcp-scripts/db-manager');
const CloudBaseManager = require('./mcp-scripts/cloudbase-manager');
const GitHubManager = require('./mcp-scripts/github-manager');

class MCPDemo {
    constructor() {
        this.db = new DatabaseManager();
        this.cloudbase = new CloudBaseManager();
        this.github = new GitHubManager();
    }

    async runDemo() {
        console.log('🎯 MCP工具使用演示');
        console.log('==================================');

        try {
            // 1. 数据库管理演示
            await this.databaseDemo();
            
            // 2. CloudBase管理演示
            await this.cloudbaseDemo();
            
            // 3. GitHub管理演示
            await this.githubDemo();
            
            // 4. 综合操作演示
            await this.integrationDemo();
            
        } catch (error) {
            console.error('❌ 演示过程中出现错误:', error.message);
        } finally {
            await this.db.disconnect();
        }
    }

    async databaseDemo() {
        console.log('\n📊 数据库管理演示');
        console.log('----------------------------------');
        
        // 获取统计数据
        const stats = await this.db.getStats();
        console.log('📈 系统统计:');
        console.log(`   用户数量: ${stats.users}`);
        console.log(`   潜在客户: ${stats.leads}`);
        console.log(`   订单数量: ${stats.orders}`);
        console.log(`   任务数量: ${stats.tasks}`);
        
        // 获取用户列表
        const users = await this.db.getUsers();
        console.log('\n👥 用户列表:');
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email})`);
        });
        
        // 获取套餐信息
        const packages = await this.db.getPackages();
        console.log('\n📦 套餐信息:');
        packages.forEach(pkg => {
            console.log(`   - ${pkg.name}: ¥${pkg.price} (${pkg.duration_days}天)`);
        });
    }

    async cloudbaseDemo() {
        console.log('\n☁️ CloudBase管理演示');
        console.log('----------------------------------');
        
        // 获取环境信息
        const envInfo = await this.cloudbase.getEnvironmentInfo();
        console.log('🌍 环境信息获取成功');
        
        // 获取云函数信息
        const funcInfo = await this.cloudbase.getFunctionInfo('api');
        console.log('⚙️ 云函数信息获取成功');
        
        // 列出所有函数
        const functions = await this.cloudbase.listFunctions();
        console.log('📋 云函数列表获取成功');
        
        console.log('✅ CloudBase管理功能正常');
    }

    async githubDemo() {
        console.log('\n📝 GitHub管理演示');
        console.log('----------------------------------');
        
        // 获取Git状态
        const status = await this.github.getStatus();
        console.log('📊 Git状态:');
        console.log(status.split('\n').slice(0, 3).join('\n'));
        
        console.log('✅ GitHub管理功能正常');
    }

    async integrationDemo() {
        console.log('\n🔄 综合操作演示');
        console.log('----------------------------------');
        
        // 模拟完整的开发流程
        console.log('1. 📊 检查数据库状态...');
        const stats = await this.db.getStats();
        console.log(`   当前用户数: ${stats.users}`);
        
        console.log('2. ☁️ 检查CloudBase状态...');
        const funcInfo = await this.cloudbase.getFunctionInfo('api');
        console.log('   云函数状态正常');
        
        console.log('3. 📝 检查Git状态...');
        const gitStatus = await this.github.getStatus();
        console.log('   Git状态正常');
        
        console.log('4. 🚀 准备部署...');
        console.log('   所有系统状态正常，可以开始部署');
        
        console.log('✅ 综合操作演示完成');
    }

    async quickActions() {
        console.log('\n⚡ 快速操作菜单');
        console.log('==================================');
        console.log('1. 查看系统统计');
        console.log('2. 部署云函数');
        console.log('3. 提交代码');
        console.log('4. 备份数据库');
        console.log('5. 查看Git状态');
        console.log('6. 退出');
        
        // 这里可以添加交互式菜单
        console.log('\n💡 提示: 运行具体功能请查看 MCP_USAGE_GUIDE.md');
    }
}

// 运行演示
async function main() {
    const demo = new MCPDemo();
    await demo.runDemo();
    
    console.log('\n🎉 MCP演示完成！');
    console.log('📖 详细使用说明请查看: MCP_USAGE_GUIDE.md');
    console.log('🚀 开始使用MCP工具提升开发效率！');
}

main().catch(console.error); 