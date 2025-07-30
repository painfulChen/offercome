// 路由文档生成脚本
const { routes, API_PREFIX } = require('../routes');

console.log('# API 路由文档');
console.log('');
console.log(`API前缀: \`${API_PREFIX}\``);
console.log('');
console.log('| 方法 | 路径 | 描述 | 认证 | 速率限制 |');
console.log('|------|------|------|------|----------|');

routes.forEach(route => {
    const method = route.method;
    const path = `${API_PREFIX}${route.path}`;
    const description = route.description;
    const auth = route.auth ? '是' : '否';
    const rateLimit = route.rateLimit ? `${route.rateLimit}/min` : '无限制';
    
    console.log(`| ${method} | \`${path}\` | ${description} | ${auth} | ${rateLimit} |`);
});

console.log('');
console.log(`总路由数: ${routes.length}`);

// 按功能分组统计
const groupedRoutes = routes.reduce((acc, route) => {
    const group = route.path.split('/')[1] || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(route);
    return acc;
}, {});

console.log('');
console.log('## 按功能分组');
Object.entries(groupedRoutes).forEach(([group, groupRoutes]) => {
    console.log(`### ${group.toUpperCase()} (${groupRoutes.length}个)`);
    groupRoutes.forEach(route => {
        console.log(`- \`${route.method} ${API_PREFIX}${route.path}\` - ${route.description}`);
    });
    console.log('');
}); 