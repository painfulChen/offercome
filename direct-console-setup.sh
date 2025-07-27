#!/bin/bash

echo "🚀 腾讯云控制台配置HTTP触发器"
echo "================================"
echo ""

echo "📋 配置步骤："
echo ""
echo "1️⃣ 打开腾讯云CloudBase控制台"
echo "   访问：https://console.cloud.tencent.com/tcb/scf?envId=offercome2025-9g14jitp22f4ddfc"
echo ""
echo "2️⃣ 进入云函数管理"
echo "   - 在左侧菜单选择'云函数'"
echo "   - 找到名为'api'的函数"
echo "   - 点击函数名称进入详情页"
echo ""
echo "3️⃣ 配置HTTP触发器"
echo "   - 点击'触发管理'标签页"
echo "   - 点击'新建触发器'按钮"
echo "   - 配置参数："
echo "     • 类型：HTTP触发器"
echo "     • 路径：/*"
echo "     • 方法：ALL"
echo "     • 描述：API访问触发器"
echo "   - 点击'确定'保存"
echo ""
echo "4️⃣ 获取触发器URL"
echo "   - 配置完成后，复制生成的HTTP触发器URL"
echo "   - 格式类似：https://xxx.service.tcloudbase.com"
echo ""

# 等待用户配置
echo "⏳ 请按照上述步骤配置HTTP触发器，完成后按回车键继续..."
read -p ""

echo ""
echo "🔍 请输入HTTP触发器URL："
read trigger_url

if [ -n "$trigger_url" ]; then
    echo ""
    echo "✅ 获取到触发器URL: $trigger_url"
    
    # 测试触发器
    echo ""
    echo "🧪 测试HTTP触发器..."
    echo "测试健康检查接口..."
    
    if curl -s "${trigger_url}/api/health" > /dev/null 2>&1; then
        echo "✅ HTTP触发器测试成功！"
        
        # 更新前端页面
        echo ""
        echo "🌐 更新前端页面URL..."
        sed -i '' "s|https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com|${trigger_url}|g" public/kimi-api-tester.html
        
        echo "✅ 前端页面URL已更新"
        
        # 重新部署前端页面
        echo ""
        echo "📦 重新部署前端页面..."
        cloudbase hosting deploy ./public -e offercome2025-9g14jitp22f4ddfc
        
        echo ""
        echo "🎉 配置完成！"
        echo ""
        echo "📝 现在可以访问前端页面进行真实API调用："
        echo "https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/kimi-api-tester.html"
        echo ""
        echo "🧪 测试命令："
        echo "curl ${trigger_url}/api/health"
        echo "curl -X POST ${trigger_url}/api/ai/chat \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"message\":\"测试消息\"}'"
        
    else
        echo "❌ HTTP触发器测试失败"
        echo "可能的原因："
        echo "1. 触发器URL不正确"
        echo "2. 触发器配置未生效（需要等待几分钟）"
        echo "3. 网络连接问题"
        echo ""
        echo "请检查配置后重试"
    fi
    
else
    echo "❌ 未提供触发器URL"
fi

echo ""
echo "📚 故障排除："
echo "1. 确保环境ID正确：offercome2025-9g14jitp22f4ddfc"
echo "2. 确保函数名称正确：api"
echo "3. 确保路径配置为：/*"
echo "4. 如果测试失败，等待几分钟后重试" 