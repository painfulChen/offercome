# 🚀 RAG系统快速部署指南

## 📋 问题修复总结

### 1. 文件上传接口修复
- ✅ 修复了multipart/form-data解析问题
- ✅ 添加了完整的文件处理逻辑
- ✅ 支持单文件和批量文件上传
- ✅ 添加了详细的错误处理和日志记录

### 2. 日志系统增强
- ✅ 创建了专门的日志工具类
- ✅ 支持不同级别的日志记录
- ✅ 添加了文件上传专用日志
- ✅ 添加了RAG操作专用日志
- ✅ 支持日志文件轮转和清理

## 🛠️ 快速部署步骤

### 步骤1: 本地测试部署

```bash
# 1. 运行部署脚本
./deploy-rag-system.sh

# 2. 启动服务
cd server && npm start

# 3. 测试文件上传
node test-upload-fix.js
```

### 步骤2: 服务器部署

```bash
# 1. 上传代码到服务器
scp -r . user@your-server:/path/to/rag-system/

# 2. 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /path/to/rag-system/

# 4. 运行服务器部署脚本
./deploy-server-rag.sh
```

### 步骤3: 配置环境变量

编辑 `server/.env` 文件：

```env
# RAG系统环境配置
NODE_ENV=production
PORT=3000

# Kimi API配置
KIMI_API_KEY=your_actual_kimi_api_key_here

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 安全配置
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=*
```

### 步骤4: 启动服务

```bash
# 使用PM2启动
pm2 start ecosystem.config.js --env production

# 或者使用管理脚本
./start-rag.sh
```

## 🔧 管理命令

### 服务管理
```bash
# 启动服务
./start-rag.sh

# 停止服务
./stop-rag.sh

# 重启服务
./restart-rag.sh

# 查看状态
./status-rag.sh

# 查看日志
./logs-rag.sh
```

### 健康检查
```bash
# 运行健康检查
./health-check-rag.sh

# 测试文件上传
node test-upload-fix.js
```

### 备份管理
```bash
# 创建备份
./backup-rag.sh

# 查看备份
ls -la backups/
```

## 📊 系统监控

### 日志文件位置
- 应用日志: `server/logs/`
- PM2日志: `~/.pm2/logs/`
- 上传文件: `server/uploads/`

### 监控命令
```bash
# 查看PM2状态
pm2 status

# 查看实时日志
pm2 logs rag-system

# 查看系统资源
pm2 monit
```

## 🐛 故障排除

### 常见问题

#### 1. 文件上传失败
```bash
# 检查日志
tail -f server/logs/error.log

# 检查上传目录权限
ls -la server/uploads/

# 检查文件大小限制
grep MAX_FILE_SIZE server/.env
```

#### 2. API调用失败
```bash
# 检查服务状态
curl http://localhost:3000/api/rag/health

# 检查端口占用
netstat -tlnp | grep :3000

# 检查防火墙
sudo ufw status
```

#### 3. 内存不足
```bash
# 查看内存使用
free -h

# 重启服务
pm2 restart rag-system

# 调整内存限制
# 编辑 ecosystem.config.js 中的 max_memory_restart
```

### 调试模式

```bash
# 启动调试模式
cd server && npm run dev

# 查看详细日志
LOG_LEVEL=debug npm start
```

## 📈 性能优化

### 1. 文件上传优化
- 设置合适的文件大小限制
- 启用文件压缩
- 使用CDN存储大文件

### 2. 内存优化
- 定期清理临时文件
- 设置合理的向量存储大小
- 启用垃圾回收

### 3. 并发优化
- 调整PM2实例数
- 设置合理的并发上传限制
- 使用负载均衡

## 🔒 安全配置

### 1. 环境变量安全
```bash
# 生成安全的JWT密钥
openssl rand -base64 32

# 设置文件权限
chmod 600 server/.env
```

### 2. 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### 3. Nginx安全配置
```nginx
# 添加安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
```

## 📝 使用示例

### 1. 上传简历
```javascript
// 前端代码示例
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'resume');
formData.append('tags', 'javascript,frontend');

fetch('/api/rag/upload/local', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log('上传成功:', data));
```

### 2. 搜索文档
```javascript
// 搜索示例
fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: 'JavaScript开发经验',
        limit: 5
    })
})
.then(response => response.json())
.then(data => console.log('搜索结果:', data));
```

## 🎯 部署检查清单

- [ ] 环境变量配置完成
- [ ] Kimi API Key已设置
- [ ] 文件上传目录权限正确
- [ ] 日志目录创建完成
- [ ] PM2安装并配置
- [ ] 防火墙端口开放
- [ ] Nginx配置完成（如需要）
- [ ] 健康检查通过
- [ ] 文件上传测试通过
- [ ] 文档搜索测试通过

## 📞 技术支持

如果遇到问题，请按以下顺序排查：

1. 查看日志文件: `server/logs/`
2. 运行健康检查: `./health-check-rag.sh`
3. 测试文件上传: `node test-upload-fix.js`
4. 检查系统资源: `pm2 monit`
5. 查看PM2日志: `pm2 logs rag-system`

---

**🎉 恭喜！你的RAG系统已经成功部署并可以正常使用文件上传功能了！** 