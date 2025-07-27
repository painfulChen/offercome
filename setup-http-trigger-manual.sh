#!/bin/bash

# 手动配置HTTP触发器的脚本
echo "🔧 手动配置HTTP触发器"
echo "=================================="

# 环境变量
ENV_ID="offercome2025-9g14jitp22f4ddfc"
FUNCTION_NAME="api"

echo "📋 环境信息:"
echo "  环境ID: $ENV_ID"
echo "  函数名: $FUNCTION_NAME"
echo ""

echo "🎯 请按照以下步骤在腾讯云控制台创建HTTP触发器:"
echo ""
echo "📱 1. 访问腾讯云控制台:"
echo "   https://console.cloud.tencent.com/tcb/scf?envId=$ENV_ID&rid=4"
echo ""
echo "🔧 2. 在控制台中执行以下操作:"
echo "   a) 找到函数 'api'"
echo "   b) 点击函数名称进入详情页"
echo "   c) 选择 '触发器管理' 标签页"
echo "   d) 点击 '创建触发器' 按钮"
echo "   e) 选择触发器类型: 'HTTP访问'"
echo "   f) 配置触发器参数:"
echo "      - 触发器名称: api-http-trigger"
echo "      - 路径: /api/*"
echo "      - 方法: GET, POST, PUT, DELETE, OPTIONS"
echo "      - 启用状态: 启用"
echo "   g) 点击 '确定' 保存"
echo ""
echo "🧪 3. 测试触发器配置:"
echo "   curl -X GET 'https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health'"
echo ""
echo "🌐 4. 测试前端页面:"
echo "   https://$ENV_ID-1256790827.tcloudbaseapp.com/"
echo ""

# 等待用户确认
echo "⏳ 请完成上述步骤后按回车键继续..."
read -r

# 测试API接口
echo "🧪 测试API接口..."
API_RESPONSE=$(curl -s -X GET "https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/health")

if echo "$API_RESPONSE" | grep -q "success"; then
    echo "✅ API接口测试成功!"
    echo "响应: $API_RESPONSE"
    echo ""
    echo "🎉 恭喜！HTTP触发器配置成功！"
    echo ""
    echo "🌐 现在可以访问前端页面:"
    echo "   https://$ENV_ID-1256790827.tcloudbaseapp.com/"
    echo ""
    echo "🧪 测试其他API接口:"
    echo "   curl -X POST 'https://$ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api/auth/register' \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"123456\"}'"
else
    echo "❌ API接口测试失败"
    echo "响应: $API_RESPONSE"
    echo ""
    echo "🔧 故障排除:"
    echo "1. 确认HTTP触发器已正确创建"
    echo "2. 检查路径配置是否为 /api/*"
    echo "3. 确认函数代码正确部署"
    echo "4. 检查云函数日志"
    echo "5. 等待几分钟让触发器生效"
fi

echo ""
echo "🎯 下一步操作:"
echo "1. 访问前端页面测试完整功能"
echo "2. 检查用户注册/登录功能"
echo "3. 测试AI聊天功能"
echo "4. 监控云函数日志"
echo ""
echo "✅ 配置完成!" 