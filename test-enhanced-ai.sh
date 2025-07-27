#!/bin/bash

echo "🧪 测试增强版AI服务..."

# 测试外部访问
echo "=== 测试外部访问 ==="
curl -s http://124.222.117.47:3000/api/health || echo "外部访问失败"

echo ""
echo "=== 测试AI聊天 ==="
curl -s -X POST http://124.222.117.47:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好，我想了解美国计算机科学硕士申请"}' || echo "AI聊天失败"

echo ""
echo "=== 测试AI状态 ==="
curl -s http://124.222.117.47:3000/api/ai/status || echo "AI状态检查失败"

echo ""
echo "=== 测试招生建议 ==="
curl -s -X POST http://124.222.117.47:3000/api/ai/admission-advice \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "age": "25",
    "education": "本科计算机科学",
    "targetMajor": "计算机科学硕士",
    "budget": "50万人民币",
    "specialNeeds": "希望申请美国TOP50大学"
  }' || echo "招生建议生成失败"

echo ""
echo "✅ 测试完成！" 