// CloudBase管理脚本
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class CloudBaseManager {
    constructor() {
        this.envId = 'offercome2025-9g14jitp22f4ddfc';
    }

    async deployFunction(functionName = 'api') {
        try {
            console.log(`🚀 部署云函数 ${functionName}...`);
            const { stdout } = await execAsync(`tcb functions:deploy ${functionName} --force`);
            console.log('✅ 云函数部署成功');
            return stdout;
        } catch (error) {
            console.error('❌ 云函数部署失败:', error.message);
            throw error;
        }
    }

    async deployHosting(path = 'public/') {
        try {
            console.log('🌐 部署静态网站...');
            const { stdout } = await execAsync(`tcb hosting:deploy ${path}`);
            console.log('✅ 静态网站部署成功');
            return stdout;
        } catch (error) {
            console.error('❌ 静态网站部署失败:', error.message);
            throw error;
        }
    }

    async getFunctionInfo(functionName = 'api') {
        try {
            console.log(`📊 获取云函数信息: ${functionName}`);
            const { stdout } = await execAsync(`tcb functions:detail ${functionName}`);
            return stdout;
        } catch (error) {
            console.error('❌ 获取云函数信息失败:', error.message);
            throw error;
        }
    }

    async listFunctions() {
        try {
            console.log('📋 列出所有云函数...');
            const { stdout } = await execAsync('tcb functions:list');
            return stdout;
        } catch (error) {
            console.error('❌ 列出云函数失败:', error.message);
            throw error;
        }
    }

    async getEnvironmentInfo() {
        try {
            console.log('🌍 获取环境信息...');
            const { stdout } = await execAsync('tcb env:list');
            return stdout;
        } catch (error) {
            console.error('❌ 获取环境信息失败:', error.message);
            throw error;
        }
    }
}

module.exports = CloudBaseManager;
