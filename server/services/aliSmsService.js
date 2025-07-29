// 阿里云短信服务
const Core = require('@alicloud/pop-core');

class AliSMSService {
    constructor() {
        // 阿里云短信配置
        this.accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
        this.accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
        this.signName = process.env.ALI_SMS_SIGN_NAME;
        this.templateCode = process.env.ALI_SMS_TEMPLATE_CODE;
        
        // 初始化客户端
        this.client = new Core({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });
    }

    // 发送真实短信
    async sendRealSMS(phone, code) {
        try {
            const params = {
                PhoneNumbers: phone,
                SignName: this.signName,
                TemplateCode: this.templateCode,
                TemplateParam: JSON.stringify({ code: code })
            };

            const result = await this.client.request('SendSms', params, { method: 'POST' });
            
            console.log('阿里云短信发送结果:', result);
            
            if (result.Code === 'OK') {
                return {
                    success: true,
                    message: '短信发送成功',
                    phone: phone,
                    messageId: result.RequestId
                };
            } else {
                return {
                    success: false,
                    message: '短信发送失败',
                    error: result.Message
                };
            }
        } catch (error) {
            console.error('发送阿里云短信失败:', error);
            return {
                success: false,
                message: '短信发送失败',
                error: error.message
            };
        }
    }
}

module.exports = AliSMSService; 