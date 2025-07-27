#!/usr/bin/env node

const https = require('https');

class KimiAPITester {
  constructor() {
    this.kimiApiKey = 'sk-reaTT6uRqEqQPZ7HMXp5gmoingV6cZ2dumU8Y4axl9DHN2Jw';
    this.kimiApiUrl = 'api.moonshot.cn'; // 修改为正确的API域名
  }

  // 直接调用Kimi API
  async makeHttpRequest(hostname, path, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      console.log('发送请求到:', `https://${hostname}${path}`);
      console.log('请求数据:', JSON.stringify(data, null, 2));
      
      const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.kimiApiKey}`,
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      };

      console.log('请求头:', options.headers);

      const req = https.request(options, (res) => {
        console.log('响应状态码:', res.statusCode);
        console.log('响应头:', res.headers);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log('原始响应数据:', responseData);
          try {
            const parsedData = JSON.parse(responseData);
            console.log('解析后的响应:', JSON.stringify(parsedData, null, 2));
            resolve(parsedData);
          } catch (error) {
            console.error('JSON解析失败:', error);
            reject(new Error(`JSON解析失败: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('HTTP请求失败:', error);
        reject(new Error(`HTTP请求失败: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  async testKimiChat(message = '你好，请介绍一下自己') {
    console.log('\n🤖 测试Kimi聊天...');
    console.log('问题:', message);
    
    try {
      const requestData = {
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        model: 'moonshot-v1-8k',
        stream: false
      };

      // 尝试不同的API路径
      const apiPaths = [
        '/v1/chat/completions',
        '/api/v1/chat/completions',
        '/chat/completions'
      ];

      let response = null;
      let successfulPath = null;

      for (const path of apiPaths) {
        console.log(`尝试API路径: ${path}`);
        try {
          response = await this.makeHttpRequest(
            this.kimiApiUrl, 
            path, 
            requestData
          );
          
          if (response.choices && response.choices[0] && response.choices[0].message) {
            successfulPath = path;
            break;
          }
        } catch (error) {
          console.log(`路径 ${path} 失败:`, error.message);
          continue;
        }
      }

      if (!successfulPath) {
        throw new Error('所有API路径都失败了');
      }

      console.log(`✅ 成功使用路径: ${successfulPath}`);
      const aiResponse = response.choices[0].message.content;
      console.log('AI回复:', aiResponse);
      
      return {
        success: true,
        message: aiResponse,
        model: 'kimi-moonshot-v1-8k',
        apiPath: successfulPath,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Kimi API调用失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testKimiStatus() {
    console.log('\n📊 测试Kimi API状态...');
    
    try {
      // 尝试调用一个简单的API来测试连接
      const response = await this.makeHttpRequest(
        this.kimiApiUrl, 
        '/api/chat-messages', 
        {
          messages: [{ role: 'user', content: 'test' }],
          model: 'moonshot-v1-8k',
          stream: false
        }
      );
      
      console.log('✅ Kimi API连接正常');
      return { success: true, status: 'connected' };
      
    } catch (error) {
      console.error('❌ Kimi API连接失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🚀 开始直接测试Kimi API...');
    console.log('=====================================\n');
    
    // 测试API状态
    await this.testKimiStatus();
    
    // 测试聊天功能
    await this.testKimiChat('你好，请介绍一下自己');
    
    // 测试具体问题
    await this.testKimiChat('如何学习Java编程？');
    
    console.log('\n📋 测试完成');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new KimiAPITester();
  tester.runAllTests().catch(console.error);
}

module.exports = KimiAPITester; 