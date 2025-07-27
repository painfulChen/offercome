#!/bin/bash

echo "🚀 启动API监控系统"
echo "=================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}📊 监控选项:${NC}"
echo "1. 启动实时API监控 (命令行)"
echo "2. 启动成本分析器 (交互式)"
echo "3. 打开Web监控面板"
echo "4. 启动完整监控系统"
echo "5. 查看当前成本统计"
echo ""

read -p "请选择监控方式 (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 启动实时API监控...${NC}"
        ./monitor-api-cost.sh
        ;;
    2)
        echo -e "${GREEN}🚀 启动成本分析器...${NC}"
        ./cost-analyzer.sh
        ;;
    3)
        echo -e "${GREEN}🌐 打开Web监控面板...${NC}"
        echo "访问地址: http://localhost:3000/cost-dashboard.html"
        echo ""
        echo -e "${YELLOW}💡 提示:${NC}"
        echo "• 确保API服务器正在运行"
        echo "• 面板会自动刷新数据"
        echo "• 支持实时成本统计"
        ;;
    4)
        echo -e "${GREEN}🚀 启动完整监控系统...${NC}"
        echo "• 实时API监控"
        echo "• 成本分析"
        echo "• Web监控面板"
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "Web面板: http://localhost:3000/cost-dashboard.html"
        echo "API统计: http://localhost:3000/api/cost/stats"
        echo ""
        echo -e "${YELLOW}🔄 启动监控...${NC}"
        ./monitor-api-cost.sh &
        sleep 2
        echo -e "${GREEN}✅ 监控系统已启动${NC}"
        ;;
    5)
        echo -e "${BLUE}📊 当前成本统计:${NC}"
        curl -s "http://localhost:3000/api/cost/stats" | python3 -m json.tool 2>/dev/null || echo "无法获取统计数据"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac 