#!/bin/bash

# CloudBase AI 开发框架快速启动脚本

echo "🚀 启动 CloudBase AI 开发框架..."

# 检查Node.js版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本过低，需要 16+ 版本"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 检查通过: $(npm -v)"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件配置您的环境变量"
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p miniprogram/images

# 检查数据库连接
echo "🔍 检查数据库连接..."
if command -v docker &> /dev/null && docker ps &> /dev/null; then
    echo "🐳 检测到 Docker，启动数据库服务..."
    docker-compose up -d mongo redis
    echo "⏳ 等待数据库启动..."
    sleep 10
else
    echo "⚠️  未检测到 Docker，请确保 MongoDB 和 Redis 已启动"
fi

# 启动开发服务器
echo "🎯 启动开发服务器..."
echo "📱 小程序开发：请使用微信开发者工具打开 miniprogram/ 目录"
echo "🌐 API服务：http://localhost:3000"
echo "📊 健康检查：http://localhost:3000/health"

npm run dev 