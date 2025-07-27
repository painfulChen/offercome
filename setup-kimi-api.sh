#!/bin/bash

echo "🤖 配置Kimi AI API"
echo "=================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 配置步骤:${NC}"
echo "1. 访问 https://kimi.moonshot.cn/"
echo "2. 注册并登录账号"
echo "3. 进入API设置页面"
echo "4. 创建API Key"
echo ""

echo -e "${BLUE}🔑 请输入您的Kimi API Key:${NC}"
read -p "API Key: " KIMI_API_KEY

if [ -n "$KIMI_API_KEY" ]; then
    echo ""
    echo -e "${YELLOW}📝 更新环境配置...${NC}"
    
    # 更新生产环境配置
    sed -i '' "s/KIMI_API_KEY=your_kimi_api_key_here/KIMI_API_KEY=$KIMI_API_KEY/" env.production
    
    # 创建本地环境配置
    cat > .env << EOF
NODE_ENV=development
PORT=3000
KIMI_API_KEY=$KIMI_API_KEY
CLOUDBASE_ENV_ID=offercome2025-9g14jitp22f4ddfc
EOF
    
    echo -e "${GREEN}✅ API Key已配置${NC}"
    echo ""
    echo -e "${YELLOW}🔄 重启服务器以应用配置...${NC}"
    
    # 重启服务器
    pkill -f "node server/index-test.js"
    sleep 2
    node server/index-test.js &
    
    echo -e "${GREEN}✅ 服务器已重启${NC}"
    echo ""
    echo -e "${BLUE}🧪 测试AI服务...${NC}"
    sleep 3
    
    # 测试AI服务
    curl -s -X POST http://localhost:3000/api/ai/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "你好，请介绍一下你的功能"}' | head -5
    
    echo ""
    echo -e "${GREEN}✅ 配置完成！${NC}"
    echo ""
    echo -e "${BLUE}📱 现在您可以在手机上测试AI功能了${NC}"
    echo "访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
    
else
    echo -e "${RED}❌ 未输入API Key${NC}"
    echo "请重新运行脚本并输入有效的API Key"
fi 