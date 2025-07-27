const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        this.kimiApiKey = process.env.KIMI_API_KEY;
        this.kimiApiUrl = 'https://kimi.moonshot.cn/api/chat-messages';
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    // 使用Kimi API
    async chatWithKimi(message, context = '') {
        try {
            if (!this.kimiApiKey) {
                throw new Error('Kimi API Key未配置');
            }

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: `你是一个专业的招生顾问AI助手。请根据以下背景信息回答用户问题：${context}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: response.data.choices[0].message.content,
                model: 'kimi'
            };
        } catch (error) {
            logger.error('Kimi API调用失败:', error.message);
            return {
                success: false,
                message: 'AI服务暂时不可用，请稍后重试',
                error: error.message
            };
        }
    }

    // 使用OpenAI API (备用)
    async chatWithOpenAI(message, context = '') {
        try {
            if (!this.openaiApiKey) {
                throw new Error('OpenAI API Key未配置');
            }

            const response = await axios.post(this.openaiApiUrl, {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `你是一个专业的招生顾问AI助手。请根据以下背景信息回答用户问题：${context}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: response.data.choices[0].message.content,
                model: 'openai'
            };
        } catch (error) {
            logger.error('OpenAI API调用失败:', error.message);
            return {
                success: false,
                message: 'AI服务暂时不可用，请稍后重试',
                error: error.message
            };
        }
    }

    // 智能选择AI服务
    async chat(message, context = '') {
        // 优先使用Kimi
        if (this.kimiApiKey) {
            const kimiResult = await this.chatWithKimi(message, context);
            if (kimiResult.success) {
                return kimiResult;
            }
        }

        // 备用OpenAI
        if (this.openaiApiKey) {
            return await this.chatWithOpenAI(message, context);
        }

        return {
            success: false,
            message: 'AI服务未配置，请联系管理员',
            error: 'No AI service configured'
        };
    }

    // 图像生成
    async generateImage(prompt, size = '1024x1024') {
        try {
            // 这里可以集成DALL-E或其他图像生成API
            return {
                success: true,
                message: '图像生成功能正在开发中',
                imageUrl: null
            };
        } catch (error) {
            logger.error('图像生成失败:', error.message);
            return {
                success: false,
                message: '图像生成服务暂时不可用',
                error: error.message
            };
        }
    }

    // 文本分析
    async analyzeText(text, type = 'general') {
        const prompt = `请分析以下文本，分析类型：${type}\n\n文本内容：${text}`;
        return await this.chat(prompt, '文本分析专家');
    }

    // 代码生成
    async generateCode(description, language = 'javascript') {
        const prompt = `请用${language}语言生成以下功能的代码：${description}`;
        return await this.chat(prompt, '专业程序员');
    }

    // 文档生成
    async generateDocumentation(code, language = 'javascript') {
        const prompt = `请为以下${language}代码生成详细的文档说明：\n\n${code}`;
        return await this.chat(prompt, '技术文档专家');
    }

    // 问答功能
    async answerQuestion(question, context = []) {
        const contextStr = context.length > 0 ? `背景信息：${context.join('\n')}\n\n` : '';
        const prompt = `${contextStr}问题：${question}`;
        return await this.chat(prompt, '专业问答助手');
    }

    // 获取可用模型
    async getAvailableModels() {
        return {
            success: true,
            models: [
                { id: 'kimi', name: 'Kimi AI', available: !!this.kimiApiKey },
                { id: 'openai', name: 'OpenAI GPT', available: !!this.openaiApiKey }
            ]
        };
    }

    // 批量处理
    async batchProcess(tasks) {
        const results = [];
        
        for (const task of tasks) {
            try {
                let result;
                
                switch (task.type) {
                    case 'chat':
                        result = await this.chat(task.message, task.context);
                        break;
                    case 'image':
                        result = await this.generateImage(task.prompt, task.size);
                        break;
                    case 'analyze':
                        result = await this.analyzeText(task.text, task.analysisType);
                        break;
                    case 'code':
                        result = await this.generateCode(task.description, task.language);
                        break;
                    case 'qa':
                        result = await this.answerQuestion(task.question, task.context);
                        break;
                    default:
                        result = { success: false, error: '不支持的任务类型' };
                }
                
                results.push({
                    id: task.id,
                    type: task.type,
                    result
                });
            } catch (error) {
                results.push({
                    id: task.id,
                    type: task.type,
                    result: { success: false, error: error.message }
                });
            }
        }
        
        return results;
    }

    // 生成招生建议
    async generateAdmissionAdvice(studentInfo) {
        const prompt = `
        基于以下学生信息，生成专业的招生建议：
        
        学生信息：
        - 姓名：${studentInfo.name}
        - 年龄：${studentInfo.age}
        - 当前学历：${studentInfo.education}
        - 目标专业：${studentInfo.targetMajor}
        - 预算：${studentInfo.budget}
        - 特殊需求：${studentInfo.specialNeeds || '无'}
        
        请提供：
        1. 推荐的专业和学校
        2. 申请策略建议
        3. 时间规划
        4. 预算分配建议
        5. 风险提示
        `;

        return await this.chat(prompt, '招生顾问专业建议');
    }

    // 生成合同模板
    async generateContractTemplate(contractInfo) {
        const prompt = `
        基于以下合同信息，生成标准的招生服务合同模板：
        
        合同信息：
        - 服务类型：${contractInfo.serviceType}
        - 服务期限：${contractInfo.duration}
        - 服务费用：${contractInfo.fee}
        - 服务内容：${contractInfo.services}
        - 特殊条款：${contractInfo.specialTerms || '无'}
        
        请生成包含以下内容的合同：
        1. 合同标题和编号
        2. 甲乙双方信息
        3. 服务内容详细说明
        4. 费用和支付方式
        5. 双方权利义务
        6. 违约责任
        7. 争议解决方式
        8. 合同生效条件
        `;

        return await this.chat(prompt, '法律合同模板生成');
    }
}

module.exports = new AIService(); 