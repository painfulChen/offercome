// 简化的CloudBase云函数入口
exports.main_handler = async (event, context) => {
    try {
        const { httpMethod, path, headers, body, queryStringParameters } = event;
        
        // 设置CORS头
        const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        };
        
        // 处理OPTIONS请求
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        // 健康检查
        if (path === '/health' || path === '/api/health' || path === '/api-v2/health') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    message: 'OfferCome智能求职辅导平台API服务正常运行',
                    timestamp: new Date().toISOString(),
                    version: '2.0.0',
                    environment: 'production',
                    features: [
                        'AI聊天服务',
                        '求职建议生成',
                        '简历优化',
                        '面试准备',
                        '用户管理',
                        '模块化架构'
                    ],
                    optimization: {
                        coldStart: 'optimized',
                        memoryUsage: 'reduced',
                        modularArchitecture: true,
                        structuredLogging: true
                    }
                })
            };
        }
        
        // 认证模块
        if (path.includes('/auth')) {
            if (httpMethod === 'POST' && path.includes('/login')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: '登录成功',
                        data: {
                            token: 'mock_token_' + Date.now(),
                            user: {
                                id: 'user_123',
                                username: 'testuser',
                                email: 'test@example.com'
                            }
                        }
                    })
                };
            }
            
            if (httpMethod === 'POST' && path.includes('/register')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: '注册成功',
                        data: {
                            token: 'mock_token_' + Date.now(),
                            user: {
                                id: 'user_' + Date.now(),
                                username: 'newuser',
                                email: 'new@example.com'
                            }
                        }
                    })
                };
            }
        }
        
        // AI模块
        if (path.includes('/ai')) {
            if (httpMethod === 'POST' && path.includes('/chat')) {
                const requestBody = body ? JSON.parse(body) : {};
                const { message = '你好' } = requestBody;
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: 'AI回复生成成功',
                        data: {
                            response: `我理解您的问题"${message}"，让我为您提供一些建议...`,
                            timestamp: new Date().toISOString(),
                            context: {
                                messageCount: 1,
                                sessionId: `session_${Date.now()}`
                            }
                        }
                    })
                };
            }
            
            if (httpMethod === 'POST' && path.includes('/suggest')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: 'AI建议生成成功',
                        data: {
                            category: 'career',
                            suggestions: [
                                '建议您关注行业发展趋势',
                                '可以考虑提升专业技能',
                                '建立职业发展规划',
                                '扩展人脉网络'
                            ],
                            timestamp: new Date().toISOString()
                        }
                    })
                };
            }
        }
        
        // 用户模块
        if (path.includes('/user')) {
            if (httpMethod === 'GET' && path.includes('/profile')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: '获取用户信息成功',
                        data: {
                            user: {
                                id: 'user_123',
                                username: 'testuser',
                                email: 'test@example.com',
                                avatar: 'https://via.placeholder.com/150',
                                skills: ['JavaScript', 'Node.js', 'React', 'Python'],
                                experience: '3年',
                                location: '北京'
                            }
                        }
                    })
                };
            }
            
            if (httpMethod === 'GET' && path.includes('/stats')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        message: '获取用户统计成功',
                        data: {
                            stats: {
                                totalUsers: 1250,
                                activeUsers: 890,
                                newUsersThisMonth: 45
                            },
                            timestamp: new Date().toISOString()
                        }
                    })
                };
            }
        }
        
        // 模块化路由测试
        if (path.startsWith('/api/v1/')) {
            const module = path.split('/')[3]; // 获取模块名
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    message: `模块 ${module} 访问成功`,
                    data: {
                        module,
                        path,
                        method: httpMethod,
                        timestamp: new Date().toISOString(),
                        features: {
                            modularArchitecture: true,
                            versionControl: 'v1',
                            structuredResponse: true
                        }
                    }
                })
            };
        }
        
        // 默认响应
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'ROUTE_NOT_FOUND',
                message: '接口不存在',
                availableEndpoints: [
                    'GET /health - 健康检查',
                    'POST /auth/login - 用户登录',
                    'POST /auth/register - 用户注册',
                    'POST /ai/chat - AI聊天',
                    'POST /ai/suggest - AI建议',
                    'GET /user/profile - 用户信息',
                    'GET /user/stats - 用户统计',
                    'GET /api/v1/* - 模块化API'
                ]
            })
        };
        
    } catch (error) {
        console.error('Function execution error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'FUNCTION_ERROR',
                message: '服务器内部错误',
                details: error.message
            })
        };
    }
}; 