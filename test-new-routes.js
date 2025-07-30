#!/usr/bin/env node

// 测试新的路由系统
const { routes, API_PREFIX } = require('./server/routes');
const RouteManager = require('./server/utils/routeManager');

console.log('🧪 测试新的路由系统');
console.log('=' * 50);

// 初始化路由管理器
const routeManager = new RouteManager();

// 模拟处理函数
const mockHandlers = {
    healthHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getMBTIQuestionsHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    calculateMBTIHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    aiChatHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    aiRagHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    loginHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    registerHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    logoutHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getUserProfileHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    updateUserProfileHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getCasesHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getCaseByIdHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    createCaseHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getCategoriesHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getChatHistoryHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    clearChatHistoryHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    sendPhoneCodeHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    verifyPhoneCodeHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    uploadRagDocumentHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    getRagDocumentsHandler: () => ({ statusCode: 200, body: '{"success":true}' }),
    deleteRagDocumentHandler: () => ({ statusCode: 200, body: '{"success":true}' })
};

// 注册处理函数
routeManager.registerHandlers(mockHandlers);

// 测试路由解析
console.log('\n📊 路由解析测试');
console.log('=' * 50);

let passedTests = 0;
let totalTests = 0;

routes.forEach(route => {
    totalTests++;
    const fullPath = `${API_PREFIX}${route.path}`;
    const result = routeManager.resolveRoute(fullPath, route.method);
    
    if (result) {
        console.log(`✅ ${route.method} ${fullPath} - ${route.description}`);
        passedTests++;
    } else {
        console.log(`❌ ${route.method} ${fullPath} - ${route.description}`);
    }
});

console.log(`\n📈 测试结果: ${passedTests}/${totalTests} 通过`);

// 测试不存在的路由
console.log('\n🔍 测试不存在的路由');
const nonExistentRoutes = [
    '/api-v2/nonexistent',
    '/api-v2/test/123',
    '/api-v2/unknown/path'
];

nonExistentRoutes.forEach(path => {
    const result = routeManager.resolveRoute(path, 'GET');
    if (!result) {
        console.log(`✅ ${path} - 正确返回null`);
    } else {
        console.log(`❌ ${path} - 错误匹配到路由`);
    }
});

// 生成路由文档
console.log('\n📄 生成路由文档');
const docs = routeManager.generateRouteDocs();
console.log(`生成了 ${docs.length} 个路由文档`);

console.log('\n🎉 路由系统测试完成！'); 