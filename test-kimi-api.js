#!/usr/bin/env node

/**
 * Kimi API 测试脚本
 * 通过CLI调用CloudBase函数，触发真实的Kimi API调用
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class KimiAPITester {
  constructor() {
    this.envId = 'offercome2025-9g14jitp22f4ddfc';
    this.functionName = 'api';
    this.testResults = [];
  }

  async runCommand(command) {
    try {
      console.log(`🔧 执行命令: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`⚠️  警告: ${stderr}`);
      }
      
      // 从CLI输出中提取JSON结果
      const lines = stdout.split('\n');
      let jsonResult = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('返回结果：') || trimmed.startsWith('返回结果:')) {
          // 提取返回结果后面的JSON
          const jsonStart = trimmed.indexOf('{');
          if (jsonStart !== -1) {
            const jsonStr = trimmed.substring(jsonStart);
            try {
              jsonResult = JSON.parse(jsonStr);
              break;
            } catch (e) {
              console.warn('JSON解析失败，尝试下一行');
            }
          }
        }
      }
      
      if (!jsonResult) {
        throw new Error('未找到有效的JSON响应');
      }
      
      return jsonResult;
    } catch (error) {
      console.error(`❌ 命令执行失败: ${error.message}`);
      throw error;
    }
  }

  async testHealth() {
    console.log('\n🏥 测试健康检查...');
    try {
      const result = await this.runCommand(`cloudbase functions:invoke ${this.functionName} -e ${this.envId}`);
      
      if (result.statusCode === 200) {
        const body = JSON.parse(result.body);
        console.log('✅ 健康检查通过');
        console.log(`   消息: ${body.message}`);
        console.log(`   环境: ${body.environment}`);
        console.log(`   Kimi API配置: ${body.kimi_api_configured ? '是' : '否'}`);
        return { success: true, data: body };
      } else {
        console.log('❌ 健康检查失败');
        return { success: false, error: result };
      }
    } catch (error) {
      console.log('❌ 健康检查异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testCostStats() {
    console.log('💰 测试成本统计...');
    try {
      const eventData = { path: '/api/cost/stats', httpMethod: 'GET' };
      const result = await this.runCommand(`cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`);
      
      if (result.success) {
        console.log('✅ 成本统计获取成功');
        console.log(`   总调用次数: ${result.totalCalls || 0}`);
        console.log(`   总成本: ¥${(result.totalCost || 0).toFixed(4)}`);
        console.log(`   成功次数: ${result.successCount || 0}`);
        console.log(`   成功率: ${(result.successRate || 0).toFixed(2)}%`);
        return true;
      } else {
        console.log('❌ 成本统计获取失败');
        console.log(`   错误: ${result.message || '未知错误'}`);
        return false;
      }
    } catch (error) {
      console.log('❌ 成本统计异常:', error.message);
      return false;
    }
  }

  async testAIChat(message = '你好，请介绍一下留学申请的基本流程') {
    console.log('\n🤖 测试AI聊天...');
    console.log(`   问题: ${message}`);
    
    try {
      const eventData = {
        path: '/api/ai/chat',
        httpMethod: 'POST',
        body: JSON.stringify({ message })
      };
      
      const result = await this.runCommand(`cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`);
      
      if (result.statusCode === 200) {
        const body = JSON.parse(result.body);
        console.log('✅ AI聊天成功');
        console.log(`   模型: ${body.model}`);
        console.log(`   成本: ¥${body.cost ? body.cost.toFixed(4) : '0.0000'}`);
        console.log(`   响应时间: ${body.response_time}`);
        console.log(`   回复: ${body.message.substring(0, 100)}...`);
        return { success: true, data: body };
      } else {
        console.log('❌ AI聊天失败');
        return { success: false, error: result };
      }
    } catch (error) {
      console.log('❌ AI聊天异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testAdmissionAdvice() {
    console.log('\n📚 测试招生建议...');
    try {
      const eventData = {
        path: '/api/ai/admission-advice',
        httpMethod: 'GET'
      };
      
      const result = await this.runCommand(`cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`);
      
      if (result.statusCode === 200) {
        const body = JSON.parse(result.body);
        console.log('✅ 招生建议获取成功');
        console.log(`   建议长度: ${body.message.length} 字符`);
        console.log(`   建议内容: ${body.message.substring(0, 100)}...`);
        return { success: true, data: body };
      } else {
        console.log('❌ 招生建议获取失败');
        return { success: false, error: result };
      }
    } catch (error) {
      console.log('❌ 招生建议异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testAIStatus() {
    console.log('\n📊 测试AI状态...');
    try {
      const eventData = {
        path: '/api/ai/status',
        httpMethod: 'GET'
      };
      
      const result = await this.runCommand(`cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`);
      
      if (result.statusCode === 200) {
        const body = JSON.parse(result.body);
        console.log('✅ AI状态检查成功');
        console.log(`   状态: ${body.status}`);
        console.log(`   模型: ${body.model}`);
        console.log(`   API密钥配置: ${body.api_key_configured ? '是' : '否'}`);
        return { success: true, data: body };
      } else {
        console.log('❌ AI状态检查失败');
        return { success: false, error: result };
      }
    } catch (error) {
      console.log('❌ AI状态检查异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🚀 开始Kimi API测试...');
    console.log('=====================================');
    
    const tests = [
      { name: '健康检查', test: () => this.testHealth() },
      { name: '成本统计', test: () => this.testCostStats() },
      { name: 'AI聊天', test: () => this.testAIChat() },
      { name: '招生建议', test: () => this.testAdmissionAdvice() },
      { name: 'AI状态', test: () => this.testAIStatus() }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          name: test.name,
          success: result.success,
          data: result.data,
          error: result.error
        });
      } catch (error) {
        this.testResults.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n📋 测试结果汇总');
    console.log('=====================================');
    
    const successCount = this.testResults.filter(r => r.success).length;
    const totalCount = this.testResults.length;
    
    console.log(`总测试数: ${totalCount}`);
    console.log(`成功数: ${successCount}`);
    console.log(`失败数: ${totalCount - successCount}`);
    console.log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.name}`);
      if (!result.success && result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });
    
    if (successCount === totalCount) {
      console.log('\n🎉 所有测试通过！Kimi API集成成功！');
    } else {
      console.log('\n⚠️  部分测试失败，请检查配置和网络连接。');
    }
  }
}

// 运行测试
async function main() {
  const tester = new KimiAPITester();
  await tester.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = KimiAPITester; 