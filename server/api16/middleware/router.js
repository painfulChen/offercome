const express = require('express');
const path = require('path');

class ModuleRouter {
    constructor() {
        this.router = express.Router();
        this.modules = new Map();
        this.middleware = [];
    }

    // 注册中间件
    use(middleware) {
        this.middleware.push(middleware);
        return this;
    }

    // 注册模块
    register(moduleName, handler) {
        this.modules.set(moduleName, handler);
        return this;
    }

    // 构建路由
    build() {
        // 应用全局中间件
        this.middleware.forEach(middleware => {
            this.router.use(middleware);
        });

        // 注册模块路由
        this.router.use('/api/:version/:module', (req, res, next) => {
            const { version, module } = req.params;
            
            // 版本检查
            if (!this.isValidVersion(version)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid API version',
                    supportedVersions: ['v1']
                });
            }

            // 模块检查
            if (!this.modules.has(module)) {
                return res.status(404).json({
                    success: false,
                    error: 'Module not found',
                    availableModules: Array.from(this.modules.keys())
                });
            }

            // 调用模块处理器
            const handler = this.modules.get(module);
            req.moduleContext = {
                version,
                module,
                timestamp: new Date().toISOString()
            };

            try {
                return handler(req, res, next);
            } catch (error) {
                console.error(`Module ${module} error:`, error);
                return res.status(500).json({
                    success: false,
                    error: 'Module execution failed',
                    message: error.message
                });
            }
        });

        return this.router;
    }

    // 版本验证
    isValidVersion(version) {
        const supportedVersions = ['v1'];
        return supportedVersions.includes(version);
    }

    // 获取模块列表
    getModules() {
        return Array.from(this.modules.keys());
    }

    // 获取路由信息
    getRoutes() {
        const routes = [];
        this.modules.forEach((handler, module) => {
            routes.push({
                module,
                path: `/api/v1/${module}`,
                handler: handler.name || 'anonymous'
            });
        });
        return routes;
    }
}

module.exports = ModuleRouter; 