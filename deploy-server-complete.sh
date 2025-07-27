#!/bin/bash

# 🚀 招生管理系统 - 完整服务器部署脚本
# 支持多种部署方式：CloudBase、自建服务器、Docker等

echo "🎯 招生管理系统 - 服务器部署工具"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
PROJECT_NAME="offercome-api"
VERSION="1.0.0"

# 显示部署选项
show_deployment_options() {
    echo ""
    echo -e "${CYAN}📋 请选择部署方式:${NC}"
    echo "1. 🚀 CloudBase云函数部署 (推荐)"
    echo "2. 🐳 Docker容器部署"
    echo "3. 📦 传统服务器部署"
    echo "4. 🔧 配置环境变量"
    echo "5. 📊 查看部署状态"
    echo "6. 🧪 测试API接口"
    echo "7. 📝 查看部署日志"
    echo "8. 🗑️ 清理部署文件"
    echo "0. ❌ 退出"
    echo ""
    read -p "请输入选项 (0-8): " choice
}

# CloudBase部署
deploy_cloudbase() {
    echo -e "${BLUE}🚀 开始CloudBase部署...${NC}"
    
    # 检查CloudBase CLI
    if ! command -v tcb &> /dev/null; then
        echo -e "${YELLOW}📦 安装CloudBase CLI...${NC}"
        npm install -g @cloudbase/cli
    fi
    
    # 检查登录状态
    echo -e "${YELLOW}🔐 检查登录状态...${NC}"
    if ! tcb login --list &> /dev/null; then
        echo -e "${YELLOW}📝 需要登录CloudBase...${NC}"
        tcb login
    fi
    
    # 创建部署包
    echo -e "${YELLOW}📦 准备部署文件...${NC}"
    mkdir -p deploy-package
    cp -r server deploy-package/
    cp package.json deploy-package/
    cp cloudbaserc.json deploy-package/
    cp env.production deploy-package/.env
    
    cd deploy-package
    
    # 安装依赖
    echo -e "${YELLOW}📥 安装依赖...${NC}"
    npm install --production
    
    # 部署云函数
    echo -e "${YELLOW}🚀 部署云函数...${NC}"
    tcb framework deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 云函数部署成功！${NC}"
    else
        echo -e "${RED}❌ 云函数部署失败${NC}"
        cd ..
        return 1
    fi
    
    cd ..
    
    # 部署静态文件
    echo -e "${YELLOW}🌐 部署静态文件...${NC}"
    tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 静态文件部署成功！${NC}"
    else
        echo -e "${RED}❌ 静态文件部署失败${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 CloudBase部署完成！${NC}"
    echo "前端地址: https://${CLOUDBASE_ENV_ID}-1256790827.tcloudbaseapp.com"
    echo "API地址: https://${CLOUDBASE_ENV_ID}-1256790827.ap-shanghai.app.tcloudbase.com"
}

# Docker部署
deploy_docker() {
    echo -e "${BLUE}🐳 开始Docker部署...${NC}"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装${NC}"
        return 1
    fi
    
    # 创建Dockerfile
    echo -e "${YELLOW}📝 创建Dockerfile...${NC}"
    cat > Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server ./server
COPY public ./public

EXPOSE 3000

CMD ["node", "server/index.js"]
EOF
    
    # 构建镜像
    echo -e "${YELLOW}🔨 构建Docker镜像...${NC}"
    docker build -t $PROJECT_NAME:$VERSION .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker镜像构建成功！${NC}"
    else
        echo -e "${RED}❌ Docker镜像构建失败${NC}"
        return 1
    fi
    
    # 运行容器
    echo -e "${YELLOW}🚀 启动Docker容器...${NC}"
    docker run -d \
        --name $PROJECT_NAME \
        -p 3000:3000 \
        --env-file env.production \
        $PROJECT_NAME:$VERSION
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker容器启动成功！${NC}"
        echo "访问地址: http://localhost:3000"
    else
        echo -e "${RED}❌ Docker容器启动失败${NC}"
        return 1
    fi
}

# 传统服务器部署
deploy_traditional() {
    echo -e "${BLUE}📦 开始传统服务器部署...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装${NC}"
        return 1
    fi
    
    # 安装依赖
    echo -e "${YELLOW}📥 安装依赖...${NC}"
    npm install --production
    
    # 创建PM2配置文件
    echo -e "${YELLOW}📝 创建PM2配置...${NC}"
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'offercome-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    
    # 安装PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}📦 安装PM2...${NC}"
        npm install -g pm2
    fi
    
    # 启动应用
    echo -e "${YELLOW}🚀 启动应用...${NC}"
    pm2 start ecosystem.config.js
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 应用启动成功！${NC}"
        echo "访问地址: http://localhost:3000"
        echo "PM2状态: pm2 status"
        echo "查看日志: pm2 logs"
    else
        echo -e "${RED}❌ 应用启动失败${NC}"
        return 1
    fi
}

# 配置环境变量
configure_env() {
    echo -e "${BLUE}🔧 配置环境变量...${NC}"
    
    echo -e "${YELLOW}📝 请配置以下环境变量:${NC}"
    echo ""
    
    # 读取当前配置
    if [ -f ".env" ]; then
        source .env
    fi
    
    # 数据库配置
    read -p "MongoDB URI (默认: mongodb://localhost:27017/offercome): " mongodb_uri
    mongodb_uri=${mongodb_uri:-"mongodb://localhost:27017/offercome"}
    
    read -p "Redis URL (默认: redis://localhost:6379): " redis_url
    redis_url=${redis_url:-"redis://localhost:6379"}
    
    # AI服务配置
    read -p "Kimi API Key: " kimi_api_key
    read -p "OpenAI API Key: " openai_api_key
    
    # JWT配置
    read -p "JWT Secret (默认: your_jwt_secret_here): " jwt_secret
    jwt_secret=${jwt_secret:-"your_jwt_secret_here"}
    
    # 微信配置
    read -p "微信小程序 AppID: " wechat_appid
    read -p "微信小程序 Secret: " wechat_secret
    
    # 创建环境变量文件
    cat > .env << EOF
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
MONGODB_URI=$mongodb_uri
REDIS_URL=$redis_url

# CloudBase配置
CLOUDBASE_ENV_ID=$CLOUDBASE_ENV_ID

# AI服务配置
KIMI_API_KEY=$kimi_api_key
OPENAI_API_KEY=$openai_api_key

# JWT配置
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=$wechat_appid
WECHAT_SECRET=$wechat_secret

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
    
    echo -e "${GREEN}✅ 环境变量配置完成！${NC}"
}

# 查看部署状态
check_status() {
    echo -e "${BLUE}📊 部署状态检查...${NC}"
    
    # 检查本地服务
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        echo -e "${GREEN}✅ 本地服务运行正常${NC}"
    else
        echo -e "${RED}❌ 本地服务未运行${NC}"
    fi
    
    # 检查CloudBase服务
    if command -v tcb &> /dev/null; then
        echo -e "${YELLOW}🔍 检查CloudBase服务...${NC}"
        tcb framework list
    fi
    
    # 检查Docker容器
    if command -v docker &> /dev/null; then
        echo -e "${YELLOW}🐳 检查Docker容器...${NC}"
        docker ps | grep $PROJECT_NAME
    fi
    
    # 检查PM2进程
    if command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}📦 检查PM2进程...${NC}"
        pm2 status
    fi
}

# 测试API接口
test_api() {
    echo -e "${BLUE}🧪 测试API接口...${NC}"
    
    # 测试健康检查
    echo -e "${YELLOW}🔍 测试健康检查...${NC}"
    curl -s http://localhost:3000/api/health | jq . || echo "健康检查失败"
    
    # 测试登录接口
    echo -e "${YELLOW}🔐 测试登录接口...${NC}"
    curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' | jq . || echo "登录测试失败"
    
    # 测试AI聊天接口
    echo -e "${YELLOW}🤖 测试AI聊天接口...${NC}"
    curl -X POST http://localhost:3000/api/ai/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"你好"}' | jq . || echo "AI聊天测试失败"
}

# 查看部署日志
view_logs() {
    echo -e "${BLUE}📝 查看部署日志...${NC}"
    
    echo -e "${YELLOW}选择日志类型:${NC}"
    echo "1. 应用日志"
    echo "2. 错误日志"
    echo "3. 访问日志"
    echo "4. PM2日志"
    echo "5. Docker日志"
    
    read -p "请选择 (1-5): " log_type
    
    case $log_type in
        1) tail -f logs/app.log ;;
        2) tail -f logs/error.log ;;
        3) tail -f logs/access.log ;;
        4) pm2 logs ;;
        5) docker logs -f $PROJECT_NAME ;;
        *) echo "无效选择" ;;
    esac
}

# 清理部署文件
cleanup() {
    echo -e "${BLUE}🗑️ 清理部署文件...${NC}"
    
    # 清理部署包
    if [ -d "deploy-package" ]; then
        rm -rf deploy-package
        echo -e "${GREEN}✅ 清理部署包完成${NC}"
    fi
    
    # 清理Docker
    if command -v docker &> /dev/null; then
        docker stop $PROJECT_NAME 2>/dev/null
        docker rm $PROJECT_NAME 2>/dev/null
        docker rmi $PROJECT_NAME:$VERSION 2>/dev/null
        echo -e "${GREEN}✅ 清理Docker资源完成${NC}"
    fi
    
    # 清理PM2
    if command -v pm2 &> /dev/null; then
        pm2 delete offercome-api 2>/dev/null
        echo -e "${GREEN}✅ 清理PM2进程完成${NC}"
    fi
    
    echo -e "${GREEN}✅ 清理完成！${NC}"
}

# 主菜单循环
while true; do
    show_deployment_options
    
    case $choice in
        1)
            deploy_cloudbase
            ;;
        2)
            deploy_docker
            ;;
        3)
            deploy_traditional
            ;;
        4)
            configure_env
            ;;
        5)
            check_status
            ;;
        6)
            test_api
            ;;
        7)
            view_logs
            ;;
        8)
            cleanup
            ;;
        0)
            echo -e "${GREEN}👋 再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择，请重新输入${NC}"
            ;;
    esac
    
    echo ""
    read -p "按回车键继续..."
done 