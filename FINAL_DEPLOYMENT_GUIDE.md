# CloudBase AI 数据持久化部署完整指南

## 🎯 项目概述

本项目是一个基于腾讯云CloudBase的AI开发框架，现已实现完整的数据持久化存储和自动化部署方案。

## 📋 功能特性

### ✅ 数据持久化
- MySQL数据库存储
- 自动备份和恢复
- 数据迁移工具
- 事务支持

### ✅ 自动化部署
- CloudBase云函数部署
- 传统服务器部署
- CI/CD流程
- 健康检查

### ✅ 监控维护
- 性能监控
- 实时日志
- 错误告警
- 数据备份

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <your-repo-url>
cd project

# 安装依赖
npm install

# 设置环境变量
export DB_HOST=your-db-host
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export DB_NAME=cloudbase_ai
export ENV_ID=your-env-id
```

### 2. 数据库初始化

```bash
# 初始化数据库
npm run init-db

# 测试数据库连接
npm run db-test
```

### 3. 部署应用

```bash
# 自动化部署（推荐）
npm run auto-deploy

# 或手动部署
npm run deploy
```

## 📊 数据管理

### 数据备份

```bash
# 备份所有表
npm run backup

# 备份特定表
npm run backup-table users

# 查看备份列表
npm run list-backups

# 清理旧备份
npm run cleanup-backups 30
```

### 数据恢复

```bash
# 恢复单个表
npm run restore database-backups/users_2024-01-01.json

# 恢复完整备份
node server/scripts/backup-restore.js restore-full database-backups/full_backup_2024-01-01.json
```

### 数据迁移

```bash
# 从JSON文件迁移
npm run migrate-json data.json users

# 从MongoDB迁移
npm run migrate-mongo users users '{"_id":"id","username":"username","email":"email"}'

# 执行完整迁移
npm run migrate full-migration
```

## 🔍 监控和性能

### 性能监控

```bash
# 生成性能报告
npm run performance-report

# 实时监控
npm run performance-monitor

# 性能测试
npm run performance-test
```

### 健康检查

```bash
# 检查服务状态
npm run health-check

# 检查数据库连接
npm run db-test

# API健康检查
curl -f http://your-api-domain/api/health
```

## 🛠️ 部署选项

### 选项1: CloudBase云函数部署

```bash
# 设置环境变量
export DEPLOY_TO_CLOUDBASE=true
export ENV_ID=your-env-id

# 执行部署
npm run auto-deploy
```

### 选项2: 传统服务器部署

```bash
# 设置环境变量
export DEPLOY_TO_SERVER=true
export SERVER_HOST=your-server-ip
export SERVER_USER=your-username

# 执行部署
npm run auto-deploy
```

### 选项3: 混合部署

```bash
# 同时部署到CloudBase和传统服务器
export DEPLOY_TO_CLOUDBASE=true
export DEPLOY_TO_SERVER=true
export ENV_ID=your-env-id
export SERVER_HOST=your-server-ip
export SERVER_USER=your-username

npm run auto-deploy
```

## 📁 项目结构

```
project/
├── server/                          # 后端服务
│   ├── config/                      # 配置文件
│   │   └── database-persistent.js   # 数据库配置
│   ├── models/                      # 数据模型
│   │   ├── PersistentModel.js       # 持久化基础模型
│   │   └── User.js                  # 用户模型
│   ├── scripts/                     # 脚本工具
│   │   ├── init-database-persistent.js  # 数据库初始化
│   │   ├── backup-restore.js        # 备份恢复
│   │   ├── migrate-data.js          # 数据迁移
│   │   └── performance-monitor.js   # 性能监控
│   └── handlers/                    # 处理器
│       └── health-check.js          # 健康检查
├── miniprogram/                     # 微信小程序
├── public/                          # 静态资源
├── deploy-persistent.sh             # 部署脚本
├── auto-deploy.sh                   # 自动化部署脚本
├── cloudbaserc-persistent.json      # CloudBase配置
└── package.json                     # 项目配置
```

## 🔧 常用命令

### 开发命令

```bash
# 本地开发
npm run dev

# 启动生产服务
npm start

# 运行测试
npm test
```

### 数据库命令

```bash
# 初始化数据库
npm run init-db

# 测试数据库连接
npm run db-test

# 数据备份
npm run backup

# 数据恢复
npm run restore <backup-file>
```

### 部署命令

```bash
# 手动部署
npm run deploy

# 自动化部署
npm run auto-deploy

# 健康检查
npm run health-check
```

### 监控命令

```bash
# 性能报告
npm run performance-report

# 实时监控
npm run performance-monitor

# 性能测试
npm run performance-test
```

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查环境变量
echo $DB_HOST $DB_USER $DB_PASSWORD

# 测试连接
npm run db-test

# 检查防火墙
sudo ufw status
```

#### 2. 部署失败

```bash
# 检查CloudBase CLI
tcb --version

# 重新登录
tcb login

# 检查环境ID
echo $ENV_ID
```

#### 3. 性能问题

```bash
# 生成性能报告
npm run performance-report

# 检查数据库性能
mysql -u root -p -e "SHOW PROCESSLIST;"

# 检查应用日志
pm2 logs cloudbase-ai
```

### 日志文件

```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 查看访问日志
tail -f logs/access.log
```

## 📈 性能优化

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_ai_calls_created_at ON ai_calls(created_at);

-- 优化查询
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

### 应用优化

```javascript
// 启用缓存
const redis = require('redis');
const client = redis.createClient();

// 连接池优化
const pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000
});
```

## 🔒 安全配置

### 环境变量安全

```bash
# 使用强密码
export JWT_SECRET=your-very-long-and-random-secret-key
export DB_PASSWORD=your-strong-db-password

# 定期更换密钥
# 使用密钥管理服务
```

### 网络安全

```bash
# 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 启用SSL
# 配置HTTPS
```

## 📞 技术支持

### 联系方式

- **项目文档**: [项目Wiki]
- **问题反馈**: [GitHub Issues]
- **技术支持**: [技术支持邮箱]

### 社区资源

- **CloudBase文档**: [腾讯云CloudBase]
- **MySQL文档**: [MySQL官方文档]
- **Node.js文档**: [Node.js官方文档]

## 🎉 完成！

恭喜您！现在您已经拥有了一个完整的、可扩展的、生产就绪的CloudBase AI开发框架，具备：

- ✅ **数据持久化**: 可靠的MySQL数据存储
- ✅ **自动化部署**: 完整的CI/CD流程
- ✅ **监控维护**: 全面的性能监控
- ✅ **备份恢复**: 自动化的数据保护
- ✅ **安全配置**: 生产级安全设置

开始您的AI开发之旅吧！🚀 