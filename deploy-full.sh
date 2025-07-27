#!/bin/bash

echo "🚀 招生管理系统 - 完整部署脚本"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置信息
SERVER_IP="124.222.117.47"
SERVER_USER="ubuntu"
SERVER_PASSWORD="Somkouny2016@g"
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
KIMI_API_KEY="sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP"
WECHAT_APPID="wxf6a4c28ccfeec802"
WECHAT_SECRET="944470e0383f4c34538b368525113842"

echo -e "${BLUE}📋 部署配置信息：${NC}"
echo "服务器IP: $SERVER_IP"
echo "用户名: $SERVER_USER"
echo "CloudBase环境ID: $CLOUDBASE_ENV_ID"
echo "Kimi API Key: ${KIMI_API_KEY:0:10}..."
echo "微信小程序AppID: $WECHAT_APPID"
echo ""

echo -e "${YELLOW}🔍 步骤1: 准备项目文件${NC}"

# 创建生产环境配置文件
cat > .env.production << EOF
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/offercome
REDIS_URL=redis://localhost:6379

# CloudBase配置
CLOUDBASE_ENV_ID=$CLOUDBASE_ENV_ID

# AI服务配置
KIMI_API_KEY=$KIMI_API_KEY

# JWT配置
JWT_SECRET=offercome_jwt_secret_2025
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=$WECHAT_APPID
WECHAT_SECRET=$WECHAT_SECRET

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
EOF

echo -e "${GREEN}✅ 环境配置文件已创建${NC}"

echo -e "${YELLOW}🔍 步骤2: 上传项目到服务器${NC}"

# 使用scp上传项目文件
echo "正在上传项目文件..."
scp -r . $SERVER_USER@$SERVER_IP:~/offercome-project

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 项目文件上传成功${NC}"
else
    echo -e "${RED}❌ 项目文件上传失败${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 步骤3: 在服务器上安装和配置${NC}"

# 在服务器上执行部署命令
expect << EOF
spawn ssh $SERVER_USER@$SERVER_IP
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$SERVER_PASSWORD\r"
    }
}
expect "$ "

# 进入项目目录
send "cd ~/offercome-project\r"
expect "$ "

# 安装Node.js和npm
send "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -\r"
expect "$ "
send "sudo apt-get install -y nodejs\r"
expect "$ "

# 安装MongoDB
send "wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -\r"
expect "$ "
send "echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list\r"
expect "$ "
send "sudo apt-get update\r"
expect "$ "
send "sudo apt-get install -y mongodb-org\r"
expect "$ "
send "sudo systemctl start mongod\r"
expect "$ "
send "sudo systemctl enable mongod\r"
expect "$ "

# 安装Redis
send "sudo apt-get install -y redis-server\r"
expect "$ "
send "sudo systemctl start redis-server\r"
expect "$ "
send "sudo systemctl enable redis-server\r"
expect "$ "

# 安装PM2
send "sudo npm install -g pm2\r"
expect "$ "

# 安装项目依赖
send "npm install\r"
expect "$ "

# 创建日志目录
send "mkdir -p logs\r"
expect "$ "

# 启动服务
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

# 保存PM2配置
send "pm2 save\r"
expect "$ "
send "pm2 startup\r"
expect "$ "

# 检查服务状态
send "pm2 status\r"
expect "$ "

# 检查端口
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo -e "${GREEN}✅ 服务器部署完成${NC}"

echo -e "${YELLOW}🔍 步骤4: 配置CloudBase部署${NC}"

# 使用CloudBase CLI部署
echo "正在配置CloudBase部署..."
tcb env list

# 创建CloudBase配置文件
cat > cloudbase.json << EOF
{
  "envId": "$CLOUDBASE_ENV_ID",
  "functionRoot": "./server",
  "functions": [
    {
      "name": "offercome-api",
      "runtime": "Nodejs16.13",
      "memorySize": 256,
      "timeout": 10,
      "triggers": [
        {
          "name": "httpTrigger",
          "type": "http",
          "config": {
            "methods": ["GET", "POST", "PUT", "DELETE"]
          }
        }
      ]
    }
  ]
}
EOF

echo -e "${GREEN}✅ CloudBase配置完成${NC}"

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}📋 访问信息：${NC}"
echo "API服务地址: http://$SERVER_IP:3000"
echo "CloudBase环境: $CLOUDBASE_ENV_ID"
echo "微信小程序AppID: $WECHAT_APPID"
echo ""
echo -e "${YELLOW}📝 下一步操作：${NC}"
echo "1. 测试API接口"
echo "2. 配置微信小程序"
echo "3. 上传小程序代码"
echo ""

echo -e "${GREEN}✅ 部署脚本执行完成！${NC}" 