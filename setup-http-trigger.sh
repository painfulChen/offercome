#!/bin/bash

echo "🚀 配置HTTP触发器自动化脚本"
echo "=================================="
echo ""

# 检查是否已登录CloudBase
echo "🔐 检查CloudBase登录状态..."
if ! cloudbase functions:list > /dev/null 2>&1; then
    echo "❌ 未登录CloudBase，请先登录"
    echo "运行: cloudbase login"
    exit 1
fi

echo "✅ CloudBase已登录"

# 显示当前函数状态
echo ""
echo "📊 当前函数状态:"
cloudbase functions:list

echo ""
echo "🔧 HTTP触发器配置指南"
echo "=================================="
echo ""
echo "由于CloudBase CLI不支持直接创建HTTP触发器，请按以下步骤手动配置："
echo ""
echo "1. 打开浏览器访问："
echo "   https://console.cloud.tencent.com/tcb/scf?envId=offercome2025"
echo ""
echo "2. 在左侧菜单选择'云函数'"
echo ""
echo "3. 找到名为'api'的函数，点击进入"
echo ""
echo "4. 点击'触发管理'标签页"
echo ""
echo "5. 点击'新建触发器'按钮"
echo ""
echo "6. 配置触发器参数："
echo "   - 类型：HTTP触发器"
echo "   - 路径：/*"
echo "   - 方法：ALL"
echo "   - 描述：API访问触发器"
echo ""
echo "7. 点击'确定'保存"
echo ""
echo "8. 复制生成的HTTP触发器URL"
echo ""
echo "9. 更新前端页面中的API URL（如果需要）"
echo ""

# 测试当前API是否可访问
echo "🧪 测试当前API可访问性..."
echo ""

# 测试健康检查
echo "测试健康检查接口..."
if curl -s "https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api/health" > /dev/null 2>&1; then
    echo "✅ 健康检查接口可访问"
else
    echo "❌ 健康检查接口不可访问（需要HTTP触发器）"
fi

echo ""
echo "📝 配置完成后，前端页面将能够："
echo "- 直接调用CloudBase函数API"
echo "- 获取真实的Kimi API响应"
echo "- 实时跟踪成本数据"
echo "- 提供完整的用户体验"
echo ""
echo "🌐 前端页面地址："
echo "https://offercome2025-1256790827.tcloudbaseapp.com/kimi-api-tester.html"
echo ""
echo "📊 测试命令："
echo "curl https://您的HTTP触发器域名/api/health"
echo "curl -X POST https://您的HTTP触发器域名/api/ai/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"测试消息\"}'" 