#!/bin/bash

echo "🚀 开始部署MBTI职业建议系统..."

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js环境
echo -e "${YELLOW}📋 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"

# 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 初始化数据库
echo -e "${YELLOW}🗄️ 初始化数据库...${NC}"
cd server/scripts
node init-database.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 数据库初始化失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 数据库初始化完成${NC}"
cd ../..

# 启动服务器
echo -e "${YELLOW}🚀 启动服务器...${NC}"
npm start &

# 等待服务器启动
echo -e "${YELLOW}⏳ 等待服务器启动...${NC}"
sleep 5

# 测试API
echo -e "${YELLOW}🧪 测试API...${NC}"
node test-mbti-career.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ API测试失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API测试通过${NC}"

# 显示部署信息
echo -e "${GREEN}🎉 MBTI职业建议系统部署完成！${NC}"
echo -e "${YELLOW}📊 系统信息:${NC}"
echo "   - 服务器地址: http://localhost:3000"
echo "   - API文档: http://localhost:3000/api/docs"
echo "   - 健康检查: http://localhost:3000/api/health"
echo ""
echo -e "${YELLOW}🔗 主要API端点:${NC}"
echo "   - GET /api/mbti/career-advice - 获取所有职业建议"
echo "   - GET /api/mbti/career-advice/:type - 获取特定类型职业建议"
echo "   - POST /api/mbti/calculate - MBTI计算"
echo ""
echo -e "${YELLOW}📝 使用说明:${NC}"
echo "   1. 访问 http://localhost:3000 开始使用"
echo "   2. 完成MBTI测试后会自动显示职业建议"
echo "   3. 可以查看所有16型MBTI的职业建议"
echo ""
echo -e "${GREEN}✅ 部署完成！${NC}" 