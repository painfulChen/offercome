#!/bin/bash

# GitHub推送脚本
echo "🚀 开始推送到GitHub..."

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 显示远程仓库信息
echo "🔗 远程仓库信息:"
git remote -v

# 显示最近的提交
echo "📝 最近的提交:"
git log --oneline -5

# 尝试推送
echo "📤 尝试推送到GitHub..."
echo "仓库地址: https://github.com/painfulChen/offercome.git"
echo "当前分支: main"
echo "提交ID: be6943e"

# 如果推送失败，提供手动推送指南
echo ""
echo "📋 如果自动推送失败，请手动执行以下命令:"
echo "1. 确保已配置GitHub凭据"
echo "2. 运行: git push origin main"
echo "3. 或使用个人访问令牌:"
echo "   git remote set-url origin https://YOUR_TOKEN@github.com/painfulChen/offercome.git"
echo "   git push origin main"

echo ""
echo "🎯 项目信息:"
echo "- 项目名称: CloudBase AI开发框架"
echo "- GitHub仓库: https://github.com/painfulChen/offercome.git"
echo "- 当前状态: 数据持久化部署完成，API服务配置中"
echo "- 需要O3协助: 路径配置优化问题"

echo ""
echo "✅ 代码已准备就绪，等待推送到GitHub" 