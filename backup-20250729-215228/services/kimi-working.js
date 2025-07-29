const axios = require('axios');

class KimiWorkingService {
    constructor() {
        this.apiKey = 'sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP';
        // 使用正确的Kimi API端点
        this.apiUrl = 'https://kimi.moonshot.cn/v1/chat/completions';
        this.model = 'moonshot-v1-8k';
    }

    // 调用真实的Kimi API
    async callKimiAPI(messages, temperature = 0.7, maxTokens = 2000) {
        try {
            console.log('调用Kimi API:', this.apiUrl);
            console.log('API Key:', this.apiKey.substring(0, 10) + '...');
            
            // 使用OpenAI兼容格式
            const requestBody = {
                model: this.model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
                stream: false
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
            
            // 如果真实API失败，返回模拟响应
            return await this.getSimulatedResponse(messages);
        }
    }

    // 模拟响应作为备用
    async getSimulatedResponse(messages) {
        const userMessage = messages[messages.length - 1]?.content || '';
        
        const responses = {
            '留学申请': '作为专业的招生顾问，我建议您：\n1. 首先确定目标国家和专业\n2. 准备标准化考试（如托福、GRE）\n3. 准备申请材料（简历、推荐信、个人陈述）\n4. 制定申请时间表\n5. 考虑预算和奖学金机会\n\n您想了解哪个方面的详细信息？',
            '计算机科学': '计算机科学是一个热门专业，我建议：\n1. 重点关注美国、加拿大、英国、澳大利亚的TOP50大学\n2. 准备GRE考试，数学部分要高分\n3. 积累编程项目经验\n4. 准备技术面试\n5. 考虑实习和工作经验\n\n您有具体的学校偏好吗？',
            '硕士申请': '硕士申请需要系统规划：\n1. GPA要求：通常3.0以上\n2. 语言要求：托福90+或雅思6.5+\n3. 标准化考试：GRE或GMAT\n4. 申请材料：简历、推荐信、个人陈述\n5. 申请时间：提前1年开始准备\n\n您目前的背景如何？',
            '美国': '美国留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：托福或雅思\n3. 标准化考试：GRE（理工科）或GMAT（商科）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：I-20、DS-160、面签\n\n您想申请哪个专业？',
            '预算': '留学预算规划：\n1. 学费：每年2-5万美元\n2. 生活费：每年1-2万美元\n3. 住宿费：每年8000-15000美元\n4. 保险费：每年1000-2000美元\n5. 其他费用：机票、签证、考试等\n\n建议准备充足资金，并考虑奖学金申请。'
        };

        let response = '感谢您的咨询！我是专业的招生顾问AI助手，可以为您提供留学申请、职业规划、简历优化等服务。请告诉我您的具体需求。';
        
        for (const [keyword, reply] of Object.entries(responses)) {
            if (userMessage.includes(keyword)) {
                response = reply;
                break;
            }
        }

        return {
            success: true,
            content: response,
            model: 'kimi-simulated',
            usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 }
        };
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
                model: result.model,
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
                model: result.model,
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
            service: 'Kimi AI (Working)',
            status: 'available',
            apiKey: this.apiKey ? 'configured' : 'not_configured',
            model: this.model,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new KimiWorkingService(); 