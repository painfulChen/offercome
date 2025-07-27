#!/bin/bash

echo "🚀 CodeBuddy配置HTTP触发器自动化脚本"
echo "======================================"
echo ""

# 检查CodeBuddy CLI是否安装
echo "🔍 检查CodeBuddy CLI..."
if ! command -v codebuddy &> /dev/null; then
    echo "❌ CodeBuddy CLI未安装，正在安装..."
    npm install -g @tencent/codebuddy-cli
    if [ $? -ne 0 ]; then
        echo "❌ CodeBuddy CLI安装失败"
        echo "请手动安装：npm install -g @tencent/codebuddy-cli"
        exit 1
    fi
fi

echo "✅ CodeBuddy CLI已安装"

# 检查登录状态
echo ""
echo "🔐 检查CodeBuddy登录状态..."
if ! codebuddy whoami &> /dev/null; then
    echo "❌ 未登录CodeBuddy，请先登录"
    echo "运行: codebuddy login"
    echo ""
    echo "登录后重新运行此脚本"
    exit 1
fi

echo "✅ CodeBuddy已登录"

# 显示当前环境
echo ""
echo "📊 当前环境列表："
codebuddy env list

echo ""
echo "🔧 配置HTTP触发器..."
echo ""

# 尝试通过CodeBuddy CLI创建HTTP触发器
echo "尝试通过CodeBuddy CLI创建HTTP触发器..."

# 方法1：使用CodeBuddy CLI
if codebuddy function trigger create \
  --env-id offercome2025-9g14jitp22f4ddfc \
  --function-name api \
  --trigger-type http \
  --path "/*" \
  --method ALL \
  --description "API访问触发器" 2>/dev/null; then
    
    echo "✅ CodeBuddy CLI配置成功！"
    
    # 获取触发器URL
    echo ""
    echo "🔍 获取触发器URL..."
    trigger_url=$(codebuddy function trigger list \
      --env-id offercome2025-9g14jitp22f4ddfc \
      --function-name api \
      --format json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$trigger_url" ]; then
        echo "✅ 触发器URL: $trigger_url"
        
        # 更新前端页面
        echo ""
        echo "🌐 更新前端页面URL..."
        sed -i '' "s|https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com|${trigger_url}|g" public/kimi-api-tester.html
        
        echo "✅ 前端页面URL已更新"
        
        # 测试触发器
        echo ""
        echo "🧪 测试HTTP触发器..."
        if curl -s "${trigger_url}/api/health" > /dev/null 2>&1; then
            echo "✅ HTTP触发器测试成功！"
        else
            echo "⚠️ HTTP触发器测试失败，可能需要等待几分钟生效"
        fi
        
    else
        echo "❌ 无法获取触发器URL"
    fi
    
else
    echo "❌ CodeBuddy CLI配置失败，尝试其他方法..."
    
    # 方法2：使用腾讯云API
    echo ""
    echo "🔧 尝试使用腾讯云API配置..."
    echo ""
    echo "请按以下步骤手动配置："
    echo ""
    echo "1. 访问CodeBuddy控制台："
    echo "   https://console.cloud.tencent.com/codebuddy"
    echo ""
    echo "2. 选择环境：offercome2025-9g14jitp22f4ddfc"
    echo ""
    echo "3. 进入云函数模块"
    echo ""
    echo "4. 找到'api'函数，点击进入"
    echo ""
    echo "5. 点击'触发管理'标签"
    echo ""
    echo "6. 点击'新建触发器'"
    echo ""
    echo "7. 配置参数："
    echo "   - 类型：HTTP触发器"
    echo "   - 路径：/*"
    echo "   - 方法：ALL"
    echo "   - 描述：API访问触发器"
    echo ""
    echo "8. 点击'确定'保存"
    echo ""
    echo "9. 复制生成的HTTP触发器URL"
    echo ""
    
    # 等待用户输入触发器URL
    echo "⏳ 请配置完成后输入HTTP触发器URL："
    read trigger_url
    
    if [ -n "$trigger_url" ]; then
        echo ""
        echo "🌐 更新前端页面URL..."
        sed -i '' "s|https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com|${trigger_url}|g" public/kimi-api-tester.html
        
        echo "✅ 前端页面URL已更新"
        
        # 测试触发器
        echo ""
        echo "🧪 测试HTTP触发器..."
        if curl -s "${trigger_url}/api/health" > /dev/null 2>&1; then
            echo "✅ HTTP触发器测试成功！"
        else
            echo "⚠️ HTTP触发器测试失败，可能需要等待几分钟生效"
        fi
    fi
fi

echo ""
echo "🎉 配置完成！"
echo ""
echo "📝 现在可以访问前端页面进行真实API调用："
echo "https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/kimi-api-tester.html"
echo ""
echo "🧪 测试命令："
if [ -n "$trigger_url" ]; then
    echo "curl ${trigger_url}/api/health"
    echo "curl -X POST ${trigger_url}/api/ai/chat \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"message\":\"测试消息\"}'"
fi 