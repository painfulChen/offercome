// 安全中间件 - 高优先级优化
const crypto = require('crypto');

// 简单的内存速率限制器
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000; // 15分钟
        this.maxRequests = 100; // 每个IP最多100次请求
    }

    isAllowed(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        
        // 清理过期的请求记录
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        // 添加新请求
        validRequests.push(now);
        this.requests.set(ip, validRequests);
        
        return true;
    }

    getRemainingRequests(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
}

const rateLimiter = new RateLimiter();

// 输入验证中间件
const validateMBTIAnswers = (answers) => {
    if (!Array.isArray(answers)) {
        return { valid: false, error: '答案必须是数组格式' };
    }
    
    if (answers.length !== 4) {
        return { valid: false, error: '必须提供4个答案' };
    }
    
    const validOptions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
    for (let i = 0; i < answers.length; i++) {
        if (!validOptions.includes(answers[i])) {
            return { valid: false, error: `第${i + 1}个答案无效: ${answers[i]}` };
        }
    }
    
    return { valid: true };
};

// 增强的JWT工具类
class EnhancedAuth {
    static generateSecureToken(user) {
        const payload = {
            id: user.id,
            role: user.role,
            iat: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000), // 24小时
            issuer: 'offercome',
            audience: 'offercome-users'
        };
        
        // 使用更强的签名算法
        return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
            algorithm: 'HS512'
        });
    }
    
    static encryptSensitiveData(data) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex')
        };
    }
    
    static decryptSensitiveData(encryptedData) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    }
}

// 安全中间件主函数
const securityMiddleware = (event) => {
    const clientIP = event.requestContext?.sourceIp || 'unknown';
    
    // 1. 速率限制检查
    if (!rateLimiter.isAllowed(clientIP)) {
        return {
            statusCode: 429,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: '请求过于频繁，请稍后再试',
                retryAfter: 900 // 15分钟
            })
        };
    }
    
    // 2. 添加安全头
    const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
    };
    
    return { securityHeaders, clientIP };
};

module.exports = {
    securityMiddleware,
    validateMBTIAnswers,
    EnhancedAuth,
    rateLimiter
}; 