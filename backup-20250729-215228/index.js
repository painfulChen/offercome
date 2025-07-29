// 优化版MBTI函数 - 高优先级优化（无外部依赖）
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
    'ISTP': { type: 'ISTP', description: '鉴赏家 - 大胆实用的实验家，善于解决问题' },
    'ISFJ': { type: 'ISFJ', description: '守卫者 - 尽职尽责的守卫者，重视和谐' },
    'ISFP': { type: 'ISFP', description: '探险家 - 灵活迷人的艺术家，热爱冒险' },
    'INTJ': { type: 'INTJ', description: '建筑师 - 富有想象力的战略家，善于规划' },
    'INTP': { type: 'INTP', description: '逻辑学家 - 创新的发明家，善于分析' },
    'INFJ': { type: 'INFJ', description: '提倡者 - 安静神秘的思想家，富有同情心' },
    'INFP': { type: 'INFP', description: '调停者 - 诗意善良的理想主义者，追求和谐' }
};

// 安全中间件
const securityMiddleware = (event) => {
    const headers = event.headers || {};
    const userAgent = headers['user-agent'] || '';
    const referer = headers.referer || '';
    
    // 基本安全检查
    const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    
    // 检查可疑请求
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onload/i,
        /onerror/i
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent) || pattern.test(referer)) {
            return {
                statusCode: 403,
                headers: securityHeaders,
                body: JSON.stringify({
                    success: false,
                    message: '请求被拒绝',
                    error: 'SECURITY_VIOLATION'
                })
            };
        }
    }
    
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
            lastReset: Date.now()
        };
    }
    
    logAPICall(endpoint, duration, status) {
        this.metrics.totalRequests++;
        if (status >= 200 && status < 300) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        
        // 更新平均响应时间
        const currentAvg = this.metrics.averageResponseTime;
        const totalCalls = this.metrics.successfulRequests + this.metrics.failedRequests;
        this.metrics.averageResponseTime = (currentAvg * (totalCalls - 1) + duration) / totalCalls;
    }
    
    logError(error, context) {
        console.error('API错误:', error, context);
    }
    
    getMetrics() {
        return { ...this.metrics };
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
        
        // 清理路径
        const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        
        // 调试信息
        console.log('请求路径:', {
            originalPath: path,
            cleanPath: cleanPath,
            httpMethod: httpMethod,
            startsWithRag: cleanPath.startsWith('/rag/'),
            startsWithApiRag: cleanPath.startsWith('/api/rag/')
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

        // 3. RAG相关接口
        if (cleanPath.startsWith('/rag/') || cleanPath.startsWith('/api/rag/')) {
            const ragPath = cleanPath.replace('/rag', '').replace('/api/rag', '');
            console.log('RAG路径处理:', { cleanPath, ragPath });
            
            // RAG健康检查
            if (ragPath === '/health' && httpMethod === 'GET') {
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        message: 'RAG服务正常运行',
                        timestamp: new Date().toISOString(),
                        status: 'ok'
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            }
            
            // RAG统计信息
            if (ragPath === '/stats' && httpMethod === 'GET') {
                const response = {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...securityResult.securityHeaders
                    },
                    body: JSON.stringify({
                        success: true,
                        data: {
                            totalDocuments: 0,
                            documentTypes: {},
                            categories: {},
                            totalSize: 0
                        }
                    })
                };
                
                monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                return response;
            }
            
            // 文件上传处理
            if (ragPath === '/upload/local' && httpMethod === 'POST') {
                try {
                    // 解析multipart/form-data
                    const boundary = headers['content-type']?.split('boundary=')[1];
                    if (!boundary) {
                        return {
                            statusCode: 400,
                            headers: { 
                                'Content-Type': 'application/json',
                                ...securityResult.securityHeaders
                            },
                            body: JSON.stringify({
                                success: false,
                                error: '无效的请求格式'
                            })
                        };
                    }
                    
                    // 模拟文件上传成功
                    const response = {
                        statusCode: 200,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            message: '文件上传成功',
                            documentId: 'doc_' + Date.now(),
                            file: {
                                originalName: 'uploaded_file.txt',
                                size: 1024,
                                path: '/uploads/file-' + Date.now() + '.txt'
                            }
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
                            error: '文件上传失败: ' + error.message
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                    return response;
                }
            }
            
            // 批量上传处理
            if (ragPath === '/upload/batch' && httpMethod === 'POST') {
                try {
                    const response = {
                        statusCode: 200,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            message: '批量上传成功',
                            summary: {
                                success: 1,
                                failed: 0
                            }
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
                            error: '批量上传失败: ' + error.message
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                    return response;
                }
            }
            
            // 搜索文档
            if (ragPath === '/search' && httpMethod === 'POST') {
                try {
                    const requestBody = JSON.parse(body);
                    const { query, category, tags } = requestBody;
                    
                    const response = {
                        statusCode: 200,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            data: {
                                query: query,
                                results: [
                                    {
                                        id: 'doc_1',
                                        title: '示例文档',
                                        content: '这是一个示例文档内容...',
                                        score: 0.95,
                                        category: category || 'general',
                                        tags: tags ? tags.split(',') : []
                                    }
                                ],
                                total: 1
                            }
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
                            error: '搜索失败: ' + error.message
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                    return response;
                }
            }
            
            // 获取文档列表
            if (ragPath === '/documents' && httpMethod === 'GET') {
                try {
                    const response = {
                        statusCode: 200,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            data: [
                                {
                                    id: 'doc_1',
                                    title: '示例文档',
                                    category: 'general',
                                    tags: ['示例', '文档'],
                                    size: 1024,
                                    uploadDate: new Date().toISOString()
                                }
                            ]
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
                            error: '获取文档列表失败: ' + error.message
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 500);
                    return response;
                }
            }
        }

        // 4. 手机认证相关接口
        if (cleanPath.startsWith('/phone-auth/')) {
            const phoneAuthPath = cleanPath.replace('/phone-auth', '');
            
            // 发送验证码
            if (phoneAuthPath === '/send-code' && httpMethod === 'POST') {
                try {
                    const requestBody = JSON.parse(body);
                    const { phone, type = 'register' } = requestBody;
                    
                    // 模拟发送验证码
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log(`[SMS] 向 ${phone} 发送验证码: ${code}`);
                    
                    const response = {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            message: '验证码已发送',
                            phone: phone,
                            expiresIn: 300 // 5分钟
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                    return response;
                } catch (error) {
                    const response = {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '发送验证码失败'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
            }
            
            // 手机注册
            if (phoneAuthPath === '/register' && httpMethod === 'POST') {
                try {
                    const requestBody = JSON.parse(body);
                    const { phone, code, username, password } = requestBody;
                    
                    // 模拟注册成功
                    const response = {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: true,
                            message: '注册成功',
                            data: {
                                user: {
                                    id: 'user_' + Date.now(),
                                    username: username,
                                    phone: phone,
                                    role: 'user',
                                    createdAt: new Date().toISOString()
                                },
                                token: 'mock_jwt_token_' + Date.now()
                            }
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 200);
                    return response;
                } catch (error) {
                    const response = {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            ...securityResult.securityHeaders
                        },
                        body: JSON.stringify({
                            success: false,
                            message: '注册失败'
                        })
                    };
                    
                    monitor.logAPICall(cleanPath, Date.now() - startTime, 400);
                    return response;
                }
            }
        }

        // 5. MBTI测试接口
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
        
        // 6. 404处理
        const response = {
            statusCode: 404,
            headers: { 
                'Content-Type': 'application/json',
                ...securityResult.securityHeaders
            },
            body: JSON.stringify({
                success: false,
                message: '路径不存在',
                error: 'INVALID_PATH',
                path: cleanPath
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