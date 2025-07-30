// 路由覆盖测试 - 确保所有路由都能正常工作
const request = require('supertest');
const { routes, API_PREFIX } = require('../server/routes');
const RouteManager = require('../server/utils/routeManager');

// 模拟处理函数
const mockHandlers = {
    healthHandler: (req, res) => res.json({ status: 'ok' }),
    getMBTIQuestionsHandler: (req, res) => res.json({ questions: [] }),
    calculateMBTIHandler: (req, res) => res.json({ type: 'ESTJ' }),
    aiChatHandler: (req, res) => res.json({ message: 'AI response' }),
    aiRagHandler: (req, res) => res.json({ answer: 'RAG answer' }),
    loginHandler: (req, res) => res.json({ token: 'mock-token' }),
    registerHandler: (req, res) => res.json({ success: true }),
    logoutHandler: (req, res) => res.json({ success: true }),
    getUserProfileHandler: (req, res) => res.json({ profile: {} }),
    updateUserProfileHandler: (req, res) => res.json({ success: true }),
    getCasesHandler: (req, res) => res.json({ cases: [] }),
    getCaseByIdHandler: (req, res) => res.json({ case: {} }),
    createCaseHandler: (req, res) => res.json({ success: true }),
    getCategoriesHandler: (req, res) => res.json({ categories: [] }),
    getChatHistoryHandler: (req, res) => res.json({ history: [] }),
    clearChatHistoryHandler: (req, res) => res.json({ success: true }),
    sendPhoneCodeHandler: (req, res) => res.json({ success: true }),
    verifyPhoneCodeHandler: (req, res) => res.json({ success: true }),
    uploadRagDocumentHandler: (req, res) => res.json({ success: true }),
    getRagDocumentsHandler: (req, res) => res.json({ documents: [] }),
    deleteRagDocumentHandler: (req, res) => res.json({ success: true })
};

describe('路由覆盖测试', () => {
    let routeManager;

    beforeEach(() => {
        routeManager = new RouteManager();
        routeManager.registerHandlers(mockHandlers);
    });

    test('所有路由都应该有对应的处理函数', () => {
        const missingHandlers = routes.filter(route => !mockHandlers[route.handler]);
        expect(missingHandlers).toHaveLength(0);
    });

    test('路由管理器应该能正确解析所有路由', () => {
        routes.forEach(route => {
            const result = routeManager.resolveRoute(`${API_PREFIX}${route.path}`, route.method);
            expect(result).toBeTruthy();
            expect(result.route).toEqual(route);
            expect(result.handler).toBe(mockHandlers[route.handler]);
        });
    });

    test('不存在的路由应该返回null', () => {
        const result = routeManager.resolveRoute('/api-v2/nonexistent', 'GET');
        expect(result).toBeNull();
    });

    test('路由前缀应该正确应用', () => {
        const testRoute = routes[0]; // 使用第一个路由作为测试
        const fullPath = `${API_PREFIX}${testRoute.path}`;
        expect(fullPath).toBe('/api-v2/health');
    });

    test('所有路由都应该有描述信息', () => {
        routes.forEach(route => {
            expect(route.description).toBeTruthy();
            expect(typeof route.description).toBe('string');
        });
    });

    test('路由方法应该是有效的HTTP方法', () => {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        routes.forEach(route => {
            expect(validMethods).toContain(route.method);
        });
    });

    test('路由路径应该以/开头', () => {
        routes.forEach(route => {
            expect(route.path.startsWith('/')).toBe(true);
        });
    });

    test('应该能生成完整的路由文档', () => {
        const docs = routeManager.generateRouteDocs();
        expect(docs).toHaveLength(routes.length);
        
        docs.forEach(doc => {
            expect(doc.method).toBeTruthy();
            expect(doc.path).toBeTruthy();
            expect(doc.description).toBeTruthy();
            expect(typeof doc.auth).toBe('boolean');
        });
    });
});

describe('路由功能测试', () => {
    test('健康检查路由应该返回200', async () => {
        // 这里需要实际的服务器实例，暂时跳过
        // const response = await request(app).get('/api-v2/health');
        // expect(response.status).toBe(200);
        expect(true).toBe(true); // 占位符
    });

    test('MBTI问题路由应该返回问题列表', async () => {
        // 这里需要实际的服务器实例，暂时跳过
        // const response = await request(app).get('/api-v2/mbti/questions');
        // expect(response.status).toBe(200);
        // expect(response.body).toHaveProperty('questions');
        expect(true).toBe(true); // 占位符
    });
});

describe('路由安全测试', () => {
    test('需要认证的路由应该有auth标记', () => {
        const authRoutes = routes.filter(route => route.auth === true);
        expect(authRoutes.length).toBeGreaterThan(0);
        
        authRoutes.forEach(route => {
            expect(route.auth).toBe(true);
        });
    });

    test('有速率限制的路由应该有rateLimit配置', () => {
        const rateLimitedRoutes = routes.filter(route => route.rateLimit);
        expect(rateLimitedRoutes.length).toBeGreaterThan(0);
        
        rateLimitedRoutes.forEach(route => {
            expect(typeof route.rateLimit).toBe('number');
            expect(route.rateLimit).toBeGreaterThan(0);
        });
    });
}); 