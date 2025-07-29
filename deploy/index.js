// 简化版MBTI函数 - 专门用于新版部署
exports.main = async (event) => {
    console.log('收到MBTI请求:', event);
    
    const cleanPath = (event.path || '').replace(/^\/api-v2/, '');
    const { httpMethod, body } = event;
    
    try {
        // 健康检查
        if (cleanPath === '/health') {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'MBTI API服务正常运行',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // MBTI问题获取
        if (cleanPath === '/mbti/questions' && httpMethod === 'GET') {
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
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: questions,
                    message: '获取MBTI测试题目成功'
                })
            };
        }
        
        // MBTI答案提交
        if (cleanPath === '/mbti/submit' && httpMethod === 'POST') {
            const { answers } = JSON.parse(body);
            
            if (!answers || !Array.isArray(answers)) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: '答案格式错误'
                    })
                };
            }
            
            // MBTI计算逻辑
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
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    data: {
                        type: type,
                        description: typeDescriptions[type] || '未知类型',
                        scores: { E, I, S, N, T, F, J, P }
                    },
                    message: 'MBTI测试完成'
                })
            };
        }
        
        // 404处理
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: 'INVALID_PATH',
                path: cleanPath
            })
        };
        
    } catch (error) {
        console.error('MBTI处理错误:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: '服务器内部错误',
                error: error.message
            })
        };
    }
}; 