#!/bin/bash

# MySQL连接诊断脚本
echo "🔍 详细诊断MySQL连接..."

# 配置信息
MYSQL_HOST="sh-cdb-l8rfujds.sql.tencentcdb.com"
MYSQL_PORT="21736"
MYSQL_USER="root"
MYSQL_PASSWORD="Offercome2024!"

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

echo "=================================="
echo "🔍 MySQL连接诊断报告"
echo "=================================="

# 1. 检查网络连通性
log_info "1. 检查网络连通性..."
if ping -c 3 "$MYSQL_HOST" >/dev/null 2>&1; then
    log_success "网络连通性正常"
else
    log_error "网络连通性失败"
    echo "   尝试解析域名..."
    nslookup "$MYSQL_HOST" 2>/dev/null || echo "   域名解析失败"
fi

# 2. 检查端口连通性
log_info "2. 检查端口连通性..."
if command -v nc &> /dev/null; then
    if nc -z -w 5 "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; then
        log_success "端口 $MYSQL_PORT 可访问"
    else
        log_error "端口 $MYSQL_PORT 不可访问"
    fi
else
    log_warning "nc命令不可用，跳过端口检查"
fi

# 3. 检查MySQL客户端
log_info "3. 检查MySQL客户端..."
if command -v mysql &> /dev/null; then
    log_success "MySQL客户端已安装"
    mysql --version
else
    log_error "MySQL客户端未安装"
    echo "   安装命令: brew install mysql-client"
fi

# 4. 尝试不同的连接方式
log_info "4. 尝试不同的连接方式..."

# 方式1: 使用外网地址和端口
echo "   方式1: 外网地址 + 端口21736"
if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    log_success "外网连接成功！"
    exit 0
else
    log_error "外网连接失败"
fi

# 方式2: 尝试内网地址
echo "   方式2: 内网地址 + 端口3306"
if mysql -h "172.17.16.7" -P "3306" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    log_success "内网连接成功！"
    exit 0
else
    log_error "内网连接失败"
fi

# 方式3: 尝试不同的端口
echo "   方式3: 尝试端口3306"
if mysql -h "$MYSQL_HOST" -P "3306" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    log_success "端口3306连接成功！"
    exit 0
else
    log_error "端口3306连接失败"
fi

# 5. 检查错误详情
log_info "5. 检查详细错误信息..."
echo "   尝试获取详细错误:"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>&1 | head -5

echo ""
echo "=================================="
echo "🔧 故障排除建议"
echo "=================================="
echo "1. 检查腾讯云控制台中的连接信息"
echo "2. 确认外网访问是否已开启"
echo "3. 检查安全组规则是否生效"
echo "4. 尝试使用腾讯云提供的连接工具"
echo ""
echo "📋 当前配置:"
echo "   主机: $MYSQL_HOST"
echo "   端口: $MYSQL_PORT"
echo "   用户: $MYSQL_USER"
echo "   安全组: sg-askzjc3u"
echo ""
echo "💡 建议:"
echo "   1. 在腾讯云控制台检查实例状态"
echo "   2. 确认外网访问设置"
echo "   3. 检查安全组规则是否已生效" 