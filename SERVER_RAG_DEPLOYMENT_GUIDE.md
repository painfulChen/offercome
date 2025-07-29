# RAG系统服务器部署指南

## 📋 部署概述

本指南将帮助你将RAG系统部署到服务器上。系统包含完整的文档管理、搜索和AI增强功能。

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

```bash
# 1. 确保在项目根目录
cd /path/to/project

# 2. 运行部署脚本
./deploy-rag-server.sh
```

### 方法二：手动部署

#### 步骤1：准备服务器环境

```bash
# 连接到服务器
ssh ubuntu@124.222.117.47

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
npm install -g pm2

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# 安装Redis
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### 步骤2：上传项目文件

```bash
# 在本地执行
scp -r deploy-rag-local ubuntu@124.222.117.47:~/

# 或者使用其他方式上传文件
```

#### 步骤3：在服务器上部署

```bash
# 连接到服务器
ssh ubuntu@124.222.117.47

# 进入项目目录
cd ~/deploy-rag-local

# 安装数据库
chmod +x install-database.sh
./install-database.sh

# 进入服务器目录
cd server

# 安装依赖
npm install

# 启动服务
pm2 start index-local.js --name "rag-system"

# 保存PM2配置
pm2 save
pm2 startup
```

#### 步骤4：配置防火墙

```bash
# 开放3000端口
sudo ufw allow 3000
sudo ufw enable
```

## 🔧 配置说明

### 环境变量配置

编辑 `server/.env` 文件：

```env
# RAG系统环境配置
NODE_ENV=production
PORT=3000

# Kimi API配置
KIMI_API_KEY=sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/rag_system
REDIS_HOST=localhost
REDIS_PORT=6379

# 安全配置
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=*
```

### 数据库配置

MongoDB默认配置：
- 数据库：`rag_system`
- 用户：`rag_user`
- 密码：`rag_password_123`

## 📊 服务管理

### 查看服务状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs rag-system
```

### 重启服务
```bash
pm2 restart rag-system
```

### 停止服务
```bash
pm2 stop rag-system
```

### 删除服务
```bash
pm2 delete rag-system
```

## 🧪 测试部署

### 健康检查
```bash
curl http://124.222.117.47:3000/health
```

### RAG API测试
```bash
# 健康检查
curl http://124.222.117.47:3000/api/rag/health

# 文档列表
curl http://124.222.117.47:3000/api/rag/documents

# 上传测试文件
curl -X POST -F "file=@test.txt" -F "category=test" http://124.222.117.47:3000/api/rag/upload/local

# 搜索测试
curl -X POST -H "Content-Type: application/json" -d '{"query":"测试"}' http://124.222.117.47:3000/api/rag/search
```

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

- **健康检查**: http://124.222.117.47:3000/health
- **RAG管理界面**: http://124.222.117.47:3000/public/rag-admin-enhanced.html
- **API文档**: http://124.222.117.47:3000/api/rag/health

## 🔍 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口占用
   sudo lsof -i :3000
   
   # 检查日志
   pm2 logs rag-system
   ```

2. **数据库连接失败**
   ```bash
   # 检查MongoDB状态
   sudo systemctl status mongod
   
   # 检查Redis状态
   sudo systemctl status redis-server
   ```

3. **文件上传失败**
   ```bash
   # 检查上传目录权限
   sudo chmod 755 server/uploads
   ```

### 日志查看

```bash
# 查看PM2日志
pm2 logs rag-system

# 查看系统日志
sudo journalctl -u mongod
sudo journalctl -u redis-server
```

## 📝 API接口说明

### 核心接口

1. **健康检查**
   - GET `/health`
   - 返回服务状态信息

2. **RAG健康检查**
   - GET `/api/rag/health`
   - 返回RAG系统和数据库状态

3. **文档管理**
   - GET `/api/rag/documents` - 获取文档列表
   - POST `/api/rag/upload/local` - 上传本地文件
   - DELETE `/api/rag/documents/:id` - 删除文档

4. **搜索功能**
   - POST `/api/rag/search` - 搜索文档
   - 请求体：`{"query": "搜索关键词", "limit": 5}`

### 示例请求

```bash
# 上传文档
curl -X POST -F "file=@document.pdf" -F "category=resume" -F "tags=resume,job" http://124.222.117.47:3000/api/rag/upload/local

# 搜索文档
curl -X POST -H "Content-Type: application/json" -d '{"query":"简历优化"}' http://124.222.117.47:3000/api/rag/search

# 获取文档列表
curl http://124.222.117.47:3000/api/rag/documents
```

## 🎯 下一步

部署完成后，你可以：

1. **上传文档** - 通过管理界面上传各种格式的文档
2. **配置Kimi API** - 启用AI增强功能
3. **集成到其他系统** - 通过API接口集成到现有系统
4. **优化性能** - 根据使用情况调整配置参数

## 📞 技术支持

如果遇到问题，请检查：

1. 服务器日志：`pm2 logs rag-system`
2. 数据库状态：`sudo systemctl status mongod`
3. 网络连接：`curl http://localhost:3000/health`
4. 端口占用：`sudo lsof -i :3000`

---

**部署完成！** 🎉 你的RAG系统现在已经可以在服务器上运行了。 