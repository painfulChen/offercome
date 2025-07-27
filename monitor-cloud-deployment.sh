#!/bin/bash

echo "☁️ 云部署状态监控"
echo "=================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

# 监控函数
monitor_cloud_status() {
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================="
        
        # 检查CloudBase环境状态
        echo -e "${YELLOW}☁️ CloudBase环境状态:${NC}"
        ENV_STATUS=$(tcb env list | grep $CLOUDBASE_ENV_ID | awk '{print $6}')
        if [ "$ENV_STATUS" = "正常" ]; then
            echo -e "${GREEN}✅ 环境状态正常${NC}"
        else
            echo -e "${RED}❌ 环境状态异常: $ENV_STATUS${NC}"
        fi
        
        # 检查前端页面
        echo -e "${YELLOW}🌐 前端页面状态:${NC}"
        if curl -s "$FRONTEND_URL" | grep -q "OfferCome"; then
            echo -e "${GREEN}✅ 前端页面正常加载${NC}"
        else
            echo -e "${RED}❌ 前端页面加载失败${NC}"
        fi
        
        # 检查静态文件
        echo -e "${YELLOW}📁 静态文件状态:${NC}"
        STATIC_FILES=$(tcb hosting list -e $CLOUDBASE_ENV_ID | grep -c "index.html\|app.js\|styles.css")
        if [ "$STATIC_FILES" -ge 3 ]; then
            echo -e "${GREEN}✅ 静态文件部署完整 (${STATIC_FILES}个文件)${NC}"
        else
            echo -e "${RED}❌ 静态文件不完整 (${STATIC_FILES}个文件)${NC}"
        fi
        
        # 显示访问地址
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "前端页面: $FRONTEND_URL"
        echo ""
        echo -e "${BLUE}🔍 测试命令:${NC}"
        echo "curl $FRONTEND_URL"
        echo ""
        echo "按 Ctrl+C 停止监控"
        
        sleep 10
    done
}

# 启动监控
monitor_cloud_status 