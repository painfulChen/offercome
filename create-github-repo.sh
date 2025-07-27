#!/bin/bash

# GitHub仓库创建和代码推送脚本
echo "🚀 开始创建GitHub仓库并推送代码"
echo "=================================="

# 设置变量
GITHUB_USERNAME="painfulChen"
REPO_NAME="offercome"
REPO_DESCRIPTION="智能求职辅导平台 - 基于腾讯云CloudBase的AI驱动求职服务"

echo "📋 配置信息："
echo "   GitHub用户名: $GITHUB_USERNAME"
echo "   仓库名称: $REPO_NAME"
echo "   仓库描述: $REPO_DESCRIPTION"
echo ""

# 检查GitHub CLI是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI未安装，请先安装："
    echo "   brew install gh"
    echo "   或访问: https://cli.github.com/"
    echo ""
    echo "🔧 手动创建仓库步骤："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名称: $REPO_NAME"
    echo "3. 描述: $REPO_DESCRIPTION"
    echo "4. 选择 Public 或 Private"
    echo "5. 不要初始化README、.gitignore或license"
    echo "6. 点击 'Create repository'"
    echo ""
    echo "然后运行以下命令："
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "git push -u origin main"
    exit 1
fi

# 检查是否已登录GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 请先登录GitHub："
    echo "gh auth login"
    exit 1
fi

echo "✅ GitHub CLI已安装并已登录"
echo ""

# 创建GitHub仓库
echo "🏗️ 创建GitHub仓库..."
gh repo create $REPO_NAME \
    --description "$REPO_DESCRIPTION" \
    --public \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 仓库创建成功！"
    echo ""
    echo "📊 项目信息："
    echo "   - 仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "   - 在线演示: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/"
    echo "   - API地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
    echo ""
    echo "🔗 快速链接："
    echo "   - 查看仓库: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "   - 设置页面: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings"
    echo "   - Issues: https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues"
    echo ""
    echo "💡 建议后续操作："
    echo "   1. 在仓库页面添加项目描述"
    echo "   2. 设置仓库主题标签"
    echo "   3. 上传项目截图"
    echo "   4. 创建Issues和Projects"
    echo "   5. 设置GitHub Pages（可选）"
else
    echo "❌ 仓库创建失败，请手动创建"
    echo ""
    echo "🔧 手动步骤："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名称: $REPO_NAME"
    echo "3. 描述: $REPO_DESCRIPTION"
    echo "4. 选择 Public 或 Private"
    echo "5. 不要初始化README、.gitignore或license"
    echo "6. 点击 'Create repository'"
    echo ""
    echo "然后运行："
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "git push -u origin main"
fi 