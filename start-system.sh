#!/bin/bash

# 一键启动脚本
# 启动整个招生管理系统

echo "🚀 启动招生管理系统..."
echo "=================================="

# 检查Node.js环境
echo "🔍 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js版本: $NODE_VERSION"

# 检查npm环境
echo "📦 检查npm环境..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

# 安装依赖
echo "📥 安装项目依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ 依赖已安装"
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p public

# 检查环境变量文件
echo "⚙️ 检查环境配置..."
if [ ! -f ".env" ]; then
    echo "⚠️ 未找到.env文件，将使用默认配置"
    echo "💡 建议复制env.example为.env并配置相关参数"
fi

# 停止已运行的进程
echo "🛑 停止已运行的进程..."
pkill -f "node server/simple-api.js" 2>/dev/null
pkill -f "node server/index.js" 2>/dev/null
sleep 2

# 启动API服务器
echo "🔧 启动API服务器..."
if [ -f "server/simple-api.js" ]; then
    echo "✅ 使用simple-api.js启动"
    nohup node server/simple-api.js > logs/server.log 2>&1 &
    SERVER_PID=$!
else
    echo "✅ 使用index.js启动"
    nohup node server/index.js > logs/server.log 2>&1 &
    SERVER_PID=$!
fi

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ API服务器启动成功"
else
    echo "❌ API服务器启动失败"
    echo "📋 查看日志: tail -f logs/server.log"
    exit 1
fi

# 启动监控脚本
echo "📊 启动系统监控..."
nohup ./system-status.sh > logs/monitor.log 2>&1 &

# 显示访问信息
echo "=================================="
echo "🎉 系统启动完成！"
echo ""
echo "📱 访问地址:"
echo "   本地API: http://localhost:3000"
echo "   前端页面: http://localhost:3000"
echo "   健康检查: http://localhost:3000/api/health"
echo "   AI聊天: http://localhost:3000/api/ai/chat"
echo "   成本统计: http://localhost:3000/api/cost/stats"
echo ""
echo "☁️ CloudBase地址:"
echo "   前端页面: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
echo ""
echo "📋 常用命令:"
echo "   查看日志: tail -f logs/server.log"
echo "   查看监控: tail -f logs/monitor.log"
echo "   停止服务: pkill -f 'node server'"
echo "   重启服务: ./start-system.sh"
echo ""
echo "💡 提示: 系统已自动启动监控，按Ctrl+C停止" 