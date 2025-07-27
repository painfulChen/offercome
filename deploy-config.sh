#!/bin/bash

echo "🚀 招生管理系统部署配置"
echo "================================"

# 服务器信息
SERVER_IP="124.222.117.47"
SERVER_USER="ubuntu"
SERVER_PASSWORD="Somkouny2016@g"

echo "📋 服务器信息："
echo "IP地址: $SERVER_IP"
echo "用户名: $SERVER_USER"
echo "操作系统: Ubuntu"
echo ""

# 检查SSH连接
echo "🔍 检查服务器连接..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "✅ SSH连接成功"
else
    echo "❌ SSH连接失败，请检查："
    echo "1. 服务器是否运行"
    echo "2. 防火墙是否开放22端口"
    echo "3. 密码是否正确"
    exit 1
fi

# 获取系统信息
echo "📊 获取系统信息..."
ssh $SERVER_USER@$SERVER_IP "lsb_release -a && free -h && df -h"

echo ""
echo "✅ 服务器连接测试完成！"
echo "下一步：配置服务器环境" 