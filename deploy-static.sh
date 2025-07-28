#!/bin/bash

echo "🚀 开始部署静态网站..."

# 检查public目录是否存在
if [ ! -d "public" ]; then
    echo "❌ public目录不存在"
    exit 1
fi

# 创建临时部署目录
echo "📦 准备部署文件..."
rm -rf deploy-temp
mkdir deploy-temp
cp -r public/* deploy-temp/

# 删除.git目录（如果存在）
if [ -d "deploy-temp/.git" ]; then
    rm -rf deploy-temp/.git
fi

# 部署到CloudBase
echo "🌐 部署到CloudBase..."
tcb hosting:deploy deploy-temp/ /

# 清理临时目录
rm -rf deploy-temp

echo "✅ 静态网站部署完成！"
echo "🌐 访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com" 