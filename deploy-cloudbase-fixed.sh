#!/bin/bash

echo "🚀 部署到CloudBase (修复版)..."

# 登录CloudBase
echo "🔐 登录CloudBase..."
cloudbase login

# 部署函数
echo "📦 部署函数..."
cloudbase functions:deploy api --force

# 部署静态文件
echo "📁 部署静态文件..."
cloudbase hosting:deploy public/ -e offercome2025-9g14jitp22f4ddfc

echo "✅ 部署完成！"
echo "🌐 访问地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
echo "🔧 API地址: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api/health"
