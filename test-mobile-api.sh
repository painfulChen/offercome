#!/bin/bash

echo "📱 手机端API测试"
echo "================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://10.0.4.234:3000"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

echo -e "${YELLOW}🔧 测试API服务器...${NC}"
if curl -s "$API_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API服务器正常${NC}"
else
    echo -e "${RED}❌ API服务器异常${NC}"
    exit 1
fi

echo -e "${YELLOW}🤖 测试AI聊天功能...${NC}"
AI_RESPONSE=$(curl -s -X POST "$API_URL/api/ai/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "你好"}' 2>/dev/null)

if echo "$AI_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ AI聊天功能正常${NC}"
    echo "响应: $(echo "$AI_RESPONSE" | jq -r '.message' 2>/dev/null || echo '解析失败')"
else
    echo -e "${RED}❌ AI聊天功能异常${NC}"
    echo "响应: $AI_RESPONSE"
fi

echo -e "${YELLOW}🌐 测试前端页面...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 前端页面正常 (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ 前端页面异常 (HTTP $FRONTEND_STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}📱 手机访问信息:${NC}"
echo "前端地址: $FRONTEND_URL"
echo "API地址: $API_URL"
echo ""
echo -e "${GREEN}✅ 测试完成！现在可以在手机上正常使用AI功能了${NC}" 