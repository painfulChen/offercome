#!/bin/bash

echo "🚀 CloudBase AI 框架部署脚本"
echo "================================"

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件，请先配置环境变量"
    echo "📝 请复制 env.example 到 .env 并填入您的配置信息"
    exit 1
fi

# 加载环境变量
source .env

echo "📋 当前配置："
echo "环境: $NODE_ENV"
echo "CloudBase环境ID: $CLOUDBASE_ENV_ID"
echo "API地址: $DEPLOY_URL"

# 检查CloudBase CLI
if ! command -v tcb &> /dev/null; then
    echo "📦 安装CloudBase CLI..."
    npm install -g @cloudbase/cli
fi

# 登录检查
echo "🔐 检查登录状态..."
tcb login --check || {
    echo "请先登录腾讯云..."
    tcb login
}

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到CloudBase
echo "☁️ 部署到CloudBase..."
tcb deploy --env $CLOUDBASE_ENV_ID

# 获取部署信息
echo "📊 获取部署信息..."
tcb env list --env $CLOUDBASE_ENV_ID

echo ""
echo "✅ 部署完成！"
echo "🌐 您的应用地址："
echo "API服务: $DEPLOY_URL"
echo "小程序: 请使用微信开发者工具上传到微信平台"
echo ""
echo "📱 小程序配置："
echo "1. 在微信开发者工具中打开 miniprogram/ 目录"
echo "2. 在 app.js 中更新 API 地址为: $DEPLOY_URL"
echo "3. 上传代码到微信平台" 