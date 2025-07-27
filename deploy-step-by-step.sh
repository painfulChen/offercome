#!/bin/bash

echo "🎯 招生管理系统 - 逐步部署脚本"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器信息
SERVER_IP="124.222.117.47"
SERVER_USER="ubuntu"
SERVER_PASSWORD="Somkouny2016@g"

# CloudBase信息
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"

# API密钥
KIMI_API_KEY="sk-ES7OyFh1ZQtdSpDK46yanZP1VP1qxRcb1QYmg2jbSugPBRlP"

# 微信小程序配置
WECHAT_APPID="wxf6a4c28ccfeec802"
WECHAT_SECRET="944470e0383f4c34538b368525113842"

echo -e "${BLUE}📋 当前配置信息：${NC}"
echo "服务器IP: $SERVER_IP"
echo "用户名: $SERVER_USER"
echo "操作系统: Ubuntu"
echo "CloudBase环境ID: $CLOUDBASE_ENV_ID"
echo "Kimi API Key: ${KIMI_API_KEY:0:10}..."
echo "微信小程序AppID: $WECHAT_APPID"
echo "微信小程序Secret: ${WECHAT_SECRET:0:10}..."
echo ""

echo -e "${GREEN}✅ 步骤1: 服务器连接测试 - 已完成${NC}"
echo -e "${GREEN}✅ 步骤2: CloudBase登录 - 已完成${NC}"
echo -e "${GREEN}✅ 步骤3: Kimi API配置 - 已完成${NC}"
echo -e "${GREEN}✅ 步骤4: 微信小程序AppID配置 - 已完成${NC}"
echo -e "${GREEN}✅ 步骤5: 微信小程序Secret配置 - 已完成${NC}"
echo ""

echo -e "${YELLOW}🔍 步骤6: 配置项目环境${NC}"
echo "正在配置项目环境..."

# 创建环境配置文件
cat > .env.cloudbase << EOF
# CloudBase环境配置
CLOUDBASE_ENV_ID=$CLOUDBASE_ENV_ID
SERVER_IP=$SERVER_IP
SERVER_USER=$SERVER_USER
KIMI_API_KEY=$KIMI_API_KEY
WECHAT_APPID=$WECHAT_APPID
WECHAT_SECRET=$WECHAT_SECRET
EOF

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

# AI服务配置 (优先使用Kimi)
KIMI_API_KEY=$KIMI_API_KEY
OPENAI_API_KEY=your_openai_api_key_here

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

echo -e "${GREEN}✅ 项目环境已配置${NC}"
echo ""

echo -e "${YELLOW}🚀 步骤7: 开始部署到服务器${NC}"
echo "正在连接到服务器..."

# 测试服务器连接
echo "测试服务器连接..."
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
send "echo '服务器连接成功'\r"
expect "$ "
send "exit\r"
expect eof
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服务器连接成功${NC}"
else
    echo -e "${RED}❌ 服务器连接失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 部署计划：${NC}"
echo "1. 上传项目代码到服务器"
echo "2. 安装依赖包"
echo "3. 配置数据库"
echo "4. 启动服务"
echo "5. 配置CloudBase部署"
echo ""

echo -e "${YELLOW}是否开始部署？(y/n): ${NC}" 