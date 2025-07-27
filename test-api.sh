#!/bin/bash

echo "🧪 测试API服务..."

# 测试本地API
echo "测试本地API..."
curl -s http://localhost:3000/api/health || echo "本地API无响应"

# 测试服务器API
echo "测试服务器API..."
curl -s http://124.222.117.47:3000/api/health || echo "服务器API无响应"

# 测试其他端口
echo "测试其他端口..."
for port in 3001 3002 8080 80; do
    echo "测试端口 $port..."
    curl -s --connect-timeout 5 http://124.222.117.47:$port/api/health 2>/dev/null || echo "端口 $port 无响应"
done

echo "✅ 测试完成！" 