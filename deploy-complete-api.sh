#!/bin/bash

# 完整的API部署脚本
echo "🚀 开始完整API部署流程"
echo "=================================="

# 环境变量
ENV_ID="offercome2025-9g14jitp22f4ddfc"
FUNCTION_NAME="api"

echo "📋 环境信息:"
echo "  环境ID: $ENV_ID"
echo "  函数名: $FUNCTION_NAME"
echo ""

# 1. 部署云函数
echo "🔧 步骤1: 部署云函数..."
tcb fn deploy api

if [ $? -eq 0 ]; then
    echo "✅ 云函数部署成功"
else
    echo "❌ 云函数部署失败"
    exit 1
fi

echo ""

# 2. 删除旧的HTTP服务
echo "🔧 步骤2: 清理旧的HTTP服务..."
tcb service:delete -p "/api" 2>/dev/null || echo "没有旧的HTTP服务需要删除"
tcb service:delete -p "/api/*" 2>/dev/null || echo "没有旧的HTTP服务需要删除"

echo "✅ HTTP服务清理完成"
echo ""

# 3. 创建新的HTTP服务
echo "🔧 步骤3: 创建新的HTTP服务..."
sleep 3  # 等待清理完成

tcb service:create -e $ENV_ID -p /api -f $FUNCTION_NAME

if [ $? -eq 0 ]; then
    echo "✅ HTTP服务创建成功"
else
    echo "❌ HTTP服务创建失败"
    exit 1
fi

echo ""

# 4. 等待服务生效
echo "⏳ 步骤4: 等待服务生效..."
sleep 10

# 5. 测试API接口
echo "🧪 步骤5: 测试API接口..."

# 测试健康检查
echo "测试健康检查接口..."
HEALTH_RESPONSE=$(curl -s -X GET "https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health")
echo "响应: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo "✅ 健康检查接口测试成功!"
else
    echo "❌ 健康检查接口测试失败"
    echo "响应: $HEALTH_RESPONSE"
fi

echo ""

# 测试用户注册
echo "测试用户注册接口..."
REGISTER_RESPONSE=$(curl -s -X POST "https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}')
echo "响应: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    echo "✅ 用户注册接口测试成功!"
else
    echo "❌ 用户注册接口测试失败"
    echo "响应: $REGISTER_RESPONSE"
fi

echo ""

# 测试AI聊天
echo "测试AI聊天接口..."
CHAT_RESPONSE=$(curl -s -X POST "https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}')
echo "响应: $CHAT_RESPONSE"

if echo "$CHAT_RESPONSE" | grep -q "success"; then
    echo "✅ AI聊天接口测试成功!"
else
    echo "❌ AI聊天接口测试失败"
    echo "响应: $CHAT_RESPONSE"
fi

echo ""

# 6. 显示最终结果
echo "🎯 部署结果总结:"
echo "=================================="
echo "🌐 API基础URL: https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api"
echo "📱 前端页面: https://$ENV_ID-1256790827.tcloudbaseapp.com/"
echo ""
echo "🧪 测试命令:"
echo "curl -X GET 'https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health'"
echo "curl -X POST 'https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/auth/register' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"123456\"}'"
echo ""
echo "✅ 完整API部署流程完成!" 