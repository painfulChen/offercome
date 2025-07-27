const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        this.kimiApiKey = process.env.KIMI_API_KEY || 'sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP';
        this.kimiApiUrl = 'https://kimi.moonshot.cn/api/chat-messages';
    }

    // 使用Kimi API进行聊天
    async chatWithKimi(message, context = '') {
        try {
            if (!this.kimiApiKey) {
                throw new Error('Kimi API Key未配置');
            }

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

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30秒超时
            });

            return {
                success: true,
                message: response.data.choices[0].message.content,
                model: 'kimi',
                usage: response.data.usage,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Kimi API调用失败:', error.message);
            return {
                success: false,
                message: 'AI服务暂时不可用，请稍后重试',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 智能聊天接口
    async chat(message, context = '') {
        return await this.chatWithKimi(message, context);
    }

    // 生成招生建议
    async generateAdmissionAdvice(studentInfo) {
        const prompt = `
        基于以下学生信息，生成专业的招生建议：
        
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
        `;

        return await this.chatWithKimi(prompt, '招生顾问专业建议生成');
    }

    // 生成合同模板
    async generateContractTemplate(contractInfo) {
        const prompt = `
        基于以下合同信息，生成标准的招生服务合同模板：
        
        合同信息：
        - 服务类型：${contractInfo.serviceType || '留学申请服务'}
        - 服务期限：${contractInfo.duration || '未指定'}
        - 服务费用：${contractInfo.fee || '未指定'}
        - 服务内容：${contractInfo.services || '未指定'}
        - 特殊条款：${contractInfo.specialTerms || '无'}
        
        请生成包含以下内容的完整合同：
        1. 合同标题和编号
        2. 甲乙双方信息
        3. 服务内容详细说明
        4. 费用和支付方式
        5. 双方权利义务
        6. 违约责任
        7. 争议解决方式
        8. 合同生效条件
        9. 保密条款
        10. 其他必要条款
        `;

        return await this.chatWithKimi(prompt, '法律合同模板生成');
    }

    // 简历优化建议
    async optimizeResume(resumeContent, targetPosition) {
        const prompt = `
        请对以下简历进行优化建议，目标职位：${targetPosition}
        
        简历内容：
        ${resumeContent}
        
        请提供：
        1. 整体结构优化建议
        2. 内容亮点突出建议
        3. 技能描述优化
        4. 项目经验改进建议
        5. 教育背景优化
        6. 关键词优化建议
        7. 格式和排版建议
        `;

        return await this.chatWithKimi(prompt, '简历优化专家');
    }

    // 面试准备建议
    async prepareInterview(jobDescription, resumeContent) {
        const prompt = `
        基于以下职位描述和简历内容，提供面试准备建议：
        
        职位描述：
        ${jobDescription}
        
        简历内容：
        ${resumeContent}
        
        请提供：
        1. 可能被问到的技术问题
        2. 行为面试问题预测
        3. 自我介绍建议
        4. 项目经验讲述要点
        5. 薪资谈判建议
        6. 面试礼仪提醒
        7. 常见问题回答模板
        `;

        return await this.chatWithKimi(prompt, '面试准备专家');
    }

    // 职业规划建议
    async careerPlanning(userProfile) {
        const prompt = `
        基于以下用户信息，提供职业规划建议：
        
        用户信息：
        - 当前职位：${userProfile.currentPosition || '未提供'}
        - 工作经验：${userProfile.experience || '未提供'}
        - 技能特长：${userProfile.skills || '未提供'}
        - 职业目标：${userProfile.goals || '未提供'}
        - 行业偏好：${userProfile.industry || '未提供'}
        
        请提供：
        1. 短期职业发展路径（1-2年）
        2. 中期职业规划（3-5年）
        3. 长期职业愿景（5-10年）
        4. 需要提升的技能
        5. 推荐的学习资源
        6. 行业发展趋势分析
        7. 薪资增长预期
        `;

        return await this.chatWithKimi(prompt, '职业规划专家');
    }

    // 获取服务状态
    async getServiceStatus() {
        return {
            success: true,
            service: 'Kimi AI',
            status: 'available',
            apiKey: this.kimiApiKey ? 'configured' : 'not_configured',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new AIService(); 