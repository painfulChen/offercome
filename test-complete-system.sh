#!/bin/bash

echo "🧪 完整系统测试开始..."

echo "📋 测试1: 健康检查接口"
curl -s http://124.222.117.47:3000/api/health | jq .

echo -e "\n📋 测试2: AI聊天接口"
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想了解美国计算机科学硕士申请"}' | jq .

echo -e "\n📋 测试3: 招生建议接口"
curl -s -X POST http://124.222.117.47:3000/api/ai/admission-advice \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "age": "25",
    "education": "本科计算机科学",
    "targetMajor": "计算机科学硕士",
    "budget": "50万人民币",
    "specialNeeds": "希望申请美国TOP50大学"
  }' | jq .

echo -e "\n📋 测试4: AI服务状态"
curl -s http://124.222.117.47:3000/api/ai/status | jq .

echo -e "\n📋 测试5: 前端页面访问"
curl -s http://124.222.117.47:3000/ | head -5

echo -e "\n📋 测试6: 静态文件访问"
curl -s http://124.222.117.47:3000/styles.css | head -3

echo -e "\n✅ 完整系统测试完成！"
echo "🌐 前端访问地址: http://124.222.117.47:3000/"
echo "📱 请在iPhone 16 Pro上测试移动端体验" 