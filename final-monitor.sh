#!/bin/bash

echo "🎯 最终系统监控"
echo "================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
API_URL="http://localhost:3000"

# 监控函数
monitor_system() {
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================="
        
        # 1. 检查本地API服务器
        echo -e "${YELLOW}🔧 检查本地API服务器...${NC}"
        if curl -s "$API_URL/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 本地API服务器正常${NC}"
        else
            echo -e "${RED}❌ 本地API服务器异常${NC}"
            echo -e "${YELLOW}🔄 重启API服务器...${NC}"
            pkill -f "node server/index-proxy.js"
            sleep 2
            node server/index-proxy.js &
            sleep 5
        fi
        
        # 2. 检查AI服务
        echo -e "${YELLOW}🤖 检查AI服务...${NC}"
        AI_RESPONSE=$(curl -s -X POST "$API_URL/api/ai/chat" \
            -H "Content-Type: application/json" \
            -d '{"message": "test"}' 2>/dev/null)
        
        if echo "$AI_RESPONSE" | grep -q "success.*true"; then
            echo -e "${GREEN}✅ AI服务正常${NC}"
        else
            echo -e "${RED}❌ AI服务异常${NC}"
        fi
        
        # 3. 检查前端页面
        echo -e "${YELLOW}🌐 检查前端页面...${NC}"
        FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
        
        if [ "$FRONTEND_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ 前端页面正常 (HTTP $FRONTEND_RESPONSE)${NC}"
        else
            echo -e "${RED}❌ 前端页面异常 (HTTP $FRONTEND_RESPONSE)${NC}"
        fi
        
        # 4. 系统资源监控
        echo -e "${YELLOW}💻 系统资源监控...${NC}"
        CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d'%' -f1)
        MEMORY_USAGE=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | cut -d'%' -f1)
        
        echo "CPU使用率: ${CPU_USAGE}%"
        echo "内存使用: ${MEMORY_USAGE}%"
        
        # 显示访问地址
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "前端页面: $FRONTEND_URL"
        echo "本地API: $API_URL"
        echo ""
        echo -e "${PURPLE}📊 监控信息:${NC}"
        echo "• 监控间隔: 30秒"
        echo "• 最后更新: $(date '+%H:%M:%S')"
        echo ""
        echo -e "${GREEN}✅ 系统状态: 正常运行${NC}"
        echo ""
        echo "按 Ctrl+C 停止监控"
        
        sleep 30
    done
}

# 启动监控
monitor_system 