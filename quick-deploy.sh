#!/bin/bash

# OfferCome 快速部署脚本
# 作者: OfferCome Team
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="OfferCome"
ENV_ID="offercome2025-9g14jitp22f4ddfc"
API_BASE="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
FRONTEND_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v tcb &> /dev/null; then
        log_error "CloudBase CLI 未安装"
        log_info "请运行: npm install -g @cloudbase/cli"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    npm install
    log_success "依赖安装完成"
}

# 部署API服务
deploy_api() {
    log_info "部署API服务到CloudBase..."
    
    # 检查是否在正确的目录
    if [ ! -f "server/index.js" ]; then
        log_error "未找到 server/index.js，请确保在项目根目录运行"
        exit 1
    fi
    
    # 部署云函数
    tcb fn deploy api -e $ENV_ID --force
    
    if [ $? -eq 0 ]; then
        log_success "API服务部署成功"
    else
        log_error "API服务部署失败"
        exit 1
    fi
}

# 部署前端
deploy_frontend() {
    log_info "部署前端到CloudBase静态托管..."
    
    # 检查public目录
    if [ ! -d "public" ]; then
        log_error "未找到 public 目录"
        exit 1
    fi
    
    # 部署静态文件
    tcb hosting deploy public/ -e $ENV_ID
    
    if [ $? -eq 0 ]; then
        log_success "前端部署成功"
    else
        log_error "前端部署失败"
        exit 1
    fi
}

# 测试API
test_api() {
    log_info "测试API接口..."
    
    # 测试健康检查
    log_info "测试健康检查接口..."
    response=$(curl -s -w "%{http_code}" "$API_BASE/health" -o /tmp/health_response)
    if [ "$response" = "200" ]; then
        log_success "健康检查接口正常"
    else
        log_error "健康检查接口异常，状态码: $response"
    fi
    
    # 测试MBTI问题接口
    log_info "测试MBTI问题接口..."
    response=$(curl -s -w "%{http_code}" "$API_BASE/mbti/questions" -o /tmp/mbti_response)
    if [ "$response" = "200" ]; then
        log_success "MBTI问题接口正常"
    else
        log_error "MBTI问题接口异常，状态码: $response"
    fi
    
    # 测试AI聊天接口
    log_info "测试AI聊天接口..."
    response=$(curl -s -w "%{http_code}" -X POST "$API_BASE/ai/chat" \
        -H "Content-Type: application/json" \
        -d '{"message":"测试消息"}' \
        -o /tmp/chat_response)
    if [ "$response" = "200" ]; then
        log_success "AI聊天接口正常"
    else
        log_error "AI聊天接口异常，状态码: $response"
    fi
}

# 测试前端
test_frontend() {
    log_info "测试前端页面..."
    
    # 测试主页面
    response=$(curl -s -w "%{http_code}" "$FRONTEND_URL/index-optimized.html" -o /dev/null)
    if [ "$response" = "200" ]; then
        log_success "主页面访问正常"
    else
        log_error "主页面访问异常，状态码: $response"
    fi
    
    # 测试MBTI测试页面
    response=$(curl -s -w "%{http_code}" "$FRONTEND_URL/mbti-test.html" -o /dev/null)
    if [ "$response" = "200" ]; then
        log_success "MBTI测试页面访问正常"
    else
        log_error "MBTI测试页面访问异常，状态码: $response"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo
    log_success "🎉 部署完成！"
    echo
    echo "📊 部署信息:"
    echo "  项目名称: $PROJECT_NAME"
    echo "  环境ID: $ENV_ID"
    echo "  部署时间: $(date)"
    echo
    echo "🔗 访问地址:"
    echo "  前端主页: $FRONTEND_URL/index-optimized.html"
    echo "  MBTI测试: $FRONTEND_URL/mbti-test.html"
    echo "  API健康检查: $API_BASE/health"
    echo
    echo "🧪 测试命令:"
    echo "  curl -X GET \"$API_BASE/health\""
    echo "  curl -X GET \"$API_BASE/mbti/questions\""
    echo "  curl -X POST \"$API_BASE/ai/chat\" -H \"Content-Type: application/json\" -d '{\"message\":\"测试\"}'"
    echo
}

# 显示帮助信息
show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  deploy-api     部署API服务"
    echo "  deploy-frontend 部署前端"
    echo "  deploy-all     部署全部服务"
    echo "  test-api       测试API接口"
    echo "  test-frontend  测试前端页面"
    echo "  test-all       测试全部功能"
    echo "  install        安装依赖"
    echo "  check          检查依赖"
    echo "  help           显示帮助信息"
    echo
    echo "Examples:"
    echo "  $0 deploy-all    # 部署全部服务"
    echo "  $0 test-all      # 测试全部功能"
    echo "  $0 install       # 安装依赖"
}

# 主函数
main() {
    case "${1:-help}" in
        "deploy-api")
            check_dependencies
            deploy_api
            ;;
        "deploy-frontend")
            check_dependencies
            deploy_frontend
            ;;
        "deploy-all")
            check_dependencies
            install_dependencies
            deploy_api
            deploy_frontend
            show_deployment_info
            ;;
        "test-api")
            test_api
            ;;
        "test-frontend")
            test_frontend
            ;;
        "test-all")
            test_api
            test_frontend
            ;;
        "install")
            install_dependencies
            ;;
        "check")
            check_dependencies
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@" 