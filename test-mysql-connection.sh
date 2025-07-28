#!/bin/bash

# MySQL连接测试脚本
echo "🔍 测试MySQL连接..."

# 配置信息
MYSQL_HOST="sh-cdb-l8rfujds.sql.tencentcdb.com"
MYSQL_PORT="21736"
MYSQL_USER="root"
MYSQL_PASSWORD="Offercome2024!"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查MySQL客户端
if ! command -v mysql &> /dev/null; then
    log_error "MySQL客户端未安装"
    echo "安装命令: brew install mysql-client"
    exit 1
fi

# 测试连接
log_info "测试数据库连接..."
echo "连接信息:"
echo "  主机: $MYSQL_HOST"
echo "  端口: $MYSQL_PORT"
echo "  用户: $MYSQL_USER"
echo ""

# 测试基本连接
if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1 as test;" 2>/dev/null; then
    log_success "数据库连接成功！"
    
    # 测试数据库列表
    log_info "获取数据库列表..."
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null
    
    # 创建offercome数据库
    log_info "创建offercome数据库..."
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`offercome\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "数据库创建成功"
        
        # 测试使用数据库
        log_info "测试使用offercome数据库..."
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE \`offercome\`; SELECT 'Database ready!' as status;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            log_success "数据库配置完成！"
            echo ""
            echo "🎉 MySQL数据库已准备就绪！"
            echo "=================================="
            echo "连接信息:"
            echo "  主机: $MYSQL_HOST"
            echo "  端口: $MYSQL_PORT"
            echo "  数据库: offercome"
            echo "  用户: $MYSQL_USER"
            echo ""
            echo "下一步:"
            echo "  1. 初始化数据库表结构"
            echo "  2. 部署应用到CloudBase"
            echo "  3. 测试完整功能"
        else
            log_error "数据库使用失败"
        fi
    else
        log_error "数据库创建失败"
    fi
else
    log_error "数据库连接失败"
    echo ""
    echo "🔧 故障排除:"
    echo "1. 检查安全组规则是否配置"
    echo "2. 检查网络连接"
    echo "3. 检查用户名密码"
    echo ""
    echo "安全组配置:"
    echo "  安全组ID: sg-askzjc3u"
    echo "  端口: 21736 (外网) / 3306 (内网)"
    echo "  源IP: 0.0.0.0/0"
fi 