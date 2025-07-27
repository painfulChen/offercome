#!/bin/bash

echo "🧪 开始系统功能测试..."

# 测试API健康检查
echo "📋 测试API健康检查..."
curl -s http://localhost:3000/api/health

# 测试AI聊天功能
echo -e "\n🤖 测试AI聊天功能..."
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好，请介绍一下这个系统"}'

# 测试招生建议功能
echo -e "\n📚 测试招生建议功能..."
curl -s -X POST http://localhost:3000/api/ai/admission-advice \
  -H "Content-Type: application/json" \
  -d '{"student_info": "计算机科学专业，GPA 3.5，托福 95"}'

# 测试服务状态
echo -e "\n🔍 测试服务状态..."
curl -s http://localhost:3000/api/ai/status

echo -e "\n✅ 系统测试完成！" 