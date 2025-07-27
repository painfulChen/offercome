#!/bin/bash

echo "🚀 招生管理系统 - 自动部署脚本"
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

echo -e "${YELLOW}🔍 步骤2: 创建部署包${NC}"

# 创建部署包
mkdir -p deploy-package
cp -r server deploy-package/
cp -r miniprogram deploy-package/
cp package.json deploy-package/
cp .env.production deploy-package/
cp README.md deploy-package/

# 创建服务器部署脚本
cat > deploy-package/deploy-on-server.sh << 'EOF'
#!/bin/bash

echo "在服务器上部署..."

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装MongoDB
if ! command -v mongod &> /dev/null; then
    echo "安装MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# 安装Redis
if ! command -v redis-server &> /dev/null; then
    echo "安装Redis..."
    sudo apt-get install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    sudo npm install -g pm2
fi

# 安装项目依赖
echo "安装项目依赖..."
npm install

# 创建日志目录
mkdir -p logs

# 启动服务
echo "启动服务..."
pm2 start server/index.js --name offercome-api

# 保存PM2配置
pm2 save
pm2 startup

echo "部署完成！"
echo "服务状态："
pm2 status
EOF

chmod +x deploy-package/deploy-on-server.sh

echo -e "${GREEN}✅ 部署包已创建${NC}"

echo -e "${YELLOW}🔍 步骤3: 上传部署包${NC}"

# 使用expect上传文件
expect << EOF
spawn scp -r deploy-package $SERVER_USER@$SERVER_IP:~/
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
expect eof
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 部署包上传成功${NC}"
else
    echo -e "${RED}❌ 部署包上传失败${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 步骤4: 在服务器上执行部署${NC}"

# 使用expect在服务器上执行部署
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

send "cd ~/deploy-package\r"
expect "$ "

send "chmod +x deploy-on-server.sh\r"
expect "$ "

send "./deploy-on-server.sh\r"
expect "$ "

send "pm2 status\r"
expect "$ "

send "netstat -tlnp | grep :3000\r"
expect "$ "

send "exit\r"
expect eof
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服务器部署完成${NC}"
else
    echo -e "${RED}❌ 服务器部署失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}📋 访问信息：${NC}"
echo "API服务地址: http://$SERVER_IP:3000"
echo "CloudBase环境: $CLOUDBASE_ENV_ID"
echo "微信小程序AppID: $WECHAT_APPID"
echo ""
echo -e "${YELLOW}📝 下一步操作：${NC}"
echo "1. 测试API接口: curl http://$SERVER_IP:3000/api/health"
echo "2. 配置微信小程序"
echo "3. 上传小程序代码"
echo ""

echo -e "${GREEN}✅ 部署脚本执行完成！${NC}" 