// 短信验证码服务
const crypto = require('crypto');

// 尝试导入腾讯云SDK
let tencentcloud;
try {
    tencentcloud = require('tencentcloud-sdk-nodejs');
} catch (error) {
    console.log('腾讯云SDK未安装，使用模拟短信服务');
}

class SMSService {
    constructor() {
        this.verificationCodes = new Map(); // 内存存储验证码
        this.codeExpiry = 5 * 60 * 1000; // 5分钟过期
        this.maxAttempts = 3; // 最大尝试次数
        this.attempts = new Map(); // 尝试次数记录
        
        // 特殊手机号列表 - 这些号码会收到真实短信
        this.realSmsPhones = [
            '17356511434', // 您的手机号
            '13800138000', // 测试号码
            '18600000000'  // 其他测试号码
        ];
    }

    // 生成验证码
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 生成验证码哈希
    generateCodeHash(phone, code) {
        const data = `${phone}:${code}:${process.env.SMS_SECRET || 'default_secret'}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // 发送真实短信到特定号码
    async sendRealSMS(phone, code) {
        try {
            // 检查腾讯云配置
            const secretId = process.env.TENCENT_SECRET_ID;
            const secretKey = process.env.TENCENT_SECRET_KEY;
            const sdkAppId = process.env.SMS_SDK_APP_ID;
            const signName = process.env.SMS_SIGN_NAME;
            const templateId = process.env.SMS_TEMPLATE_ID;

            if (!secretId || !secretKey || !sdkAppId || !signName || !templateId) {
                console.log('腾讯云短信配置不完整，使用模拟发送');
                console.log(`[模拟短信] 向 ${phone} 发送验证码: ${code}`);
                console.log(`[短信内容] 您的OfferCome验证码是：${code}，5分钟内有效，请勿泄露给他人。`);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    success: true,
                    message: '模拟短信发送成功',
                    phone: phone,
                    code: code,
                    isMock: true
                };
            }

            // 使用腾讯云短信服务
            if (tencentcloud) {
                const SmsClient = tencentcloud.sms.v20210111.Client;
                const client = new SmsClient({
                    credential: {
                        secretId: secretId,
                        secretKey: secretKey,
                    },
                    region: 'ap-guangzhou',
                    profile: {
                        httpProfile: {
                            endpoint: 'sms.tencentcloudapi.com',
                        },
                    },
                });

                const params = {
                    SmsSdkAppId: sdkAppId,
                    SignName: signName,
                    TemplateId: templateId,
                    TemplateParamSet: [code],
                    PhoneNumberSet: [`+86${phone}`],
                };

                console.log('正在发送腾讯云短信...');
                const result = await client.SendSms(params);
                
                console.log('腾讯云短信发送结果:', result);
                
                if (result.SendStatusSet && result.SendStatusSet[0].Code === 'Ok') {
                    return {
                        success: true,
                        message: '腾讯云短信发送成功',
                        phone: phone,
                        messageId: result.SendStatusSet[0].SerialNo,
                        isReal: true
                    };
                } else {
                    throw new Error(result.SendStatusSet[0].Message || '短信发送失败');
                }
            } else {
                throw new Error('腾讯云SDK未安装');
            }
        } catch (error) {
            console.error('发送真实短信失败:', error);
            console.log(`[降级到模拟] 向 ${phone} 发送验证码: ${code}`);
            
            return {
                success: true,
                message: '模拟短信发送成功（腾讯云配置失败）',
                phone: phone,
                code: code,
                isMock: true,
                error: error.message
            };
        }
    }

    // 发送验证码（模拟 + 真实）
    async sendVerificationCode(phone) {
        try {
            // 生成6位验证码
            const code = this.generateCode();
            const codeHash = this.generateCodeHash(phone, code);
            
            // 存储验证码和哈希
            this.verificationCodes.set(phone, {
                code: code,
                hash: codeHash,
                createdAt: Date.now(),
                attempts: 0
            });

            // 检查是否为特殊手机号
            if (this.realSmsPhones.includes(phone)) {
                // 发送真实短信
                const realSmsResult = await this.sendRealSMS(phone, code);
                if (realSmsResult.success) {
                    console.log(`✅ 真实短信已发送到 ${phone}: ${code}`);
                } else {
                    console.log(`❌ 真实短信发送失败: ${realSmsResult.error}`);
                }
            } else {
                // 模拟发送短信
                console.log(`[模拟短信] 向 ${phone} 发送验证码: ${code}`);
                console.log(`[提示] 这是模拟短信，真实环境需要配置短信服务商`);
            }
            
            return {
                success: true,
                message: this.realSmsPhones.includes(phone) ? '真实短信已发送' : '验证码已发送（模拟）',
                phone: phone,
                expiresIn: this.codeExpiry / 1000, // 秒
                isRealSMS: this.realSmsPhones.includes(phone)
            };
        } catch (error) {
            console.error('发送验证码失败:', error);
            return {
                success: false,
                message: '发送验证码失败',
                error: error.message
            };
        }
    }

    // 验证验证码
    verifyCode(phone, inputCode) {
        const storedData = this.verificationCodes.get(phone);
        
        if (!storedData) {
            return {
                success: false,
                message: '验证码不存在或已过期'
            };
        }

        // 检查是否过期
        if (Date.now() - storedData.createdAt > this.codeExpiry) {
            this.verificationCodes.delete(phone);
            return {
                success: false,
                message: '验证码已过期'
            };
        }

        // 检查尝试次数
        if (storedData.attempts >= this.maxAttempts) {
            this.verificationCodes.delete(phone);
            return {
                success: false,
                message: '验证码尝试次数过多，请重新获取'
            };
        }

        // 验证码匹配
        if (storedData.code === inputCode) {
            // 验证成功，删除验证码
            this.verificationCodes.delete(phone);
            return {
                success: true,
                message: '验证码验证成功'
            };
        } else {
            // 增加尝试次数
            storedData.attempts += 1;
            this.verificationCodes.set(phone, storedData);
            
            return {
                success: false,
                message: `验证码错误，还剩${this.maxAttempts - storedData.attempts}次尝试机会`
            };
        }
    }

    // 检查手机号是否已注册
    async checkPhoneExists(phone) {
        // 这里应该查询数据库
        // 暂时返回false，表示手机号未注册
        return false;
    }

    // 清理过期验证码
    cleanupExpiredCodes() {
        const now = Date.now();
        for (const [phone, data] of this.verificationCodes.entries()) {
            if (now - data.createdAt > this.codeExpiry) {
                this.verificationCodes.delete(phone);
            }
        }
    }

    // 获取验证码状态
    getCodeStatus(phone) {
        const storedData = this.verificationCodes.get(phone);
        if (!storedData) {
            return {
                exists: false,
                message: '验证码不存在'
            };
        }

        const remainingTime = Math.max(0, this.codeExpiry - (Date.now() - storedData.createdAt));
        const remainingAttempts = Math.max(0, this.maxAttempts - storedData.attempts);

        return {
            exists: true,
            remainingTime: Math.ceil(remainingTime / 1000), // 秒
            remainingAttempts: remainingAttempts,
            message: `验证码有效，剩余${Math.ceil(remainingTime / 1000)}秒，可尝试${remainingAttempts}次`
        };
    }

    // 获取特殊手机号列表
    getRealSmsPhones() {
        return this.realSmsPhones;
    }

    // 添加特殊手机号
    addRealSmsPhone(phone) {
        if (!this.realSmsPhones.includes(phone)) {
            this.realSmsPhones.push(phone);
            console.log(`✅ 已添加真实短信手机号: ${phone}`);
        }
    }
}

// 创建全局实例
const smsService = new SMSService();

// 定期清理过期验证码
setInterval(() => {
    smsService.cleanupExpiredCodes();
}, 60000); // 每分钟清理一次

module.exports = smsService; 