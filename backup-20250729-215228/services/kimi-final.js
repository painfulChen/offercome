const axios = require('axios');

class KimiRealService {
    constructor() {
        this.apiKey = 'sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP';
        this.apiUrl = 'https://kimi.moonshot.cn/api/chat-messages';
        this.model = 'moonshot-v1-8k';
    }

    // 调用真实的Kimi API
    async callKimiAPI(messages, temperature = 0.7, maxTokens = 2000) {
        try {
            console.log('调用Kimi API:', this.apiUrl);
            console.log('API Key:', this.apiKey.substring(0, 10) + '...');
            
            const requestBody = {
                name: 'offercome-ai-chat', // 添加必需的name字段
                messages: messages,
                model: this.model,
                stream: false,
                temperature: temperature,
                max_tokens: maxTokens
            };

            console.log('请求体:', JSON.stringify(requestBody, null, 2));
            
            const response = await axios.post(this.apiUrl, requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30秒超时
            });

            console.log('Kimi API响应成功');
            return {
                success: true,
                content: response.data.choices[0].message.content,
                usage: response.data.usage,
                model: this.model
            };
        } catch (error) {
            console.error('Kimi API调用失败:', error.response?.status, error.response?.data || error.message);
            
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // 智能聊天
    async chat(message, context = '') {
        const systemPrompt = `你是一个专业的招生顾问AI助手，专门帮助学生进行留学申请和职业规划。

你的主要职责包括：
1. 提供留学申请建议和策略
2. 分析学生背景和需求
3. 推荐合适的专业和学校
4. 制定申请时间规划
5. 提供简历和文书建议
6. 回答关于留学申请的各种问题

请根据以下背景信息回答用户问题：${context}

请用专业、友好、详细的方式回答，确保信息准确有用。`;

        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: message
            }
        ];

        const result = await this.callKimiAPI(messages);
        
        if (result.success) {
            return {
                success: true,
                message: result.content,
                model: 'kimi-real',
                usage: result.usage,
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                success: false,
                message: 'AI服务暂时不可用，请稍后重试',
                error: result.error,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 生成招生建议
    async generateAdmissionAdvice(studentInfo) {
        const prompt = `基于以下学生信息，生成专业的招生建议：

学生信息：
- 姓名：${studentInfo.name || '未提供'}
- 年龄：${studentInfo.age || '未提供'}
- 当前学历：${studentInfo.education || '未提供'}
- 目标专业：${studentInfo.targetMajor || '未提供'}
- 预算：${studentInfo.budget || '未提供'}
- 特殊需求：${studentInfo.specialNeeds || '无'}

请提供详细的建议，包括：
1. 推荐的专业和学校（按优先级排序）
2. 申请策略和时间规划
3. 预算分配建议
4. 需要准备的材料清单
5. 可能遇到的挑战和解决方案
6. 申请成功率评估

请用专业的语言，提供具体可行的建议。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个专业的留学申请顾问，有丰富的经验帮助学生制定申请策略。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const result = await this.callKimiAPI(messages);
        
        if (result.success) {
            return {
                success: true,
                message: result.content,
                model: 'kimi-real',
                usage: result.usage,
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                success: false,
                message: '招生建议生成失败，请稍后重试',
                error: result.error,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 获取服务状态
    async getServiceStatus() {
        return {
            success: true,
            service: 'Kimi AI (Real)',
            status: 'available',
            apiKey: this.apiKey ? 'configured' : 'not_configured',
            model: this.model,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new KimiRealService(); 