# 🎯 CodeBuddy配置HTTP触发器指南

## 方法1：通过CodeBuddy控制台配置

### 步骤1：访问CodeBuddy控制台
1. 打开浏览器访问：https://console.cloud.tencent.com/codebuddy
2. 使用您的腾讯云账号登录

### 步骤2：选择项目
1. 在CodeBuddy控制台中找到您的项目
2. 点击进入项目详情页面

### 步骤3：配置CloudBase函数
1. 在左侧菜单选择"云开发"
2. 选择环境：`offercome2025-9g14jitp22f4ddfc`
3. 点击"云函数"模块

### 步骤4：配置HTTP触发器
1. 找到名为"api"的函数
2. 点击函数名称进入详情页
3. 点击"触发管理"标签
4. 点击"新建触发器"
5. 配置参数：
   - **触发器类型**：HTTP触发器
   - **路径**：`/*`
   - **请求方法**：ALL
   - **描述**：API访问触发器
6. 点击"确定"保存

### 步骤5：获取触发器URL
配置完成后，复制生成的HTTP触发器URL

## 方法2：通过CodeBuddy CLI配置

### 安装CodeBuddy CLI
```bash
npm install -g @tencent/codebuddy-cli
```

### 登录CodeBuddy
```bash
codebuddy login
```

### 配置HTTP触发器
```bash
# 列出当前环境
codebuddy env list

# 配置HTTP触发器
codebuddy function trigger create \
  --env-id offercome2025-9g14jitp22f4ddfc \
  --function-name api \
  --trigger-type http \
  --path "/*" \
  --method ALL \
  --description "API访问触发器"
```

## 方法3：通过API配置

### 使用腾讯云API
```bash
# 获取访问密钥
export TENCENT_SECRET_ID="您的SecretId"
export TENCENT_SECRET_KEY="您的SecretKey"

# 创建HTTP触发器
curl -X POST \
  "https://tcb.tencentcloudapi.com/" \
  -H "Content-Type: application/json" \
  -H "X-TC-Action: CreateTrigger" \
  -H "X-TC-Version: 2018-06-08" \
  -H "X-TC-Region: ap-shanghai" \
  -d '{
    "FunctionName": "api",
    "TriggerName": "http-trigger",
    "Type": "http",
    "Enable": "ENABLE",
    "Qualifier": "$LATEST",
    "EnvironmentId": "offercome2025-9g14jitp22f4ddfc"
  }'
```

## 验证配置

### 测试HTTP触发器
```bash
# 获取触发器URL后测试
curl -X GET "您的触发器URL/api/health"
curl -X POST "您的触发器URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"测试消息"}'
```

## 更新前端页面

配置完成后，更新前端页面中的API URL：

```javascript
// 在public/kimi-api-tester.html中更新
const API_BASE_URL = "您的HTTP触发器URL";
```

## 注意事项

1. **权限要求**：确保您的账号有CloudBase函数管理权限
2. **环境ID**：确认使用正确的环境ID：`offercome2025-9g14jitp22f4ddfc`
3. **函数名称**：确认函数名称为：`api`
4. **路径配置**：使用`/*`路径以支持所有API端点

## 故障排除

### 常见问题
1. **权限不足**：联系管理员分配CloudBase管理权限
2. **环境不存在**：确认环境ID正确
3. **函数不存在**：确认函数已正确部署
4. **触发器创建失败**：检查网络连接和API密钥

### 调试命令
```bash
# 查看函数状态
codebuddy function list --env-id offercome2025-9g14jitp22f4ddfc

# 查看触发器列表
codebuddy function trigger list --env-id offercome2025-9g14jitp22f4ddfc

# 查看函数日志
codebuddy function log --env-id offercome2025-9g14jitp22f4ddfc --function-name api
``` 