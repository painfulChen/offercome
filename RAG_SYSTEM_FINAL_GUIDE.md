# 🚀 RAG系统完整指南 - 线上功能打通

## 📋 系统概述

RAG（Retrieval Augmented Generation）系统是一个智能文档检索与管理系统，专为求职陪跑服务设计。系统支持多种文档格式的上传、处理和检索，并具备完整的数据持久化功能。

### ✨ 核心特性

- ✅ **多格式文档支持**: PDF、Word、图片、文本文件
- ✅ **飞书集成**: 支持飞书文档和表格导入
- ✅ **智能搜索**: 基于向量相似度的文档检索
- ✅ **数据持久化**: MongoDB + Redis 双重存储
- ✅ **实时同步**: 文档上传后立即同步到数据库
- ✅ **完整日志**: 详细的操作日志和错误追踪
- ✅ **管理界面**: 直观的Web管理界面
- ✅ **API接口**: RESTful API支持

## 🗄️ 数据库架构

### MongoDB 文档结构

```javascript
{
  documentId: "唯一标识",
  title: "文档标题",
  type: "文档类型", // local_file, feishu_document, feishu_spreadsheet, image, document, text
  fileName: "文件名",
  filePath: "文件路径",
  fileSize: "文件大小",
  mimeType: "MIME类型",
  content: "文档内容",
  vectors: [向量数据],
  vectorDimension: "向量维度",
  metadata: {
    category: "分类", // resume, interview, career, skills, general
    tags: ["标签"],
    uploadedBy: "上传者",
    source: "来源", // local_file, feishu, api
    url: "原始URL",
    originalName: "原始文件名",
    processedAt: "处理时间"
  },
  stats: {
    searchCount: "搜索次数",
    lastSearched: "最后搜索时间",
    relevanceScore: "相关性分数"
  },
  status: "状态", // active, inactive, processing, error
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### Redis 缓存结构

- **会话管理**: 用户会话和临时数据
- **搜索结果缓存**: 频繁搜索结果的缓存
- **系统状态**: 实时系统状态信息

## 🚀 快速部署

### 方式一：一键部署（推荐）

```bash
# 1. 给脚本执行权限
chmod +x deploy-rag-complete.sh

# 2. 运行一键部署
./deploy-rag-complete.sh
```

这个脚本会自动完成：
- 安装MongoDB和Redis
- 部署RAG系统
- 配置环境变量
- 初始化数据库
- 启动服务
- 运行功能测试

### 方式二：分步部署

#### 1. 安装数据库

```bash
# 安装MongoDB和Redis
./install-database.sh
```

#### 2. 部署RAG系统

```bash
# 部署系统
./deploy-server-rag.sh
```

#### 3. 配置环境变量

编辑 `server/.env` 文件：

```env
# Kimi API配置
KIMI_API_KEY=your_actual_kimi_api_key_here

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/rag_system

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 其他配置...
```

#### 4. 初始化数据库

```bash
# 初始化数据库集合和索引
node init-database.js
```

#### 5. 启动服务

```bash
# 使用PM2启动
pm2 start ecosystem.config.js --env production

# 或使用管理脚本
./start-rag-complete.sh
```

## 📊 系统管理

### 管理命令

```bash
# 启动系统
./start-rag-complete.sh

# 停止系统
./stop-rag-complete.sh

# 重启系统
./restart-rag-complete.sh

# 查看状态
./status-rag-complete.sh

# 查看日志
./logs-rag-complete.sh
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

### 健康检查

```bash
# 系统健康检查
curl http://localhost:3000/api/rag/health

# 查看详细统计
curl http://localhost:3000/api/rag/stats
```

## 🔧 功能使用

### 1. 文档上传

#### 单文件上传

```javascript
// 使用FormData上传文件
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'resume');
formData.append('tags', 'javascript,前端,React');

fetch('/api/rag/upload/local', {
    method: 'POST',
    body: formData
});
```

#### 批量上传

```javascript
const formData = new FormData();
files.forEach(file => {
    formData.append('files', file);
});
formData.append('category', 'batch');

fetch('/api/rag/upload/batch', {
    method: 'POST',
    body: formData
});
```

#### 飞书文档上传

```javascript
fetch('/api/rag/upload/feishu-document', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://your-company.feishu.cn/docx/...',
        category: 'feishu'
    })
});
```

### 2. 文档搜索

#### 基础搜索

```javascript
fetch('/api/rag/search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: 'JavaScript开发经验',
        limit: 5
    })
});
```

#### 高级搜索

```javascript
fetch('/api/rag/search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: '面试准备',
        category: 'interview',
        tags: ['前端', 'React'],
        limit: 10
    })
});
```

### 3. 文档管理

#### 获取文档列表

```javascript
// 获取所有文档
fetch('/api/rag/documents');

// 按分类过滤
fetch('/api/rag/documents?category=resume');
```

#### 获取文档详情

```javascript
fetch(`/api/rag/documents/${documentId}`);
```

#### 删除文档

```javascript
fetch(`/api/rag/documents/${documentId}`, {
    method: 'DELETE'
});
```

### 4. 系统监控

#### 健康检查

```javascript
fetch('/api/rag/health').then(response => {
    const health = response.json();
    console.log('数据库连接:', health.database.connected);
    console.log('文档数量:', health.database.documents);
    console.log('服务状态:', health.services);
});
```

#### 统计信息

```javascript
fetch('/api/rag/stats').then(response => {
    const stats = response.json();
    console.log('总文档数:', stats.totalDocuments);
    console.log('总大小:', stats.totalSize);
    console.log('分类分布:', stats.categories);
});
```

## 🎯 API接口文档

### 基础端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/rag/health` | 系统健康检查 |
| GET | `/api/rag/stats` | 系统统计信息 |
| GET | `/api/rag/supported-types` | 支持的文件类型 |

### 文档管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/rag/upload/local` | 单文件上传 |
| POST | `/api/rag/upload/batch` | 批量文件上传 |
| POST | `/api/rag/upload/feishu-document` | 飞书文档上传 |
| POST | `/api/rag/upload/feishu-spreadsheet` | 飞书表格上传 |
| GET | `/api/rag/documents` | 获取文档列表 |
| GET | `/api/rag/documents/:id` | 获取文档详情 |
| DELETE | `/api/rag/documents/:id` | 删除文档 |

### 搜索功能

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/rag/search` | 文档搜索 |

### 日志管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/rag/logs` | 获取日志 |
| POST | `/api/rag/logs/clear` | 清理日志 |

## 🧪 测试验证

### 功能测试

```bash
# 运行完整的数据库同步测试
node test-database-sync.js

# 运行文件上传测试
node test-upload-fix.js
```

### 手动测试

1. **健康检查**
   ```bash
   curl http://localhost:3000/api/rag/health
   ```

2. **文件上传测试**
   ```bash
   curl -X POST -F "file=@test.pdf" -F "category=test" -F "tags=test" http://localhost:3000/api/rag/upload/local
   ```

3. **搜索测试**
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"query":"测试","limit":5}' http://localhost:3000/api/rag/search
   ```

## 📈 性能优化

### 数据库优化

1. **MongoDB索引**
   ```javascript
   // 创建文本索引
   db.rag_documents.createIndex({content: "text", title: "text"});
   
   // 创建复合索引
   db.rag_documents.createIndex({category: 1, tags: 1});
   ```

2. **Redis配置**
   ```bash
   # 设置内存限制
   redis-cli config set maxmemory 256mb
   redis-cli config set maxmemory-policy allkeys-lru
   ```

### 应用优化

1. **连接池配置**
   ```javascript
   // MongoDB连接池
   maxPoolSize: 10,
   serverSelectionTimeoutMS: 5000,
   
   // Redis连接池
   maxRetriesPerRequest: 3,
   retryDelayOnFailover: 100
   ```

2. **文件上传优化**
   ```javascript
   // 设置最大文件大小
   MAX_FILE_SIZE: 10485760, // 10MB
   
   // 并发上传限制
   MAX_CONCURRENT_UPLOADS: 5
   ```

## 🔒 安全配置

### 环境变量安全

```bash
# 设置强密码
JWT_SECRET=your_very_strong_secret_key_here

# 限制CORS
CORS_ORIGIN=https://your-domain.com

# 数据库认证
MONGODB_URI=mongodb://username:password@localhost:27017/rag_system
REDIS_PASSWORD=your_redis_password
```

### 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 3000  # 应用端口
sudo ufw allow 27017  # MongoDB端口
sudo ufw allow 6379   # Redis端口
```

### 文件权限

```bash
# 设置安全的文件权限
chmod 600 server/.env
chmod 755 server/uploads
chmod 755 server/logs
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

#### 3. 搜索功能异常

```bash
# 检查向量存储
curl http://localhost:3000/api/rag/stats

# 查看内存使用
pm2 monit
```

### 调试模式

```bash
# 启动调试模式
cd server && LOG_LEVEL=debug npm start

# 查看详细日志
tail -f server/logs/debug.log
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
2. 运行健康检查: `curl http://localhost:3000/api/rag/health`
3. 检查数据库状态: `./check-database.sh`
4. 查看系统资源: `pm2 monit`

---

## 🎉 系统就绪！

恭喜！你的RAG系统已经成功部署并配置完成。现在你可以：

✅ **上传各种格式的文档**  
✅ **进行智能搜索和检索**  
✅ **管理文档和元数据**  
✅ **监控系统状态**  
✅ **享受数据持久化**  

🚀 **开始使用这个强大的RAG系统吧！** 