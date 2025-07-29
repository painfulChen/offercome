#!/bin/bash

echo "🔍 OfferCome迁移状态检查"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# CloudBase环境信息
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
CLOUDBASE_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/"
CLOUDBASE_API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"

echo -e "${BLUE}📋 检查项目：${NC}"

# 1. 检查脚本运行状态
echo -e "${BLUE}🔍 1. 检查脚本运行状态...${NC}"
if pgrep -f "unified-deployment.sh" > /dev/null; then
    echo -e "${YELLOW}⚠️  统一部署脚本正在运行${NC}"
elif pgrep -f "migrate-to-cloudbase.sh" > /dev/null; then
    echo -e "${YELLOW}⚠️  迁移脚本正在运行${NC}"
else
    echo -e "${GREEN}✅ 脚本执行完成${NC}"
fi

# 2. 检查重要文件
echo -e "${BLUE}📁 2. 检查重要文件...${NC}"
IMPORTANT_FILES=(
    "server/index.js"
    "public/index.html"
    "package.json"
    "cloudbase.json"
    ".env.cloudbase"
)

for file in "${IMPORTANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${YELLOW}⚠️  $file 缺失${NC}"
    fi
done

# 3. 检查备份
echo -e "${BLUE}📦 3. 检查备份...${NC}"
if ls -d backup-* 2>/dev/null; then
    echo -e "${GREEN}✅ 备份已创建${NC}"
    ls -la backup-*/
else
    echo -e "${YELLOW}⚠️  未找到备份目录${NC}"
fi

# 4. 检查报告文件
echo -e "${BLUE}📊 4. 检查报告文件...${NC}"
REPORTS=(
    "CLEANUP_REPORT.md"
    "DEPLOYMENT_REPORT.md"
    "UNIFIED_DEPLOYMENT_REPORT.md"
)

for report in "${REPORTS[@]}"; do
    if [ -f "$report" ]; then
        echo -e "${GREEN}✅ $report${NC}"
    else
        echo -e "${YELLOW}⚠️  $report 未生成${NC}"
    fi
done

# 5. 检查CloudBase部署
echo -e "${BLUE}☁️  5. 检查CloudBase部署...${NC}"

# 测试前端访问
if curl -s -o /dev/null -w "%{http_code}" "$CLOUDBASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 前端访问正常${NC}"
    echo "   地址: $CLOUDBASE_URL"
else
    echo -e "${YELLOW}⚠️  前端访问可能有问题${NC}"
fi

# 测试API访问
if curl -s -o /dev/null -w "%{http_code}" "$CLOUDBASE_API_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✅ API服务正常${NC}"
    echo "   API地址: $CLOUDBASE_API_URL"
else
    echo -e "${YELLOW}⚠️  API服务可能需要几分钟启动${NC}"
fi

echo ""
echo -e "${BLUE}📋 当前状态总结：${NC}"
echo "🌐 主站地址: $CLOUDBASE_URL"
echo "🔗 API地址: $CLOUDBASE_API_URL"

echo ""
echo -e "${YELLOW}⚠️  如果迁移还在进行中，请稍等几分钟...${NC}"
echo "您可以通过以下命令查看实时日志："
echo "tail -f unified-deployment-*.log" 