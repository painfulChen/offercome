// 真实短信服务 - 腾讯云短信
const tencentcloud = require('tencentcloud-sdk-nodejs');

class RealSMSService {
    constructor() {
        // 腾讯云短信配置
        this.secretId = process.env.TENCENT_SECRET_ID;
        this.secretKey = process.env.TENCENT_SECRET_KEY;
        this.smsSdkAppId = process.env.SMS_SDK_APP_ID;
        this.signName = process.env.SMS_SIGN_NAME;
        this.templateId = process.env.SMS_TEMPLATE_ID;
        
        // 初始化短信客户端
        this.smsClient = tencentcloud.sms.v20210111.Client;
        this.client = new this.smsClient({
            credential: {
                secretId: this.secretId,
                secretKey: this.secretKey,
            },
            region: 'ap-guangzhou',
            profile: {
                httpProfile: {
                    endpoint: 'sms.tencentcloudapi.com',
                },
            },
        });
    }

    // 发送真实短信
    async sendRealSMS(phone, code) {
        try {
            const params = {
                SmsSdkAppId: this.smsSdkAppId,
                SignName: this.signName,
                TemplateId: this.templateId,
                TemplateParamSet: [code],
                PhoneNumberSet: [`+86${phone}`],
            };

            const result = await this.client.SendSms(params);
            
            console.log('真实短信发送结果:', result);
            
            if (result.SendStatusSet && result.SendStatusSet[0].Code === 'Ok') {
                return {
                    success: true,
                    message: '短信发送成功',
                    phone: phone,
                    messageId: result.SendStatusSet[0].SerialNo
                };
            } else {
                return {
                    success: false,
                    message: '短信发送失败',
                    error: result.SendStatusSet[0].Message
                };
            }
        } catch (error) {
            console.error('发送真实短信失败:', error);
            return {
                success: false,
                message: '短信发送失败',
                error: error.message
            };
        }
    }

    // 获取短信发送状态
    async getSMSStatus(messageId) {
        try {
            const params = {
                SmsSdkAppId: this.smsSdkAppId,
                SerialNo: messageId
            };

            const result = await this.client.PullSmsSendStatus(params);
            return result;
        } catch (error) {
            console.error('获取短信状态失败:', error);
            return null;
        }
    }
}

module.exports = RealSMSService; 