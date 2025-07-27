#!/bin/bash

echo "📋 日志查看工具"
echo "================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_FILE="logs/auto-monitor.log"

if [ ! -f "$LOG_FILE" ]; then
    echo -e "${RED}❌ 日志文件不存在: $LOG_FILE${NC}"
    echo "请先运行自动监控系统: ./auto-monitor-fix.sh"
    exit 1
fi

echo -e "${BLUE}📊 日志统计:${NC}"
echo "总行数: $(wc -l < "$LOG_FILE")"
echo "错误数: $(grep -c "ERROR" "$LOG_FILE")"
echo "警告数: $(grep -c "WARNING" "$LOG_FILE")"
echo "成功数: $(grep -c "SUCCESS" "$LOG_FILE")"
echo ""

echo -e "${YELLOW}🔍 最近10条日志:${NC}"
tail -10 "$LOG_FILE"
echo ""

echo -e "${YELLOW}❌ 最近的错误:${NC}"
grep "ERROR" "$LOG_FILE" | tail -5
echo ""

echo -e "${YELLOW}⚠️ 最近的警告:${NC}"
grep "WARNING" "$LOG_FILE" | tail -5
echo ""

echo -e "${GREEN}✅ 最近的成功操作:${NC}"
grep "SUCCESS" "$LOG_FILE" | tail -5
echo ""

echo -e "${BLUE}📈 实时日志监控 (按 Ctrl+C 停止):${NC}"
tail -f "$LOG_FILE" 