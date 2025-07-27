#!/bin/bash

# 数据库管理脚本
# 用于初始化、测试和管理数据库

echo "🗄️  CloudBase AI 数据库管理工具"
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install mongoose bcryptjs redis

# 测试数据库连接
echo "🔌 测试数据库连接..."
node test-database.js

# 初始化数据库
echo "🚀 初始化数据库..."
node server/init-database.js

echo ""
echo "✅ 数据库管理完成！"
echo ""
echo "📊 可用的管理命令："
echo "  - node test-database.js     # 测试数据库连接"
echo "  - node server/init-database.js  # 初始化数据库"
echo "  - npm run deploy            # 部署到CloudBase"
echo ""
echo "🌐 访问地址："
echo "  - 登录页面: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/admin-login.html"
echo "  - 管理后台: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/admin-dashboard.html"
echo ""
echo "🔑 默认账号："
echo "  - 管理员: admin / admin123"
echo "  - 测试用户: user123 / user123" 