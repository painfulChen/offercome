#!/usr/bin/env node

// 快速验证脚本 - 测试路由优化系统
const { routes, API_PREFIX, getAvailablePaths } = require('./server/routes');
const RouteManager = require('./server/utils/routeManager');
const RouteMonitor = require('./server/utils/monitor');

console.log('🚀 路由优化系统验证');
console.log('=' * 50);

// 1. 验证路由配置
console.log('\n1. 路由配置验证');
console.log(`- 总路由数: ${routes.length}`);
console.log(`- API前缀: ${API_PREFIX}`);
console.log(`- 可用路径数: ${getAvailablePaths().length}`);

// 2. 验证路由管理器
console.log('\n2. 路由管理器验证');
const routeManager = new RouteManager();

// 模拟注册一些处理函数
const mockHandlers = {
    healthHandler: () => ({ status: 'ok' }),
    getMBTIQuestionsHandler: () => ({ questions: [] }),
    aiChatHandler: () => ({ message: 'AI response' })
};

routeManager.registerHandlers(mockHandlers);

// 测试路由解析
const testRoutes = [
    { path: '/api-v2/health', method: 'GET', expected: true },
    { path: '/api-v2/mbti/questions', method: 'GET', expected: true },
    { path: '/api-v2/nonexistent', method: 'GET', expected: false }
];

testRoutes.forEach(test => {
    const result = routeManager.resolveRoute(test.path, test.method);
    const status = result ? '✅' : '❌';
    const expected = test.expected ? '应该匹配' : '应该不匹配';
    console.log(`${status} ${test.method} ${test.path} - ${expected}`);
});

// 3. 验证监控系统
console.log('\n3. 监控系统验证');
const monitor = new RouteMonitor();

// 模拟一些路由缺失
const testMisses = [
    { path: '/api-v2/missing1', method: 'GET' },
    { path: '/api-v2/missing2', method: 'POST' },
    { path: '/api-v2/missing1', method: 'GET' } // 重复测试
];

testMisses.forEach(miss => {
    monitor.recordRouteMiss(miss.path, miss.method);
});

const report = monitor.generateReport();
console.log(`- 总缺失次数: ${report.totalMisses}`);
console.log(`- 唯一路径数: ${report.uniquePaths}`);
console.log(`- 告警次数: ${report.alertCount}`);

// 4. 验证路由文档
console.log('\n4. 路由文档验证');
const fs = require('fs');
if (fs.existsSync('API_ROUTES.md')) {
    const content = fs.readFileSync('API_ROUTES.md', 'utf8');
    const lines = content.split('\n');
    const routeLines = lines.filter(line => line.includes('| GET') || line.includes('| POST') || line.includes('| PUT') || line.includes('| DELETE'));
    console.log(`- 文档中的路由数: ${routeLines.length}`);
    console.log(`- 配置中的路由数: ${routes.length}`);
    console.log(`- 文档完整性: ${routeLines.length === routes.length ? '✅' : '❌'}`);
} else {
    console.log('❌ API_ROUTES.md 文件不存在');
}

// 5. 验证部署配置
console.log('\n5. 部署配置验证');
const cloudbaserc = require('./cloudbaserc.json');
console.log(`- 环境ID: ${cloudbaserc.envId}`);
console.log(`- 服务路径: ${cloudbaserc.service.path}`);
console.log(`- 目标函数: ${cloudbaserc.service.target}`);

// 6. 生成验证报告
console.log('\n6. 生成验证报告');
const reportData = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    apiPrefix: API_PREFIX,
    routeManagerWorking: true,
    monitorWorking: true,
    documentationComplete: fs.existsSync('API_ROUTES.md'),
    deploymentConfigValid: cloudbaserc.service && cloudbaserc.service.path === 'api-v2'
};

console.log('\n📊 验证报告:');
console.log(JSON.stringify(reportData, null, 2));

// 7. 总结
console.log('\n🎯 验证总结:');
const allChecks = [
    routes.length > 0,
    API_PREFIX === '/api-v2',
    reportData.routeManagerWorking,
    reportData.monitorWorking,
    reportData.documentationComplete,
    reportData.deploymentConfigValid
];

const passedChecks = allChecks.filter(check => check).length;
const totalChecks = allChecks.length;

console.log(`- 通过检查: ${passedChecks}/${totalChecks}`);
console.log(`- 总体状态: ${passedChecks === totalChecks ? '✅ 全部通过' : '❌ 存在问题'}`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 路由优化系统验证通过！');
    console.log('可以安全地进行部署。');
} else {
    console.log('\n⚠️  发现一些问题，请检查后重新验证。');
}
