#!/bin/bash

echo "🔍 开始实时监控部署状态..."
echo "按 Ctrl+C 停止监控"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 监控函数
monitor_status() {
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================="
        
        # 检查服务器状态
        echo -e "${YELLOW}📊 服务器状态检查:${NC}"
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API服务正常运行${NC}"
        else
            echo -e "${RED}❌ API服务未响应${NC}"
        fi
        
        # 检查前端页面
        echo -e "${YELLOW}🌐 前端页面检查:${NC}"
        if curl -s http://localhost:3000/ | grep -q "OfferCome"; then
            echo -e "${GREEN}✅ 前端页面正常加载${NC}"
        else
            echo -e "${RED}❌ 前端页面加载失败${NC}"
        fi
        
        # 检查AI服务
        echo -e "${YELLOW}🤖 AI服务检查:${NC}"
        AI_RESPONSE=$(curl -s -X POST http://localhost:3000/api/ai/chat \
            -H "Content-Type: application/json" \
            -d '{"message": "test"}' 2>/dev/null)
        if echo "$AI_RESPONSE" | grep -q "success.*true"; then
            echo -e "${GREEN}✅ AI聊天服务正常${NC}"
        else
            echo -e "${RED}❌ AI聊天服务异常${NC}"
        fi
        
        # 显示系统资源
        echo -e "${YELLOW}💻 系统资源:${NC}"
        echo "CPU使用率: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d'%' -f1)%"
        echo "内存使用: $(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | cut -d'%' -f1)%"
        
        # 显示端口占用
        echo -e "${YELLOW}🔌 端口状态:${NC}"
        if lsof -i :3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 端口3000正在使用${NC}"
        else
            echo -e "${RED}❌ 端口3000未使用${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "前端页面: http://localhost:3000/"
        echo "API文档: http://localhost:3000/api/health"
        echo ""
        echo "按 Ctrl+C 停止监控"
        
        sleep 5
    done
}

# 启动监控
monitor_status 