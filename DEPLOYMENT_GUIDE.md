# CloudBase部署指南

## 问题解决

### 1. 原始问题
- **错误**: `HTTP 400: {"code":"FUNCTION_INVOCATION_FAILED","message":"Function code exception caught"`
- **原因**: CloudBase函数代码异常，可能是依赖问题或代码错误

### 2. 解决方案

#### 步骤1: 运行修复脚本
```bash
./fix-cloudbase-deployment.sh
```

#### 步骤2: 检查修复结果
- ✅ 移除了有问题的cloudbase依赖
- ✅ 创建了新的CloudBase函数入口文件
- ✅ 生成了部署脚本

#### 步骤3: 测试本地函数
```bash
node test-cloudbase-function.js
```

## 部署步骤

### 1. 环境准备
```bash
# 安装CloudBase CLI
npm install -g @cloudbase/cli

# 登录CloudBase
cloudbase login
```

### 2. 配置环境变量
编辑 `.env` 文件：
```bash
# 服务器配置
NODE_ENV=production
PORT=3000

# CloudBase配置
CLOUDBASE_ENV_ID=offercome2025-9g14jitp22f4ddfc

# AI服务配置
KIMI_API_KEY=your_kimi_api_key_here

# 监控配置
ENABLE_MONITORING=true
COST_TRACKING_ENABLED=true
```

### 3. 部署到CloudBase
```bash
# 使用修复后的部署脚本
./deploy-cloudbase-fixed.sh
```

### 4. 验证部署
```bash
# 测试健康检查
curl https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api/health

# 测试AI聊天
curl -X POST https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"测试消息"}'

# 测试成本统计
curl https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api/cost/stats
```

## 功能验证

### 1. 健康检查
- **接口**: `GET /api/health`
- **功能**: 检查CloudBase函数运行状态
- **预期响应**: 
```json
{
  "success": true,
  "message": "CloudBase函数正常运行",
  "timestamp": "2025-07-26T07:22:29.132Z",
  "environment": "cloudbase"
}
```

### 2. AI聊天
- **接口**: `POST /api/ai/chat`
- **功能**: 提供AI招生咨询服务
- **请求体**: `{"message": "用户消息"}`
- **预期响应**:
```json
{
  "success": true,
  "message": "AI响应内容",
  "model": "kimi-simulated",
  "timestamp": "2025-07-26T07:22:29.133Z"
}
```

### 3. 成本统计
- **接口**: `GET /api/cost/stats`
- **功能**: 获取API调用成本统计
- **预期响应**:
```json
{
  "success": true,
  "total_cost": 0,
  "total_calls": 3372,
  "api_types": {
    "kimi-simulated": {"calls": 1694, "cost": 0},
    "health-check": {"calls": 1676, "cost": 0}
  },
  "message": "统计完成，共3372次调用，总成本¥0.00"
}
```

### 4. 最近记录
- **接口**: `GET /api/cost/recent?limit=10`
- **功能**: 获取最近的成本记录
- **参数**: `limit` - 记录数量限制

### 5. 清除日志
- **接口**: `DELETE /api/cost/clear`
- **功能**: 清除成本跟踪日志

## 故障排除

### 1. 函数调用失败
**问题**: `FUNCTION_INVOCATION_FAILED`
**解决**:
- 检查函数内存设置（建议128MB）
- 检查函数超时设置（建议5秒）
- 检查代码语法错误

### 2. 成本统计无法查询
**问题**: 成本数据为空
**解决**:
- 检查日志文件权限
- 确保日志目录存在
- 检查环境变量配置

### 3. 网络连接问题
**问题**: 无法访问CloudBase
**解决**:
- 检查网络连接
- 确认CloudBase环境ID正确
- 检查防火墙设置

## 监控和维护

### 1. 日志查看
```bash
# 查看函数日志
cloudbase functions:log api

# 查看部署日志
cloudbase hosting:log
```

### 2. 性能监控
```bash
# 启动性能监控
node performance-monitor.js

# 查看系统状态
./system-status.sh
```

### 3. 成本跟踪
```bash
# 查看成本统计
curl http://localhost:3000/api/cost/stats

# 查看最近记录
curl "http://localhost:3000/api/cost/recent?limit=10"
```

## 最佳实践

### 1. 开发环境
- 使用本地服务器进行开发和测试
- 定期同步代码到CloudBase
- 保持环境变量的一致性

### 2. 生产环境
- 使用CloudBase进行生产部署
- 定期备份数据和配置
- 监控系统性能和成本

### 3. 安全考虑
- 保护API密钥和敏感信息
- 使用HTTPS进行数据传输
- 定期更新依赖包

## 联系支持

如果遇到问题，请：
1. 查看CloudBase控制台日志
2. 检查函数配置和权限
3. 联系技术支持团队

---

**版本**: 1.0.0  
**最后更新**: 2025-07-26  
**维护者**: OfferCome团队 