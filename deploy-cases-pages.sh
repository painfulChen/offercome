#!/bin/bash

echo "🚀 开始部署优秀案例页面..."

# 创建临时部署目录
mkdir -p cases-deploy

# 复制优秀案例页面
cp public/cases.html cases-deploy/
cp public/admin-cases.html cases-deploy/

# 更新首页（如果需要）
cp public/index-fixed.html cases-deploy/index.html

echo "📁 文件准备完成，开始部署到CloudBase..."

# 切换到部署目录
cd cases-deploy

# 使用CloudBase Framework部署
tcb framework deploy

echo "✅ 优秀案例页面部署完成！"
echo "📍 访问地址:"
echo "   - 优秀案例页面: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/cases.html"
echo "   - 管理后台: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/admin-cases.html"

# 清理临时目录
cd ..
rm -rf cases-deploy

echo "🎉 部署完成！" 