#!/bin/bash

# MCP服务器启动脚本
echo "🚀 启动MCP服务器..."

# 检查配置文件
if [ ! -f "mcp-config/mysql.yaml" ]; then
    echo "❌ MySQL MCP配置文件不存在"
    exit 1
fi

# 启动MySQL MCP
echo "📊 启动MySQL MCP..."
npx @modelcontextprotocol/server-mysql \
    --connection-string "mysql://root:Offercome2024!@sh-cdb-l8rfujds.sql.tencentcdb.com:21736/offercome" \
    --ssl false &

MYSQL_PID=$!
echo "✅ MySQL MCP启动成功 (PID: $MYSQL_PID)"

# 等待服务器启动
sleep 2

echo "🎉 MCP服务器启动完成！"
echo "📊 可用服务:"
echo "   - MySQL数据库管理"
echo "   - CloudBase云服务管理"
echo "   - GitHub代码管理"
echo "   - Docker容器管理"

# 保持脚本运行
wait
