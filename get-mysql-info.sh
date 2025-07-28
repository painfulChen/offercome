#!/bin/bash

# 获取MySQL实例信息的脚本
echo "🔍 获取MySQL实例信息..."

# 检查tcb CLI是否安装
if ! command -v tcb &> /dev/null; then
    echo "❌ tcb CLI未安装，请先安装腾讯云CLI"
    exit 1
fi

# 检查是否已登录
if ! tcb auth:list &> /dev/null; then
    echo "❌ 请先登录腾讯云CLI"
    echo "运行: tcb auth:login"
    exit 1
fi

echo "📋 正在获取MySQL实例列表..."

# 获取MySQL实例列表
echo "=== MySQL实例列表 ==="
tcb mysql:list 2>/dev/null || echo "使用腾讯云CLI获取实例列表..."

echo ""
echo "📝 请提供以下信息:"
echo "1. 实例ID (例如: cdb-xxxxxx)"
echo "2. 内网地址 (例如: 10.0.0.1)"
echo "3. 外网地址 (例如: 123.456.789.10)"
echo "4. VPC ID (例如: vpc-xxxxxx)"
echo "5. 子网ID (例如: subnet-xxxxxx)"
echo "6. 安全组ID (例如: sg-xxxxxx)"
echo ""
echo "💡 提示: 这些信息可以在腾讯云控制台的MySQL实例详情页面找到" 