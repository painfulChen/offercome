#!/bin/bash

# MySQL认证检查脚本
echo "🔐 检查MySQL认证配置..."

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
echo "🔐 MySQL认证检查"
echo "=================================="

# 检查腾讯云MySQL的特殊要求
log_info "腾讯云MySQL连接要求:"
echo "1. 需要SSL连接"
echo "2. 可能需要特定的认证插件"
echo "3. 可能需要设置特定的连接参数"
echo ""

# 尝试不同的连接参数
log_info "尝试不同的连接参数..."

# 方式1: 标准连接
echo "方式1: 标准连接"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>&1 | head -3

# 方式2: 添加SSL参数
echo ""
echo "方式2: 添加SSL参数"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" --ssl-mode=REQUIRED -e "SELECT 1;" 2>&1 | head -3

# 方式3: 禁用SSL
echo ""
echo "方式3: 禁用SSL"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" --ssl-mode=DISABLED -e "SELECT 1;" 2>&1 | head -3

# 方式4: 使用不同的认证方式
echo ""
echo "方式4: 使用mysql_native_password"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" --default-auth=mysql_native_password -e "SELECT 1;" 2>&1 | head -3

echo ""
echo "=================================="
echo "💡 建议解决方案"
echo "=================================="
echo "1. 检查腾讯云控制台中的连接示例"
echo "2. 确认是否需要SSL连接"
echo "3. 检查用户认证方式"
echo "4. 尝试使用腾讯云提供的连接工具"
echo ""
echo "📋 在腾讯云控制台检查:"
echo "1. 进入MySQL实例详情"
echo "2. 查看'连接信息'部分"
echo "3. 点击'一键连接检查'"
echo "4. 查看连接示例代码" 