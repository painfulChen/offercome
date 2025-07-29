const axios = require('axios');
const logger = require('../utils/logger');
const RAGService = require('./rag-service');

class AIRAGService {
    constructor() {
        this.kimiApiKey = process.env.KIMI_API_KEY || 'sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP';
        this.kimiApiUrl = 'https://kimi.moonshot.cn/api/chat-messages';
        this.ragService = new RAGService();
    }

    // 使用RAG增强的聊天功能
    async chatWithRAG(message, context = '') {
        try {
            // 首先从RAG知识库中检索相关信息
            const ragResults = await this.ragService.searchDocuments(message, 3);
            
            let ragContext = '';
            if (ragResults.success && ragResults.results.length > 0) {
                ragContext = '\n\n基于知识库的相关信息：\n';
                ragResults.results.forEach((result, index) => {
                    ragContext += `${index + 1}. ${result.title}: ${result.content}\n`;
                });
            }

            const systemPrompt = `你是一个专业的求职陪跑AI助手，专门帮助求职者进行职业规划、简历优化、面试准备等。

你的主要职责包括：
1. 提供求职策略和建议
2. 简历优化和写作指导
3. 面试技巧和准备建议
4. 职业规划和发展建议
5. 行业分析和趋势解读
6. 回答关于求职的各种问题

${ragContext}

请根据知识库中的相关信息，结合你的专业知识，为用户提供最准确、最有用的建议。

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
                timeout: 30000
            });

            return {
                success: true,
                message: response.data.choices[0].message.content,
                model: 'kimi-rag-enhanced',
                usage: response.data.usage,
                ragResults: ragResults.success ? ragResults.results : [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('RAG增强AI聊天失败:', error.message);
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
        return await this.chatWithRAG(message, context);
    }

    // 基于RAG的简历优化
    async optimizeResumeWithRAG(resumeContent, targetPosition, userProfile = {}) {
        try {
            // 从RAG知识库中检索简历相关的信息
            const resumeQuery = `简历优化 ${targetPosition} ${userProfile.experience || ''} ${userProfile.skills || ''}`;
            const ragResults = await this.ragService.searchDocuments(resumeQuery, 5);
            
            let ragContext = '';
            if (ragResults.success && ragResults.results.length > 0) {
                ragContext = '\n\n基于知识库的简历优化建议：\n';
                ragResults.results.forEach((result, index) => {
                    ragContext += `${index + 1}. ${result.title}: ${result.content}\n`;
                });
            }

            const prompt = `
            请基于以下信息优化简历：

            目标职位：${targetPosition}
            用户背景：${JSON.stringify(userProfile)}
            当前简历内容：${resumeContent}

            ${ragContext}

            请提供：
            1. 简历结构优化建议
            2. 关键词优化建议
            3. 内容改进建议
            4. 格式和排版建议
            5. 针对目标职位的具体修改建议
            6. 完整的优化后简历内容

            请确保建议专业、实用，符合目标职位的要求。
            `;

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的简历优化专家，擅长根据目标职位和用户背景优化简历。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 3000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return {
                success: true,
                optimizedResume: response.data.choices[0].message.content,
                model: 'kimi-rag-enhanced',
                ragResults: ragResults.success ? ragResults.results : [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('RAG增强简历优化失败:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 基于RAG的面试准备
    async prepareInterviewWithRAG(jobDescription, resumeContent, interviewType = 'general') {
        try {
            // 从RAG知识库中检索面试相关的信息
            const interviewQuery = `面试准备 ${interviewType} ${jobDescription}`;
            const ragResults = await this.ragService.searchDocuments(interviewQuery, 5);
            
            let ragContext = '';
            if (ragResults.success && ragResults.results.length > 0) {
                ragContext = '\n\n基于知识库的面试准备建议：\n';
                ragResults.results.forEach((result, index) => {
                    ragContext += `${index + 1}. ${result.title}: ${result.content}\n`;
                });
            }

            const prompt = `
            请基于以下信息提供面试准备建议：

            职位描述：${jobDescription}
            简历内容：${resumeContent}
            面试类型：${interviewType}

            ${ragContext}

            请提供：
            1. 可能被问到的面试问题
            2. 针对性的回答建议
            3. 面试技巧和注意事项
            4. 着装和礼仪建议
            5. 面试后的跟进建议
            6. 常见问题的应对策略

            请确保建议具体、实用，符合该职位的要求。
            `;

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的面试准备专家，擅长帮助求职者准备各种类型的面试。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 3000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return {
                success: true,
                interviewPrep: response.data.choices[0].message.content,
                model: 'kimi-rag-enhanced',
                ragResults: ragResults.success ? ragResults.results : [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('RAG增强面试准备失败:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 基于RAG的职业规划
    async careerPlanningWithRAG(userProfile, targetIndustry = '') {
        try {
            // 从RAG知识库中检索职业规划相关的信息
            const careerQuery = `职业规划 ${targetIndustry} ${userProfile.experience || ''} ${userProfile.skills || ''}`;
            const ragResults = await this.ragService.searchDocuments(careerQuery, 5);
            
            let ragContext = '';
            if (ragResults.success && ragResults.results.length > 0) {
                ragContext = '\n\n基于知识库的职业规划建议：\n';
                ragResults.results.forEach((result, index) => {
                    ragContext += `${index + 1}. ${result.title}: ${result.content}\n`;
                });
            }

            const prompt = `
            请基于以下信息提供职业规划建议：

            用户背景：${JSON.stringify(userProfile)}
            目标行业：${targetIndustry}

            ${ragContext}

            请提供：
            1. 职业发展路径建议
            2. 技能提升计划
            3. 行业趋势分析
            4. 薪资期望建议
            5. 转行策略（如适用）
            6. 长期职业目标规划

            请确保建议个性化、实用，符合用户的背景和目标。
            `;

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的职业规划师，擅长帮助求职者制定个性化的职业发展计划。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 3000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return {
                success: true,
                careerPlan: response.data.choices[0].message.content,
                model: 'kimi-rag-enhanced',
                ragResults: ragResults.success ? ragResults.results : [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('RAG增强职业规划失败:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 基于RAG的行业分析
    async industryAnalysisWithRAG(industry, position = '') {
        try {
            // 从RAG知识库中检索行业分析相关的信息
            const analysisQuery = `行业分析 ${industry} ${position}`;
            const ragResults = await this.ragService.searchDocuments(analysisQuery, 5);
            
            let ragContext = '';
            if (ragResults.success && ragResults.results.length > 0) {
                ragContext = '\n\n基于知识库的行业分析信息：\n';
                ragResults.results.forEach((result, index) => {
                    ragContext += `${index + 1}. ${result.title}: ${result.content}\n`;
                });
            }

            const prompt = `
            请基于以下信息提供行业分析：

            目标行业：${industry}
            目标职位：${position}

            ${ragContext}

            请提供：
            1. 行业现状和发展趋势
            2. 主要公司和机会
            3. 薪资水平和福利
            4. 技能要求和认证
            5. 行业挑战和机遇
            6. 进入该行业的建议

            请确保分析全面、准确，包含最新的行业信息。
            `;

            const response = await axios.post(this.kimiApiUrl, {
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的行业分析师，擅长分析各个行业的发展趋势和就业机会。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'moonshot-v1-8k',
                stream: false,
                temperature: 0.7,
                max_tokens: 3000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.kimiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return {
                success: true,
                industryAnalysis: response.data.choices[0].message.content,
                model: 'kimi-rag-enhanced',
                ragResults: ragResults.success ? ragResults.results : [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('RAG增强行业分析失败:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 获取服务状态
    async getServiceStatus() {
        try {
            const ragStats = this.ragService.getDocumentStats();
            return {
                success: true,
                status: 'healthy',
                ragStats: ragStats,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 测试RAG功能
    async testRAGFunctionality() {
        try {
            const testQuery = '求职技巧';
            const ragResults = await this.ragService.searchDocuments(testQuery, 1);
            
            return {
                success: true,
                ragWorking: ragResults.success,
                documentCount: this.ragService.getDocumentStats().totalDocuments,
                testQuery: testQuery,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = AIRAGService; 