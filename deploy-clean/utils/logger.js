const winston = require('winston');
const { format } = winston;
const Ajv = require('ajv');
const envManager = require('../config/env');

// 创建CLS上下文
const cls = require('cls-hooked');
const namespace = cls.createNamespace('request-context');

// 自定义错误类
class CloudBaseError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
        super(message);
        this.name = 'CloudBaseError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// JSON Schema验证器
const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false
});

// 预定义schemas
const schemas = {
    user: {
        type: 'object',
        properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        },
        required: ['username', 'email', 'password']
    },
    aiChat: {
        type: 'object',
        properties: {
            message: { type: 'string', minLength: 1, maxLength: 1000 },
            context: { type: 'object' },
            options: { type: 'object' }
        },
        required: ['message']
    }
};

// 注册schemas
Object.keys(schemas).forEach(name => {
    ajv.addSchema(schemas[name], name);
});

// 创建日志格式
const logFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const requestId = namespace.get('requestId');
        const userId = namespace.get('userId');
        const module = namespace.get('module');
        
        return JSON.stringify({
            timestamp,
            level,
            message,
            requestId,
            userId,
            module,
            ...meta
        });
    })
);

// 创建日志记录器
const logger = winston.createLogger({
    level: envManager.get('LOG_LEVEL', 'info'),
    format: logFormat,
    transports: [
        // 控制台输出
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        // 文件输出
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    ]
});

// 请求上下文中间件
const requestContext = (req, res, next) => {
    namespace.run(() => {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        namespace.set('requestId', requestId);
        namespace.set('userId', req.user?.id || 'anonymous');
        namespace.set('module', req.moduleContext?.module || 'unknown');
        
        // 添加请求ID到响应头
        res.setHeader('X-Request-ID', requestId);
        
        next();
    });
};

// 验证中间件
const validateSchema = (schemaName) => {
    return (req, res, next) => {
        try {
            const validate = ajv.getSchema(schemaName);
            if (!validate) {
                throw new CloudBaseError(`Schema '${schemaName}' not found`, 'SCHEMA_NOT_FOUND', 500);
            }

            const isValid = validate(req.body);
            if (!isValid) {
                const errors = validate.errors.map(err => ({
                    field: err.dataPath,
                    message: err.message,
                    value: err.data
                }));
                
                throw new CloudBaseError(
                    'Validation failed',
                    'VALIDATION_ERROR',
                    400,
                    { errors }
                );
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

// 错误处理中间件
const errorHandler = (error, req, res, next) => {
    const requestId = namespace.get('requestId');
    
    // 记录错误日志
    logger.error('Request error', {
        requestId,
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });

    // 如果是CloudBaseError，直接返回
    if (error instanceof CloudBaseError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.code,
            message: error.message,
            details: error.details,
            requestId
        });
    }

    // 其他错误统一处理
    const statusCode = error.statusCode || 500;
    const message = envManager.isProduction() ? 'Internal server error' : error.message;
    
    res.status(statusCode).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message,
        requestId
    });
};

// 性能监控中间件
const performanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const requestId = namespace.get('requestId');
        
        logger.info('Request completed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    });
    
    next();
};

// 健康检查中间件
const healthCheck = (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: envManager.get('NODE_ENV'),
        version: process.version,
        memory: process.memoryUsage(),
        features: envManager.get('FEATURES')
    };
    
    res.json(health);
};

// 导出工具函数
module.exports = {
    logger,
    CloudBaseError,
    requestContext,
    validateSchema,
    errorHandler,
    performanceMonitor,
    healthCheck,
    namespace,
    ajv,
    schemas
}; 