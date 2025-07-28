// CloudBase函数 - 简化版本
// 不依赖外部数据库，使用内存存储

const https = require('https');
const fs = require('fs');

// 内存存储
let users = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
    },
    {
        id: '2',
        username: 'user123',
        email: 'user123@example.com',
        password: 'user123',
        role: 'user',
        isActive: true
    }
];

// 成本追踪
class CostTracker {
    constructor() {
        this.costLogFile = '/tmp/cost_log.json';
        this.initializeCostLog();
    }

    initializeCostLog() {
        try {
            if (!fs.existsSync(this.costLogFile)) {
                fs.writeFileSync(this.costLogFile, JSON.stringify([]));
            }
        } catch (error) {
            console.error('初始化成本日志失败:', error);
        }
    }

    logCost(apiType, status, cost) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                apiType,
                status,
                cost,
                requestId: Math.random().toString(36).substr(2, 9)
            };

            let logs = [];
            if (fs.existsSync(this.costLogFile)) {
                const content = fs.readFileSync(this.costLogFile, 'utf8');
                logs = JSON.parse(content);
            }
            logs.push(logEntry);
            fs.writeFileSync(this.costLogFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('记录成本失败:', error);
        }
    }

    getCostStats() {
        try {
            if (!fs.existsSync(this.costLogFile)) {
                return this.getEmptyStats();
            }
            const content = fs.readFileSync(this.costLogFile, 'utf8');
            const logs = JSON.parse(content);
            
            const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
            const totalCalls = logs.length;
            const successCount = logs.filter(log => log.status === 'success').length;
            const errorCount = logs.filter(log => log.status === 'error').length;
            
            return {
                totalCost: parseFloat(totalCost.toFixed(4)),
                totalCalls,
                successCount,
                errorCount,
                successRate: totalCalls > 0 ? parseFloat(((successCount / totalCalls) * 100).toFixed(2)) : 0
            };
        } catch (error) {
            console.error('获取成本统计失败:', error);
            return this.getEmptyStats();
        }
    }

    getEmptyStats() {
        return {
            totalCost: 0,
            totalCalls: 0,
            successCount: 0,
            errorCount: 0,
            successRate: 0
        };
    }
}

// Kimi AI服务
class KimiAIService {
    constructor(costTracker) {
        this.costTracker = costTracker;
        this.apiKey = 'sk-reaTT6uRqEqQPZ7HMXp5gmoingV6cZ2dumU8Y4axl9DHN2Jw';
        this.baseURL = 'api.moonshot.cn';
    }

    async makeHttpRequest(hostname, path, data, headers = {}) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: hostname,
                port: 443,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(postData),
                    ...headers
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(responseData);
                        resolve({
                            statusCode: res.statusCode,
                            data: result
                        });
                    } catch (error) {
                        reject(new Error(`JSON解析失败: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    async chat(message, context = '') {
        const startTime = Date.now();
        let responseTime = 0;
        let cost = 0;
        let status = 'success';
        let errorMessage = null;

        try {
            const requestData = {
                model: 'moonshot-v1-8k',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的AI助手，请用中文回答用户的问题。'
                    },
                    {
                        role: 'user',
                        content: context ? `${context}\n\n${message}` : message
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            };

            const response = await this.makeHttpRequest(
                this.baseURL,
                '/v1/chat/completions',
                requestData
            );

            responseTime = Date.now() - startTime;

            if (response.statusCode === 200 && response.data.choices && response.data.choices[0]) {
                const aiMessage = response.data.choices[0].message.content;
                cost = this.calculateCost(response.data.usage);
                
                this.costTracker.logCost('kimi-chat', 'success', cost);
                
                return {
                    success: true,
                    message: aiMessage,
                    model: 'moonshot-v1-8k',
                    cost: cost,
                    input_tokens: response.data.usage.prompt_tokens,
                    output_tokens: response.data.usage.completion_tokens,
                    timestamp: new Date().toISOString(),
                    usage: response.data.usage
                };
            } else {
                throw new Error('API响应格式错误');
            }
        } catch (error) {
            responseTime = Date.now() - startTime;
            status = 'error';
            errorMessage = error.message;
            console.error('Kimi API调用失败:', error);
            
            this.costTracker.logCost('kimi-chat', 'error', 0);
            
            return {
                success: false,
                message: 'AI服务暂时不可用，请稍后重试',
                error: error.message
            };
        }
    }

    calculateCost(usage) {
        const inputCost = (usage.prompt_tokens / 1000) * 0.012;
        const outputCost = (usage.completion_tokens / 1000) * 0.012;
        return parseFloat((inputCost + outputCost).toFixed(4));
    }
}

// 认证服务
class AuthService {
    constructor() {
        this.users = users;
    }

    login(username, password) {
        const user = this.users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password && 
            u.isActive
        );

        if (user) {
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.isActive ? 'active' : 'inactive'
                },
                token: `token_${user.id}_${Date.now()}`
            };
        } else {
            return { success: false, message: '用户名或密码错误' };
        }
    }

    createUser(userData) {
        // 检查用户名和邮箱是否已存在
        const existingUser = this.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            return { success: false, message: '用户名或邮箱已存在' };
        }

        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        console.log('创建新用户:', newUser.username);

        return {
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: 'active'
            }
        };
    }

    getAllUsers() {
        return this.users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.isActive ? 'active' : 'inactive',
            createdAt: user.createdAt
        }));
    }
}

// 初始化服务
const costTracker = new CostTracker();
const kimiAIService = new KimiAIService(costTracker);
const authService = new AuthService();

// 主函数
exports.main = async (event, context) => {
    console.log('收到请求:', event);
    
    const { path, httpMethod, body } = event;
    let responseBody = '';
    let statusCode = 200;
    let headers = { 'Content-Type': 'application/json' };

    try {
        // 处理路径
        let processedPath = path;
        if (processedPath.startsWith('/api/')) {
            processedPath = processedPath.substring(5);
        }
        if (processedPath.startsWith('/api-v2/')) {
            processedPath = processedPath.substring(8);
        }
        if (processedPath.startsWith('/')) {
            processedPath = processedPath.substring(1);
        }

        console.log('处理路径:', processedPath, '方法:', httpMethod);

        switch (processedPath) {
            case 'health':
                responseBody = JSON.stringify({
                    success: true,
                    message: 'API服务正常运行',
                    timestamp: new Date().toISOString()
                });
                break;

            case 'auth/login':
                if (httpMethod !== 'POST') {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持POST方法' });
                } else {
                    let loginData;
                    try {
                        loginData = JSON.parse(body);
                    } catch (error) {
                        statusCode = 400;
                        responseBody = JSON.stringify({ success: false, message: '请求体格式错误' });
                        break;
                    }
                    const loginResult = authService.login(loginData.username, loginData.password);
                    responseBody = JSON.stringify(loginResult);
                }
                break;

            case 'auth/register':
                if (httpMethod !== 'POST') {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持POST方法' });
                } else {
                    let regData;
                    try {
                        regData = JSON.parse(body);
                    } catch (error) {
                        statusCode = 400;
                        responseBody = JSON.stringify({ success: false, message: '请求体格式错误' });
                        break;
                    }
                    
                    // 校验必填
                    if (!regData.username || !regData.email || !regData.password) {
                        statusCode = 400;
                        responseBody = JSON.stringify({ success: false, message: '用户名、邮箱和密码为必填项' });
                        break;
                    }
                    
                    const registerResult = authService.createUser(regData);
                    responseBody = JSON.stringify(registerResult);
                }
                break;

            case 'auth/verify':
                if (httpMethod !== 'GET') {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持GET方法' });
                } else {
                    const token = event.headers?.authorization?.replace('Bearer ', '') || 
                                event.headers?.Authorization?.replace('Bearer ', '');
                    
                    if (!token) {
                        statusCode = 401;
                        responseBody = JSON.stringify({ success: false, message: '缺少认证token' });
                        break;
                    }
                    
                    // 简单的token验证（在实际项目中应该使用JWT）
                    const tokenParts = token.split('_');
                    if (tokenParts.length >= 2) {
                        const userId = tokenParts[1];
                        const user = authService.users.find(u => u.id === userId);
                        
                        if (user && user.isActive) {
                            responseBody = JSON.stringify({
                                success: true,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    role: user.role,
                                    status: 'active'
                                }
                            });
                        } else {
                            statusCode = 401;
                            responseBody = JSON.stringify({ success: false, message: 'token无效或用户不存在' });
                        }
                    } else {
                        statusCode = 401;
                        responseBody = JSON.stringify({ success: false, message: 'token格式错误' });
                    }
                }
                break;

            case 'ai/chat':
                if (httpMethod !== 'POST') {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持POST方法' });
                } else {
                    let chatData;
                    try {
                        chatData = JSON.parse(body);
                    } catch (error) {
                        statusCode = 400;
                        responseBody = JSON.stringify({ success: false, message: '请求体格式错误' });
                        break;
                    }
                    
                    if (!chatData.message) {
                        statusCode = 400;
                        responseBody = JSON.stringify({ success: false, message: '消息内容不能为空' });
                        break;
                    }
                    
                    const chatResult = await kimiAIService.chat(chatData.message, chatData.context || '');
                    responseBody = JSON.stringify(chatResult);
                }
                break;

            case 'cost/stats':
                const stats = costTracker.getCostStats();
                responseBody = JSON.stringify({
                    success: true,
                    stats: stats
                });
                break;

            case 'admin/users':
                if (httpMethod === 'GET') {
                    const users = authService.getAllUsers();
                    responseBody = JSON.stringify({
                        success: true,
                        users: users
                    });
                } else {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持GET方法' });
                }
                break;

            case 'mbti/questions':
                if (httpMethod === 'GET') {
                    const questions = [
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
                    responseBody = JSON.stringify({
                        success: true,
                        data: questions,
                        message: '获取MBTI测试题目成功'
                    });
                } else {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持GET方法' });
                }
                break;

            case 'mbti/submit':
                if (httpMethod === 'POST') {
                    try {
                        const { answers } = JSON.parse(body);
                        if (!answers || !Array.isArray(answers)) {
                            statusCode = 400;
                            responseBody = JSON.stringify({
                                success: false,
                                message: '答案格式错误'
                            });
                            break;
                        }

                        // 简单的MBTI计算逻辑
                        let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
                        
                        answers.forEach(answer => {
                            switch(answer) {
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

                        const typeDescriptions = {
                            'INTJ': '建筑师 - 富有想象力和战略性的思考者',
                            'INTP': '逻辑学家 - 具有创新性的发明家',
                            'ENTJ': '指挥官 - 大胆、富有想象力的领导者',
                            'ENTP': '辩论家 - 聪明好奇的思想家',
                            'INFJ': '提倡者 - 安静而神秘，富有同情心',
                            'INFP': '调停者 - 诗意的、善良的利他主义者',
                            'ENFJ': '主人公 - 富有魅力和鼓舞人心的领导者',
                            'ENFP': '竞选者 - 热情、有创造力、社交能力强',
                            'ISTJ': '物流师 - 实际而注重事实的个体',
                            'ISFJ': '守卫者 - 非常专注和温暖的守护者',
                            'ESTJ': '总经理 - 优秀的管理者',
                            'ESFJ': '执政官 - 非常关心他人的社交蝴蝶',
                            'ISTP': '鉴赏家 - 大胆而实用的实验家',
                            'ISFP': '探险家 - 灵活而有魅力的艺术家',
                            'ESTP': '企业家 - 聪明、精力充沛、非常善于感知',
                            'ESFP': '表演者 - 自发的、精力充沛的娱乐者'
                        };

                        responseBody = JSON.stringify({
                            success: true,
                            data: {
                                type: type,
                                description: typeDescriptions[type] || '未知类型',
                                scores: {
                                    E, I, S, N, T, F, J, P
                                }
                            },
                            message: 'MBTI测试完成'
                        });
                    } catch (error) {
                        console.error('MBTI测试处理错误:', error);
                        statusCode = 500;
                        responseBody = JSON.stringify({
                            success: false,
                            message: 'MBTI测试处理失败',
                            error: error.message
                        });
                    }
                } else {
                    statusCode = 405;
                    responseBody = JSON.stringify({ success: false, message: '只支持POST方法' });
                }
                break;

            default:
                statusCode = 404;
                responseBody = JSON.stringify({
                    success: false,
                    message: `路径 ${processedPath} 不存在`,
                    availablePaths: [
                        '/api/health',
                        '/api/auth/login',
                        '/api/auth/register',
                        '/api/ai/chat',
                        '/api/cost/stats',
                        '/api/admin/users',
                        '/api/mbti/questions',
                        '/api/mbti/submit'
                    ]
                });
                break;
        }
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        statusCode = 500;
        responseBody = JSON.stringify({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }

    return {
        statusCode: statusCode,
        headers: headers,
        body: responseBody
    };
}; 