#!/bin/bash

# MySQL数据库设置脚本
echo "🗄️ 设置MySQL数据库..."

# 配置信息
MYSQL_HOST="sh-cdb-l8rfujds.sql.tencentcdb.com"
MYSQL_PORT="21736"
MYSQL_USER="root"
MYSQL_PASSWORD="Offercome2024!"
MYSQL_DATABASE="offercome"

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
echo "🗄️ MySQL数据库设置"
echo "=================================="

# 创建Node.js连接脚本
cat > setup-mysql.js << 'EOF'
const mysql = require('mysql2/promise');

const config = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false
};

async function setupDatabase() {
    let connection;
    try {
        console.log('🔗 连接MySQL服务器...');
        connection = await mysql.createConnection(config);
        console.log('✅ 连接成功！');
        
        // 创建数据库
        console.log('📝 创建数据库...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`offercome\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 数据库创建成功');
        
        // 使用数据库
        await connection.execute('USE `offercome`');
        console.log('✅ 切换到offercome数据库');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询测试成功:', rows);
        
        // 创建基本表结构
        console.log('📋 创建基本表结构...');
        
        // 用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ 用户表创建成功');
        
        // 测试数据
        console.log('📊 插入测试数据...');
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash) 
            VALUES ('admin', 'admin@offercome.com', 'test_hash')
        `);
        console.log('✅ 测试数据插入成功');
        
        // 查询测试数据
        const [users] = await connection.execute('SELECT * FROM users');
        console.log('📋 用户数据:', users);
        
        console.log('🎉 数据库设置完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 设置失败:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 连接已关闭');
        }
    }
}

setupDatabase();
EOF

# 检查Node.js和mysql2
log_info "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    log_error "Node.js未安装"
    exit 1
fi

if ! node -e "require('mysql2')" 2>/dev/null; then
    log_warning "mysql2模块未安装，正在安装..."
    npm install mysql2
fi

# 运行设置脚本
log_info "运行数据库设置脚本..."
node setup-mysql.js

if [ $? -eq 0 ]; then
    log_success "数据库设置完成！"
    
    echo ""
    echo "🎉 MySQL数据库配置成功！"
    echo "=================================="
    echo "连接信息:"
    echo "  主机: $MYSQL_HOST"
    echo "  端口: $MYSQL_PORT"
    echo "  数据库: $MYSQL_DATABASE"
    echo "  用户: $MYSQL_USER"
    echo ""
    echo "下一步:"
    echo "  1. 部署应用到CloudBase"
    echo "  2. 配置数据库连接"
    echo "  3. 测试完整功能"
else
    log_error "数据库设置失败"
    exit 1
fi 