#!/bin/bash

echo "🚀 开始部署OfferCome所有页面..."

# 创建临时部署目录
mkdir -p all-pages-deploy

# 复制所有页面文件
echo "📁 复制页面文件..."
cp public/index-fixed.html all-pages-deploy/index.html
cp public/cases.html all-pages-deploy/
cp public/admin-cases.html all-pages-deploy/

# 复制其他必要的静态文件（如果有的话）
if [ -f "public/styles.css" ]; then
    cp public/styles.css all-pages-deploy/
fi

if [ -f "public/app.js" ]; then
    cp public/app.js all-pages-deploy/
fi

echo "📋 文件列表:"
ls -la all-pages-deploy/

echo "🌐 开始部署到CloudBase..."

# 切换到部署目录
cd all-pages-deploy

# 使用CloudBase Framework部署
echo "正在部署到CloudBase..."
tcb framework deploy

echo "✅ 所有页面部署完成！"
echo ""
echo "📍 访问地址:"
echo "   - 首页: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/"
echo "   - 优秀案例: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/cases.html"
echo "   - 案例管理: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/admin-cases.html"
echo ""
echo "🔧 后端API地址:"
echo "   - API基础地址: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/api"
echo "   - 案例API: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/api/cases"
echo "   - 分类API: https://offercome2025-9g14jitp22f4ddfc.tcb.qcloud.la/api/categories"
echo ""
echo "📊 功能特性:"
echo "   ✅ 优秀案例展示页面"
echo "   ✅ 案例筛选和排序"
echo "   ✅ 后台管理功能"
echo "   ✅ 响应式设计"
echo "   ✅ 现代化UI"

# 清理临时目录
cd ..
rm -rf all-pages-deploy

echo ""
echo "🎉 部署完成！所有功能已就绪！" 