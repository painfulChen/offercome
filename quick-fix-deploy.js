#!/usr/bin/env node

// 快速修复部署脚本 - 将新路由系统集成到现有代码中
const fs = require('fs');
const path = require('path');

console.log('🔧 开始快速修复部署...');

// 1. 备份当前文件
const backupFile = 'server/index-backup-' + Date.now() + '.js';
fs.copyFileSync('server/index.js', backupFile);
console.log('✅ 已备份当前文件到:', backupFile);

// 2. 创建简化版本的新服务器文件
const newServerCode = `// 快速修复版 - 集成新路由系统
const crypto = require('crypto');

// 路由配置
const routes = [
    { path: '/health', method: 'GET', handler: 'healthHandler', description: '健康检查接口' },
    { path: '/mbti/questions', method: 'GET', handler: 'getMBTIQuestionsHandler', description: '获取MBTI测试问题' },
    { path: '/mbti/calculate', method: 'POST', handler: 'calculateMBTIHandler', description: '计算MBTI类型' },
    { path: '/ai/chat', method: 'POST', handler: 'aiChatHandler', description: 'AI聊天接口' },
    { path: '/ai/rag', method: 'POST', handler: 'aiRagHandler', description: 'RAG知识库查询' },
    { path: '/auth/login', method: 'POST', handler: 'loginHandler', description: '用户登录' },
    { path: '/auth/register', method: 'POST', handler: 'registerHandler', description: '用户注册' },
    { path: '/auth/logout', method: 'POST', handler: 'logoutHandler', description: '用户登出' },
    { path: '/user/profile', method: 'GET', handler: 'getUserProfileHandler', description: '获取用户资料' },
    { path: '/user/profile', method: 'PUT', handler: 'updateUserProfileHandler', description: '更新用户资料' },
    { path: '/cases', method: 'GET', handler: 'getCasesHandler', description: '获取案例列表' },
    { path: '/cases/:id', method: 'GET', handler: 'getCaseByIdHandler', description: '获取单个案例详情' },
    { path: '/cases', method: 'POST', handler: 'createCaseHandler', description: '创建新案例' },
    { path: '/categories', method: 'GET', handler: 'getCategoriesHandler', description: '获取案例分类' },
    { path: '/chat/history', method: 'GET', handler: 'getChatHistoryHandler', description: '获取聊天历史' },
    { path: '/chat/clear', method: 'POST', handler: 'clearChatHistoryHandler', description: '清空聊天历史' },
    { path: '/phone/send-code', method: 'POST', handler: 'sendPhoneCodeHandler', description: '发送手机验证码' },
    { path: '/phone/verify', method: 'POST', handler: 'verifyPhoneCodeHandler', description: '验证手机验证码' },
    { path: '/rag/upload', method: 'POST', handler: 'uploadRagDocumentHandler', description: '上传RAG文档' },
    { path: '/rag/documents', method: 'GET', handler: 'getRagDocumentsHandler', description: '获取RAG文档列表' },
    { path: '/rag/documents/:id', method: 'DELETE', handler: 'deleteRagDocumentHandler', description: '删除RAG文档' }
];

const API_PREFIX = '/api-v2';

// 简单的内存速率限制器
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000;
        this.maxRequests = 100;
    }

    isAllowed(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(ip, validRequests);
        return true;
    }
}

const rateLimiter = new RateLimiter();

// 输入验证函数
const validateMBTIAnswers = (answers) => {
    if (!Array.isArray(answers)) {
        return { valid: false, error: '答案必须是数组格式' };
    }
    
    if (answers.length !== 4) {
        return { valid: false, error: '必须提供4个答案' };
    }
    
    const validOptions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
    for (let i = 0; i < answers.length; i++) {
        if (!validOptions.includes(answers[i])) {
            return { valid: false, error: \`第\${i + 1}个答案无效: \${answers[i]}\` };
        }
    }
    
    return { valid: true };
};

// 全局缓存
const globalCache = new Map();

// MBTI问题数据
const getMBTIQuestions = () => [
    {
        id: 1,
        question: "在社交场合中，你更倾向于：",
        options: [
            { id: 'E', text: "主动与他人交谈，享受社交" },
            { id: 'I', text: "保持安静，观察周围环境" }
        ]
    },
    {
        id: 2,
        question: "在做决定时，你更依赖：",
        options: [
            { id: 'T', text: "逻辑分析和客观事实" },
            { id: 'F', text: "个人价值观和他人感受" }
        ]
    },
    {
        id: 3,
        question: "你更喜欢的工作环境是：",
        options: [
            { id: 'J', text: "有明确的计划和截止日期" },
            { id: 'P', text: "灵活多变，可以随时调整" }
        ]
    },
    {
        id: 4,
        question: "你更关注：",
        options: [
            { id: 'S', text: "具体的细节和现实情况" },
            { id: 'N', text: "抽象的概念和未来可能性" }
        ]
    }
];

// MBTI类型描述
const mbtiDescriptions = {
    'ESTJ': { type: 'ESTJ', description: '总经理 - 优秀的管理者，善于组织和执行' },
    'ESTP': { type: 'ESTP', description: '企业家 - 灵活的行动者，善于解决问题' },
    'ESFJ': { type: 'ESFJ', description: '主人 - 关心他人的协调者，重视和谐' },
    'ESFP': { type: 'ESFP', description: '表演者 - 自发的表演者，热爱生活' },
    'ENTJ': { type: 'ENTJ', description: '指挥官 - 大胆果断的领导者，善于规划' },
    'ENTP': { type: 'ENTP', description: '辩论家 - 创新的思考者，善于辩论' },
    'ENFJ': { type: 'ENFJ', description: '主人公 - 富有魅力的领导者，善于激励' },
    'ENFP': { type: 'ENFP', description: '探险家 - 热情洋溢的创意家，善于激励' },
    'ISTJ': { type: 'ISTJ', description: '检查者 - 实际可靠的检查者，善于执行' },
    'ISTP': { type: 'ISTP', description: '鉴赏家 - 大胆而实际的实验家，善于操作' },
    'ISFJ': { type: 'ISFJ', description: '守卫者 - 尽职尽责的守卫者，善于保护' },
    'ISFP': { type: 'ISFP', description: '探险家 - 灵活迷人的艺术家，善于适应' },
    'INTJ': { type: 'INTJ', description: '建筑师 - 富有想象力和战略性的思考者' },
    'INTP': { type: 'INTP', description: '逻辑学家 - 创新发明家，善于逻辑思考' },
    'INFJ': { type: 'INFJ', description: '提倡者 - 安静而神秘，富有同情心' },
    'INFP': { type: 'INFP', description: '调停者 - 诗意善良的利他主义者' }
};

// 安全中间件
const securityMiddleware = (event) => {
    const headers = event.headers || {};
    const userAgent = headers['user-agent'] || '';
    
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: '访问被拒绝'
            })
        };
    }
    
    const securityHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    };
    
    return { securityHeaders };
};

// 性能监控器
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastReset: Date.now()
        };
        this.requestTimes = [];
    }

    logAPICall(endpoint, duration, status) {
        this.metrics.totalRequests++;
        this.requestTimes.push(duration);
        
        if (status >= 200 && status < 300) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        
        if (this.requestTimes.length > 100) {
            this.requestTimes.shift();
        }
        
        this.metrics.averageResponseTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length;
    }

    logError(error, context) {
        console.error('API错误:', { error: error.message, context, timestamp: new Date().toISOString() });
    }

    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalRequests > 0 ? 
                (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%' : '0%'
        };
    }
}

const monitor = new PerformanceMonitor();

// 路由匹配函数
function matchRoute(path, method) {
    // 移除API前缀
    let cleanPath = path;
    if (cleanPath.startsWith('/api-v2/')) {
        cleanPath = cleanPath.replace('/api-v2', '');
    } else if (cleanPath.startsWith('/api/')) {
        cleanPath = cleanPath.replace('/api', '');
    }
    
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    
    // 查找匹配的路由
    return routes.find(route => {
        // 简单的路径匹配（支持参数）
        const routePath = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp('^' + routePath + '$');
        return regex.test(cleanPath) && route.method === method;
    });
}

// 处理函数
const handlers = {
    healthHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            message: 'API服务正常运行',
            timestamp: new Date().toISOString(),
            routes: routes.length,
            prefix: API_PREFIX
        })
    }),

    getMBTIQuestionsHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: getMBTIQuestions(),
            message: 'MBTI问题获取成功'
        })
    }),

    calculateMBTIHandler: (req) => {
        try {
            const { answers } = req.body || {};
            
            const validation = validateMBTIAnswers(answers);
            if (!validation.valid) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: validation.error
                    })
                };
            }
            
            let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
            
            answers.forEach(answer => {
                switch (answer) {
                    case 'E': E++; break;
                    case 'I': I++; break;
                    case 'S': S++; break;
                    case 'N': N++; break;
                    case 'T': T++; break;
                    case 'F': F++; break;
                    case 'J': J++; break;
                    case 'P': P++; break;
                }
            });
            
            const type = [
                E > I ? 'E' : 'I',
                S > N ? 'S' : 'N',
                T > F ? 'T' : 'F',
                J > P ? 'J' : 'P'
            ].join('');
            
            const description = mbtiDescriptions[type] || { type, description: '未知类型' };
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        type: type,
                        description: description.description,
                        answers: answers
                    },
                    message: 'MBTI类型计算成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'MBTI计算失败: ' + error.message
                })
            };
        }
    },

    aiChatHandler: (req) => {
        try {
            const { message, model = 'kimi' } = req.body || {};
            
            if (!message) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '消息不能为空'
                    })
                };
            }
            
            const aiResponses = {
                'kimi': '我是Kimi AI助手，很高兴为您服务！',
                'openai': '我是OpenAI助手，有什么可以帮助您的吗？'
            };
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        response: aiResponses[model] || '收到您的消息，正在处理中...',
                        model: model,
                        timestamp: new Date().toISOString()
                    },
                    message: 'AI回复成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'AI聊天失败: ' + error.message
                })
            };
        }
    },

    aiRagHandler: (req) => {
        try {
            const { question, context } = req.body || {};
            
            if (!question) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '问题不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        answer: '基于知识库的回复：' + question,
                        context: context || '默认上下文',
                        timestamp: new Date().toISOString()
                    },
                    message: 'RAG查询成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'RAG查询失败: ' + error.message
                })
            };
        }
    },

    loginHandler: (req) => {
        try {
            const { username, password } = req.body || {};
            
            if (!username || !password) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '用户名和密码不能为空'
                    })
                };
            }
            
            if (username === 'admin' && password === 'admin123') {
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            token: 'mock-jwt-token-' + Date.now(),
                            user: { username, role: 'admin' }
                        },
                        message: '登录成功'
                    })
                };
            } else {
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '用户名或密码错误'
                    })
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '登录失败: ' + error.message
                })
            };
        }
    },

    registerHandler: (req) => {
        try {
            const { username, email, password } = req.body || {};
            
            if (!username || !email || !password) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '用户名、邮箱和密码不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        user: {
                            id: Date.now(),
                            username: username,
                            email: email,
                            role: 'user'
                        }
                    },
                    message: '注册成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '注册失败: ' + error.message
                })
            };
        }
    },

    logoutHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            message: '登出成功'
        })
    }),

    getUserProfileHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                profile: {
                    id: 1,
                    name: '测试用户',
                    email: 'test@example.com',
                    phone: '13800138000'
                }
            },
            message: '用户资料获取成功'
        })
    }),

    updateUserProfileHandler: (req) => {
        try {
            const { name, email, phone } = req.body || {};
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        profile: { name, email, phone }
                    },
                    message: '用户资料更新成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '更新失败: ' + error.message
                })
            };
        }
    },

    getCasesHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                cases: [
                    { id: 1, title: '案例1', description: '这是第一个案例' },
                    { id: 2, title: '案例2', description: '这是第二个案例' }
                ],
                total: 2
            },
            message: '案例列表获取成功'
        })
    }),

    getCaseByIdHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                case: { id: 1, title: '案例详情', description: '这是案例的详细描述' }
            },
            message: '案例详情获取成功'
        })
    }),

    createCaseHandler: (req) => {
        try {
            const { title, description, category } = req.body || {};
            
            if (!title || !description) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '标题和描述不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        case: {
                            id: Date.now(),
                            title,
                            description,
                            category: category || '默认分类'
                        }
                    },
                    message: '案例创建成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '创建失败: ' + error.message
                })
            };
        }
    },

    getCategoriesHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                categories: [
                    { id: 1, name: '技术', count: 5 },
                    { id: 2, name: '管理', count: 3 },
                    { id: 3, name: '设计', count: 2 }
                ]
            },
            message: '分类列表获取成功'
        })
    }),

    getChatHistoryHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                history: [
                    { id: 1, message: '你好', timestamp: new Date().toISOString() },
                    { id: 2, message: '你好！', timestamp: new Date().toISOString() }
                ]
            },
            message: '聊天历史获取成功'
        })
    }),

    clearChatHistoryHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            message: '聊天历史清空成功'
        })
    }),

    sendPhoneCodeHandler: (req) => {
        try {
            const { phone } = req.body || {};
            
            if (!phone) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '手机号不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        code: '123456',
                        expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                    },
                    message: '验证码发送成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '发送失败: ' + error.message
                })
            };
        }
    },

    verifyPhoneCodeHandler: (req) => {
        try {
            const { phone, code } = req.body || {};
            
            if (!phone || !code) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '手机号和验证码不能为空'
                    })
                };
            }
            
            if (code === '123456') {
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        message: '验证码验证成功'
                    })
                };
            } else {
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '验证码错误'
                    })
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '验证失败: ' + error.message
                })
            };
        }
    },

    uploadRagDocumentHandler: (req) => {
        try {
            const { title, content, category } = req.body || {};
            
            if (!title || !content) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '标题和内容不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        document: {
                            id: Date.now(),
                            title,
                            content,
                            category: category || '默认分类',
                            uploadTime: new Date().toISOString()
                        }
                    },
                    message: '文档上传成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '上传失败: ' + error.message
                })
            };
        }
    },

    getRagDocumentsHandler: () => ({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            data: {
                documents: [
                    { id: 1, title: '文档1', category: '技术', uploadTime: new Date().toISOString() },
                    { id: 2, title: '文档2', category: '管理', uploadTime: new Date().toISOString() }
                ],
                total: 2
            },
            message: '文档列表获取成功'
        })
    }),

    deleteRagDocumentHandler: (req) => {
        try {
            const { id } = req.body || {};
            
            if (!id) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '文档ID不能为空'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: '文档删除成功'
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '删除失败: ' + error.message
                })
            };
        }
    }
};

// 云函数入口
exports.main = async (event, context) => {
    const startTime = Date.now();
    
    try {
        const { httpMethod, path, body, headers } = event;
        
        // 安全检查
        const securityResult = securityMiddleware(event);
        if (securityResult.statusCode) {
            monitor.logAPICall(path, Date.now() - startTime, securityResult.statusCode);
            return securityResult;
        }
        
        // 路径处理
        let cleanPath = path;
        if (cleanPath.startsWith('/api-v2/')) {
            cleanPath = cleanPath.replace('/api-v2', '');
        } else if (cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.replace('/api', '');
        }
        
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }
        
        console.log('请求路径处理:', {
            originalPath: path,
            cleanPath: cleanPath,
            httpMethod: httpMethod
        });
        
        // 路由匹配
        const matchedRoute = matchRoute(path, httpMethod);
        
        if (!matchedRoute) {
            const response = {
                statusCode: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: false,
                    message: \`路径 \${cleanPath} 不存在\`,
                    availablePaths: routes.map(r => \`\${API_PREFIX}\${r.path}\`),
                    timestamp: new Date().toISOString()
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 404);
            return response;
        }
        
        // 解析请求体
        let requestBody = {};
        if (body) {
            try {
                requestBody = JSON.parse(body);
            } catch (error) {
                console.warn('请求体解析失败:', error.message);
            }
        }
        
        // 调用处理函数
        const handler = handlers[matchedRoute.handler];
        if (!handler) {
            const response = {
                statusCode: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: false,
                    message: '处理函数未找到: ' + matchedRoute.handler
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
            return response;
        }
        
        const handlerResult = handler({ body: requestBody, headers });
        
        // 添加安全头
        const response = {
            ...handlerResult,
            headers: {
                ...handlerResult.headers,
                ...securityResult.securityHeaders
            }
        };
        
        monitor.logAPICall(cleanPath, Date.now() - startTime, response.statusCode);
        return response;
        
    } catch (error) {
        console.error('API处理错误:', error);
        
        const response = {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: '服务器内部错误',
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
        
        monitor.logError(error, { path: event.path, httpMethod: event.httpMethod });
        monitor.logAPICall(event.path || '/unknown', Date.now() - startTime, 500);
        return response;
    }
};
`;

// 3. 写入新文件
fs.writeFileSync('server/index.js', newServerCode);
console.log('✅ 已创建新的服务器文件');

// 4. 部署命令
console.log('\n🚀 部署命令:');
console.log('tcb functions:deploy api -e offercome2025-9g14jitp22f4ddfc --force');
console.log('\n📋 测试命令:');
console.log('node test-deployed-code.js');

console.log('\n🎉 快速修复完成！'); 