#!/bin/bash

echo "🔧 更新前端页面URL"
echo "===================="
echo ""

echo "📝 请输入您的HTTP触发器URL："
echo "格式: https://service-xxxxx-1256790827.ap-shanghai.apigateway.myqcloud.com/release"
echo ""

read -p "请输入触发器URL: " TRIGGER_URL

if [ -z "$TRIGGER_URL" ]; then
    echo "❌ 未输入URL，退出"
    exit 1
fi

echo ""
echo "🔍 验证URL格式..."
if [[ "$TRIGGER_URL" =~ ^https://service-[a-zA-Z0-9]+-1256790827\.ap-shanghai\.apigateway\.myqcloud\.com/release ]]; then
    echo "✅ URL格式正确"
else
    echo "⚠️  URL格式可能不正确，但继续执行..."
fi

echo ""
echo "📝 更新前端页面..."

# 备份原文件
cp public/cost-dashboard-fixed.html public/cost-dashboard-fixed.html.backup

# 更新URL
sed -i '' "s|url: 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com'|url: '$TRIGGER_URL'|g" public/cost-dashboard-fixed.html

echo "✅ 前端页面已更新"
echo ""

echo "🚀 重新部署静态文件..."
cloudbase hosting:deploy public/ -e offercome2025-9g14jitp22f4ddfc

echo ""
echo "🧪 测试更新后的页面..."
echo "访问: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/cost-dashboard-fixed.html"
echo ""

echo "📊 更新完成！"
echo "- 原文件已备份为: public/cost-dashboard-fixed.html.backup"
echo "- 新URL: $TRIGGER_URL"
echo "- 静态文件已重新部署"
echo ""
echo "✅ 现在您的API成本监控面板应该能正常工作了！" 