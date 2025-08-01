#!/bin/bash

# SCF部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认参数
STAGE=${1:-dev}
REGION="ap-shanghai"

echo -e "${GREEN}🚀 开始部署到 $STAGE 环境...${NC}"

# 检查环境文件
if [ ! -f "env.$STAGE" ]; then
    echo -e "${RED}❌ 环境配置文件 env.$STAGE 不存在${NC}"
    exit 1
fi

# 复制环境配置
echo -e "${YELLOW}📋 复制环境配置...${NC}"
cp env.$STAGE .env

# 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install
cd server && npm install && cd ..

# 检查SCF CLI
if ! command -v scf &> /dev/null; then
    echo -e "${YELLOW}📦 安装SCF CLI...${NC}"
    npm install -g serverless-cloud-framework
fi

# 部署
echo -e "${YELLOW}🚀 部署到 $STAGE 环境...${NC}"
scf deploy --stage $STAGE --region $REGION

# 等待部署完成
echo -e "${YELLOW}⏳ 等待部署完成...${NC}"
sleep 30

# 测试API
echo -e "${YELLOW}🧪 测试API健康检查...${NC}"
API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/$STAGE/api/health"

if curl -f "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API测试成功！${NC}"
    echo -e "${GREEN}🔗 API地址: $API_URL${NC}"
else
    echo -e "${RED}❌ API测试失败${NC}"
    echo -e "${YELLOW}🔍 请检查部署日志${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}📊 环境: $STAGE${NC}"
echo -e "${GREEN}🌐 区域: $REGION${NC}"
echo -e "${GREEN}🔗 API地址: $API_URL${NC}" 