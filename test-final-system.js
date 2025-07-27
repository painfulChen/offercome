#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class FinalSystemTester {
  constructor() {
    this.envId = 'offercome2025-9g14jitp22f4ddfc';
    this.functionName = 'api';
  }

  async runCommand(command) {
    try {
      console.log(`🔧 执行命令: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.log(`⚠️  警告: ${stderr}`);
      }
      
      // 解析返回的JSON结果
      const lines = stdout.split('\n');
      let jsonResult = null;
      
      for (const line of lines) {
        if (line.includes('返回结果：')) {
          const jsonStr = line.split('返回结果：')[1];
          try {
            const outerResult = JSON.parse(jsonStr);
            // 解析嵌套的body字段
            if (outerResult.body) {
              jsonResult = JSON.parse(outerResult.body);
            } else {
              jsonResult = outerResult;
            }
            break;
          } catch (error) {
            console.log('JSON解析失败:', error.message);
          }
        }
      }
      
      // 如果没有找到"返回结果："，尝试解析整个输出
      if (!jsonResult) {
        try {
          // 查找最后一个有效的JSON对象
          const jsonMatches = stdout.match(/\{[^{}]*\}/g);
          if (jsonMatches && jsonMatches.length > 0) {
            const lastJson = jsonMatches[jsonMatches.length - 1];
            const outerResult = JSON.parse(lastJson);
            if (outerResult.body) {
              jsonResult = JSON.parse(outerResult.body);
            } else {
              jsonResult = outerResult;
            }
          }
        } catch (error) {
          console.log('备用JSON解析失败:', error.message);
        }
      }
      
      return jsonResult || { success: false, error: '未找到有效的JSON响应' };
      
    } catch (error) {
      console.error('命令执行失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testKimiChat() {
    console.log('\n🤖 测试Kimi真实聊天...');
    
    try {
      const eventData = {
        path: '/api/ai/chat',
        httpMethod: 'POST',
        body: JSON.stringify({ message: '你好，请介绍一下自己' })
      };
      
      const result = await this.runCommand(
        `cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`
      );
      
      if (result.success && result.message) {
        console.log('✅ Kimi真实聊天成功!');
        console.log(`   模型: ${result.model || 'unknown'}`);
        console.log(`   成本: ¥${(result.cost || 0).toFixed(4)}`);
        console.log(`   回复长度: ${result.message.length} 字符`);
        console.log(`   回复预览: ${result.message.substring(0, 100)}...`);
        return true;
      } else {
        console.log('❌ Kimi聊天失败');
        console.log(`   错误: ${result.error || '未知错误'}`);
        return false;
      }
      
    } catch (error) {
      console.log('❌ Kimi聊天异常:', error.message);
      return false;
    }
  }

  async testCostTracking() {
    console.log('\n💰 测试成本跟踪...');
    
    try {
      const eventData = {
        path: '/api/cost/stats',
        httpMethod: 'GET'
      };
      
      const result = await this.runCommand(
        `cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`
      );
      
      if (result.success) {
        console.log('✅ 成本跟踪成功!');
        console.log(`   总调用次数: ${result.totalCalls || 0}`);
        console.log(`   总成本: ¥${(result.totalCost || 0).toFixed(4)}`);
        console.log(`   成功次数: ${result.successCount || 0}`);
        console.log(`   成功率: ${(result.successRate || 0).toFixed(2)}%`);
        return true;
      } else {
        console.log('❌ 成本跟踪失败');
        console.log(`   错误: ${result.error || '未知错误'}`);
        return false;
      }
      
    } catch (error) {
      console.log('❌ 成本跟踪异常:', error.message);
      return false;
    }
  }

  async testSystemHealth() {
    console.log('\n🏥 测试系统健康...');
    
    try {
      const eventData = {
        path: '/api/health',
        httpMethod: 'GET'
      };
      
      const result = await this.runCommand(
        `cloudbase functions:invoke ${this.functionName} -e ${this.envId} --params '${JSON.stringify(eventData)}'`
      );
      
      if (result.success) {
        console.log('✅ 系统健康检查通过!');
        console.log(`   状态: ${result.status || 'healthy'}`);
        console.log(`   消息: ${result.message || '系统正常'}`);
        return true;
      } else {
        console.log('❌ 系统健康检查失败');
        console.log(`   错误: ${result.error || '未知错误'}`);
        return false;
      }
      
    } catch (error) {
      console.log('❌ 系统健康检查异常:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 开始最终系统测试...');
    console.log('=====================================\n');
    
    const tests = [
      { name: '系统健康', test: () => this.testSystemHealth() },
      { name: 'Kimi聊天', test: () => this.testKimiChat() },
      { name: '成本跟踪', test: () => this.testCostTracking() }
    ];
    
    let successCount = 0;
    const results = [];
    
    for (const test of tests) {
      console.log(`\n📋 测试: ${test.name}`);
      const success = await test.test();
      results.push({ name: test.name, success });
      if (success) successCount++;
    }
    
    console.log('\n📊 最终测试结果汇总');
    console.log('=====================================');
    console.log(`总测试数: ${tests.length}`);
    console.log(`成功数: ${successCount}`);
    console.log(`失败数: ${tests.length - successCount}`);
    console.log(`成功率: ${((successCount / tests.length) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.name}`);
    });
    
    if (successCount === tests.length) {
      console.log('\n🎉 所有测试通过！系统完全正常！');
      console.log('\n🌐 前端页面地址:');
      console.log('https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/kimi-api-tester.html');
      console.log('\n📝 现在您可以:');
      console.log('- 访问前端页面进行真实AI对话');
      console.log('- 获取真实的Kimi API回复');
      console.log('- 查看实时的成本统计');
      console.log('- 享受完整的用户体验');
    } else {
      console.log('\n⚠️  部分测试失败，请检查配置');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new FinalSystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FinalSystemTester; 