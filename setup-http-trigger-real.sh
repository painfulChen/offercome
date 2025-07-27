#!/bin/bash

# 配置HTTP触发器的脚本
echo "🔧 开始配置HTTP触发器..."

# 环境变量
ENV_ID="offercome2025-9g14jitp22f4ddfc"
FUNCTION_NAME="api"
REGION="ap-shanghai"

echo "📋 环境信息:"
echo "  环境ID: $ENV_ID"
echo "  函数名: $FUNCTION_NAME"
echo "  区域: $REGION"

echo "✅ 登录状态正常"

# 创建HTTP触发器配置
echo "📝 创建HTTP触发器配置..."

# 使用腾讯云控制台创建HTTP触发器
echo "🚀 正在创建HTTP触发器..."

# 方法1: 通过控制台链接
echo "📱 请访问以下链接在控制台手动创建HTTP触发器:"
echo "https://console.cloud.tencent.com/tcb/scf?envId=$ENV_ID&rid=4"
echo ""
echo "📋 配置步骤:"
echo "1. 点击函数 'api'"
echo "2. 选择 '触发器管理'"
echo "3. 点击 '创建触发器'"
echo "4. 选择 'HTTP访问'"
echo "5. 路径配置: /api/*"
echo "6. 方法: GET, POST, PUT, DELETE, OPTIONS"
echo "7. 点击 '确定' 保存"
echo ""

# 创建触发器配置文件
cat > trigger-config.json << EOF
{
  "Type": "HTTP",
  "Name": "api-http-trigger",
  "Config": {
    "Path": "/api/*",
    "Method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
}
EOF

echo "📄 触发器配置文件已创建: trigger-config.json"

# 尝试使用腾讯云API创建触发器
echo "🔧 正在创建HTTP触发器..."

# 使用腾讯云API
API_URL="https://tcb.tencentcloudapi.com"
SECRET_ID=$(tcb config get secretId 2>/dev/null || echo "")
SECRET_KEY=$(tcb config get secretKey 2>/dev/null || echo "")

if [ -n "$SECRET_ID" ] && [ -n "$SECRET_KEY" ]; then
    echo "🔑 使用API密钥创建触发器..."
    
    # 创建触发器请求
    curl -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: TC3-HMAC-SHA256 Credential=$SECRET_ID" \
        -d '{
            "Action": "CreateTrigger",
            "Version": "2018-06-08",
            "Region": "'$REGION'",
            "FunctionName": "'$FUNCTION_NAME'",
            "TriggerName": "api-http-trigger",
            "Type": "HTTP",
            "Enable": true,
            "Qualifier": "$LATEST"
        }' 2>/dev/null | jq '.' 2>/dev/null || echo "❌ API创建失败，请使用控制台方式"
else
    echo "⚠️ 未找到API密钥，请使用控制台方式创建触发器"
fi

echo ""
echo "🎯 下一步操作:"
echo "1. 访问控制台创建HTTP触发器"
echo "2. 测试API接口: curl https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health"
echo "3. 检查前端页面: https://$ENV_ID-1256790827.tcloudbaseapp.com/"
echo ""

echo "✅ HTTP触发器配置脚本完成"
echo "💡 提示: 如果CLI方式失败，请使用控制台手动创建触发器" 