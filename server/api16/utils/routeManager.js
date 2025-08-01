// 路由管理器 - 自动注册和验证
const { routes, API_PREFIX, validateRoute, getAvailablePaths } = require('../routes');

class RouteManager {
    constructor() {
        this.handlers = new Map();
        this.availablePaths = getAvailablePaths();
        this.routeMisses = new Set();
    }

    // 注册处理函数
    registerHandler(name, handler) {
        this.handlers.set(name, handler);
    }

    // 批量注册处理函数
    registerHandlers(handlers) {
        Object.entries(handlers).forEach(([name, handler]) => {
            this.registerHandler(name, handler);
        });
    }

    // 验证路由并返回处理函数
    resolveRoute(path, method) {
        const route = validateRoute(path, method);
        
        if (!route) {
            // 记录未命中的路由
            this.routeMisses.add(`${method} ${path}`);
            console.warn(`[ROUTE_MISS] ${method} ${path} - 未找到匹配的路由`);
            return null;
        }

        const handler = this.handlers.get(route.handler);
        if (!handler) {
            console.error(`[ROUTE_ERROR] 处理函数未注册: ${route.handler}`);
            return null;
        }

        return { route, handler };
    }

    // 获取所有可用路径（用于启动期自检）
    getAvailablePaths() {
        return this.availablePaths;
    }

    // 获取路由缺失统计
    getRouteMissStats() {
        return Array.from(this.routeMisses);
    }

    // 启动期自检
    selfCheck() {
        console.log('=== 路由自检开始 ===');
        console.log(`API前缀: ${API_PREFIX}`);
        console.log(`总路由数: ${routes.length}`);
        
        // 检查所有路由的处理函数是否已注册
        const missingHandlers = routes.filter(route => !this.handlers.has(route.handler));
        
        if (missingHandlers.length > 0) {
            console.warn('⚠️  未注册的处理函数:');
            missingHandlers.forEach(route => {
                console.warn(`  - ${route.handler} (${route.method} ${route.path})`);
            });
        } else {
            console.log('✅ 所有路由处理函数已注册');
        }

        console.log('=== 可用路径 ===');
        this.availablePaths.forEach(path => {
            console.log(`  ${path}`);
        });
        
        console.log('=== 路由自检完成 ===');
    }

    // 生成路由文档
    generateRouteDocs() {
        const docs = routes.map(route => ({
            method: route.method,
            path: `${API_PREFIX}${route.path}`,
            description: route.description,
            auth: route.auth || false,
            rateLimit: route.rateLimit || '无限制'
        }));

        return docs;
    }
}

module.exports = RouteManager; 