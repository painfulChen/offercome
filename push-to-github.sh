#!/bin/bash

echo "🚀 开始推送代码到GitHub..."

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 显示最近的提交
echo "📝 最近的提交:"
git log --oneline -3

# 尝试推送
echo "📤 推送到GitHub..."
echo "仓库地址: https://github.com/painfulChen/offercome.git"

# 方法1: 使用origin
echo "方法1: 使用origin推送..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    exit 0
fi

# 方法2: 使用HTTPS URL
echo "方法2: 使用HTTPS URL推送..."
git push https://github.com/painfulChen/offercome.git main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    exit 0
fi

# 方法3: 强制推送
echo "方法3: 强制推送..."
git push --force-with-lease origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    exit 0
fi

echo "❌ 推送失败，请检查以下问题："
echo "1. 确认GitHub仓库存在: https://github.com/painfulChen/offercome"
echo "2. 确认有推送权限"
echo "3. 确认网络连接正常"
echo "4. 可能需要输入GitHub用户名和密码"

echo ""
echo "🔧 手动推送步骤："
echo "1. 访问: https://github.com/painfulChen/offercome"
echo "2. 检查仓库是否存在"
echo "3. 如果不存在，请先创建仓库"
echo "4. 然后运行: git push origin main"

exit 1 