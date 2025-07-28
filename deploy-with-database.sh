#!/bin/bash

# 包含数据库的完整部署脚本
echo "🚀 开始完整部署 OfferCome 系统..."

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
echo "🎯 OfferCome 完整部署流程"
echo "=================================="

# 1. 检查数据库连接
log_info "1. 检查数据库连接..."
node -e "
const mysql = require('mysql2/promise');
const config = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false
};

async function testDB() {
    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log('✅ 数据库连接成功，用户数:', rows[0].count);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        process.exit(1);
    }
}
testDB();
"

if [ $? -ne 0 ]; then
    log_error "数据库连接失败，停止部署"
    exit 1
fi

# 2. 更新环境变量
log_info "2. 更新环境变量..."
cat > .env.cloudbase << EOF
# MySQL数据库配置
MYSQL_HOST=sh-cdb-l8rfujds.sql.tencentcdb.com
MYSQL_PORT=21736
MYSQL_USER=root
MYSQL_PASSWORD=Offercome2024!
MYSQL_DATABASE=offercome

# 其他配置
NODE_ENV=production
EOF

log_success "环境变量更新完成"

# 3. 安装依赖
log_info "3. 安装依赖..."
npm install mysql2

# 4. 部署到CloudBase
log_info "4. 部署到CloudBase..."

# 检查tcb CLI
if command -v tcb &> /dev/null; then
    log_info "部署API到CloudBase..."
    tcb functions:deploy api --force
    
    if [ $? -eq 0 ]; then
        log_success "API部署成功"
    else
        log_error "API部署失败"
        exit 1
    fi
    
    log_info "部署前端到CloudBase..."
    ./deploy-static.sh
    
    if [ $? -eq 0 ]; then
        log_success "前端部署成功"
    else
        log_error "前端部署失败"
        exit 1
    fi
else
    log_warning "tcb CLI未安装，跳过CloudBase部署"
fi

# 5. 测试API连接
log_info "5. 测试API连接..."
API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/health"

if curl -s "$API_URL" | grep -q "ok"; then
    log_success "API连接正常"
else
    log_warning "API连接失败，可能需要重新部署"
fi

# 6. 测试数据库API
log_info "6. 测试数据库API..."
DB_API_URL="https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/users"

if curl -s "$DB_API_URL" | grep -q "users"; then
    log_success "数据库API连接正常"
else
    log_warning "数据库API连接失败"
fi

echo ""
echo "🎉 部署完成！"
echo "=================================="
echo "📋 系统信息:"
echo "  数据库: MySQL (腾讯云)"
echo "  主机: sh-cdb-l8rfujds.sql.tencentcdb.com"
echo "  端口: 21736"
echo "  数据库: offercome"
echo ""
echo "🌐 应用地址:"
echo "  API: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api"
echo "  前端: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com"
echo ""
echo "📊 数据库表:"
echo "  - users (用户表)"
echo "  - leads (潜在客户表)"
echo "  - packages (套餐表)"
echo "  - orders (订单表)"
echo "  - tasks (任务表)"
echo "  - sales_consultants (销售顾问表)"
echo "  - teachers (教师表)"
echo "  - assessments (评估表)"
echo ""
echo "✅ 系统已准备就绪！" 