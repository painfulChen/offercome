#!/bin/bash

echo "🚀 部署简化版CloudBase函数..."
echo "=================================="

# 检查CloudBase CLI
if ! command -v cloudbase &> /dev/null; then
    echo "❌ CloudBase CLI未安装，正在安装..."
    npm install -g @cloudbase/cli
fi

# 登录CloudBase
echo "🔐 登录CloudBase..."
cloudbase login

# 确保日志文件存在
echo "📝 初始化日志文件..."
mkdir -p /tmp
echo "date,time,api_type,calls,cost,status" > /tmp/cost-tracker.log

# 部署函数
echo "📦 部署函数..."
cloudbase functions:deploy api --force

# 部署静态文件
echo "📁 部署静态文件..."
cloudbase hosting:deploy public/ -e offercome2025-9g14jitp22f4ddfc

echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "前端页面: https://offercome2025-1256790827.tcloudbaseapp.com"
echo "API健康检查: https://offercome2025-1256790827.tcloudbaseapp.com/api/health"
echo ""
echo "🧪 测试命令:"
echo "curl https://offercome2025-1256790827.tcloudbaseapp.com/api/health"
echo "curl -X POST https://offercome2025-1256790827.tcloudbaseapp.com/api/ai/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"测试消息\"}'"
echo ""
echo "📊 查看日志:"
echo "cloudbase functions:log api" 