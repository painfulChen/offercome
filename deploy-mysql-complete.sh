#!/bin/bash

# OfferCome MySQL 完整部署脚本
echo "🚀 开始部署 OfferCome MySQL 数据库..."

# 配置信息
MYSQL_HOST="sh-cdb-l8rfujds.sql.tencentcdb.com"
MYSQL_PORT="21736"
MYSQL_USER="root"
MYSQL_PASSWORD="Offercome2024!"
MYSQL_DATABASE="offercome"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v mysql &> /dev/null; then
        log_warning "MySQL客户端未安装，尝试安装..."
        if command -v brew &> /dev/null; then
            brew install mysql-client
        else
            log_error "请手动安装MySQL客户端"
            exit 1
        fi
    fi
    
    log_success "依赖检查完成"
}

# 测试数据库连接
test_connection() {
    log_info "测试数据库连接..."
    
    # 使用mysql客户端测试连接
    if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
        log_success "数据库连接成功！"
        return 0
    else
        log_error "数据库连接失败"
        return 1
    fi
}

# 创建数据库
create_database() {
    log_info "创建数据库..."
    
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "数据库创建成功"
    else
        log_error "数据库创建失败"
        return 1
    fi
}

# 初始化数据库表结构
init_database() {
    log_info "初始化数据库表结构..."
    
    if [ -f "server/database-schema.sql" ]; then
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < server/database-schema.sql
        
        if [ $? -eq 0 ]; then
            log_success "数据库表结构初始化成功"
        else
            log_error "数据库表结构初始化失败"
            return 1
        fi
    else
        log_error "数据库schema文件不存在"
        return 1
    fi
}

# 更新应用配置
update_app_config() {
    log_info "更新应用配置..."
    
    # 更新数据库配置文件
    cat > server/config/database-cloud.js << EOF
const mysql = require('mysql2/promise');

const dbConfig = {
    host: '$MYSQL_HOST',
    port: $MYSQL_PORT,
    user: '$MYSQL_USER',
    password: '$MYSQL_PASSWORD',
    database: '$MYSQL_DATABASE',
    charset: 'utf8mb4',
    timezone: '+08:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

let pool = null;

async function connect() {
    try {
        if (!pool) {
            pool = mysql.createPool(dbConfig);
            log_success('数据库连接池创建成功');
        }
        return pool;
    } catch (error) {
        log_error('数据库连接失败:', error.message);
        throw error;
    }
}

async function disconnect() {
    if (pool) {
        await pool.end();
        pool = null;
        log_info('数据库连接已关闭');
    }
}

async function query(sql, params = []) {
    try {
        const connection = await connect();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        log_error('查询执行失败:', error.message);
        throw error;
    }
}

module.exports = {
    connect,
    disconnect,
    query,
    config: dbConfig
};
EOF

    log_success "应用配置更新完成"
}

# 配置安全组规则
configure_security_group() {
    log_info "配置安全组规则..."
    
    log_warning "请在腾讯云控制台手动配置安全组规则:"
    echo "安全组ID: sg-askzjc3u"
    echo "需要添加的规则:"
    echo "1. 入站规则: 允许 3306 端口 (MySQL)"
    echo "2. 入站规则: 允许 21736 端口 (外网访问)"
    echo "3. 源IP: 0.0.0.0/0 (临时，生产环境需要限制)"
    
    log_info "安全组配置指南已保存到 security-group-setup.md"
}

# 部署应用到CloudBase
deploy_to_cloudbase() {
    log_info "部署应用到CloudBase..."
    
    # 更新环境变量
    cat > .env.cloudbase << EOF
# MySQL数据库配置
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=$MYSQL_PORT
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE

# 其他配置
NODE_ENV=production
EOF

    # 部署到CloudBase
    if command -v tcb &> /dev/null; then
        log_info "部署API到CloudBase..."
        tcb functions:deploy api --force
        
        log_info "部署前端到CloudBase..."
        ./deploy-static.sh
        
        log_success "CloudBase部署完成"
    else
        log_warning "tcb CLI未安装，跳过CloudBase部署"
    fi
}

# 测试完整流程
test_complete_flow() {
    log_info "测试完整流程..."
    
    # 测试数据库连接
    if test_connection; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        return 1
    fi
    
    # 测试API连接
    API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/health"
    if curl -s "$API_URL" | grep -q "ok"; then
        log_success "API连接正常"
    else
        log_warning "API连接失败，可能需要重新部署"
    fi
    
    log_success "完整流程测试完成"
}

# 主函数
main() {
    echo "🎯 OfferCome MySQL 完整部署流程"
    echo "=================================="
    
    # 1. 检查依赖
    check_dependencies
    
    # 2. 测试连接
    if ! test_connection; then
        log_error "数据库连接失败，请检查网络和安全组配置"
        configure_security_group
        exit 1
    fi
    
    # 3. 创建数据库
    create_database
    
    # 4. 初始化表结构
    init_database
    
    # 5. 更新应用配置
    update_app_config
    
    # 6. 配置安全组
    configure_security_group
    
    # 7. 部署到CloudBase
    deploy_to_cloudbase
    
    # 8. 测试完整流程
    test_complete_flow
    
    echo ""
    echo "🎉 部署完成！"
    echo "=================================="
    echo "数据库信息:"
    echo "  主机: $MYSQL_HOST"
    echo "  端口: $MYSQL_PORT"
    echo "  数据库: $MYSQL_DATABASE"
    echo "  用户: $MYSQL_USER"
    echo ""
    echo "应用地址:"
    echo "  API: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api"
    echo "  前端: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com"
    echo ""
    echo "下一步:"
    echo "  1. 配置安全组规则"
    echo "  2. 测试应用功能"
    echo "  3. 监控数据库性能"
}

# 执行主函数
main "$@" 