#!/bin/bash

echo "🚀 部署后端API到CloudBase"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"

# 检查登录状态
echo -e "${YELLOW}🔐 检查登录状态...${NC}"
if ! tcb env list | grep -q "$CLOUDBASE_ENV_ID"; then
    echo -e "${RED}❌ 未登录或环境不存在${NC}"
    echo "请先登录: tcb login"
    exit 1
fi

echo -e "${GREEN}✅ 已登录${NC}"

# 创建部署包
echo -e "${YELLOW}📦 创建部署包...${NC}"
mkdir -p deploy-package
cp -r server deploy-package/
cp package.json deploy-package/
cp cloudbaserc.json deploy-package/

# 进入部署目录
cd deploy-package

# 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install --production

# 部署API
echo -e "${YELLOW}🚀 部署API...${NC}"
tcb framework deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API部署成功${NC}"
    
    # 获取API地址
    echo -e "${YELLOW}🔍 获取API地址...${NC}"
    API_URL=$(tcb env list | grep "$CLOUDBASE_ENV_ID" | awk '{print $2}')
    echo -e "${GREEN}✅ API地址: https://${API_URL}.service.tcloudbaseapp.com${NC}"
    
    # 测试API
    echo -e "${YELLOW}🧪 测试API...${NC}"
    sleep 10
    
    curl -s "https://${API_URL}.service.tcloudbaseapp.com/api/health"
    echo ""
    
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo ""
    echo -e "${BLUE}📱 现在可以在手机上正常使用AI功能了${NC}"
    echo "前端地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
    echo "API地址: https://${API_URL}.service.tcloudbaseapp.com"
    
else
    echo -e "${RED}❌ API部署失败${NC}"
    exit 1
fi

# 返回原目录
cd .. 