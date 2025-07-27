#!/bin/bash

echo "🚀 部署到CloudBase服务器"
echo "======================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"

echo -e "${YELLOW}🔧 检查CloudBase CLI...${NC}"
if ! command -v tcb &> /dev/null; then
    echo -e "${RED}❌ CloudBase CLI未安装${NC}"
    echo "请先安装CloudBase CLI: npm install -g @cloudbase/cli"
    exit 1
fi

echo -e "${GREEN}✅ CloudBase CLI已安装${NC}"

echo -e "${YELLOW}🔐 检查登录状态...${NC}"
if ! tcb login --list &> /dev/null; then
    echo -e "${YELLOW}📝 需要登录CloudBase...${NC}"
    tcb login
fi

echo -e "${GREEN}✅ 已登录CloudBase${NC}"

echo -e "${YELLOW}📦 准备部署文件...${NC}"

# 创建部署包
mkdir -p deploy-package
cp -r server deploy-package/
cp package.json deploy-package/
cp cloudbaserc.json deploy-package/
cp env.production deploy-package/.env

cd deploy-package

echo -e "${YELLOW}📥 安装依赖...${NC}"
npm install --production

echo -e "${YELLOW}🚀 部署到CloudBase...${NC}"
tcb framework deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端API部署成功！${NC}"
else
    echo -e "${RED}❌ 后端API部署失败${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}🌐 部署前端...${NC}"
tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 前端部署成功！${NC}"
else
    echo -e "${RED}❌ 前端部署失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📱 部署完成！访问信息:${NC}"
echo "前端地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
echo "API地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com"
echo ""
echo -e "${YELLOW}🔧 配置Kimi API:${NC}"
echo "运行: ./setup-real-kimi.sh"
echo ""
echo -e "${GREEN}✅ 现在可以在手机上访问完整的AI功能了！${NC}" 