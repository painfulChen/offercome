#!/bin/bash

# 🎨 前端优化部署脚本
# 部署优化后的前端页面到CloudBase静态托管

echo "🎨 开始部署优化后的前端页面..."

# 检查CloudBase CLI
if ! command -v tcb &> /dev/null; then
    echo "❌ CloudBase CLI 未安装，请先安装：npm install -g @cloudbase/cli"
    exit 1
fi

# 检查登录状态
echo "🔐 检查CloudBase登录状态..."
if ! tcb auth list &> /dev/null; then
    echo "📝 需要登录CloudBase..."
    tcb login
fi

# 创建优化后的前端文件
echo "📦 准备优化后的前端文件..."

# 创建部署目录
mkdir -p frontend-deploy

# 复制优化后的文件，保持原始文件名
cp public/index-optimized.html frontend-deploy/index.html
cp public/styles-optimized.css frontend-deploy/styles-optimized.css
cp public/app-optimized.js frontend-deploy/app-optimized.js

# 创建部署配置文件
cat > frontend-deploy/cloudbaserc.json << EOF
{
  "envId": "offercome2025-9g14jitp22f4ddfc",
  "framework": {
    "name": "offercome-frontend",
    "plugins": {
      "hosting": {
        "use": "@cloudbase/framework-plugin-website",
        "inputs": {
          "buildCommand": "echo 'No build required'",
          "outputPath": ".",
          "cloudPath": "/",
          "envVariables": {
            "NODE_ENV": "production"
          }
        }
      }
    }
  }
}
EOF

# 创建package.json
cat > frontend-deploy/package.json << EOF
{
  "name": "offercome-frontend",
  "version": "1.0.0",
  "description": "OfferCome Frontend",
  "scripts": {
    "deploy": "tcb framework deploy"
  }
}
EOF

# 部署到CloudBase
echo "🚀 部署到CloudBase静态托管..."
cd frontend-deploy

# 使用CloudBase Framework部署
tcb framework deploy -e offercome2025-9g14jitp22f4ddfc

if [ $? -eq 0 ]; then
    echo "✅ 前端部署成功！"
    echo "🌐 访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
    echo ""
    echo "📋 部署信息:"
    echo "- 主页: index.html"
    echo "- 样式: styles-optimized.css"
    echo "- 脚本: app-optimized.js"
    echo "- 环境: offercome2025-9g14jitp22f4ddfc"
else
    echo "❌ 前端部署失败"
    exit 1
fi

# 清理临时文件
cd ..
rm -rf frontend-deploy

echo ""
echo "🎉 前端优化部署完成！"
echo "📱 现在您可以在任何设备上访问优化后的前端页面了！" 