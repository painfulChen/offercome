#!/bin/bash

# 🎨 前端修复版本部署脚本
# 部署包含内联样式的修复版本前端页面

echo "🎨 开始部署修复版本的前端页面..."

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

# 创建修复版本的前端文件
echo "📦 准备修复版本的前端文件..."

# 创建部署目录
mkdir -p frontend-fixed

# 复制修复版本的文件
cp public/index-fixed.html frontend-fixed/index.html

# 创建部署配置文件
cat > frontend-fixed/cloudbaserc.json << EOF
{
  "envId": "offercome2025-9g14jitp22f4ddfc",
  "framework": {
    "name": "offercome-frontend-fixed",
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
cat > frontend-fixed/package.json << EOF
{
  "name": "offercome-frontend-fixed",
  "version": "2.0.0",
  "description": "OfferCome Frontend Fixed Version",
  "scripts": {
    "deploy": "tcb framework deploy"
  }
}
EOF

# 部署到CloudBase
echo "🚀 部署修复版本到CloudBase静态托管..."
cd frontend-fixed

# 使用CloudBase Framework部署
tcb framework deploy -e offercome2025-9g14jitp22f4ddfc

if [ $? -eq 0 ]; then
    echo "✅ 修复版本前端部署成功！"
    echo "🌐 访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
    echo ""
    echo "📋 部署信息:"
    echo "- 主页: index.html (修复版本)"
    echo "- 样式: 内联样式 (确保显示)"
    echo "- 脚本: 内联脚本"
    echo "- 环境: offercome2025-9g14jitp22f4ddfc"
    echo ""
    echo "🔧 修复内容:"
    echo "- 添加了内联CSS样式"
    echo "- 确保渐变背景显示"
    echo "- 添加了动画效果"
    echo "- 优化了响应式设计"
else
    echo "❌ 修复版本前端部署失败"
    exit 1
fi

# 清理临时文件
cd ..
rm -rf frontend-fixed

echo ""
echo "🎉 修复版本前端部署完成！"
echo "📱 现在您可以在任何设备上访问修复后的前端页面了！"
echo "🎨 页面应该显示完整的渐变背景和动画效果！" 