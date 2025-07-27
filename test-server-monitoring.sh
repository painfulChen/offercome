#!/bin/bash

echo "🧪 测试服务器端监控系统"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

CLOUDBASE_API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

echo -e "${BLUE}🔍 测试服务器端监控功能${NC}"
echo "=================================="

# 测试API健康状态
echo -e "${YELLOW}1. 测试API健康状态...${NC}"
if curl -s "$CLOUDBASE_API_URL/api/health" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ API健康检查正常${NC}"
else
    echo -e "${RED}❌ API健康检查失败${NC}"
fi

# 测试成本统计接口
echo -e "${YELLOW}2. 测试成本统计接口...${NC}"
if curl -s "$CLOUDBASE_API_URL/api/cost/stats" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ 成本统计接口正常${NC}"
    echo -e "${BLUE}📊 当前统计:${NC}"
    curl -s "$CLOUDBASE_API_URL/api/cost/stats" | python3 -m json.tool 2>/dev/null || echo "无法解析JSON"
else
    echo -e "${RED}❌ 成本统计接口失败${NC}"
fi

# 测试AI聊天功能
echo -e "${YELLOW}3. 测试AI聊天功能...${NC}"
if curl -s -X POST "$CLOUDBASE_API_URL/api/ai/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "测试消息"}' | grep -q "success.*true"; then
    echo -e "${GREEN}✅ AI聊天功能正常${NC}"
else
    echo -e "${RED}❌ AI聊天功能失败${NC}"
fi

# 测试监控面板
echo -e "${YELLOW}4. 测试监控面板...${NC}"
if curl -s "$FRONTEND_URL/cost-dashboard.html" | grep -q "API成本监控面板"; then
    echo -e "${GREEN}✅ 监控面板可访问${NC}"
else
    echo -e "${RED}❌ 监控面板访问失败${NC}"
fi

# 测试监控路由
echo -e "${YELLOW}5. 测试监控路由...${NC}"
if curl -s "$CLOUDBASE_API_URL/monitor" | grep -q "API成本监控面板"; then
    echo -e "${GREEN}✅ 监控路由正常${NC}"
else
    echo -e "${RED}❌ 监控路由失败${NC}"
fi

echo ""
echo -e "${GREEN}🎉 测试完成！${NC}"
echo "=================================="
echo -e "${BLUE}📱 访问地址:${NC}"
echo "• 监控面板: $FRONTEND_URL/cost-dashboard.html"
echo "• 监控路由: $CLOUDBASE_API_URL/monitor"
echo "• API统计: $CLOUDBASE_API_URL/api/cost/stats"
echo ""
echo -e "${YELLOW}💡 手动测试命令:${NC}"
echo "curl $CLOUDBASE_API_URL/api/health"
echo "curl $CLOUDBASE_API_URL/api/cost/stats"
echo "curl -X POST $CLOUDBASE_API_URL/api/ai/chat -H 'Content-Type: application/json' -d '{\"message\": \"测试\"}'" 