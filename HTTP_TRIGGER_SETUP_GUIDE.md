# 🔧 HTTP触发器配置指南

## 🚨 当前问题

云端API返回 `INVALID_PATH` 错误，这是因为没有配置HTTP触发器。

### 错误信息
```
{"code":"INVALID_PATH","message":"Invalid path. For more information, please refer to https://docs.cloudbase.net/error-code/service"}
```

## 🔧 解决方案

### 方法1: 通过CloudBase控制台配置

1. **登录CloudBase控制台**
   - 访问: https://console.cloud.tencent.com/tcb
   - 选择环境: `offercome2025-9g14jitp22f4ddfc`

2. **进入云函数管理**
   - 点击左侧菜单 "云函数"
   - 找到函数 `api`

3. **配置HTTP触发器**
   - 点击函数名称进入详情页
   - 点击 "触发器" 标签页
   - 点击 "创建触发器"
   - 选择类型: `HTTP触发器`
   - 配置信息:
     - 名称: `api-http-trigger`
     - 路径: `/api/*`
     - 方法: `GET, POST, PUT, DELETE, OPTIONS`

4. **保存配置**
   - 点击 "确定" 保存触发器配置

### 方法2: 通过CLI配置（如果支持）

```bash
# 创建触发器配置文件
cat > trigger-config.json << EOF
{
  "name": "api-http-trigger",
  "type": "http",
  "config": {
    "path": "/api/*",
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
}
EOF

# 应用触发器配置
tcb fn trigger create api -e offercome2025-9g14jitp22f4ddfc --config trigger-config.json
```

## 📋 配置详情

### 触发器配置
```json
{
  "name": "api-http-trigger",
  "type": "http",
  "config": {
    "path": "/api/*",
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
}
```

### 支持的API路径
- `GET /api/health` - 健康检查
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/ai/chat` - AI聊天

## 🧪 测试步骤

### 1. 配置触发器后测试
```bash
# 测试健康检查
curl -X GET "https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api/health"

# 测试用户注册
curl -X POST "https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# 测试AI聊天
curl -X POST "https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

### 2. 访问测试页面
- 地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/test-frontend.html
- 点击 "测试API连接" 按钮
- 应该显示 "✅ 云端API连接成功！"

## 🔍 验证方法

### 1. 检查触发器状态
```bash
tcb fn detail api -e offercome2025-9g14jitp22f4ddfc
```

应该看到触发器配置信息。

### 2. 测试API响应
```bash
curl -s "https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api/health" | jq
```

应该返回:
```json
{
  "success": true,
  "message": "招生管理系统API服务正常运行",
  "timestamp": "2025-07-27T...",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🚀 预期结果

配置HTTP触发器后：

1. **API可访问**: 所有API端点都可以通过HTTP访问
2. **测试页面正常**: 测试页面可以正常调用云端API
3. **功能完整**: 注册、登录、AI聊天等功能都正常工作

## 📞 访问地址

- **测试页面**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/test-frontend.html
- **主页面**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/index.html
- **管理页面**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/admin-dashboard-simple.html

---

**重要**: 请按照上述步骤在CloudBase控制台配置HTTP触发器，这是解决API访问问题的关键步骤。 