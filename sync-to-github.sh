#!/bin/bash

# GitHub同步脚本
echo "🚀 开始同步代码到GitHub"
echo "=================================="

# 检查Git状态
echo "📋 检查Git状态..."
git status

echo ""
echo "🎯 请按照以下步骤操作："
echo ""
echo "1️⃣ 在GitHub上创建新仓库："
echo "   - 访问 https://github.com/new"
echo "   - 仓库名称建议: offercome"
echo "   - 描述: 智能求职辅导平台"
echo "   - 选择 Public 或 Private"
echo "   - 不要初始化README、.gitignore或license"
echo "   - 点击 'Create repository'"
echo ""
echo "2️⃣ 复制仓库URL（类似以下格式）："
echo "   https://github.com/yourusername/offercome.git"
echo "   或"
echo "   git@github.com:yourusername/offercome.git"
echo ""
echo "3️⃣ 运行以下命令添加远程仓库："
echo "   git remote add origin YOUR_REPOSITORY_URL"
echo ""
echo "4️⃣ 推送代码到GitHub："
echo "   git push -u origin main"
echo ""

# 检查是否已配置远程仓库
if git remote -v | grep -q origin; then
    echo "✅ 已配置远程仓库"
    echo "当前远程仓库:"
    git remote -v
    echo ""
    echo "🚀 推送代码到GitHub..."
    git push -u origin main
else
    echo "❌ 未配置远程仓库"
    echo ""
    echo "请先按照上述步骤在GitHub上创建仓库，然后运行："
    echo "git remote add origin YOUR_REPOSITORY_URL"
    echo "git push -u origin main"
fi

echo ""
echo "🎉 同步完成！"
echo ""
echo "📊 项目信息："
echo "   - 项目名称: OfferCome智能求职辅导平台"
echo "   - 技术栈: Node.js + CloudBase + HTML5"
echo "   - 在线地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/"
echo "   - API地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
echo ""
echo "💡 提示："
echo "   - 记得在GitHub仓库页面添加项目描述"
echo "   - 可以设置GitHub Pages来展示项目"
echo "   - 建议添加Issues和Projects来管理项目" 