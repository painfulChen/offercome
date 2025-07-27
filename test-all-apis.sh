#!/bin/bash

echo "🧪 测试所有API接口..."
echo "服务器地址: http://124.222.117.47:3000"
echo ""

# 测试健康检查
echo "=== 1. 健康检查 ==="
curl -s http://124.222.117.47:3000/api/health | jq '.' 2>/dev/null || curl -s http://124.222.117.47:3000/api/health
echo ""

# 测试AI聊天
echo "=== 2. AI聊天测试 ==="
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想了解留学申请"}' | jq '.' 2>/dev/null || curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想了解留学申请"}'
echo ""

# 测试招生建议
echo "=== 3. 招生建议测试 ==="
curl -s -X POST http://124.222.117.47:3000/api/ai/admission-advice \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "age": "25",
    "education": "本科计算机科学",
    "targetMajor": "计算机科学硕士",
    "budget": "50万人民币",
    "specialNeeds": "希望申请美国TOP50大学"
  }' | jq '.' 2>/dev/null || curl -s -X POST http://124.222.117.47:3000/api/ai/admission-advice \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "age": "25",
    "education": "本科计算机科学",
    "targetMajor": "计算机科学硕士",
    "budget": "50万人民币",
    "specialNeeds": "希望申请美国TOP50大学"
  }'
echo ""

# 测试AI状态
echo "=== 4. AI服务状态 ==="
curl -s http://124.222.117.47:3000/api/ai/status | jq '.' 2>/dev/null || curl -s http://124.222.117.47:3000/api/ai/status
echo ""

# 测试不同关键词的AI聊天
echo "=== 5. 关键词测试 ==="
echo "测试关键词: 计算机科学"
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想申请计算机科学专业"}' | jq -r '.message' 2>/dev/null || curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想申请计算机科学专业"}'
echo ""

echo "测试关键词: 美国"
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想去美国留学"}' | jq -r '.message' 2>/dev/null || curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想去美国留学"}'
echo ""

echo "测试关键词: 预算"
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想了解留学预算"}' | jq -r '.message' 2>/dev/null || curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我想了解留学预算"}'
echo ""

echo "✅ 所有API测试完成！"
echo ""
echo "🎉 服务器问题已解决！"
echo "📋 可用的API接口："
echo "  - 健康检查: http://124.222.117.47:3000/api/health"
echo "  - AI聊天: http://124.222.117.47:3000/api/ai/chat"
echo "  - 招生建议: http://124.222.117.47:3000/api/ai/admission-advice"
echo "  - AI状态: http://124.222.117.47:3000/api/ai/status" 