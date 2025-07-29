# 🚀 RAG系统服务器部署完整指南

## 📋 部署概述

本指南将帮助你将RAG系统完整部署到服务器上，包括：
- ✅ 数据库安装和配置（MongoDB + Redis）
- ✅ 文件上传功能修复
- ✅ 数据持久化同步
- ✅ 完整的日志系统
- ✅ 生产环境优化

## 🗄️ 第一步：安装数据库

### 1.1 运行数据库安装脚本

```bash
# 给脚本执行权限
chmod +x install-database.sh

# 运行数据库安装
./install-database.sh
```

这个脚本会自动：
- 安装MongoDB和Redis
- 配置数据库服务
- 创建数据库用户
- 设置自动启动

### 1.2 验证数据库安装

```bash
# 检查MongoDB状态
sudo systemctl status mongod

# 检查Redis状态
sudo systemctl status redis-server

# 测试数据库连接
./check-database.sh
```

## 🖥️ 第二步：部署RAG系统

### 2.1 运行服务器部署脚本

```bash
# 给脚本执行权限
chmod +x deploy-server-rag.sh

# 运行服务器部署
./deploy-server-rag.sh
```

### 2.2 配置环境变量

编辑 `server/.env` 文件：

```env
# RAG系统环境配置
NODE_ENV=production
PORT=3000

# Kimi API配置
KIMI_API_KEY=your_actual_kimi_api_key_here

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/rag_system
# 或者使用云数据库
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rag_system

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 安全配置
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=*

# 性能配置
MAX_CONCURRENT_UPLOADS=5
VECTOR_STORE_SIZE=1000
```

### 2.3 初始化数据库

```bash
# 初始化数据库集合和索引
node init-database.js
```

## 🔧 第三步：启动服务

### 3.1 使用PM2启动

```bash
# 启动RAG系统
pm2 start ecosystem.config.js --env production

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3.2 使用管理脚本

```bash
# 启动服务
./start-rag.sh

# 检查状态
./status-rag.sh

# 查看日志
./logs-rag.sh
```

## 📊 第四步：验证部署

### 4.1 健康检查

```bash
# 运行健康检查
./health-check-rag.sh

# 测试文件上传
node test-upload-fix.js
```

### 4.2 访问地址

- **管理界面**: http://your-server-ip:3000/rag-admin.html
- **系统首页**: http://your-server-ip:3000/index-rag.html
- **API健康检查**: http://your-server-ip:3000/api/rag/health

## 🗄️ 数据库同步功能

### 数据持久化

系统现在支持完整的数据持久化：

1. **文档存储**: 所有上传的文档都会保存到MongoDB
2. **向量存储**: 文档向量也会保存到数据库
3. **元数据管理**: 完整的文档元数据管理
4. **搜索历史**: 记录搜索次数和相关性分数

### 数据库结构

```javascript
// RAG文档集合结构
{
  documentId: "唯一标识",
  title: "文档标题",
  type: "文档类型",
  fileName: "文件名",
  filePath: "文件路径",
  content: "文档内容",
  vectors: [向量数据],
  metadata: {
    category: "分类",
    tags: ["标签"],
    uploadedBy: "上传者",
    source: "来源"
  },
  stats: {
    searchCount: "搜索次数",
    lastSearched: "最后搜索时间",
    relevanceScore: "相关性分数"
  },
  status: "状态",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 同步机制

1. **实时同步**: 文档上传后立即同步到数据库
2. **内存缓存**: 保持内存中的快速访问
3. **错误处理**: 数据库连接失败时使用内存存储
4. **自动恢复**: 数据库恢复后自动加载数据

## 🔍 监控和管理

### 系统监控

```bash
# 查看PM2状态
pm2 status

# 查看实时日志
pm2 logs rag-system

# 监控系统资源
pm2 monit
```

### 数据库管理

```bash
# 备份数据库
./backup-database.sh

# 恢复数据库
./restore-database.sh <备份文件>

# 检查数据库状态
./check-database.sh
```

### 日志管理

```bash
# 查看应用日志
tail -f server/logs/info.log

# 查看错误日志
tail -f server/logs/error.log

# 查看上传日志
grep "文件上传" server/logs/info.log
```

## 🚀 生产环境优化

### 1. 性能优化

```bash
# 调整PM2配置
pm2 restart rag-system --max-memory-restart 1G

# 优化MongoDB
sudo systemctl set-property mongod CPUQuota=200%
```

### 2. 安全配置

```bash
# 配置防火墙
sudo ufw allow 3000
sudo ufw allow 27017
sudo ufw allow 6379

# 设置文件权限
chmod 600 server/.env
chmod 755 server/uploads
```

### 3. 备份策略

```bash
# 创建定时备份
crontab -e

# 添加每日备份任务
0 2 * * * /path/to/rag-system/backup-database.sh
```

## 🐛 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查MongoDB服务
sudo systemctl status mongod

# 检查Redis服务
sudo systemctl status redis-server

# 测试连接
mongo --eval "db.runCommand('ping')"
redis-cli ping
```

#### 2. 文件上传失败

```bash
# 检查上传目录权限
ls -la server/uploads/

# 检查磁盘空间
df -h

# 查看错误日志
tail -f server/logs/error.log
```

#### 3. 内存不足

```bash
# 查看内存使用
free -h

# 重启服务
pm2 restart rag-system

# 清理临时文件
find server/uploads -name "*.tmp" -delete
```

### 调试模式

```bash
# 启动调试模式
cd server && LOG_LEVEL=debug npm start

# 查看详细日志
tail -f server/logs/debug.log
```

## 📈 性能监控

### 系统指标

```bash
# 查看系统资源
htop

# 查看网络连接
netstat -tlnp

# 查看磁盘IO
iotop
```

### 应用指标

```bash
# 查看PM2指标
pm2 show rag-system

# 查看数据库统计
mongo rag_system --eval "db.stats()"

# 查看Redis信息
redis-cli info
```

## 🔄 更新和维护

### 系统更新

```bash
# 停止服务
pm2 stop rag-system

# 备份数据
./backup-database.sh

# 更新代码
git pull origin main

# 安装新依赖
cd server && npm install

# 重启服务
pm2 start rag-system
```

### 数据维护

```bash
# 清理旧日志
find server/logs -name "*.log" -mtime +30 -delete

# 清理临时文件
find server/uploads -name "*.tmp" -mtime +1 -delete

# 优化数据库
mongo rag_system --eval "db.runCommand('compact')"
```

## 📞 技术支持

### 日志文件位置

- **应用日志**: `server/logs/`
- **PM2日志**: `~/.pm2/logs/`
- **MongoDB日志**: `/var/log/mongodb/`
- **Redis日志**: `/var/log/redis/`

### 联系信息

如果遇到问题，请按以下顺序排查：

1. 查看应用日志: `tail -f server/logs/error.log`
2. 运行健康检查: `./health-check-rag.sh`
3. 检查数据库状态: `./check-database.sh`
4. 查看系统资源: `pm2 monit`

---

## 🎉 部署完成！

恭喜！你的RAG系统已经成功部署到服务器上，并具备了：

✅ **完整的数据持久化**  
✅ **文件上传功能**  
✅ **数据库同步**  
✅ **日志系统**  
✅ **监控管理**  
✅ **备份恢复**  

现在你可以开始使用这个强大的RAG系统了！ 