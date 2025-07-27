class KimiSimulatedService {
    constructor() {
        this.apiKey = 'sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP';
        this.model = 'kimi-simulated';
    }

    // 模拟响应
    async getSimulatedResponse(messages) {
        const userMessage = messages[messages.length - 1]?.content || '';
        
        const responses = {
            '留学申请': '作为专业的招生顾问，我建议您：\n1. 首先确定目标国家和专业\n2. 准备标准化考试（如托福、GRE）\n3. 准备申请材料（简历、推荐信、个人陈述）\n4. 制定申请时间表\n5. 考虑预算和奖学金机会\n\n您想了解哪个方面的详细信息？',
            '计算机科学': '计算机科学是一个热门专业，我建议：\n1. 重点关注美国、加拿大、英国、澳大利亚的TOP50大学\n2. 准备GRE考试，数学部分要高分\n3. 积累编程项目经验\n4. 准备技术面试\n5. 考虑实习和工作经验\n\n您有具体的学校偏好吗？',
            '硕士申请': '硕士申请需要系统规划：\n1. GPA要求：通常3.0以上\n2. 语言要求：托福90+或雅思6.5+\n3. 标准化考试：GRE或GMAT\n4. 申请材料：简历、推荐信、个人陈述\n5. 申请时间：提前1年开始准备\n\n您目前的背景如何？',
            '美国': '美国留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：托福或雅思\n3. 标准化考试：GRE（理工科）或GMAT（商科）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：I-20、DS-160、面签\n\n您想申请哪个专业？',
            '预算': '留学预算规划：\n1. 学费：每年2-5万美元\n2. 生活费：每年1-2万美元\n3. 住宿费：每年8000-15000美元\n4. 保险费：每年1000-2000美元\n5. 其他费用：机票、签证、考试等\n\n建议准备充足资金，并考虑奖学金申请。',
            '英国': '英国留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：雅思6.5-7.0\n3. 标准化考试：GRE（部分专业）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：CAS、Tier 4签证\n\n您想申请哪个专业？',
            '加拿大': '加拿大留学申请建议：\n1. 申请时间：9-12月\n2. 语言考试：雅思或托福\n3. 标准化考试：GRE（部分专业）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：学习许可、生物识别\n\n您想申请哪个专业？',
            '澳大利亚': '澳大利亚留学申请建议：\n1. 申请时间：全年可申请\n2. 语言考试：雅思6.5-7.0\n3. 标准化考试：GRE（部分专业）\n4. 申请材料：成绩单、推荐信、个人陈述\n5. 签证准备：学生签证500\n\n您想申请哪个专业？',
            '简历': '简历优化建议：\n1. 突出相关技能和经验\n2. 使用量化成果\n3. 关键词优化\n4. 格式简洁专业\n5. 定期更新内容\n\n您需要针对哪个职位优化简历？',
            '面试': '面试准备建议：\n1. 研究公司和职位\n2. 准备常见问题\n3. 练习自我介绍\n4. 准备项目案例\n5. 模拟面试练习\n\n您需要准备哪种类型的面试？',
            '奖学金': '奖学金申请建议：\n1. 提前了解申请条件\n2. 准备优秀成绩单\n3. 撰写个人陈述\n4. 准备推荐信\n5. 关注申请截止日期\n\n您想申请哪种类型的奖学金？'
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
            model: this.model,
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

        const result = await this.getSimulatedResponse(messages);
        
        return {
            success: true,
            message: result.content,
            model: result.model,
            usage: result.usage,
            timestamp: new Date().toISOString()
        };
    }

    // 生成招生建议
    async generateAdmissionAdvice(studentInfo) {
        const advice = `基于您提供的信息，我为您制定以下申请建议：

📚 推荐学校和专业：
1. 美国TOP50大学计算机科学硕士
2. 加拿大TOP10大学
3. 英国G5大学
4. 澳大利亚八大名校

⏰ 申请时间规划：
- 6-8月：准备标准化考试
- 9-10月：准备申请材料
- 11-12月：提交申请
- 1-3月：等待录取结果
- 4-6月：签证准备

💰 预算分配：
- 学费：40-60万人民币
- 生活费：20-30万人民币
- 其他费用：10万人民币

📋 需要准备的材料：
1. 成绩单和学历证明
2. 标准化考试成绩
3. 推荐信（2-3封）
4. 个人陈述
5. 简历
6. 作品集（如需要）

🎯 申请策略：
1. 冲刺学校：2-3所
2. 匹配学校：3-4所
3. 保底学校：2-3所

祝您申请顺利！`;

        return {
            success: true,
            message: advice,
            model: this.model,
            usage: { total_tokens: 200, prompt_tokens: 100, completion_tokens: 100 },
            timestamp: new Date().toISOString()
        };
    }

    // 获取服务状态
    async getServiceStatus() {
        return {
            success: true,
            service: 'Kimi AI (Simulated)',
            status: 'available',
            apiKey: this.apiKey ? 'configured' : 'not_configured',
            model: this.model,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new KimiSimulatedService(); 