# 🗄️ 数据库集成说明

## 📋 概述

本项目已成功集成MongoDB数据库，用于存储用户信息、AI调用记录、系统日志等数据。

## 🏗️ 数据库架构

### 数据模型

#### 1. 用户模型 (User)
- **功能**: 存储用户账户信息
- **字段**: 用户名、邮箱、密码、角色、状态等
- **特性**: 密码加密、登录统计、API使用限制

#### 2. AI调用记录 (AICall)
- **功能**: 记录所有AI API调用
- **字段**: 用户ID、请求数据、响应数据、成本、响应时间等
- **特性**: 统计分析、成本追踪、性能监控

#### 3. 系统日志 (SystemLog)
- **功能**: 记录系统运行日志
- **字段**: 日志级别、模块、消息、详细信息等
- **特性**: 错误追踪、性能监控、审计日志

## 🔧 配置说明

### 环境变量

在CloudBase函数环境中配置以下环境变量：

```bash
# MongoDB连接字符串
MONGODB_URI=mongodb://your-mongodb-host:27017/cloudbase_ai

# Redis连接字符串（可选）
REDIS_URL=redis://your-redis-host:6379

# CloudBase环境ID
CLOUDBASE_ENV_ID=offercome2025-9g14jitp22f4ddfc
```

### 数据库连接

项目支持以下数据库连接方式：

1. **本地MongoDB**: `mongodb://localhost:27017/cloudbase_ai`
2. **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/cloudbase_ai`
3. **腾讯云MongoDB**: `mongodb://username:password@your-instance.mongodb.tencentcloudapi.com:27017/cloudbase_ai`

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install mongoose bcryptjs redis
```

### 2. 测试数据库连接

```bash
node test-database.js
```

### 3. 初始化数据库

```bash
node server/init-database.js
```

### 4. 使用管理脚本

```bash
./manage-database.sh
```

## 📊 数据库功能

### 用户管理
- ✅ 用户注册和登录
- ✅ 密码加密存储
- ✅ 角色权限管理
- ✅ 登录历史记录
- ✅ API使用限制

### AI调用统计
- ✅ 调用次数统计
- ✅ 成本分析
- ✅ 响应时间监控
- ✅ 成功率统计
- ✅ 用户行为分析

### 系统监控
- ✅ 系统日志记录
- ✅ 错误追踪
- ✅ 性能监控
- ✅ 安全审计

## 🔍 API端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证Token

### 用户管理
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `PUT /api/admin/users` - 更新用户
- `DELETE /api/admin/users` - 删除用户

### 统计分析
- `GET /api/admin/ai-stats` - AI调用统计
- `GET /api/admin/logs` - 系统日志
- `GET /api/admin/ai-calls` - AI调用记录

## 🛡️ 安全特性

### 数据安全
- ✅ 密码bcrypt加密
- ✅ Token身份验证
- ✅ 数据库连接加密
- ✅ 输入数据验证

### 访问控制
- ✅ 角色权限管理
- ✅ API访问限制
- ✅ 登录状态检查
- ✅ 操作日志记录

## 📈 性能优化

### 数据库优化
- ✅ 索引优化
- ✅ 连接池管理
- ✅ 查询优化
- ✅ 数据分页

### 缓存策略
- ✅ Redis缓存支持
- ✅ 查询结果缓存
- ✅ 会话数据缓存
- ✅ 热点数据缓存

## 🔧 维护操作

### 数据备份
```bash
# 备份数据库
mongodump --db cloudbase_ai --out ./backup

# 恢复数据库
mongorestore --db cloudbase_ai ./backup/cloudbase_ai
```

### 日志清理
```javascript
// 清理30天前的日志
await SystemLog.cleanOldLogs(30);
```

### 性能监控
```javascript
// 获取系统统计
const stats = await AICall.getSystemStats();
console.log('系统统计:', stats);
```

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MongoDB服务是否运行
   - 验证连接字符串格式
   - 检查网络连接和防火墙

2. **认证失败**
   - 检查用户密码是否正确
   - 验证Token是否有效
   - 检查用户状态是否激活

3. **性能问题**
   - 检查数据库索引
   - 优化查询语句
   - 增加缓存策略

### 调试工具

```bash
# 测试数据库连接
node test-database.js

# 查看系统日志
curl -X GET "https://your-api-url/api/admin/logs"

# 检查AI调用统计
curl -X GET "https://your-api-url/api/admin/ai-stats"
```

## 📚 相关文档

- [MongoDB官方文档](https://docs.mongodb.com/)
- [Mongoose文档](https://mongoosejs.com/docs/)
- [CloudBase文档](https://docs.cloudbase.net/)
- [项目架构说明](./PROJECT_STRUCTURE.md)

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📞 技术支持

如有问题，请通过以下方式联系：

- 📧 邮箱: support@example.com
- 💬 微信群: 扫描二维码加入
- 📖 文档: [项目Wiki](https://github.com/your-repo/wiki)

---

**最后更新**: 2025-07-26
**版本**: 1.0.0 