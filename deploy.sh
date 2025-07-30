#!/bin/bash

# 一键部署脚本 - 路径统一 + 路由自动注册 + 流水线防回滚

set -e  # 遇到错误立即退出

echo "🚀 开始部署 OfferCome API 服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ -z "$TCB_ENV_ID" ]; then
        log_error "未设置 TCB_ENV_ID 环境变量"
        exit 1
    fi
    
    if [ -z "$TCB_SECRET_ID" ]; then
        log_error "未设置 TCB_SECRET_ID 环境变量"
        exit 1
    fi
    
    if [ -z "$TCB_SECRET_KEY" ]; then
        log_error "未设置 TCB_SECRET_KEY 环境变量"
        exit 1
    fi
    
    log_success "环境变量检查通过"
}

# 运行测试
run_tests() {
    log_info "运行单元测试..."
    
    cd server
    
    if ! npm test; then
        log_error "单元测试失败"
        exit 1
    fi
    
    log_success "单元测试通过"
    cd ..
}

# 生成路由文档
generate_route_docs() {
    log_info "生成路由文档..."
    
    cd server
    
    # 创建路由文档生成脚本
    cat > scripts/generate-route-docs.js << 'EOF'
const { routes, API_PREFIX } = require('../routes');

console.log('# API 路由文档');
console.log('');
console.log(`API前缀: \`${API_PREFIX}\``);
console.log('');
console.log('| 方法 | 路径 | 描述 | 认证 | 速率限制 |');
console.log('|------|------|------|------|----------|');

routes.forEach(route => {
    const method = route.method;
    const path = `${API_PREFIX}${route.path}`;
    const description = route.description;
    const auth = route.auth ? '是' : '否';
    const rateLimit = route.rateLimit ? `${route.rateLimit}/min` : '无限制';
    
    console.log(`| ${method} | \`${path}\` | ${description} | ${auth} | ${rateLimit} |`);
});

console.log('');
console.log(`总路由数: ${routes.length}`);
EOF

    node scripts/generate-route-docs.js > ../API_ROUTES.md
    
    log_success "路由文档已生成: API_ROUTES.md"
    cd ..
}

# 部署到CloudBase
deploy_to_cloudbase() {
    log_info "部署到CloudBase..."
    
    # 检查CloudBase CLI是否安装
    if ! command -v tcb &> /dev/null; then
        log_info "安装CloudBase CLI..."
        npm install -g @cloudbase/cli
    fi
    
    # 登录CloudBase
    log_info "登录CloudBase..."
    echo "$TCB_SECRET_ID" | tcb login --apiKeyId "$TCB_SECRET_ID" --apiKey "$TCB_SECRET_KEY"
    
    # 强制部署
    log_info "执行强制部署..."
    tcb framework:deploy -e "$TCB_ENV_ID" --force
    
    log_success "部署完成"
}

# 等待部署完成
wait_for_deployment() {
    log_info "等待部署完成..."
    sleep 30
}

# 冒烟测试
smoke_test() {
    log_info "执行冒烟测试..."
    
    DOMAIN="https://$TCB_ENV_ID.service.tcloudbase.com"
    ENDPOINTS=("/health" "/mbti/questions" "/ai/chat")
    
    for endpoint in "${ENDPOINTS[@]}"; do
        log_info "测试 $DOMAIN/api-v2$endpoint"
        
        if curl -fs "$DOMAIN/api-v2$endpoint" -o /dev/null; then
            log_success "✅ $endpoint 测试通过"
        else
            log_error "❌ $endpoint 测试失败"
            return 1
        fi
    done
    
    log_success "所有冒烟测试通过"
}

# 获取部署详情
get_deployment_details() {
    log_info "获取部署详情..."
    
    tcb functions:detail api -e "$TCB_ENV_ID" > function-details.json
    tcb service:describe -e "$TCB_ENV_ID" > service-details.json
    
    log_success "部署详情已保存"
}

# 生成部署报告
generate_deployment_report() {
    log_info "生成部署报告..."
    
    cat > DEPLOYMENT_REPORT.md << EOF
# 部署报告

**部署时间**: $(date)
**环境ID**: $TCB_ENV_ID
**API前缀**: /api-v2

## 部署状态
- ✅ 单元测试通过
- ✅ 路由文档生成
- ✅ CloudBase部署完成
- ✅ 冒烟测试通过

## 关键信息
- 前端地址: https://$TCB_ENV_ID.tcloudbaseapp.com/
- API地址: https://$TCB_ENV_ID.service.tcloudbase.com/api-v2
- 健康检查: https://$TCB_ENV_ID.service.tcloudbase.com/api-v2/health

## 路由统计
$(grep "总路由数" API_ROUTES.md || echo "总路由数: 未知")

## 部署文件
- function-details.json: 云函数详情
- service-details.json: HTTP服务详情
- API_ROUTES.md: 完整路由文档
EOF

    log_success "部署报告已生成: DEPLOYMENT_REPORT.md"
}

# 主函数
main() {
    log_info "开始执行部署流程..."
    
    check_env
    run_tests
    generate_route_docs
    deploy_to_cloudbase
    wait_for_deployment
    smoke_test
    get_deployment_details
    generate_deployment_report
    
    log_success "🎉 部署完成！"
    log_info "查看部署报告: cat DEPLOYMENT_REPORT.md"
    log_info "查看路由文档: cat API_ROUTES.md"
}

# 执行主函数
main "$@" 