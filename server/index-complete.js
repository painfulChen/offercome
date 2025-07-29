// 完整修复版OfferCome API服务器
const crypto = require('crypto');

// 简单的内存速率限制器
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000; // 15分钟
        this.maxRequests = 100; // 每个IP最多100次请求
    }

    isAllowed(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        
        // 清理过期的请求记录
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        // 添加新请求
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
            return { valid: false, error: `第${i + 1}个答案无效: ${answers[i]}` };
        }
    }
    
    return { valid: true };
};

// 全局缓存 - 性能优化
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
    'ENFP': { type: 'ENFP', description: '竞选者 - 热情洋溢的创意家，善于激励' },
    'ISTJ': { type: 'ISTJ', description: '检查者 - 实际可靠的检查者，重视传统' },
    'ISTP': { type: 'ISTP', description: '鉴赏家 - 大胆实用的实验家，善于操作' },
    'ISFJ': { type: 'ISFJ', description: '守卫者 - 尽职尽责的守卫者，重视和谐' },
    'ISFP': { type: 'ISFP', description: '探险家 - 灵活迷人的艺术家，热爱冒险' },
    'INTJ': { type: 'INTJ', description: '建筑师 - 富有想象力的战略家，善于规划' },
    'INTP': { type: 'INTP', description: '逻辑学家 - 创新的发明家，善于分析' },
    'INFJ': { type: 'INFJ', description: '提倡者 - 安静神秘的诗意守护者，富有同情心' },
    'INFP': { type: 'INFP', description: '调停者 - 诗意善良的利他主义者，富有同情心' }
};

// 安全中间件
const securityMiddleware = (event) => {
    const headers = event.headers || {};
    const clientIP = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';
    
    // 速率限制检查
    if (!rateLimiter.isAllowed(clientIP)) {
        return {
            statusCode: 429,
            headers: { 
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString()
            },
            body: JSON.stringify({
                success: false,
                message: '请求过于频繁，请稍后再试',
                error: 'RATE_LIMIT_EXCEEDED'
            })
        };
    }
    
    // 安全头
    const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    
    return { securityHeaders };
};

// 性能监控
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
    }
    
    logAPICall(endpoint, duration, status) {
        this.metrics.totalRequests++;
        this.metrics.totalResponseTime += duration;
        this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;
        
        if (status >= 200 && status < 400) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        
        console.log(`API调用: ${endpoint} - ${status} - ${duration}ms`);
    }
    
    logError(error, context) {
        console.error('API错误:', error, context);
    }
    
    getMetrics() {
        return this.metrics;
    }
}

const monitor = new PerformanceMonitor();

// 主处理函数
exports.main_handler = async (event, context) => {
    const startTime = Date.now();
    
    try {
        // 解析请求
        const httpMethod = event.httpMethod || 'GET';
        const path = event.path || '/';
        const body = event.body || '';
        const headers = event.headers || {};
        const queryString = event.queryString || {};
        
        // 修复路径处理逻辑
        let cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        
        // 处理API路径前缀 - 修复版本
        if (cleanPath.startsWith('/api-v2/')) {
            cleanPath = cleanPath.replace('/api-v2', '');
        } else if (cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.replace('/api', '');
        }
        
        // 确保路径以/开头
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }
        
        // 调试信息
        console.log('请求路径处理:', {
            originalPath: path,
            cleanPath: cleanPath,
            httpMethod: httpMethod,
            hasApiPrefix: path.includes('/api'),
            hasApiV2Prefix: path.includes('/api-v2')
        });
        
        // 1. 安全检查
        const securityResult = securityMiddleware(event);
        if (securityResult.statusCode) {
            monitor.logAPICall(cleanPath, Date.now() - startTime, securityResult.statusCode);
            return securityResult;
        }
        
        // 2. 健康检查
        if (cleanPath === '/health') {
            const response = {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: true,
                    message: 'API服务正常运行',
                    timestamp: new Date().toISOString(),
                    security: 'enhanced',
                    metrics: monitor.getMetrics()
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
            return response;
        }

        // 3. MBTI测试接口
        if (cleanPath === '/mbti/questions' && httpMethod === 'GET') {
            const response = {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: true,
                    data: getMBTIQuestions(),
                    message: 'MBTI问题获取成功'
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
            return response;
        }
        
        if (cleanPath === '/mbti/calculate' && httpMethod === 'POST') {
            try {
                const requestBody = JSON.parse(body);
                const { answers } = requestBody;
                
                // 验证输入
                const validation = validateMBTIAnswers(answers);
                if (!validation.valid) {
                    const response = {
                        statusCode: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: validation.error,
                            error: 'VALIDATION_ERROR'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
                
                // 计算MBTI类型
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
                
                // 确定MBTI类型
                const firstLetter = E > I ? 'E' : 'I';
                const secondLetter = S > N ? 'S' : 'N';
                const thirdLetter = T > F ? 'T' : 'F';
                const fourthLetter = J > P ? 'J' : 'P';
                
                const mbtiType = firstLetter + secondLetter + thirdLetter + fourthLetter;
                const description = mbtiDescriptions[mbtiType];
                
                if (!description) {
                    const response = {
                        statusCode: 500,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: 'MBTI类型计算错误',
                            error: 'CALCULATION_ERROR'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                    return response;
                }
                
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            type: description.type,
                            description: description.description,
                            scores: {
                                E, I, S, N, T, F, J, P
                            }
                        },
                        message: 'MBTI测试完成',
                        security: 'validated'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            } catch (error) {
                const response = {
                    statusCode: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'MBTI计算失败',
                        error: 'INTERNAL_ERROR'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                return response;
            }
        }

        // 4. AI聊天接口
        if (cleanPath === '/ai/chat' && httpMethod === 'POST') {
            try {
                const requestBody = JSON.parse(body);
                const { message, model = 'kimi' } = requestBody;
                
                if (!message) {
                    const response = {
                        statusCode: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '消息内容不能为空'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
                
                // 模拟AI回复
                const aiResponses = {
                    'kimi': '我是Kimi AI助手，很高兴为您服务！',
                    'openai': '我是OpenAI助手，有什么可以帮助您的吗？'
                };
                
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
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
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            } catch (error) {
                const response = {
                    statusCode: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'AI聊天失败: ' + error.message
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                return response;
            }
        }

        // 5. RAG文档接口
        if (cleanPath === '/rag/documents' && httpMethod === 'GET') {
            const response = {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: true,
                    data: {
                        documents: [],
                        total: 0
                    },
                    message: '文档列表获取成功'
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
            return response;
        }

        // 6. 认证接口
        if (cleanPath === '/auth/register' && httpMethod === 'POST') {
            try {
                const requestBody = JSON.parse(body);
                const { username, email, password } = requestBody;
                
                if (!username || !email || !password) {
                    const response = {
                        statusCode: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '用户名、邮箱和密码不能为空'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
                
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            user: {
                                id: Date.now(),
                                username: username,
                                email: email
                            }
                        },
                        message: '注册成功'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            } catch (error) {
                const response = {
                    statusCode: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: false,
                        message: '注册失败: ' + error.message
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                return response;
            }
        }

        if (cleanPath === '/auth/login' && httpMethod === 'POST') {
            try {
                const requestBody = JSON.parse(body);
                const { username, password } = requestBody;
                
                if (!username || !password) {
                    const response = {
                        statusCode: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '用户名和密码不能为空'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
                
                const token = 'mock_token_' + Date.now();
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            token: token,
                            user: {
                                id: 1,
                                username: username,
                                email: username + '@example.com'
                            }
                        },
                        message: '登录成功'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            } catch (error) {
                const response = {
                    statusCode: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: false,
                        message: '登录失败: ' + error.message
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                return response;
            }
        }

        // 7. 案例接口
        if (cleanPath === '/cases' && httpMethod === 'GET') {
            const response = {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: true,
                    data: {
                        cases: [
                            {
                                id: 1,
                                title: '成功案例1',
                                description: '这是一个成功的求职案例',
                                category: '技术',
                                date: '2025-01-15'
                            },
                            {
                                id: 2,
                                title: '成功案例2',
                                description: '另一个成功的求职案例',
                                category: '管理',
                                date: '2025-01-20'
                            }
                        ]
                    },
                    message: '案例获取成功'
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
            return response;
        }

        // 8. 短信接口
        if (cleanPath === '/sms/send' && httpMethod === 'POST') {
            try {
                const requestBody = JSON.parse(body);
                const { phone, template, params } = requestBody;
                
                if (!phone) {
                    const response = {
                        statusCode: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '手机号不能为空'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
                
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            messageId: 'msg_' + Date.now(),
                            phone: phone,
                            status: 'sent'
                        },
                        message: '短信发送成功'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            } catch (error) {
                const response = {
                    statusCode: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: false,
                        message: '短信发送失败: ' + error.message
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                return response;
            }
        }

        // 9. 管理接口
        if (cleanPath === '/admin/stats' && httpMethod === 'GET') {
            const response = {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    ...securityResult.securityHeaders
                },
                body: JSON.stringify({
                    success: true,
                    data: {
                        users: {
                            total: 150,
                            active: 120,
                            new: 25
                        },
                        ai: {
                            totalCalls: 1250,
                            todayCalls: 45,
                            cost: 125.50
                        },
                        rag: {
                            totalDocuments: 89,
                            categories: 12,
                            searches: 340
                        }
                    },
                    message: '统计数据获取成功'
                })
            };
            
            monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
            return response;
        }

        // 10. 404处理
        const response = {
            statusCode: 404,
            headers: { 
                'Content-Type': 'application/json',
                ...securityResult.securityHeaders
            },
            body: JSON.stringify({
                success: false,
                message: `路径 ${cleanPath} 不存在`,
                error: 'INVALID_PATH',
                availablePaths: [
                    '/health',
                    '/mbti/questions',
                    '/mbti/calculate',
                    '/ai/chat',
                    '/rag/documents',
                    '/auth/login',
                    '/auth/register',
                    '/cases',
                    '/sms/send',
                    '/admin/stats'
                ]
            })
        };
        
        monitor.logAPICall(cleanPath, Date.now() - startTime, 404);
        return response;
        
    } catch (error) {
        console.error('API处理错误:', error);
        monitor.logError(error, { path: cleanPath, method: httpMethod });
        
        const response = {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY'
            },
            body: JSON.stringify({
                success: false,
                message: '服务器内部错误',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            })
        };
        
        monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
        return response;
    }
};

// 兼容cloudbaserc.json的main函数
exports.main = exports.main_handler; 