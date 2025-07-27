#!/bin/bash

# 通过腾讯云API创建HTTP触发器的脚本
echo "🔧 通过腾讯云API创建HTTP触发器"
echo "=================================="

# 环境变量
ENV_ID="offercome2025-9g14jitp22f4ddfc"
FUNCTION_NAME="api"
REGION="ap-shanghai"

echo "📋 环境信息:"
echo "  环境ID: $ENV_ID"
echo "  函数名: $FUNCTION_NAME"
echo "  区域: $REGION"
echo ""

# 获取腾讯云API密钥
echo "🔑 获取API密钥..."
SECRET_ID=$(tcb config get secretId 2>/dev/null || echo "")
SECRET_KEY=$(tcb config get secretKey 2>/dev/null || echo "")

if [ -z "$SECRET_ID" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ 未找到API密钥，请先配置:"
    echo "   tcb config set secretId YOUR_SECRET_ID"
    echo "   tcb config set secretKey YOUR_SECRET_KEY"
    echo ""
    echo "📱 或者访问控制台手动创建HTTP触发器:"
    echo "   https://console.cloud.tencent.com/tcb/scf?envId=$ENV_ID&rid=4"
    exit 1
fi

echo "✅ API密钥已配置"

# 创建HTTP触发器
echo "🚀 正在创建HTTP触发器..."

# 使用腾讯云API创建HTTP触发器
API_URL="https://tcb.tencentcloudapi.com"

# 生成时间戳
TIMESTAMP=$(date +%s)
DATE=$(date -u +"%Y-%m-%d")

# 创建请求体
REQUEST_BODY=$(cat << EOF
{
    "Action": "CreateTrigger",
    "Version": "2018-06-08",
    "Region": "$REGION",
    "FunctionName": "$FUNCTION_NAME",
    "TriggerName": "api-http-trigger",
    "Type": "HTTP",
    "Enable": true,
    "Qualifier": "\$LATEST"
}
EOF
)

echo "📝 请求体:"
echo "$REQUEST_BODY"
echo ""

# 发送API请求
echo "🔧 发送API请求..."
RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: TC3-HMAC-SHA256 Credential=$SECRET_ID" \
    -d "$REQUEST_BODY")

echo "📄 API响应:"
echo "$RESPONSE"
echo ""

# 检查响应
if echo "$RESPONSE" | grep -q "RequestId"; then
    echo "✅ HTTP触发器创建成功!"
    echo ""
    echo "🧪 测试API接口..."
    sleep 5
    
    # 测试API接口
    API_TEST=$(curl -s -X GET "https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health")
    echo "API测试结果: $API_TEST"
    
    if echo "$API_TEST" | grep -q "success"; then
        echo "✅ API接口测试成功!"
    else
        echo "❌ API接口测试失败，可能需要等待几分钟让触发器生效"
    fi
else
    echo "❌ HTTP触发器创建失败"
    echo ""
    echo "🔧 故障排除:"
    echo "1. 检查API密钥是否正确"
    echo "2. 确认云函数已正确部署"
    echo "3. 尝试通过控制台手动创建"
    echo ""
    echo "📱 控制台链接:"
    echo "   https://console.cloud.tencent.com/tcb/scf?envId=$ENV_ID&rid=4"
fi

echo ""
echo "🎯 下一步操作:"
echo "1. 测试API接口: curl https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health"
echo "2. 检查前端页面: https://$ENV_ID-1256790827.tcloudbaseapp.com/"
echo "3. 如果API测试失败，请等待几分钟后重试"
echo ""
echo "✅ 脚本执行完成" 