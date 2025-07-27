#!/bin/bash

echo "🔧 配置CloudBase环境..."

# 检查是否安装了CloudBase CLI
if ! command -v tcb &> /dev/null; then
    echo "📦 安装CloudBase CLI..."
    npm install -g @cloudbase/cli
fi

echo "🔐 请登录腾讯云..."
tcb login

echo "📋 获取环境信息..."
tcb env list

echo "✅ CloudBase CLI配置完成！"
echo ""
echo "📝 请记录以下信息并更新到 .env 文件："
echo "1. 环境ID (env-xxxxxx)"
echo "2. 地域 (如上海)"
echo "3. SecretId 和 SecretKey (在腾讯云控制台获取)"
echo ""
echo "🔗 腾讯云控制台地址：https://console.cloud.tencent.com/tcb" 