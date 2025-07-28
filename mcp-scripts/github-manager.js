// GitHub管理脚本
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class GitHubManager {
    constructor() {
        this.owner = 'painfulChen';
        this.repo = 'offercome';
    }

    async commit(message) {
        try {
            console.log('📝 提交代码...');
            await execAsync('git add .');
            await execAsync(`git commit -m "${message}"`);
            console.log('✅ 代码提交成功');
        } catch (error) {
            console.error('❌ 代码提交失败:', error.message);
            throw error;
        }
    }

    async push(branch = 'main') {
        try {
            console.log(`🚀 推送到 ${branch} 分支...`);
            await execAsync(`git push origin ${branch}`);
            console.log('✅ 代码推送成功');
        } catch (error) {
            console.error('❌ 代码推送失败:', error.message);
            throw error;
        }
    }

    async pull(branch = 'main') {
        try {
            console.log(`📥 拉取 ${branch} 分支...`);
            await execAsync(`git pull origin ${branch}`);
            console.log('✅ 代码拉取成功');
        } catch (error) {
            console.error('❌ 代码拉取失败:', error.message);
            throw error;
        }
    }

    async createBranch(branchName) {
        try {
            console.log(`🌿 创建分支: ${branchName}`);
            await execAsync(`git checkout -b ${branchName}`);
            console.log('✅ 分支创建成功');
        } catch (error) {
            console.error('❌ 分支创建失败:', error.message);
            throw error;
        }
    }

    async getStatus() {
        try {
            console.log('📊 获取Git状态...');
            const { stdout } = await execAsync('git status');
            return stdout;
        } catch (error) {
            console.error('❌ 获取Git状态失败:', error.message);
            throw error;
        }
    }
}

module.exports = GitHubManager;
