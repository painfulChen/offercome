const fs = require('fs');
const path = require('path');
const LoggingService = require('./logging-service');

class AutoFixService {
    constructor() {
        this.logger = new LoggingService();
        this.fixHistory = [];
    }
    
    // 分析错误并自动修复
    async analyzeAndFix(error, context = '') {
        const timestamp = new Date().toISOString();
        console.log(`🔧 开始自动修复分析: ${error.message}`);
        
        // 记录错误
        this.logger.logError(error, null, context);
        
        // 根据错误类型进行修复
        const fixResult = await this.applyFixes(error, context);
        
        // 记录修复历史
        this.fixHistory.push({
            timestamp,
            error: error.message,
            context,
            fixResult
        });
        
        return fixResult;
    }
    
    // 应用修复策略
    async applyFixes(error, context) {
        const fixes = [];
        
        // 1. 修复HTTP 400错误
        if (error.message.includes('HTTP 400') || error.message.includes('Bad Request')) {
            fixes.push(await this.fixHttp400Error(error, context));
        }
        
        // 2. 修复CORS错误
        if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
            fixes.push(await this.fixCorsError(error, context));
        }
        
        // 3. 修复API连接错误
        if (error.message.includes('FUNCTION_INVOCATION_FAILED') || error.message.includes('Load failed')) {
            fixes.push(await this.fixApiConnectionError(error, context));
        }
        
        // 4. 修复数据格式错误
        if (error.message.includes('JSON') || error.message.includes('format')) {
            fixes.push(await this.fixDataFormatError(error, context));
        }
        
        // 5. 修复路径错误
        if (error.message.includes('404') || error.message.includes('Not Found')) {
            fixes.push(await this.fixPathError(error, context));
        }
        
        return {
            success: fixes.some(fix => fix.success),
            fixes,
            timestamp: new Date().toISOString()
        };
    }
    
    // 修复HTTP 400错误
    async fixHttp400Error(error, context) {
        console.log('🔧 修复HTTP 400错误...');
        
        try {
            // 检查并修复请求头
            const serverFile = path.join(__dirname, 'simple-api.js');
            if (fs.existsSync(serverFile)) {
                let content = fs.readFileSync(serverFile, 'utf8');
                
                // 确保CORS配置正确
                if (!content.includes('app.use(cors())')) {
                    content = content.replace(
                        'const app = express();',
                        'const app = express();\napp.use(cors());'
                    );
                }
                
                // 确保JSON解析中间件
                if (!content.includes('app.use(express.json())')) {
                    content = content.replace(
                        'app.use(cors());',
                        'app.use(cors());\napp.use(express.json());'
                    );
                }
                
                fs.writeFileSync(serverFile, content);
                console.log('✅ 已修复HTTP 400错误 - 添加了CORS和JSON解析');
                
                return {
                    success: true,
                    type: 'HTTP_400',
                    description: '添加了CORS和JSON解析中间件'
                };
            }
        } catch (fixError) {
            console.error('❌ 修复HTTP 400错误失败:', fixError.message);
        }
        
        return {
            success: false,
            type: 'HTTP_400',
            description: '修复失败'
        };
    }
    
    // 修复CORS错误
    async fixCorsError(error, context) {
        console.log('🔧 修复CORS错误...');
        
        try {
            const serverFile = path.join(__dirname, 'simple-api.js');
            if (fs.existsSync(serverFile)) {
                let content = fs.readFileSync(serverFile, 'utf8');
                
                // 更新CORS配置
                const corsConfig = `
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));`;
                
                if (content.includes('app.use(cors())')) {
                    content = content.replace('app.use(cors());', corsConfig);
                } else {
                    content = content.replace('const app = express();', `const app = express();${corsConfig}`);
                }
                
                fs.writeFileSync(serverFile, content);
                console.log('✅ 已修复CORS错误');
                
                return {
                    success: true,
                    type: 'CORS',
                    description: '更新了CORS配置'
                };
            }
        } catch (fixError) {
            console.error('❌ 修复CORS错误失败:', fixError.message);
        }
        
        return {
            success: false,
            type: 'CORS',
            description: '修复失败'
        };
    }
    
    // 修复API连接错误
    async fixApiConnectionError(error, context) {
        console.log('🔧 修复API连接错误...');
        
        try {
            // 创建备用API端点
            const serverFile = path.join(__dirname, 'simple-api.js');
            if (fs.existsSync(serverFile)) {
                let content = fs.readFileSync(serverFile, 'utf8');
                
                // 添加健康检查端点
                if (!content.includes('/api/health')) {
                    const healthEndpoint = `
// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API服务正常运行',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});`;
                    
                    content = content.replace('app.listen(PORT', `${healthEndpoint}\n\napp.listen(PORT`);
                }
                
                // 添加错误处理中间件
                if (!content.includes('app.use((err, req, res, next)')) {
                    const errorHandler = `
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误',
        message: err.message
    });
});`;
                    
                    content = content.replace('app.listen(PORT', `${errorHandler}\n\napp.listen(PORT`);
                }
                
                fs.writeFileSync(serverFile, content);
                console.log('✅ 已修复API连接错误 - 添加了健康检查和错误处理');
                
                return {
                    success: true,
                    type: 'API_CONNECTION',
                    description: '添加了健康检查和错误处理端点'
                };
            }
        } catch (fixError) {
            console.error('❌ 修复API连接错误失败:', fixError.message);
        }
        
        return {
            success: false,
            type: 'API_CONNECTION',
            description: '修复失败'
        };
    }
    
    // 修复数据格式错误
    async fixDataFormatError(error, context) {
        console.log('🔧 修复数据格式错误...');
        
        try {
            // 修复前端数据解析
            const dashboardFile = path.join(__dirname, '../public/cost-dashboard.html');
            if (fs.existsSync(dashboardFile)) {
                let content = fs.readFileSync(dashboardFile, 'utf8');
                
                // 增强数据验证
                const enhancedValidation = `
                // 验证数据格式
                if (!data || typeof data !== 'object') {
                    throw new Error('返回数据格式错误');
                }
                
                // 安全地获取数据
                const totalCalls = parseInt(data.total_calls) || 0;
                const totalCost = parseFloat(data.total_cost) || 0;
                const apiTypes = data.api_types || {};`;
                
                if (content.includes('验证数据格式')) {
                    // 已经存在，跳过
                } else {
                    content = content.replace(
                        'const data = await response.json();',
                        `const data = await response.json();\n${enhancedValidation}`
                    );
                }
                
                fs.writeFileSync(dashboardFile, content);
                console.log('✅ 已修复数据格式错误 - 增强了数据验证');
                
                return {
                    success: true,
                    type: 'DATA_FORMAT',
                    description: '增强了数据验证逻辑'
                };
            }
        } catch (fixError) {
            console.error('❌ 修复数据格式错误失败:', fixError.message);
        }
        
        return {
            success: false,
            type: 'DATA_FORMAT',
            description: '修复失败'
        };
    }
    
    // 修复路径错误
    async fixPathError(error, context) {
        console.log('🔧 修复路径错误...');
        
        try {
            const serverFile = path.join(__dirname, 'simple-api.js');
            if (fs.existsSync(serverFile)) {
                let content = fs.readFileSync(serverFile, 'utf8');
                
                // 添加根路径处理
                if (!content.includes("app.get('/', (req, res)")) {
                    const rootHandler = `
// 根路径处理
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API服务正常运行',
        endpoints: {
            health: '/api/health',
            costStats: '/api/cost/stats',
            aiChat: '/api/ai/chat',
            monitor: '/monitor'
        }
    });
});`;
                    
                    content = content.replace('app.listen(PORT', `${rootHandler}\n\napp.listen(PORT`);
                }
                
                fs.writeFileSync(serverFile, content);
                console.log('✅ 已修复路径错误 - 添加了根路径处理');
                
                return {
                    success: true,
                    type: 'PATH',
                    description: '添加了根路径处理'
                };
            }
        } catch (fixError) {
            console.error('❌ 修复路径错误失败:', fixError.message);
        }
        
        return {
            success: false,
            type: 'PATH',
            description: '修复失败'
        };
    }
    
    // 获取修复历史
    getFixHistory() {
        return this.fixHistory;
    }
    
    // 清理修复历史
    cleanupFixHistory(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        this.fixHistory = this.fixHistory.filter(fix => {
            const fixDate = new Date(fix.timestamp);
            return fixDate > cutoffDate;
        });
        
        console.log(`🧹 清理了${daysToKeep}天前的修复历史`);
    }
}

module.exports = AutoFixService; 