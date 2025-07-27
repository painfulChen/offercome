#!/bin/bash

echo "🚀 部署服务器端监控系统"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"
CLOUDBASE_API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com"

echo -e "${BLUE}📊 部署监控系统到CloudBase服务器${NC}"
echo "=================================="

# 检查CloudBase CLI
if ! command -v tcb &> /dev/null; then
    echo -e "${RED}❌ CloudBase CLI未安装${NC}"
    echo "请先安装: npm install -g @cloudbase/cli"
    exit 1
fi

# 检查登录状态
if ! tcb auth list &> /dev/null; then
    echo -e "${YELLOW}⚠️  需要登录CloudBase${NC}"
    echo "请运行: tcb login"
    exit 1
fi

echo -e "${GREEN}✅ CloudBase CLI已就绪${NC}"

# 创建部署包
echo -e "${BLUE}📦 创建部署包...${NC}"
mkdir -p deploy-monitoring
cp -r server deploy-monitoring/
cp package.json deploy-monitoring/
cp cloudbaserc.json deploy-monitoring/
cp env.production deploy-monitoring/.env
cp -r public deploy-monitoring/

# 更新cloudbaserc.json配置
echo -e "${BLUE}⚙️  更新部署配置...${NC}"
cat > deploy-monitoring/cloudbaserc.json << EOF
{
  "envId": "$CLOUDBASE_ENV_ID",
  "framework": {
    "name": "offercome-ai-framework",
    "plugins": {
      "server": {
        "use": "@cloudbase/framework-plugin-node",
        "inputs": {
          "entry": "server/cloudbase-api.js",
          "name": "offercome-api",
          "region": "ap-shanghai",
          "runtime": "Nodejs12.16",
          "memory": 512,
          "timeout": 30,
          "envVariables": {
            "NODE_ENV": "production",
            "CLOUDBASE_ENV_ID": "$CLOUDBASE_ENV_ID"
          }
        }
      }
    }
  },
  "static": {
    "cos": {
      "region": "ap-shanghai",
      "bucket": "offercome-static"
    }
  }
}
EOF

# 进入部署目录
cd deploy-monitoring

echo -e "${BLUE}📥 安装依赖...${NC}"
npm install --production

# 部署后端API
echo -e "${BLUE}🚀 部署后端API...${NC}"
if tcb framework deploy; then
    echo -e "${GREEN}✅ 后端API部署成功${NC}"
else
    echo -e "${RED}❌ 后端API部署失败${NC}"
    cd ..
    exit 1
fi

# 返回上级目录
cd ..

# 部署前端静态文件
echo -e "${BLUE}🌐 部署前端监控面板...${NC}"
if tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID; then
    echo -e "${GREEN}✅ 前端监控面板部署成功${NC}"
else
    echo -e "${RED}❌ 前端监控面板部署失败${NC}"
    exit 1
fi

# 清理部署包
echo -e "${BLUE}🧹 清理部署包...${NC}"
rm -rf deploy-monitoring

echo ""
echo -e "${GREEN}🎉 监控系统部署完成！${NC}"
echo "=================================="
echo -e "${BLUE}📱 访问地址:${NC}"
echo "• 前端页面: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
echo "• 监控面板: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/cost-dashboard.html"
echo "• API统计: $CLOUDBASE_API_URL/api/cost/stats"
echo "• 监控路由: $CLOUDBASE_API_URL/monitor"
echo ""
echo -e "${YELLOW}💡 测试命令:${NC}"
echo "curl $CLOUDBASE_API_URL/api/cost/stats"
echo "curl $CLOUDBASE_API_URL/monitor"
echo ""
echo -e "${PURPLE}📊 监控功能:${NC}"
echo "• 实时API调用统计"
echo "• 成本跟踪和分析"
echo "• Web可视化面板"
echo "• 服务器端数据存储" 