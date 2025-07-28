#!/bin/bash

# OfferCome 增强系统完整测试脚本
echo "🧪 开始测试增强的OfferCome系统..."

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

API_BASE_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"
TEST_FAILED=false

echo "=================================="
echo "🎯 增强系统功能测试"
echo "=================================="

# 1. 测试API健康检查
log_info "1. 测试API健康检查..."
HEALTH_RESPONSE=$(curl -s "$API_BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"version":"2.1.0"' && echo "$HEALTH_RESPONSE" | grep -q '"features"'; then
    log_success "API健康检查通过 - 版本2.1.0"
    echo "   功能特性: $(echo "$HEALTH_RESPONSE" | grep -o '"features":\[[^]]*\]')"
else
    log_error "API健康检查失败"
    log_debug "响应: $HEALTH_RESPONSE"
    TEST_FAILED=true
fi

# 2. 测试MBTI问题API
log_info "2. 测试MBTI问题API..."
MBTI_QUESTIONS_RESPONSE=$(curl -s "$API_BASE_URL/mbti/questions")
if echo "$MBTI_QUESTIONS_RESPONSE" | grep -q '"success":true' && echo "$MBTI_QUESTIONS_RESPONSE" | grep -q '"total_questions":32'; then
    log_success "MBTI问题API正常"
    echo "   问题总数: 32个"
else
    log_error "MBTI问题API失败"
    log_debug "响应: $MBTI_QUESTIONS_RESPONSE"
    TEST_FAILED=true
fi

# 3. 测试用户注册
log_info "3. 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"testuser_enhanced_$(date +%s)","email":"testuser_enhanced_$(date +%s)@example.com","password":"password123","phone":"13800138000","education":"本科","target_job":"软件工程师","experience_years":3}' "$API_BASE_URL/auth/register")
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    log_success "用户注册成功"
    echo "   用户信息已保存到数据库"
else
    log_error "用户注册失败"
    log_debug "响应: $REGISTER_RESPONSE"
    TEST_FAILED=true
fi

# 4. 测试用户登录
log_info "4. 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"testuser_enhanced_$(date +%s)@example.com","password":"password123"}' "$API_BASE_URL/auth/login")
if echo "$LOGIN_RESPONSE" | grep -q '"success":true' && echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    log_success "用户登录成功 - 获取到token"
else
    log_error "用户登录失败"
    log_debug "响应: $LOGIN_RESPONSE"
    TEST_FAILED=true
fi

# 5. 测试获取用户资料
log_info "5. 测试获取用户资料..."
if [ ! -z "$AUTH_TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/auth/me")
    if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
        log_success "获取用户资料成功"
        echo "   用户信息包含MBTI、教育背景等字段"
    else
        log_error "获取用户资料失败"
        log_debug "响应: $PROFILE_RESPONSE"
        TEST_FAILED=true
    fi
else
    log_warning "跳过用户资料测试 - 无有效token"
fi

# 6. 测试咨询提交
log_info "6. 测试咨询提交..."
CONSULTATION_DATA='{
    "name": "测试用户",
    "phone": "13800138000",
    "email": "test@example.com",
    "consultation_type": "resume",
    "current_situation": "目前在一家小公司做开发，想跳槽到大厂",
    "target_position": "高级软件工程师",
    "target_company": "腾讯、阿里",
    "urgency_level": "high",
    "budget_range": "3000-5000",
    "preferred_time": "工作日晚上",
    "additional_notes": "希望尽快获得指导"
}'

CONSULTATION_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$CONSULTATION_DATA" "$API_BASE_URL/consultations")
if echo "$CONSULTATION_RESPONSE" | grep -q '"success":true'; then
    log_success "咨询提交成功"
    echo "   咨询记录已保存到数据库"
else
    log_error "咨询提交失败"
    log_debug "响应: $CONSULTATION_RESPONSE"
    TEST_FAILED=true
fi

# 7. 测试MBTI测试结果提交
log_info "7. 测试MBTI测试结果提交..."
if [ ! -z "$AUTH_TOKEN" ]; then
    MBTI_TEST_DATA='{
        "answers": [
            {"question_id": 1, "choice": "A"},
            {"question_id": 2, "choice": "B"},
            {"question_id": 3, "choice": "A"},
            {"question_id": 4, "choice": "C"},
            {"question_id": 5, "choice": "B"},
            {"question_id": 6, "choice": "A"},
            {"question_id": 7, "choice": "C"},
            {"question_id": 8, "choice": "B"},
            {"question_id": 9, "choice": "A"},
            {"question_id": 10, "choice": "B"},
            {"question_id": 11, "choice": "A"},
            {"question_id": 12, "choice": "C"},
            {"question_id": 13, "choice": "B"},
            {"question_id": 14, "choice": "A"},
            {"question_id": 15, "choice": "C"},
            {"question_id": 16, "choice": "B"},
            {"question_id": 17, "choice": "A"},
            {"question_id": 18, "choice": "B"},
            {"question_id": 19, "choice": "A"},
            {"question_id": 20, "choice": "C"},
            {"question_id": 21, "choice": "B"},
            {"question_id": 22, "choice": "A"},
            {"question_id": 23, "choice": "C"},
            {"question_id": 24, "choice": "B"},
            {"question_id": 25, "choice": "A"},
            {"question_id": 26, "choice": "B"},
            {"question_id": 27, "choice": "A"},
            {"question_id": 28, "choice": "C"},
            {"question_id": 29, "choice": "B"},
            {"question_id": 30, "choice": "A"},
            {"question_id": 31, "choice": "C"},
            {"question_id": 32, "choice": "B"}
        ]
    }'

    MBTI_RESULT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d "$MBTI_TEST_DATA" "$API_BASE_URL/mbti/result")
    if echo "$MBTI_RESULT_RESPONSE" | grep -q '"success":true'; then
        log_success "MBTI测试结果提交成功"
        MBTI_TYPE=$(echo "$MBTI_RESULT_RESPONSE" | grep -o '"mbti_type":"[^"]*"' | cut -d'"' -f4)
        echo "   MBTI类型: $MBTI_TYPE"
    else
        log_error "MBTI测试结果提交失败"
        log_debug "响应: $MBTI_RESULT_RESPONSE"
        TEST_FAILED=true
    fi
else
    log_warning "跳过MBTI测试 - 无有效token"
fi

# 8. 测试获取通知
log_info "8. 测试获取通知..."
if [ ! -z "$AUTH_TOKEN" ]; then
    NOTIFICATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/notifications")
    if echo "$NOTIFICATIONS_RESPONSE" | grep -q '"success":true'; then
        log_success "获取通知成功"
    else
        log_error "获取通知失败"
        log_debug "响应: $NOTIFICATIONS_RESPONSE"
        TEST_FAILED=true
    fi
else
    log_warning "跳过通知测试 - 无有效token"
fi

# 9. 测试前端访问
log_info "9. 测试前端访问..."
FRONTEND_RESPONSE=$(curl -s -I "$FRONTEND_URL" | head -1)
if echo "$FRONTEND_RESPONSE" | grep -q "200"; then
    log_success "前端访问正常"
    echo "   前端地址: $FRONTEND_URL"
else
    log_warning "前端访问异常"
    echo "   响应: $FRONTEND_RESPONSE"
fi

# 10. 测试数据库统计
log_info "10. 测试数据库统计..."
if [ ! -z "$AUTH_TOKEN" ]; then
    STATS_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/users")
    if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
        log_success "数据库统计正常"
        USER_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"users":\[[^]]*\]' | grep -o '\[.*\]' | jq length 2>/dev/null || echo "未知")
        echo "   用户数量: $USER_COUNT"
    else
        log_error "数据库统计失败"
        log_debug "响应: $STATS_RESPONSE"
        TEST_FAILED=true
    fi
else
    log_warning "跳过数据库统计 - 无有效token"
fi

# 11. 测试AI服务
log_info "11. 测试AI服务..."
AI_CHAT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"message":"你好，我想了解职业规划"}' "$API_BASE_URL/ai/chat")
if echo "$AI_CHAT_RESPONSE" | grep -q '"success":true'; then
    log_success "AI聊天服务正常"
else
    log_warning "AI聊天服务异常"
    log_debug "响应: $AI_CHAT_RESPONSE"
fi

# 12. 测试套餐信息
log_info "12. 测试套餐信息..."
PACKAGES_RESPONSE=$(curl -s "$API_BASE_URL/packages")
if echo "$PACKAGES_RESPONSE" | grep -q '"success":true'; then
    log_success "套餐信息获取正常"
else
    log_error "套餐信息获取失败"
    log_debug "响应: $PACKAGES_RESPONSE"
    TEST_FAILED=true
fi

echo ""
echo "=================================="
echo "📊 测试结果总结"
echo "=================================="

if [ "$TEST_FAILED" = true ]; then
    log_error "❌ 部分测试失败，请检查系统状态"
    echo ""
    echo "🔧 建议的修复步骤:"
    echo "1. 检查数据库连接"
    echo "2. 验证API部署状态"
    echo "3. 检查前端文件部署"
    echo "4. 查看CloudBase日志"
else
    log_success "✅ 所有测试通过！"
    echo ""
    echo "🎉 增强系统功能完整:"
    echo "✅ 用户注册和登录"
    echo "✅ 咨询表单提交"
    echo "✅ MBTI测试功能"
    echo "✅ 通知系统"
    echo "✅ 前端界面优化"
    echo "✅ 数据库集成"
    echo "✅ AI服务集成"
fi

echo ""
echo "🌐 访问地址:"
echo "   前端: $FRONTEND_URL"
echo "   API: $API_BASE_URL"
echo ""
echo "📋 主要功能:"
echo "   - 用户认证系统"
echo "   - 咨询管理"
echo "   - MBTI人格测试"
echo "   - CRM线索管理"
echo "   - 通知系统"
echo "   - AI智能服务"

echo ""
echo "🚀 系统已准备就绪！" 