#!/bin/bash

echo "🔍 OfferCome系统部署状态检查"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# CloudBase环境信息
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
CLOUDBASE_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/"
CLOUDBASE_API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"

# 服务器信息
SERVER_IP="124.222.117.47"
SERVER_USER="ubuntu"

echo -e "${BLUE}📋 检查项目：${NC}"
echo "1. CloudBase部署状态"
echo "2. 服务器部署状态"
echo "3. 本地开发环境"
echo "4. 数据库连接状态"
echo "5. API服务状态"
echo ""

# 1. 检查CloudBase部署
echo -e "${BLUE}🔍 1. 检查CloudBase部署...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$CLOUDBASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ CloudBase前端访问正常${NC}"
    echo "   地址: $CLOUDBASE_URL"
else
    echo -e "${RED}❌ CloudBase前端访问失败${NC}"
fi

# 检查CloudBase API
if curl -s -o /dev/null -w "%{http_code}" "$CLOUDBASE_API_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✅ CloudBase API服务正常${NC}"
    echo "   API地址: $CLOUDBASE_API_URL"
else
    echo -e "${YELLOW}⚠️  CloudBase API服务可能存在问题${NC}"
fi

echo ""

# 2. 检查服务器部署
echo -e "${BLUE}🔍 2. 检查服务器部署...${NC}"
if ping -c 1 $SERVER_IP &> /dev/null; then
    echo -e "${GREEN}✅ 服务器可达${NC}"
    echo "   服务器IP: $SERVER_IP"
    
    # 检查SSH连接
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
        echo -e "${GREEN}✅ SSH连接正常${NC}"
        
        # 检查服务器上的服务
        SERVICES=$(ssh $SERVER_USER@$SERVER_IP "systemctl list-units --type=service --state=running | grep -E '(nginx|node|mongodb|redis)' || echo 'No services found'")
        if [ ! -z "$SERVICES" ]; then
            echo -e "${GREEN}✅ 服务器服务运行中${NC}"
            echo "$SERVICES" | head -5
        else
            echo -e "${YELLOW}⚠️  未发现相关服务${NC}"
        fi
    else
        echo -e "${RED}❌ SSH连接失败${NC}"
    fi
else
    echo -e "${RED}❌ 服务器不可达${NC}"
fi

echo ""

# 3. 检查本地开发环境
echo -e "${BLUE}🔍 3. 检查本地开发环境...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ 项目文件存在${NC}"
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✅ Node.js已安装: $(node -v)${NC}"
    else
        echo -e "${RED}❌ Node.js未安装${NC}"
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✅ npm已安装: $(npm -v)${NC}"
    else
        echo -e "${RED}❌ npm未安装${NC}"
    fi
    
    # 检查依赖
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ 依赖已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  依赖未安装，运行: npm install${NC}"
    fi
else
    echo -e "${RED}❌ 项目文件不存在${NC}"
fi

echo ""

# 4. 检查数据库连接
echo -e "${BLUE}🔍 4. 检查数据库连接...${NC}"

# 检查MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}✅ 本地MongoDB连接正常${NC}"
    else
        echo -e "${YELLOW}⚠️  本地MongoDB未运行${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB客户端未安装${NC}"
fi

# 检查Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ 本地Redis连接正常${NC}"
    else
        echo -e "${YELLOW}⚠️  本地Redis未运行${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Redis客户端未安装${NC}"
fi

echo ""

# 5. 检查API服务
echo -e "${BLUE}🔍 5. 检查API服务...${NC}"

# 检查本地API
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" | grep -q "200"; then
    echo -e "${GREEN}✅ 本地API服务正常${NC}"
    echo "   地址: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  本地API服务未运行${NC}"
    echo "   启动命令: npm run dev"
fi

echo ""

# 6. 检查环境配置
echo -e "${BLUE}🔍 6. 检查环境配置...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ 环境配置文件存在${NC}"
    
    # 检查关键配置
    if grep -q "CLOUDBASE_ENV_ID" .env; then
        echo -e "${GREEN}✅ CloudBase环境ID已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  CloudBase环境ID未配置${NC}"
    fi
    
    if grep -q "KIMI_API_KEY" .env; then
        echo -e "${GREEN}✅ Kimi API密钥已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  Kimi API密钥未配置${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  环境配置文件不存在${NC}"
    echo "   请复制 env.example 到 .env 并配置"
fi

echo ""

# 7. 总结和建议
echo -e "${BLUE}📊 部署状态总结：${NC}"

echo -e "${GREEN}✅ 推荐使用CloudBase部署${NC}"
echo "   原因："
echo "   - 统一管理，避免冲突"
echo "   - 自动扩缩容"
echo "   - 成本优化"
echo "   - 高可用性"

echo ""
echo -e "${YELLOW}⚠️  建议操作：${NC}"
echo "1. 统一到CloudBase部署"
echo "2. 迁移其他部署的数据"
echo "3. 更新所有配置指向CloudBase"
echo "4. 关闭其他部署方式"

echo ""
echo -e "${BLUE}🔗 相关文档：${NC}"
echo "- 统一部署方案: DEPLOYMENT_UNIFICATION_PLAN.md"
echo "- 系统架构图: SYSTEM_ARCHITECTURE_DIAGRAM.md"
echo "- 项目结构: PROJECT_STRUCTURE.md"

echo ""
echo "✅ 检查完成！" 