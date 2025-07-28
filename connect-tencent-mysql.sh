#!/bin/bash

# 腾讯云MySQL专用连接脚本
echo "🔗 使用腾讯云推荐的连接方式..."

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
echo "🔗 腾讯云MySQL连接测试"
echo "=================================="

# 腾讯云推荐的连接参数
log_info "使用腾讯云推荐的连接参数..."

# 方式1: 使用caching_sha2_password认证
echo "方式1: caching_sha2_password认证"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    --default-auth=caching_sha2_password \
    --ssl-mode=DISABLED \
    -e "SELECT 1 as test;" 2>&1

if [ $? -eq 0 ]; then
    log_success "连接成功！使用caching_sha2_password"
    exit 0
fi

# 方式2: 使用sha256_password认证
echo ""
echo "方式2: sha256_password认证"
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    --default-auth=sha256_password \
    --ssl-mode=DISABLED \
    -e "SELECT 1 as test;" 2>&1

if [ $? -eq 0 ]; then
    log_success "连接成功！使用sha256_password"
    exit 0
fi

# 方式3: 使用Node.js连接测试
echo ""
echo "方式3: 使用Node.js连接测试"
cat > test-mysql-node.js << 'EOF'
const mysql = require('mysql2/promise');

const config = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false,
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from('Offercome2024!')
    }
};

async function testConnection() {
    try {
        console.log('🔗 尝试连接MySQL...');
        const connection = await mysql.createConnection(config);
        console.log('✅ 连接成功！');
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询成功:', rows);
        
        await connection.end();
        console.log('✅ 连接已关闭');
        return true;
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        return false;
    }
}

testConnection();
EOF

if command -v node &> /dev/null; then
    if [ -f "package.json" ] && grep -q "mysql2" package.json; then
        node test-mysql-node.js
    else
        log_warning "Node.js或mysql2未安装，跳过Node.js测试"
    fi
else
    log_warning "Node.js未安装，跳过Node.js测试"
fi

echo ""
echo "=================================="
echo "💡 解决方案"
echo "=================================="
echo "1. 在腾讯云控制台查看连接示例"
echo "2. 使用腾讯云提供的连接工具"
echo "3. 检查是否需要特殊的认证方式"
echo ""
echo "📋 建议操作:"
echo "1. 进入腾讯云控制台"
echo "2. 查看MySQL实例详情"
echo "3. 点击'一键连接检查'"
echo "4. 复制连接示例代码" 