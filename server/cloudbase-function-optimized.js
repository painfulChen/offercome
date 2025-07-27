const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// 导入优化模块
const envManager = require('./config/env');
const ModuleRouter = require('./middleware/router');
const {
    logger,
    requestContext,
    validateSchema,
    errorHandler,
    performanceMonitor,
    healthCheck,
    CloudBaseError
} = require('./utils/logger');

// 导入模块处理器
const authHandler = require('./modules/auth');
const aiHandler = require('./modules/ai');
const userHandler = require('./modules/user');

// 初始化环境配置
envManager.load();

// 创建Express应用
const app = express();

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: envManager.get('CORS_ORIGIN', '*'),
    credentials: true
}));

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志和监控中间件
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(requestContext);
app.use(performanceMonitor);

// 健康检查
app.get('/health', healthCheck);

// 创建模块路由器
const router = new ModuleRouter()
    .use((req, res, next) => {
        // 全局请求预处理
        req.startTime = Date.now();
        next();
    })
    .register('auth', authHandler)
    .register('ai', aiHandler)
    .register('user', userHandler);

// 应用路由
app.use(router.build());

// 404处理
app.use('*', (req, res) => {
    throw new CloudBaseError('Route not found', 'ROUTE_NOT_FOUND', 404);
});

// 错误处理中间件
app.use(errorHandler);

// CloudBase云函数入口
exports.main_handler = async (event, context) => {
    try {
        // 验证环境配置
        envManager.validate();
        
        logger.info('CloudBase function invoked', {
            event: {
                httpMethod: event.httpMethod,
                path: event.path,
                headers: event.headers
            },
            context: {
                functionName: context.functionName,
                functionVersion: context.functionVersion,
                memoryLimitInMB: context.memoryLimitInMB,
                timeLimitInSeconds: context.timeLimitInSeconds
            }
        });

        // 构建HTTP请求对象
        const req = {
            method: event.httpMethod,
            url: event.path,
            headers: event.headers || {},
            body: event.body ? JSON.parse(event.body) : {},
            query: event.queryStringParameters || {},
            ip: event.requestContext?.sourceIp || 'unknown'
        };

        // 构建HTTP响应对象
        const res = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: ''
        };

        // 模拟Express中间件链
        const middlewareChain = [
            ...app._router.stack.filter(layer => layer.route || layer.name === 'router'),
            (req, res) => {
                // 最终响应处理
                if (!res.body) {
                    res.body = JSON.stringify({
                        success: false,
                        error: 'NO_RESPONSE',
                        message: 'No response generated'
                    });
                }
            }
        ];

        // 执行中间件链
        let index = 0;
        const next = (error) => {
            if (error) {
                // 错误处理
                logger.error('Middleware error', { error: error.message, stack: error.stack });
                res.statusCode = error.statusCode || 500;
                res.body = JSON.stringify({
                    success: false,
                    error: error.code || 'MIDDLEWARE_ERROR',
                    message: error.message,
                    requestId: req.headers['x-request-id']
                });
                return;
            }

            if (index >= middlewareChain.length) {
                return;
            }

            const middleware = middlewareChain[index++];
            try {
                middleware(req, res, next);
            } catch (error) {
                next(error);
            }
        };

        // 开始执行中间件链
        next();

        // 记录响应
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: Date.now() - req.startTime
        });

        return res;

    } catch (error) {
        logger.error('Function execution error', {
            error: error.message,
            stack: error.stack
        });

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'FUNCTION_ERROR',
                message: envManager.isProduction() ? 'Internal server error' : error.message
            })
        };
    }
};

// 开发环境直接启动服务器
if (process.env.NODE_ENV === 'development') {
    const PORT = envManager.get('PORT', 3000);
    app.listen(PORT, () => {
        logger.info(`Development server started on port ${PORT}`);
        logger.info('Environment info:', envManager.getEnvironmentInfo());
    });
}

module.exports = app; 