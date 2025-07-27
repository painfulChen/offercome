#!/bin/bash

echo "🔍 环境状态检查"
echo "================"

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}检查CloudBase环境状态:${NC}"
ENV_STATUS=$(tcb env list | grep $CLOUDBASE_ENV_ID | grep -o "正常")

if [ "$ENV_STATUS" = "正常" ]; then
    echo -e "${GREEN}✅ 环境状态正常${NC}"
else
    echo -e "${RED}❌ 环境状态异常${NC}"
fi

echo ""
echo "完整环境信息:"
tcb env list | grep $CLOUDBASE_ENV_ID 