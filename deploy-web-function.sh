#!/bin/bash

echo "🚀 部署Web函数版本"
echo "===================="
echo ""

# 备份原配置
cp cloudbaserc.json cloudbaserc-backup.json

# 使用Web函数配置
cp cloudbaserc-web.json cloudbaserc.json

echo "📦 部署Web函数..."
cloudbase functions:deploy api-web -e offercome2025-9g14jitp22f4ddfc

if [ $? -eq 0 ]; then
    echo "✅ Web函数部署成功！"
    echo ""
    echo "🌐 Web函数访问地址："
    echo "https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api-web/"
    echo ""
    echo "🧪 测试命令："
    echo "curl https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api-web/api/health"
    echo "curl -X POST https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api-web/api/ai/chat \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"message\":\"测试消息\"}'"
    
    # 更新前端页面URL
    echo ""
    echo "🌐 更新前端页面URL..."
    sed -i '' "s|https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com|https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/api-web|g" public/kimi-api-tester.html
    
    # 重新部署前端
    echo "📦 重新部署前端页面..."
    cloudbase hosting deploy ./public -e offercome2025-9g14jitp22f4ddfc
    
    echo ""
    echo "🎉 部署完成！"
    echo "📝 现在可以访问前端页面进行真实API调用："
    echo "https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/kimi-api-tester.html"
    
else
    echo "❌ Web函数部署失败"
    # 恢复原配置
    cp cloudbaserc-backup.json cloudbaserc.json
fi 