#!/bin/bash

echo "🔗 添加GitHub远程仓库"
echo "======================"

# 设置变量
GITHUB_USERNAME="painfulChen"
REPO_NAME="offercome"

echo "📋 仓库信息："
echo "   GitHub用户名: $GITHUB_USERNAME"
echo "   仓库名称: $REPO_NAME"
echo "   仓库URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

echo "🎯 请确保您已经在GitHub上创建了仓库："
echo "   1. 访问 https://github.com/new"
echo "   2. 仓库名称: $REPO_NAME"
echo "   3. 描述: 智能求职辅导平台 - 基于腾讯云CloudBase的AI驱动求职服务"
echo "   4. 选择 Public 或 Private"
echo "   5. 不要初始化README、.gitignore或license"
echo "   6. 点击 'Create repository'"
echo ""

read -p "✅ 确认已创建仓库？(y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    
    if [ $? -eq 0 ]; then
        echo "✅ 远程仓库添加成功！"
        echo ""
        echo "🚀 推送代码到GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 代码推送成功！"
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
            echo "❌ 代码推送失败"
            echo "请检查网络连接和GitHub认证"
        fi
    else
        echo "❌ 远程仓库添加失败"
        echo "请检查仓库URL是否正确"
    fi
else
    echo "❌ 请先创建GitHub仓库"
fi 