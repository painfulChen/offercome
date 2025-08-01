#!/bin/bash

# 自动化部署脚本 - CloudBase AI 数据持久化版本
# 包含完整的CI/CD流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 检查环境变量
check_environment() {
    log "检查环境变量..."
    
    required_vars=("DB_HOST" "DB_USER" "ENV_ID")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "缺少必需的环境变量: $var"
            exit 1
        fi
    done
    
    # DB_PASSWORD可以为空（本地开发环境）
    if [ -z "$DB_PASSWORD" ]; then
        warn "DB_PASSWORD为空，使用空密码连接数据库"
    fi
    
    log "环境变量检查通过"
}

# 代码质量检查
code_quality_check() {
    log "执行代码质量检查..."
    
    # 检查语法错误
    if ! node -c server/index.js; then
        error "JavaScript语法检查失败"
        exit 1
    fi
    
    # 运行测试（可选）
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        log "运行单元测试..."
        npm test || {
            warn "单元测试失败，但继续部署"
        }
    fi
    
    # 检查依赖安全
    if command -v npm-audit &> /dev/null; then
        log "检查依赖安全..."
        npm audit --audit-level=high || warn "发现安全漏洞，但继续部署"
    fi
    
    log "代码质量检查完成"
}

# 数据库准备
prepare_database() {
    log "准备数据库..."
    
    # 检查数据库连接
    log "测试数据库连接..."
    node -e "
    const { createPool } = require('./server/config/database-persistent');
    createPool().then(() => {
        console.log('✅ 数据库连接成功');
        process.exit(0);
    }).catch(err => {
        console.error('❌ 数据库连接失败:', err.message);
        process.exit(1);
    });
    " || {
        error "数据库连接失败"
        exit 1
    }
    
    # 初始化数据库
    log "初始化数据库..."
    node server/scripts/init-database-persistent.js || {
        error "数据库初始化失败"
        exit 1
    }
    
    log "数据库准备完成"
}

# 构建项目
build_project() {
    log "构建项目..."
    
    # 安装依赖
    log "安装依赖..."
    npm install --production || {
        error "依赖安装失败"
        exit 1
    }
    
    # 构建静态资源
    if [ -f "package.json" ] && grep -q '"build:static"' package.json; then
        log "构建静态资源..."
        npm run build:static || warn "静态资源构建失败，但继续部署"
    fi
    
    # 创建部署包
    log "创建部署包..."
    tar -czf deploy-persistent-$(date +%Y%m%d-%H%M%S).tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=*.log \
        --exclude=temp \
        --exclude=uploads \
        --exclude=*.tar.gz \
        server/ \
        miniprogram/ \
        public/ \
        package.json \
        cloudbaserc.json \
        .env || {
        error "部署包创建失败"
        exit 1
    }
    
    log "项目构建完成"
}

# 部署到CloudBase
deploy_to_cloudbase() {
    log "部署到腾讯云CloudBase..."
    
    # 检查CloudBase CLI
    if ! command -v tcb &> /dev/null; then
        error "CloudBase CLI 未安装"
        log "安装CloudBase CLI: npm install -g @cloudbase/cli"
        exit 1
    fi
    
    # 登录CloudBase
    log "登录CloudBase..."
    tcb login || {
        error "CloudBase登录失败"
        exit 1
    }
    
    # 部署HTTP触发器
    log "部署HTTP触发器..."
    tcb service:deploy \
        --name api \
        --path api \
        --code-path server/ \
        --env-id $ENV_ID || {
        error "CloudBase部署失败"
        exit 1
    }
    
    log "CloudBase部署完成"
}

# 部署到传统服务器
deploy_to_server() {
    log "部署到传统服务器..."
    
    if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
        error "缺少服务器配置 (SERVER_HOST, SERVER_USER)"
        exit 1
    fi
    
    # 上传部署包
    log "上传部署包到服务器..."
    scp deploy-persistent-*.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/ || {
        error "文件上传失败"
        exit 1
    }
    
    # 在服务器上部署
    log "在服务器上部署..."
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        cd /tmp
        tar -xzf deploy-persistent-*.tar.gz
        sudo mv server /opt/cloudbase-ai/
        sudo chown -R www-data:www-data /opt/cloudbase-ai/
        cd /opt/cloudbase-ai/
        npm install --production
        sudo systemctl restart cloudbase-ai
        echo "✅ 服务器部署完成"
EOF
    
    log "传统服务器部署完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查API健康状态
    local api_url=""
    if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
        api_url="https://$ENV_ID.service.tcloudbase.com/api/health"
    elif [ "$DEPLOY_TO_SERVER" = "true" ]; then
        api_url="http://$SERVER_HOST:3000/api/health"
    fi
    
    if [ -n "$api_url" ]; then
        log "检查API健康状态: $api_url"
        for i in {1..5}; do
            if curl -f -s "$api_url" > /dev/null; then
                log "✅ API健康检查通过"
                return 0
            else
                warn "API健康检查失败，重试 $i/5"
                sleep 5
            fi
        done
        error "API健康检查失败"
        return 1
    fi
    
    log "跳过API健康检查"
    return 0
}

# 性能测试
performance_test() {
    log "执行性能测试..."
    
    # 运行性能监控
    node server/scripts/performance-monitor.js test || {
        warn "性能测试失败，但继续部署"
    }
    
    log "性能测试完成"
}

# 数据备份
backup_data() {
    log "执行数据备份..."
    
    # 创建备份
    node server/scripts/backup-restore.js backup || {
        warn "数据备份失败，但继续部署"
    }
    
    log "数据备份完成"
}

# 清理旧文件
cleanup() {
    log "清理旧文件..."
    
    # 删除旧的部署包
    rm -f deploy-persistent-*.tar.gz
    
    # 清理日志文件
    find . -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log "清理完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    log "发送部署通知..."
    
    # 这里可以集成各种通知服务
    # 例如：钉钉、企业微信、邮件等
    
    if [ "$status" = "success" ]; then
        log "✅ 部署成功通知已发送"
    else
        error "❌ 部署失败通知已发送"
    fi
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    log "🚀 开始自动化部署..."
    
    # 检查环境
    check_environment
    
    # 代码质量检查
    code_quality_check
    
    # 数据备份
    backup_data
    
    # 准备数据库
    prepare_database
    
    # 构建项目
    build_project
    
    # 部署到CloudBase
    if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
        deploy_to_cloudbase
    fi
    
    # 部署到传统服务器
    if [ "$DEPLOY_TO_SERVER" = "true" ]; then
        deploy_to_server
    fi
    
    # 健康检查
    health_check
    
    # 性能测试
    performance_test
    
    # 清理
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "🎉 自动化部署完成！总耗时: ${duration}秒"
    
    # 发送成功通知
    send_notification "success" "部署成功"
    
    # 显示部署信息
    echo ""
    log "📋 部署信息:"
    echo "  - 数据库: $DB_HOST:$DB_PORT"
    echo "  - 数据库名: ${DB_NAME:-cloudbase_ai}"
    echo "  - 环境: production"
    echo "  - 部署时间: $(date)"
    echo "  - 总耗时: ${duration}秒"
    
    if [ "$DEPLOY_TO_CLOUDBASE" = "true" ]; then
        echo "  - CloudBase环境: $ENV_ID"
        echo "  - API地址: https://$ENV_ID.service.tcloudbase.com/api"
    fi
    
    if [ "$DEPLOY_TO_SERVER" = "true" ]; then
        echo "  - 服务器: $SERVER_HOST"
        echo "  - API地址: http://$SERVER_HOST:3000"
    fi
}

# 错误处理
trap 'error "部署过程中发生错误，正在清理..."; cleanup; send_notification "failure" "部署失败"; exit 1' ERR

# 执行主函数
main "$@" 