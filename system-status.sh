#!/bin/bash

# 系统状态监控脚本
# 检查所有组件的运行状态

echo "🕐 $(date '+%Y-%m-%d %H:%M:%S')"
echo "=================================="

# 检查本地API服务器
echo "🔧 检查本地API服务器..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 本地API服务器正常"
else
    echo "❌ 本地API服务器异常"
fi

# 检查AI服务
echo "🤖 检查AI服务..."
if curl -s -X POST http://localhost:3000/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"测试"}' > /dev/null; then
    echo "✅ AI服务正常"
else
    echo "❌ AI服务异常"
fi

# 检查前端页面
echo "🌐 检查前端页面..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端页面正常"
else
    echo "❌ 前端页面异常"
fi

# 检查CloudBase环境
echo "☁️ 检查CloudBase环境..."
if curl -s https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com > /dev/null; then
    echo "✅ CloudBase环境正常"
else
    echo "❌ CloudBase环境异常"
fi

# 检查日志文件
echo "📁 检查日志文件..."
if [ -f "logs/cost-tracker.log" ]; then
    echo "✅ 成本跟踪日志正常"
else
    echo "❌ 成本跟踪日志缺失"
fi

if [ -f "logs/request-tracker.log" ]; then
    echo "✅ 请求跟踪日志正常"
else
    echo "❌ 请求跟踪日志缺失"
fi

# 检查系统资源
echo "💻 检查系统资源..."
CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
MEMORY_USAGE=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
MEMORY_TOTAL=$(vm_stat | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')

echo "CPU使用率: ${CPU_USAGE}%"
echo "内存使用: $(( (MEMORY_TOTAL - MEMORY_USAGE) * 100 / MEMORY_TOTAL ))%"

# 检查端口占用
echo "🔌 检查端口占用..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ 端口3000正常占用"
else
    echo "❌ 端口3000未占用"
fi

# 检查环境变量
echo "⚙️ 检查环境变量..."
if [ -n "$NODE_ENV" ]; then
    echo "✅ NODE_ENV: $NODE_ENV"
else
    echo "❌ NODE_ENV未设置"
fi

if [ -n "$PORT" ]; then
    echo "✅ PORT: $PORT"
else
    echo "❌ PORT未设置"
fi

echo "=================================="
echo "📊 系统状态检查完成"
echo "💡 提示: 如果发现异常，请检查相应的服务配置" 