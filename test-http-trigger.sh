#!/bin/bash

echo "🧪 测试CloudBase HTTP触发器"
echo "============================"
echo ""

echo "📝 请先配置HTTP触发器，然后输入触发器URL："
echo "格式: https://service-xxxxx-1256790827.ap-shanghai.apigateway.myqcloud.com/release"
echo ""

read -p "请输入您的HTTP触发器URL: " TRIGGER_URL

if [ -z "$TRIGGER_URL" ]; then
    echo "❌ 未输入URL，退出测试"
    exit 1
fi

echo ""
echo "🔍 开始测试..."
echo ""

# 测试健康检查
echo "📋 测试健康检查接口..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${TRIGGER_URL}/api/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "状态码: $HEALTH_STATUS"
echo "响应: $HEALTH_BODY"
echo ""

# 测试成本统计
echo "💰 测试成本统计接口..."
STATS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${TRIGGER_URL}/api/cost/stats")
STATS_STATUS=$(echo "$STATS_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
STATS_BODY=$(echo "$STATS_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "状态码: $STATS_STATUS"
echo "响应: $STATS_BODY"
echo ""

# 测试AI聊天
echo "🤖 测试AI聊天接口..."
CHAT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"测试消息"}' \
  "${TRIGGER_URL}/api/ai/chat")
CHAT_STATUS=$(echo "$CHAT_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
CHAT_BODY=$(echo "$CHAT_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "状态码: $CHAT_STATUS"
echo "响应: $CHAT_BODY"
echo ""

# 测试招生建议
echo "📚 测试招生建议接口..."
ADVICE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${TRIGGER_URL}/api/ai/admission-advice")
ADVICE_STATUS=$(echo "$ADVICE_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
ADVICE_BODY=$(echo "$ADVICE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "状态码: $ADVICE_STATUS"
echo "响应: $ADVICE_BODY"
echo ""

# 总结
echo "📊 测试总结："
echo "健康检查: $HEALTH_STATUS"
echo "成本统计: $STATS_STATUS"
echo "AI聊天: $CHAT_STATUS"
echo "招生建议: $ADVICE_STATUS"
echo ""

if [ "$HEALTH_STATUS" = "200" ] && [ "$STATS_STATUS" = "200" ] && [ "$CHAT_STATUS" = "200" ] && [ "$ADVICE_STATUS" = "200" ]; then
    echo "✅ 所有接口测试成功！"
    echo ""
    echo "🔧 现在请更新前端页面中的URL："
    echo "文件: public/cost-dashboard-fixed.html"
    echo "行号: 355"
    echo "新URL: $TRIGGER_URL"
    echo ""
    echo "🚀 然后重新部署静态文件："
    echo "cloudbase hosting:deploy public/ -e offercome2025-9g14jitp22f4ddfc"
else
    echo "❌ 部分接口测试失败，请检查HTTP触发器配置"
fi 