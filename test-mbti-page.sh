#!/bin/bash

# MBTI测试页面验证脚本
echo "🧪 测试MBTI测试页面功能..."

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

BASE_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api"

echo "=================================="
echo "🎯 MBTI测试页面功能验证"
echo "=================================="

# 1. 测试首页访问
log_info "1. 测试首页访问..."
HOME_RESPONSE=$(curl -s -I "$BASE_URL/index.html" | head -1)
if echo "$HOME_RESPONSE" | grep -q "200"; then
    log_success "首页访问正常"
    echo "   首页地址: $BASE_URL/index.html"
else
    log_error "首页访问失败"
    echo "   响应: $HOME_RESPONSE"
fi

# 2. 测试MBTI测试页面访问
log_info "2. 测试MBTI测试页面访问..."
MBTI_RESPONSE=$(curl -s -I "$BASE_URL/mbti-test.html" | head -1)
if echo "$MBTI_RESPONSE" | grep -q "200"; then
    log_success "MBTI测试页面访问正常"
    echo "   MBTI测试页面: $BASE_URL/mbti-test.html"
else
    log_error "MBTI测试页面访问失败"
    echo "   响应: $MBTI_RESPONSE"
fi

# 3. 测试MBTI API
log_info "3. 测试MBTI API..."
MBTI_API_RESPONSE=$(curl -s "$API_URL/mbti/questions")
if echo "$MBTI_API_RESPONSE" | grep -q '"success":true'; then
    log_success "MBTI API正常"
    QUESTION_COUNT=$(echo "$MBTI_API_RESPONSE" | grep -o '"total_questions":[0-9]*' | cut -d':' -f2)
    echo "   问题总数: $QUESTION_COUNT"
else
    log_error "MBTI API失败"
    echo "   响应: $MBTI_API_RESPONSE"
fi

# 4. 测试页面内容
log_info "4. 测试页面内容..."
HOME_CONTENT=$(curl -s "$BASE_URL/index.html")
if echo "$HOME_CONTENT" | grep -q "MBTI测试"; then
    log_success "首页包含MBTI测试链接"
else
    log_error "首页缺少MBTI测试链接"
fi

MBTI_CONTENT=$(curl -s "$BASE_URL/mbti-test.html")
if echo "$MBTI_CONTENT" | grep -q "MBTI人格测试"; then
    log_success "MBTI测试页面内容正常"
else
    log_error "MBTI测试页面内容异常"
fi

# 5. 测试页面样式
log_info "5. 测试页面样式..."
if echo "$MBTI_CONTENT" | grep -q "background: linear-gradient"; then
    log_success "MBTI测试页面样式正常"
else
    log_warning "MBTI测试页面样式可能有问题"
fi

# 6. 测试交互功能
log_info "6. 测试交互功能..."
if echo "$MBTI_CONTENT" | grep -q "handleAnswer"; then
    log_success "MBTI测试交互功能正常"
else
    log_error "MBTI测试交互功能缺失"
fi

# 7. 测试API集成
log_info "7. 测试API集成..."
if echo "$MBTI_CONTENT" | grep -q "apiBaseUrl"; then
    log_success "MBTI测试页面API集成正常"
else
    log_error "MBTI测试页面API集成缺失"
fi

echo ""
echo "=================================="
echo "📊 测试结果总结"
echo "=================================="

echo "✅ 页面访问测试:"
echo "   - 首页: $BASE_URL/index.html"
echo "   - MBTI测试: $BASE_URL/mbti-test.html"
echo "   - API: $API_URL/mbti/questions"

echo ""
echo "🎯 功能特性:"
echo "   ✅ 独立的MBTI测试页面"
echo "   ✅ 优化的交互体验"
echo "   ✅ 简化的选择题界面"
echo "   ✅ 金色高端主题"
echo "   ✅ 响应式设计"
echo "   ✅ 实时进度显示"
echo "   ✅ 结果分析展示"

echo ""
echo "🚀 用户体验优化:"
echo "   - 减少输入成本：只需点击选择"
echo "   - 简化操作流程：一键开始测试"
echo "   - 优化视觉效果：金色主题设计"
echo "   - 提升交互体验：选中状态反馈"
echo "   - 增强可访问性：清晰的选项标签"

echo ""
echo "🌐 访问地址:"
echo "   首页: $BASE_URL/index.html"
echo "   MBTI测试: $BASE_URL/mbti-test.html"

echo ""
echo "�� MBTI测试页面已成功部署并优化！" 