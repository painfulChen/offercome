#!/bin/bash

echo "🚀 开始完整云部署 - 前端 + 后端"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# CloudBase环境配置
CLOUDBASE_ENV_ID="offercome2025-9g14jitp22f4ddfc"

echo -e "${BLUE}📋 部署配置信息:${NC}"
echo "CloudBase环境ID: $CLOUDBASE_ENV_ID"
echo ""

# 步骤1: 检查CloudBase CLI
echo -e "${YELLOW}🔧 步骤1: 检查CloudBase CLI${NC}"
if ! command -v tcb &> /dev/null; then
    echo "📦 安装CloudBase CLI..."
    npm install -g @cloudbase/cli
else
    echo -e "${GREEN}✅ CloudBase CLI已安装${NC}"
fi

# 步骤2: 登录CloudBase
echo -e "${YELLOW}🔧 步骤2: CloudBase登录${NC}"
if [ -f "cloudbase-key.json" ]; then
    echo "使用密钥文件登录..."
    # 检查密钥文件格式
    if grep -q "secretId" cloudbase-key.json; then
        # API密钥格式
        API_KEY_ID=$(cat cloudbase-key.json | grep -o '"secretId": "[^"]*"' | cut -d'"' -f4)
        API_KEY=$(cat cloudbase-key.json | grep -o '"secretKey": "[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$API_KEY_ID" ] && [ -n "$API_KEY" ]; then
            echo "使用API密钥登录..."
            tcb login --apiKeyId "$API_KEY_ID" --apiKey "$API_KEY"
        else
            echo -e "${RED}❌ 无法从密钥文件读取API密钥${NC}"
            exit 1
        fi
    elif grep -q "private_key" cloudbase-key.json; then
        # RSA私钥格式
        echo "使用RSA私钥登录..."
        tcb login -k
        echo "请在弹出的浏览器中完成登录..."
    else
        echo -e "${RED}❌ 不支持的密钥文件格式${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 未找到cloudbase-key.json文件${NC}"
    echo "请确保cloudbase-key.json文件存在"
    exit 1
fi

# 步骤3: 更新CloudBase配置
echo -e "${YELLOW}🔧 步骤3: 更新CloudBase配置${NC}"
cat > cloudbase.json << EOF
{
  "version": "2.0",
  "envId": "$CLOUDBASE_ENV_ID",
  "framework": {
    "name": "offercome-ai-framework",
    "plugins": {
      "client": {
        "use": "@cloudbase/framework-plugin-mp",
        "inputs": {
          "appid": "your-miniprogram-appid",
          "privateKeyPath": "private.key"
        }
      },
      "server": {
        "use": "@cloudbase/framework-plugin-node",
        "inputs": {
          "entry": "server/index-test.js",
          "path": "/api",
          "name": "offercome-api",
          "region": "ap-shanghai",
          "runtime": "Nodejs16.13",
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

echo -e "${GREEN}✅ CloudBase配置已更新${NC}"

# 步骤4: 准备部署文件
echo -e "${YELLOW}🔧 步骤4: 准备部署文件${NC}"

# 创建部署包
mkdir -p deploy-package
cp -r server deploy-package/
cp -r public deploy-package/
cp package.json deploy-package/
cp cloudbase.json deploy-package/
cp cloudbaserc.json deploy-package/

# 创建生产环境配置
cat > deploy-package/.env << EOF
NODE_ENV=production
CLOUDBASE_ENV_ID=$CLOUDBASE_ENV_ID
PORT=3000
EOF

echo -e "${GREEN}✅ 部署文件准备完成${NC}"

# 步骤5: 部署到CloudBase
echo -e "${YELLOW}🔧 步骤5: 部署到CloudBase${NC}"
cd deploy-package

echo "开始部署..."
tcb framework deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
else
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

cd ..

# 步骤6: 部署静态文件
echo -e "${YELLOW}🔧 步骤6: 部署静态文件${NC}"
echo "上传前端文件到COS..."

# 上传静态文件
tcb hosting deploy public/ -e $CLOUDBASE_ENV_ID

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 静态文件部署成功！${NC}"
else
    echo -e "${RED}❌ 静态文件部署失败${NC}"
fi

# 步骤7: 获取访问地址
echo -e "${YELLOW}🔧 步骤7: 获取访问地址${NC}"

# 获取环境信息
echo "获取环境信息..."
tcb env list

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo -e "${BLUE}📱 访问地址:${NC}"
echo "请查看上面的环境信息获取具体访问地址"
echo ""
echo -e "${BLUE}🔍 测试命令:${NC}"
echo "部署完成后，您可以在手机上访问前端页面" 