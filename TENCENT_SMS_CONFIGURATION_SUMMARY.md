# 📱 腾讯云短信服务配置总结

## ✅ 已完成的工作

### 1. SDK安装
- ✅ 安装腾讯云SDK: `tencentcloud-sdk-nodejs`
- ✅ 集成到短信服务中
- ✅ 支持降级到模拟模式

### 2. 代码集成
- ✅ 更新 `server/services/smsService.js`
- ✅ 添加腾讯云短信发送逻辑
- ✅ 实现配置检查和错误处理
- ✅ 支持环境变量配置

### 3. 部署状态
- ✅ 服务器代码已部署
- ✅ API接口正常工作
- ✅ 测试脚本已创建

## 🔧 需要您完成的配置

### 1. 腾讯云账号设置
1. **注册腾讯云账号**: https://cloud.tencent.com/
2. **开通短信服务**: https://console.cloud.tencent.com/sms
3. **完成实名认证**: 必需步骤

### 2. 短信服务配置
1. **创建应用**:
   - 应用名称: `OfferCome`
   - 类型: 通用
   - 记录 `SDK AppID`

2. **创建签名**:
   - 签名内容: `OfferCome`
   - 类型: 公司或个人
   - 用途: 验证码
   - 等待审核通过

3. **创建模板**:
   - 模板名称: `验证码模板`
   - 类型: 验证码
   - 内容: `您的OfferCome验证码是：{1}，5分钟内有效，请勿泄露给他人。`
   - 等待审核通过

4. **获取API密钥**:
   - 访问管理 → API密钥管理
   - 创建新密钥
   - 记录 `SecretId` 和 `SecretKey`

### 3. 环境变量配置
```bash
# 创建环境变量文件
cp env.sms.example .env

# 编辑文件，填入真实配置
nano .env
```

配置内容：
```bash
# 腾讯云短信配置
TENCENT_SECRET_ID=your_secret_id_here
TENCENT_SECRET_KEY=your_secret_key_here
SMS_SDK_APP_ID=your_sdk_app_id_here
SMS_SIGN_NAME=OfferCome
SMS_TEMPLATE_ID=your_template_id_here

# 短信服务密钥
SMS_SECRET=your_sms_secret_key_here

# 特殊手机号列表
REAL_SMS_PHONES=17356511434,13800138000,18600000000
```

## 📋 配置参数获取位置

| 参数 | 获取位置 | 说明 |
|------|----------|------|
| `TENCENT_SECRET_ID` | 访问管理 → API密钥管理 | API密钥ID |
| `TENCENT_SECRET_KEY` | 访问管理 → API密钥管理 | API密钥Key |
| `SMS_SDK_APP_ID` | 短信服务 → 应用管理 | 应用ID |
| `SMS_SIGN_NAME` | 短信服务 → 签名管理 | 签名名称 |
| `SMS_TEMPLATE_ID` | 短信服务 → 模板管理 | 模板ID |

## 🚀 部署步骤

### 1. 本地测试
```bash
# 加载环境变量
source .env

# 测试短信发送
node -e "
const smsService = require('./server/services/smsService');
smsService.sendRealSMS('17356511434', '123456').then(console.log);
"
```

### 2. 云函数部署
```bash
# 部署到CloudBase
tcb fn deploy api -e offercome2025-9g14jitp22f4ddfc --dir server --force
```

### 3. 环境变量设置
在CloudBase控制台：
1. 进入云函数管理
2. 选择 `api` 函数
3. 点击"环境变量"
4. 添加所有必要的环境变量

## 💰 费用说明

### 短信费用
- **国内短信**: 0.05元/条
- **免费额度**: 新用户通常有100条免费额度
- **计费方式**: 按实际发送条数计费

### 成本估算
- 100条免费额度 ≈ 5元价值
- 每月1000条 ≈ 50元
- 每月10000条 ≈ 500元

## ✅ 测试验证

### 当前状态
- ✅ **SDK已安装**: 腾讯云SDK已集成
- ✅ **代码已部署**: 服务器代码已更新
- ✅ **API正常工作**: 所有接口正常响应
- ❌ **环境变量未配置**: 需要您配置腾讯云参数

### 测试命令
```bash
# 运行配置测试
./test-tencent-sms.sh

# 查看云函数日志
tcb fn logs api -e offercome2025-9g14jitp22f4ddfc
```

### 预期结果
配置完成后，您应该看到：
- ✅ 环境变量检查通过
- ✅ 短信发送显示"腾讯云短信发送成功"
- ✅ 您的手机收到真实短信

## 🔒 安全注意事项

### 1. 密钥安全
- 不要将密钥提交到代码仓库
- 使用环境变量存储敏感信息
- 定期轮换API密钥

### 2. 短信安全
- 设置发送频率限制
- 监控异常发送行为
- 定期检查发送日志

### 3. 验证码安全
- 设置合理的过期时间（5分钟）
- 限制验证码尝试次数（3次）
- 防止暴力破解

## 🎯 下一步操作

### 1. 立即可以做的
- 注册腾讯云账号
- 开通短信服务
- 创建应用和签名

### 2. 需要等待的
- 签名审核（1-2个工作日）
- 模板审核（1-2个工作日）

### 3. 配置完成后
- 设置环境变量
- 重新部署云函数
- 测试真实短信发送

## 📞 技术支持

### 腾讯云文档
- [短信服务文档](https://cloud.tencent.com/document/product/382)
- [API参考](https://cloud.tencent.com/document/api/382/38778)
- [SDK文档](https://cloud.tencent.com/document/sdk/Node.js)

### 常见问题
1. **签名审核失败**: 检查签名内容和证明材料
2. **模板审核失败**: 检查模板内容和申请说明
3. **发送失败**: 检查API密钥和配置参数
4. **费用问题**: 查看短信服务计费说明

---

**总结**: 腾讯云短信服务已完全集成到您的OfferCome平台中，只需要您完成腾讯云账号配置和环境变量设置，就可以实现真正的短信发送功能！ 