#!/bin/bash

echo "🤖 自动监控修复系统启动"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
API_URL="http://localhost:3000"
LOG_FILE="logs/auto-monitor.log"

# 创建日志目录
mkdir -p logs

# 日志函数
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    echo -e "${timestamp} [${level}] ${message}"
}

# 检查并修复函数
check_and_fix() {
    local issue=$1
    local fix_command=$2
    
    log_message "CHECK" "检查问题: $issue"
    
    if eval "$fix_command"; then
        log_message "SUCCESS" "问题已修复: $issue"
        return 0
    else
        log_message "ERROR" "修复失败: $issue"
        return 1
    fi
}

# 监控函数
auto_monitor() {
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================="
        
        # 1. 检查本地服务器
        echo -e "${YELLOW}🔧 检查本地服务器...${NC}"
        if ! curl -s "$API_URL/api/health" > /dev/null 2>&1; then
            log_message "ERROR" "本地服务器未响应"
            echo -e "${RED}❌ 本地服务器未响应${NC}"
            
            # 自动重启服务器
            echo -e "${YELLOW}🔄 自动重启服务器...${NC}"
            pkill -f "node server/index-test.js"
            sleep 3
            node server/index-test.js &
            sleep 5
            
            if curl -s "$API_URL/api/health" > /dev/null 2>&1; then
                log_message "SUCCESS" "服务器重启成功"
                echo -e "${GREEN}✅ 服务器重启成功${NC}"
            else
                log_message "ERROR" "服务器重启失败"
                echo -e "${RED}❌ 服务器重启失败${NC}"
            fi
        else
            log_message "INFO" "本地服务器正常"
            echo -e "${GREEN}✅ 本地服务器正常${NC}"
        fi
        
        # 2. 检查AI服务
        echo -e "${YELLOW}🤖 检查AI服务...${NC}"
        AI_RESPONSE=$(curl -s -X POST "$API_URL/api/ai/chat" \
            -H "Content-Type: application/json" \
            -d '{"message": "test"}' 2>/dev/null)
        
        if echo "$AI_RESPONSE" | grep -q "success.*true"; then
            log_message "INFO" "AI服务正常"
            echo -e "${GREEN}✅ AI服务正常${NC}"
        else
            log_message "ERROR" "AI服务异常"
            echo -e "${RED}❌ AI服务异常${NC}"
            
            # 检查API Key配置
            if [ ! -f ".env" ] || ! grep -q "KIMI_API_KEY" .env; then
                log_message "WARNING" "Kimi API Key未配置"
                echo -e "${YELLOW}⚠️ Kimi API Key未配置${NC}"
                echo "请运行: ./setup-kimi-api.sh"
            fi
        fi
        
        # 3. 检查前端页面
        echo -e "${YELLOW}🌐 检查前端页面...${NC}"
        FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
        
        if [ "$FRONTEND_RESPONSE" = "200" ]; then
            log_message "INFO" "前端页面正常"
            echo -e "${GREEN}✅ 前端页面正常 (HTTP $FRONTEND_RESPONSE)${NC}"
        else
            log_message "ERROR" "前端页面异常 (HTTP $FRONTEND_RESPONSE)"
            echo -e "${RED}❌ 前端页面异常 (HTTP $FRONTEND_RESPONSE)${NC}"
            
            # 自动重新部署前端
            echo -e "${YELLOW}🔄 自动重新部署前端...${NC}"
            tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                log_message "SUCCESS" "前端重新部署成功"
                echo -e "${GREEN}✅ 前端重新部署成功${NC}"
            else
                log_message "ERROR" "前端重新部署失败"
                echo -e "${RED}❌ 前端重新部署失败${NC}"
            fi
        fi
        
        # 4. 检查CloudBase环境
        echo -e "${YELLOW}☁️ 检查CloudBase环境...${NC}"
        ENV_STATUS=$(tcb env list | grep $CLOUDBASE_ENV_ID | grep -o "正常")
        
        if [ "$ENV_STATUS" = "正常" ]; then
            log_message "INFO" "CloudBase环境正常"
            echo -e "${GREEN}✅ CloudBase环境正常${NC}"
        else
            log_message "ERROR" "CloudBase环境异常"
            echo -e "${RED}❌ CloudBase环境异常${NC}"
        fi
        
        # 5. 检查静态文件
        echo -e "${YELLOW}📁 检查静态文件...${NC}"
        STATIC_FILES=$(tcb hosting list -e $CLOUDBASE_ENV_ID | grep -c "index.html\|app.js\|styles.css")
        
        if [ "$STATIC_FILES" -ge 3 ]; then
            log_message "INFO" "静态文件完整 ($STATIC_FILES个文件)"
            echo -e "${GREEN}✅ 静态文件完整 ($STATIC_FILES个文件)${NC}"
        else
            log_message "ERROR" "静态文件不完整 ($STATIC_FILES个文件)"
            echo -e "${RED}❌ 静态文件不完整 ($STATIC_FILES个文件)${NC}"
            
            # 自动重新部署静态文件
            echo -e "${YELLOW}🔄 自动重新部署静态文件...${NC}"
            tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                log_message "SUCCESS" "静态文件重新部署成功"
                echo -e "${GREEN}✅ 静态文件重新部署成功${NC}"
            else
                log_message "ERROR" "静态文件重新部署失败"
                echo -e "${RED}❌ 静态文件重新部署失败${NC}"
            fi
        fi
        
        # 6. 系统资源监控
        echo -e "${YELLOW}💻 系统资源监控...${NC}"
        CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d'%' -f1)
        MEMORY_USAGE=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | cut -d'%' -f1)
        
        log_message "INFO" "CPU使用率: ${CPU_USAGE}%, 内存使用: ${MEMORY_USAGE}%"
        echo "CPU使用率: ${CPU_USAGE}%"
        echo "内存使用: ${MEMORY_USAGE}%"
        
        # 内存使用过高时自动清理
        if [ "$MEMORY_USAGE" -lt 20 ]; then
            log_message "WARNING" "内存使用率过高，执行清理"
            echo -e "${YELLOW}⚠️ 内存使用率过高，执行清理...${NC}"
            sudo purge
        fi
        
        # 显示访问地址
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "前端页面: $FRONTEND_URL"
        echo "本地API: $API_URL"
        echo ""
        echo -e "${PURPLE}📊 监控信息:${NC}"
        echo "• 日志文件: $LOG_FILE"
        echo "• 监控间隔: 30秒"
        echo "• 最后更新: $(date '+%H:%M:%S')"
        echo ""
        echo -e "${CYAN}💡 自动修复功能:${NC}"
        echo "• 服务器自动重启"
        echo "• 前端自动重新部署"
        echo "• 内存自动清理"
        echo ""
        echo "按 Ctrl+C 停止监控"
        
        sleep 30
    done
}

# 启动监控
auto_monitor 