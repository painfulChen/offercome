#!/bin/bash

echo "🔍 检查CloudBase部署状态..."
echo "=================================="

# 检查函数列表
echo "📋 已部署的函数:"
cloudbase functions:list

echo ""
echo "📁 已部署的静态文件:"
cloudbase hosting:list

echo ""
echo "🌐 访问地址:"
echo "前端页面: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
echo ""

echo "🔧 配置HTTP触发器:"
echo "1. 访问: https://console.cloud.tencent.com/tcb/scf?envId=offercome2025-9g14jitp22f4ddfc"
echo "2. 找到函数 'api'"
echo "3. 点击 '触发器' 标签"
echo "4. 创建新的HTTP触发器"
echo "5. 配置路径为: /*"
echo ""

echo "📊 测试命令:"
echo "curl -X GET 'https://[函数触发器URL]/api/health'"
echo "curl -X POST 'https://[函数触发器URL]/api/ai/chat' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"测试消息\"}'"
echo ""

echo "📝 查看函数日志:"
echo "cloudbase functions:log api"
echo ""

echo "✅ 部署状态检查完成！" 