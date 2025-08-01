#!/bin/bash

# 数据持久化部署脚本
# 用于部署到腾讯云CloudBase或其他服务器

set -e

echo "🚀 开始数据持久化部署..."

# 检查环境变量
if [ -z "$DB_HOST" ]; then
    echo "❌ 请设置数据库主机地址 DB_HOST"
    exit 1
fi

if [ -z "$DB_USER" ]; then
    echo "❌ 请设置数据库用户名 DB_USER"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 请设置数据库密码 DB_PASSWORD"
    exit 1
fi

# 创建环境变量文件
echo "📝 创建环境变量配置..."
cat > .env << EOF
# 数据库配置
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME:-cloudbase_ai}

# Redis配置 (可选)
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-}
REDIS_DB=${REDIS_DB:-0}

# 应用配置
NODE_ENV=production
PORT=${PORT:-3000}
JWT_SECRET=${JWT_SECRET:-your-secret-key}
OPENAI_API_KEY=${OPENAI_API_KEY}

# CloudBase配置
TENCENT_SECRET_ID=${TENCENT_SECRET_ID}
TENCENT_SECRET_KEY=${TENCENT_SECRET_KEY}
ENV_ID=${ENV_ID}
EOF

echo "✅ 环境变量配置完成"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 初始化数据库
echo "🗄️ 初始化数据库..."
node server/scripts/init-database-persistent.js

# 构建项目
echo "🔨 构建项目..."
npm run build

# 创建部署包
echo "📦 创建部署包..."
tar -czf deploy-persistent.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=temp \
    --exclude=uploads \
    server/ \
    miniprogram/ \
    public/ \
    package.json \
    cloudbaserc.json \
    .env

echo "✅ 部署包创建完成: deploy-persistent.tar.gz"

# 部署到CloudBase
if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
    echo "☁️ 部署到腾讯云CloudBase..."
    
    # 检查CloudBase CLI
    if ! command -v tcb &> /dev/null; then
        echo "❌ CloudBase CLI 未安装，请先安装: npm install -g @cloudbase/cli"
        exit 1
    fi
    
    # 登录CloudBase
    echo "🔐 登录CloudBase..."
    tcb login
    
    # 部署HTTP触发器
    echo "🚀 部署HTTP触发器..."
    tcb service:deploy \
        --name api \
        --path api \
        --code-path server/ \
        --env-id $ENV_ID
    
    echo "✅ CloudBase部署完成"
fi

# 部署到传统服务器
if [ "$DEPLOY_TO_SERVER" = "true" ]; then
    echo "🖥️ 部署到传统服务器..."
    
    if [ -z "$SERVER_HOST" ]; then
        echo "❌ 请设置服务器地址 SERVER_HOST"
        exit 1
    fi
    
    if [ -z "$SERVER_USER" ]; then
        echo "❌ 请设置服务器用户名 SERVER_USER"
        exit 1
    fi
    
    # 上传部署包
    echo "📤 上传部署包到服务器..."
    scp deploy-persistent.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/
    
    # 在服务器上部署
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        cd /tmp
        tar -xzf deploy-persistent.tar.gz
        sudo mv server /opt/cloudbase-ai/
        sudo chown -R www-data:www-data /opt/cloudbase-ai/
        cd /opt/cloudbase-ai/
        npm install --production
        sudo systemctl restart cloudbase-ai
        echo "✅ 服务器部署完成"
EOF
    
    echo "✅ 传统服务器部署完成"
fi

echo "🎉 数据持久化部署完成！"

# 显示部署信息
echo ""
echo "📋 部署信息:"
echo "  - 数据库: $DB_HOST:$DB_PORT"
echo "  - 数据库名: ${DB_NAME:-cloudbase_ai}"
echo "  - 环境: production"
echo "  - 部署包: deploy-persistent.tar.gz"

if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
    echo "  - CloudBase环境: $ENV_ID"
fi

if [ "$DEPLOY_TO_SERVER" = "true" ]; then
    echo "  - 服务器: $SERVER_HOST"
fi

echo ""
echo "🔗 访问地址:"
if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
    echo "  - API: https://$ENV_ID.service.tcloudbase.com/api"
fi

if [ "$DEPLOY_TO_SERVER" = "true" ]; then
    echo "  - API: http://$SERVER_HOST:3000"
fi

echo ""
echo "📝 后续步骤:"
echo "  1. 检查数据库连接"
echo "  2. 测试API接口"
echo "  3. 配置域名和SSL"
echo "  4. 设置监控和日志" 