#!/bin/bash

echo "☁️ 云部署持续监控"
echo "=================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

# 监控函数
monitor_cloud_continuous() {
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================="
        
        # 检查CloudBase环境状态
        echo -e "${YELLOW}☁️ CloudBase环境状态:${NC}"
        ENV_STATUS=$(tcb env list | grep $CLOUDBASE_ENV_ID | grep -o "正常")
        if [ "$ENV_STATUS" = "正常" ]; then
            echo -e "${GREEN}✅ 环境状态正常${NC}"
        else
            echo -e "${RED}❌ 环境状态异常${NC}"
        fi
        
        # 检查前端页面
        echo -e "${YELLOW}🌐 前端页面状态:${NC}"
        FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
        if [ "$FRONTEND_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ 前端页面正常加载 (HTTP $FRONTEND_RESPONSE)${NC}"
        else
            echo -e "${RED}❌ 前端页面加载失败 (HTTP $FRONTEND_RESPONSE)${NC}"
        fi
        
        # 检查静态文件
        echo -e "${YELLOW}📁 静态文件状态:${NC}"
        STATIC_FILES=$(tcb hosting list -e $CLOUDBASE_ENV_ID | grep -c "index.html\|app.js\|styles.css")
        if [ "$STATIC_FILES" -ge 3 ]; then
            echo -e "${GREEN}✅ 静态文件部署完整 (${STATIC_FILES}个文件)${NC}"
        else
            echo -e "${RED}❌ 静态文件不完整 (${STATIC_FILES}个文件)${NC}"
        fi
        
        # 检查页面内容
        echo -e "${YELLOW}🔍 页面内容检查:${NC}"
        PAGE_CONTENT=$(curl -s "$FRONTEND_URL" | head -20)
        if echo "$PAGE_CONTENT" | grep -q "OfferCome"; then
            echo -e "${GREEN}✅ 页面内容正确${NC}"
        else
            echo -e "${RED}❌ 页面内容异常${NC}"
        fi
        
        # 显示系统资源
        echo -e "${YELLOW}💻 本地系统资源:${NC}"
        CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d'%' -f1)
        MEMORY_USAGE=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | cut -d'%' -f1)
        echo "CPU使用率: ${CPU_USAGE}%"
        echo "内存使用: ${MEMORY_USAGE}%"
        
        # 显示访问地址
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "前端页面: $FRONTEND_URL"
        echo ""
        echo -e "${BLUE}🔍 测试命令:${NC}"
        echo "curl $FRONTEND_URL"
        echo ""
        echo -e "${PURPLE}📊 监控信息:${NC}"
        echo "• 环境ID: $CLOUDBASE_ENV_ID"
        echo "• 监控间隔: 10秒"
        echo "• 最后更新: $(date '+%H:%M:%S')"
        echo ""
        echo -e "${CYAN}💡 提示:${NC}"
        echo "• 按 Ctrl+C 停止监控"
        echo "• 页面已针对手机端优化"
        echo "• 支持深色模式"
        echo ""
        echo "按 Ctrl+C 停止监控"
        
        sleep 10
    done
}

# 启动监控
monitor_cloud_continuous 