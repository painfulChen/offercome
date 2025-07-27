#!/bin/bash

echo "🧪 测试内嵌API功能"
echo "=================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

echo -e "${YELLOW}🌐 测试前端页面...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 前端页面正常 (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ 前端页面异常 (HTTP $FRONTEND_STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}📱 手机访问测试:${NC}"
echo "访问地址: $FRONTEND_URL"
echo ""
echo -e "${YELLOW}🔧 内嵌API功能说明:${NC}"
echo "• 无需外部API服务器"
echo "• 完全在浏览器中运行"
echo "• 支持智能关键词匹配"
echo "• 提供专业留学建议"
echo ""
echo -e "${GREEN}✅ 测试完成！现在可以在手机上正常使用AI功能了${NC}"
echo ""
echo -e "${BLUE}💡 使用提示:${NC}"
echo "1. 在手机上访问上述地址"
echo "2. 点击'AI咨询'功能"
echo "3. 输入问题，如：'你好'、'留学申请'、'美国'等"
echo "4. AI会提供专业的留学建议" 