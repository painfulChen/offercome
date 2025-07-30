// CloudBase函数 - 完整版本，包含MBTI功能
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

// MBTI类型描述
const mbtiDescriptions = {
    'ENTJ': {
        type: 'ENTJ',
        title: '指挥官',
        description: '大胆、富有想象力的领导者，总是能找到或创造解决方法。',
        strengths: ['领导能力', '决策果断', '目标导向', '战略规划', '执行力强'],
        careers: [
            { title: '企业高管', reason: '你的领导能力和战略规划能力使你能够有效管理大型组织。' },
            { title: '项目经理', reason: '你的目标导向和执行力使你能够成功推进复杂项目。' },
            { title: '律师', reason: '你的决策果断和逻辑分析能力使你能够在法律领域取得成功。' },
            { title: '企业家', reason: '你的战略思维和领导能力使你能够创建和运营成功的企业。' },
            { title: '管理顾问', reason: '你的战略规划和执行力使你能够为企业提供有效的管理建议。' }
        ],
        workStyle: '喜欢挑战，注重结果，追求效率和成功。',
        teamRole: '自然领导者，能够激励团队实现目标。'
    },
    'INTJ': {
        type: 'INTJ',
        title: '建筑师',
        description: '富有想象力和战略性的思考者，一切都要经过深思熟虑。',
        strengths: ['战略思维', '分析能力', '独立性', '创新思维', '专注力'],
        careers: [
            { title: '科学家', reason: '你的分析能力和创新思维使你能够在科研领域取得突破。' },
            { title: '工程师', reason: '你的逻辑思维和专注力使你能够设计复杂的系统。' },
            { title: '投资分析师', reason: '你的战略思维和分析能力使你能够做出明智的投资决策。' },
            { title: '战略顾问', reason: '你的全局思维和规划能力使你能够为企业制定长期战略。' },
            { title: '研究员', reason: '你的深度思考能力使你能够进行深入的研究工作。' }
        ],
        workStyle: '喜欢独立工作，追求完美，注重质量和效率。',
        teamRole: '战略思考者，提供深度分析和创新想法。'
    }
    // 可以添加更多MBTI类型
};

// 优化的MBTI问题获取
const getMBTIQuestionsOptimized = () => {
    return [
        // E/I 维度 (外向/内向) - 5题
        {
            id: 1,
            text: "在社交场合中，你更倾向于：",
            options: [
                { text: "与很多人交谈，认识新朋友", score: { E: 1, I: 0 } },
                { text: "与少数几个熟悉的人深入交谈", score: { E: 0, I: 1 } }
            ]
        },
        {
            id: 2,
            text: "在团队工作中，你更喜欢：",
            options: [
                { text: "积极参与讨论，分享想法", score: { E: 1, I: 0 } },
                { text: "先思考后发言，确保想法成熟", score: { E: 0, I: 1 } }
            ]
        },
        {
            id: 3,
            text: "面对新环境时，你通常会：",
            options: [
                { text: "主动探索，快速适应", score: { E: 1, I: 0 } },
                { text: "观察环境，谨慎行动", score: { E: 0, I: 1 } }
            ]
        },
        {
            id: 4,
            text: "在休息时间，你更愿意：",
            options: [
                { text: "参加聚会或活动", score: { E: 1, I: 0 } },
                { text: "独处或与亲密朋友相处", score: { E: 0, I: 1 } }
            ]
        },
        {
            id: 5,
            text: "做决定时，你倾向于：",
            options: [
                { text: "与他人讨论，听取意见", score: { E: 1, I: 0 } },
                { text: "独自思考，内省分析", score: { E: 0, I: 1 } }
            ]
        },
        // S/N 维度 (感觉/直觉) - 5题
        {
            id: 6,
            text: "处理问题时，你更注重：",
            options: [
                { text: "具体的事实和细节", score: { S: 1, N: 0 } },
                { text: "整体的概念和可能性", score: { S: 0, N: 1 } }
            ]
        },
        {
            id: 7,
            text: "学习新知识时，你更喜欢：",
            options: [
                { text: "循序渐进，掌握基础", score: { S: 1, N: 0 } },
                { text: "跳跃式思考，寻找联系", score: { S: 0, N: 1 } }
            ]
        },
        {
            id: 8,
            text: "描述事物时，你倾向于：",
            options: [
                { text: "准确描述实际情况", score: { S: 1, N: 0 } },
                { text: "使用比喻和联想", score: { S: 0, N: 1 } }
            ]
        },
        {
            id: 9,
            text: "面对未来时，你更关注：",
            options: [
                { text: "现实可行的计划", score: { S: 1, N: 0 } },
                { text: "理想和愿景", score: { S: 0, N: 1 } }
            ]
        },
        {
            id: 10,
            text: "解决问题时，你更依赖：",
            options: [
                { text: "过去的经验和惯例", score: { S: 1, N: 0 } },
                { text: "直觉和创新思维", score: { S: 0, N: 1 } }
            ]
        },
        // T/F 维度 (思考/情感) - 5题
        {
            id: 11,
            text: "做重要决定时，你更看重：",
            options: [
                { text: "逻辑分析和客观事实", score: { T: 1, F: 0 } },
                { text: "个人价值观和他人感受", score: { T: 0, F: 1 } }
            ]
        },
        {
            id: 12,
            text: "处理冲突时，你倾向于：",
            options: [
                { text: "分析问题，寻找解决方案", score: { T: 1, F: 0 } },
                { text: "考虑各方感受，寻求和谐", score: { T: 0, F: 1 } }
            ]
        },
        {
            id: 13,
            text: "评价他人时，你更注重：",
            options: [
                { text: "能力和成就", score: { T: 1, F: 0 } },
                { text: "品格和动机", score: { T: 0, F: 1 } }
            ]
        },
        {
            id: 14,
            text: "在团队中，你更擅长：",
            options: [
                { text: "分析问题，提供建议", score: { T: 1, F: 0 } },
                { text: "理解他人，提供支持", score: { T: 0, F: 1 } }
            ]
        },
        {
            id: 15,
            text: "面对批评时，你更希望：",
            options: [
                { text: "直接指出问题，帮助改进", score: { T: 1, F: 0 } },
                { text: "温和表达，考虑感受", score: { T: 0, F: 1 } }
            ]
        },
        // J/P 维度 (判断/知觉) - 5题
        {
            id: 16,
            text: "安排时间时，你更喜欢：",
            options: [
                { text: "制定详细计划，按计划执行", score: { J: 1, P: 0 } },
                { text: "保持灵活性，随机应变", score: { J: 0, P: 1 } }
            ]
        },
        {
            id: 17,
            text: "面对截止日期时，你通常：",
            options: [
                { text: "提前完成，避免压力", score: { J: 1, P: 0 } },
                { text: "在最后期限前完成", score: { J: 0, P: 1 } }
            ]
        },
        {
            id: 18,
            text: "工作环境中，你更喜欢：",
            options: [
                { text: "有序、结构化的环境", score: { J: 1, P: 0 } },
                { text: "灵活、开放的环境", score: { J: 0, P: 1 } }
            ]
        },
        {
            id: 19,
            text: "做决定时，你倾向于：",
            options: [
                { text: "快速做出决定，付诸行动", score: { J: 1, P: 0 } },
                { text: "收集更多信息，保持开放", score: { J: 0, P: 1 } }
            ]
        },
        {
            id: 20,
            text: "面对变化时，你的反应是：",
            options: [
                { text: "调整计划，保持控制", score: { J: 1, P: 0 } },
                { text: "适应变化，享受意外", score: { J: 0, P: 1 } }
            ]
        }
    ];
};

// 计算MBTI类型
const calculateMBTITypeOptimized = (scores) => {
    const type = [];
    
    // E/I
    type.push(scores.E > scores.I ? 'E' : 'I');
    
    // S/N
    type.push(scores.S > scores.N ? 'S' : 'N');
    
    // T/F
    type.push(scores.T > scores.F ? 'T' : 'F');
    
    // J/P
    type.push(scores.J > scores.P ? 'J' : 'P');
    
    return type.join('');
};

// MBTI计算处理器
const calculateMBTIHandlerOptimized = (req) => {
    try {
        const { type, scores } = req.body || {};
        
        if (!type || !scores) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '缺少必要的参数'
                })
            };
        }
        
        // 验证MBTI类型格式
        if (!/^[EI][SN][TF][JP]$/.test(type)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: '无效的MBTI类型格式'
                })
            };
        }
        
        // 获取类型描述
        const typeInfo = mbtiDescriptions[type] || {
            type: type,
            title: '未知类型',
            description: '这是一个有效的MBTI类型，但暂无详细描述。',
            strengths: [],
            careers: [],
            workStyle: '暂无描述',
            teamRole: '暂无描述'
        };
        
        // 计算置信度
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const maxPossibleScore = 20; // 20题，每题1分
        const confidence = totalScore > 0 ? Math.min(95, (totalScore / maxPossibleScore) * 100) : 50;
        
        // 分析各维度倾向
        const dimensionAnalysis = {
            EI: {
                dimension: '外向 (E) vs 内向 (I)',
                score: scores.E - scores.I,
                tendency: scores.E > scores.I ? 'E' : 'I',
                strength: Math.abs(scores.E - scores.I),
                description: scores.E > scores.I 
                    ? `你倾向于外向，喜欢社交和与他人互动。` 
                    : `你倾向于内向，喜欢独处和深度思考。`
            },
            SN: {
                dimension: '感觉 (S) vs 直觉 (N)',
                score: scores.S - scores.N,
                tendency: scores.S > scores.N ? 'S' : 'N',
                strength: Math.abs(scores.S - scores.N),
                description: scores.S > scores.N 
                    ? `你倾向于感觉，注重具体事实和细节。` 
                    : `你倾向于直觉，关注抽象概念和可能性。`
            },
            TF: {
                dimension: '思考 (T) vs 情感 (F)',
                score: scores.T - scores.F,
                tendency: scores.T > scores.F ? 'T' : 'F',
                strength: Math.abs(scores.T - scores.F),
                description: scores.T > scores.F 
                    ? `你倾向于思考，注重逻辑分析和客观事实。` 
                    : `你倾向于情感，重视个人价值观和他人感受。`
            },
            JP: {
                dimension: '判断 (J) vs 知觉 (P)',
                score: scores.J - scores.P,
                tendency: scores.J > scores.P ? 'J' : 'P',
                strength: Math.abs(scores.J - scores.P),
                description: scores.J > scores.P 
                    ? `你倾向于判断，喜欢计划和有序。` 
                    : `你倾向于知觉，喜欢灵活和适应。`
            }
        };
        
        // 构建响应
        const response = {
            success: true,
            data: {
                type: typeInfo.type,
                title: typeInfo.title,
                description: typeInfo.description,
                strengths: typeInfo.strengths,
                careers: typeInfo.careers,
                workStyle: typeInfo.workStyle,
                teamRole: typeInfo.teamRole,
                scores: scores,
                confidence: Math.round(confidence),
                dimensionAnalysis: dimensionAnalysis,
                testInfo: {
                    totalQuestions: 20,
                    timeLimit: '10分钟',
                    completedAt: new Date().toISOString()
                },
                recommendations: {
                    careerFocus: typeInfo.careers || [],
                    developmentAreas: [],
                    workEnvironment: typeInfo.workStyle || '适合你的工作环境',
                    teamCollaboration: typeInfo.teamRole || '在团队中的角色'
                }
            },
            message: 'MBTI类型计算成功'
        };
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
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
};

// 路由匹配函数
function matchRoute(path, method) {
    return routes.find(route => {
        const pathMatch = route.path === path || 
                         (route.path.includes(':id') && path.match(new RegExp(route.path.replace(':id', '[^/]+'))));
        return pathMatch && route.method === method;
    });
}

// 主函数
exports.main = async (event, context) => {
    console.log('收到请求:', event);
    
    const { path, httpMethod, body } = event;
    let responseBody = '';
    let statusCode = 200;
    let headers = { 'Content-Type': 'application/json' };

    try {
        // 处理路径
        let cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        
        // 处理API路径前缀
        if (cleanPath.startsWith('/api-v2/')) {
            cleanPath = cleanPath.replace('/api-v2', '');
        } else if (cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.replace('/api', '');
        }

        console.log('处理路径:', cleanPath, '方法:', httpMethod);

        // 路由匹配
        const matchedRoute = matchRoute(cleanPath, httpMethod);
        
        if (!matchedRoute) {
            statusCode = 404;
            responseBody = JSON.stringify({
                success: false,
                message: `路径 ${cleanPath} 不存在`,
                availablePaths: routes.map(r => `/api-v2${r.path}`)
            });
        } else {
            // 根据路由调用相应的处理器
            switch (matchedRoute.path) {
                case '/health':
                    responseBody = JSON.stringify({
                        success: true,
                        message: 'API服务正常运行',
                        timestamp: new Date().toISOString(),
                        routes: routes.length,
                        prefix: API_PREFIX
                    });
                    break;

                case '/mbti/questions':
                    responseBody = JSON.stringify({
                        success: true,
                        data: getMBTIQuestionsOptimized(),
                        message: 'MBTI问题获取成功'
                    });
                    break;

                case '/mbti/calculate':
                    const req = { body: body ? JSON.parse(body) : {} };
                    const result = calculateMBTIHandlerOptimized(req);
                    statusCode = result.statusCode;
                    responseBody = result.body;
                    break;

                case '/ai/chat':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            response: '你好！我是你的人工智能助手，擅长中英文对话。我在这里帮助你解答问题、提供信息，并进行各种语言处理任务。无论是简单的查询还是复杂的分析，我都尽力为你提供准确、有用的回答。',
                            model: 'kimi',
                            timestamp: new Date().toISOString()
                        },
                        message: 'AI回复成功'
                    });
                    break;

                case '/ai/rag':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            answer: '基于知识库的回复：这是一个RAG系统的示例回复。',
                            context: 'RAG相关文档',
                            timestamp: new Date().toISOString()
                        },
                        message: 'RAG查询成功'
                    });
                    break;

                case '/auth/login':
                    responseBody = JSON.stringify({
                        success: false,
                        message: '用户名或密码错误'
                    });
                    break;

                case '/auth/register':
                    const registerData = body ? JSON.parse(body) : {};
                    responseBody = JSON.stringify({
                        success: true,
                        user: {
                            id: Date.now().toString(),
                            username: registerData.username || 'newuser',
                            email: registerData.email || 'test@example.com',
                            role: 'user'
                        },
                        message: '注册成功'
                    });
                    break;

                case '/auth/logout':
                    responseBody = JSON.stringify({
                        success: true,
                        message: '登出成功'
                    });
                    break;

                case '/user/profile':
                    if (httpMethod === 'GET') {
                        responseBody = JSON.stringify({
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
                        });
                    } else if (httpMethod === 'PUT') {
                        responseBody = JSON.stringify({
                            success: true,
                            data: {
                                profile: {
                                    name: '测试用户',
                                    email: 'test@example.com',
                                    phone: '13800138000'
                                }
                            },
                            message: '用户资料更新成功'
                        });
                    }
                    break;

                case '/cases':
                    if (httpMethod === 'GET') {
                        responseBody = JSON.stringify({
                            success: true,
                            data: {
                                cases: [
                                    { id: 1, title: '案例1', description: '这是第一个案例' },
                                    { id: 2, title: '案例2', description: '这是第二个案例' }
                                ]
                            },
                            message: '案例列表获取成功'
                        });
                    } else if (httpMethod === 'POST') {
                        const caseData = body ? JSON.parse(body) : {};
                        responseBody = JSON.stringify({
                            success: true,
                            data: {
                                case: {
                                    id: Date.now(),
                                    title: caseData.title || '测试案例',
                                    description: caseData.description || '这是一个测试案例',
                                    category: caseData.category || '技术'
                                }
                            },
                            message: '案例创建成功'
                        });
                    }
                    break;

                case '/cases/:id':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            case: {
                                id: 1,
                                title: '案例详情',
                                description: '这是案例的详细描述'
                            }
                        },
                        message: '案例详情获取成功'
                    });
                    break;

                case '/categories':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            categories: [
                                { id: 1, name: '技术', count: 5 },
                                { id: 2, name: '管理', count: 3 },
                                { id: 3, name: '设计', count: 2 }
                            ]
                        },
                        message: '分类列表获取成功'
                    });
                    break;

                case '/chat/history':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            history: [
                                { id: 1, message: '你好', timestamp: new Date().toISOString() },
                                { id: 2, message: '你好！有什么可以帮助你的吗？', timestamp: new Date().toISOString() }
                            ]
                        },
                        message: '聊天历史获取成功'
                    });
                    break;

                case '/chat/clear':
                    responseBody = JSON.stringify({
                        success: true,
                        message: '聊天历史清空成功'
                    });
                    break;

                case '/phone/send-code':
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            code: '123456',
                            expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                        },
                        message: '验证码发送成功'
                    });
                    break;

                case '/phone/verify':
                    responseBody = JSON.stringify({
                        success: true,
                        message: '验证码验证成功'
                    });
                    break;

                case '/rag/upload':
                    const uploadData = body ? JSON.parse(body) : {};
                    responseBody = JSON.stringify({
                        success: true,
                        data: {
                            document: {
                                id: Date.now(),
                                title: uploadData.title || '测试文档',
                                content: uploadData.content || '这是一个测试文档的内容',
                                category: uploadData.category || '技术'
                            }
                        },
                        message: '文档上传成功'
                    });
                    break;

                case '/rag/documents':
                    if (httpMethod === 'GET') {
                        responseBody = JSON.stringify({
                            success: true,
                            data: {
                                documents: [
                                    { id: 1, title: '文档1', category: '技术', uploadTime: new Date().toISOString() },
                                    { id: 2, title: '文档2', category: '管理', uploadTime: new Date().toISOString() }
                                ]
                            },
                            message: '文档列表获取成功'
                        });
                    } else if (httpMethod === 'DELETE') {
                        responseBody = JSON.stringify({
                            success: true,
                            data: { deletedId: ':id' },
                            message: '文档删除成功'
                        });
                    }
                    break;

                default:
                    statusCode = 404;
                    responseBody = JSON.stringify({
                        success: false,
                        message: `路径 ${cleanPath} 不存在`,
                        availablePaths: routes.map(r => `/api-v2${r.path}`)
                    });
                    break;
            }
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