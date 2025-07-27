# 🚀 招生管理系统 - 服务器部署完整指南

## 📋 部署概览

本指南将帮助您将招生管理系统部署到服务器上，支持多种部署方式和数据库集成。

### 🎯 支持的部署方式

1. **CloudBase云函数部署** (推荐)
   - 腾讯云CloudBase服务
   - 自动扩缩容
   - 按量付费

2. **Docker容器部署**
   - 容器化部署
   - 易于管理
   - 跨平台支持

3. **传统服务器部署**
   - 自建服务器
   - PM2进程管理
   - 完全控制

### 🗄️ 支持的数据库

- **MongoDB**: 主数据库，存储用户、学生、辅导等数据
- **Redis**: 缓存和会话存储
- **MySQL**: 关系型数据存储（可选）
- **CloudBase**: 腾讯云数据库服务

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd project

# 安装依赖
npm install

# 配置环境变量
cp env.example .env
```

### 2. 数据库集成

#### 方式一：使用数据库管理脚本（推荐）

```bash
# 运行数据库管理工具
./manage-database-enhanced.sh
```

选择以下选项：
1. **安装数据库服务** - 自动安装MongoDB、Redis、MySQL
2. **配置数据库连接** - 设置连接参数
3. **检查数据库状态** - 验证连接状态

#### 方式二：手动安装数据库

**安装MongoDB:**
```bash
# macOS
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Ubuntu
sudo apt-get install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**安装Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**安装MySQL:**
```bash
# macOS
brew install mysql@8.0
brew services start mysql@8.0

# Ubuntu
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/offercome
REDIS_URL=redis://localhost:6379
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=offercome

# CloudBase配置
CLOUDBASE_ENV_ID=your_env_id
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key

# AI服务配置
KIMI_API_KEY=your_kimi_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log

# 安全配置
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件上传配置
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
```

## 🚀 部署方式详解

### 方式一：CloudBase云函数部署

#### 1. 安装CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

#### 2. 登录CloudBase

```bash
tcb login
```

#### 3. 运行部署脚本

```bash
./deploy-server-complete.sh
```

选择选项 `1` 进行CloudBase部署。

#### 4. 配置云函数

确保 `cloudbaserc.json` 配置正确：

```json
{
  "envId": "your_env_id",
  "functionRoot": "./server",
  "functions": [
    {
      "name": "api",
      "runtime": "Nodejs16.13",
      "memorySize": 256,
      "timeout": 30,
      "entry": "index.js"
    }
  ],
  "hosting": {
    "public": "./public"
  }
}
```

### 方式二：Docker容器部署

#### 1. 构建Docker镜像

```bash
./deploy-server-complete.sh
```

选择选项 `2` 进行Docker部署。

#### 2. 手动Docker部署

```bash
# 构建镜像
docker build -t offercome-api:1.0.0 .

# 运行容器
docker run -d \
  --name offercome-api \
  -p 3000:3000 \
  --env-file .env \
  offercome-api:1.0.0
```

#### 3. Docker Compose部署

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: offercome
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

运行：
```bash
docker-compose up -d
```

### 方式三：传统服务器部署

#### 1. 安装PM2

```bash
npm install -g pm2
```

#### 2. 运行部署脚本

```bash
./deploy-server-complete.sh
```

选择选项 `3` 进行传统部署。

#### 3. 手动PM2部署

```bash
# 安装依赖
npm install --production

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 🗄️ 数据库管理

### 数据库备份

```bash
./manage-database-enhanced.sh
```

选择选项 `4` 进行数据库备份。

### 数据库恢复

```bash
./manage-database-enhanced.sh
```

选择选项 `5` 进行数据库恢复。

### 性能监控

```bash
./manage-database-enhanced.sh
```

选择选项 `7` 进行性能监控。

## 🔧 配置说明

### 数据库连接配置

#### MongoDB配置

```javascript
// server/config/database-enhanced.js
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/offercome';

await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

#### Redis配置

```javascript
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
redisClient = Redis.createClient({
  url: redisUrl,
  retry_strategy: (options) => {
    // 重试策略配置
  }
});
```

#### MySQL配置

```javascript
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'offercome',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};
```

### 数据模型

系统包含以下主要数据模型：

- **User**: 用户信息
- **Student**: 学生信息
- **Coaching**: 辅导记录
- **Resume**: 简历信息
- **JobProgress**: 求职进度
- **AICall**: AI调用记录
- **SystemLog**: 系统日志

## 📊 监控和维护

### 健康检查

```bash
curl http://localhost:3000/api/health
```

### 查看日志

```bash
# 应用日志
tail -f logs/app.log

# PM2日志
pm2 logs

# Docker日志
docker logs -f offercome-api
```

### 性能监控

```bash
# 数据库性能
./manage-database-enhanced.sh

# 系统资源
htop
df -h
free -h
```

## 🔒 安全配置

### 1. 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用环境变量存储密钥
- 定期轮换密钥

### 2. 数据库安全

```bash
# MongoDB安全配置
mongo admin --eval "
db.createUser({
  user: 'offercome_user',
  pwd: 'secure_password',
  roles: [{ role: 'readWrite', db: 'offercome' }]
})
"

# Redis安全配置
redis-cli config set requirepass "secure_password"
```

### 3. 网络安全

- 配置防火墙规则
- 使用HTTPS
- 限制API访问频率

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查数据库服务状态
./manage-database-enhanced.sh
# 选择选项 3 检查数据库状态
```

#### 2. 端口被占用

```bash
# 查看端口占用
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

#### 3. 内存不足

```bash
# 查看内存使用
free -h

# 清理缓存
sudo sync && sudo sysctl -w vm.drop_caches=3
```

#### 4. 日志文件过大

```bash
# 清理日志
find logs/ -name "*.log" -size +100M -delete

# 配置日志轮转
logrotate /etc/logrotate.d/offercome
```

## 📞 技术支持

### 获取帮助

1. 查看项目文档
2. 检查日志文件
3. 运行诊断脚本
4. 联系技术支持

### 有用的命令

```bash
# 查看系统状态
./system-status.sh

# 测试API接口
./test-all-apis.sh

# 监控部署状态
./monitor-deployment.sh

# 查看成本分析
./cost-analyzer.sh
```

## 🎯 下一步

部署完成后，您可以：

1. **配置域名和SSL证书**
2. **设置监控和告警**
3. **配置自动备份**
4. **优化性能**
5. **添加更多功能模块**

---

**祝您部署顺利！** 🚀 