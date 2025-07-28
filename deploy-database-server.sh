#!/bin/bash

# OfferCome 数据库服务器部署脚本
# 支持完整的服务器部署和配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示帮助信息
show_help() {
    echo "OfferCome 数据库服务器部署脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  deploy        部署数据库服务器"
    echo "  install       安装数据库服务"
    echo "  configure     配置数据库连接"
    echo "  migrate       数据库迁移"
    echo "  backup        备份数据库"
    echo "  restore       恢复数据库"
    echo "  monitor       监控数据库"
    echo "  help          显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --env         指定环境 (dev/prod)"
    echo "  --server      指定服务器地址"
    echo "  --user        指定服务器用户"
    echo "  --password    指定服务器密码"
    echo "  --port        指定数据库端口"
    echo "  --force       强制执行"
    echo ""
    echo "示例:"
    echo "  $0 deploy --server 192.168.1.100 --user root"
    echo "  $0 install --env prod"
    echo "  $0 configure --server localhost --port 3306"
}

# 检查服务器连接
check_server_connection() {
    local server=$1
    local user=$2
    local password=$3
    
    print_info "检查服务器连接: $server"
    
    if [ -z "$password" ]; then
        ssh -o ConnectTimeout=10 -o BatchMode=yes "$user@$server" "echo '连接成功'" 2>/dev/null
    else
        sshpass -p "$password" ssh -o ConnectTimeout=10 "$user@$server" "echo '连接成功'" 2>/dev/null
    fi
    
    if [ $? -eq 0 ]; then
        print_success "服务器连接成功"
        return 0
    else
        print_error "服务器连接失败"
        return 1
    fi
}

# 安装MySQL服务器
install_mysql_server() {
    local server=$1
    local user=$2
    local password=$3
    
    print_info "在服务器 $server 上安装MySQL..."
    
    # 创建安装脚本
    cat > temp_install_mysql.sh << 'EOF'
#!/bin/bash

# 检测操作系统
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        echo "在Ubuntu/Debian上安装MySQL..."
        sudo apt-get update
        sudo apt-get install -y mysql-server mysql-client
        
        # 启动MySQL服务
        sudo systemctl start mysql
        sudo systemctl enable mysql
        
        # 设置root密码
        sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Offercome2024!';"
        sudo mysql -e "FLUSH PRIVILEGES;"
        
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        echo "在CentOS/RHEL上安装MySQL..."
        sudo yum update -y
        sudo yum install -y mysql-server mysql
        
        # 启动MySQL服务
        sudo systemctl start mysqld
        sudo systemctl enable mysqld
        
        # 获取临时密码
        temp_password=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
        echo "临时密码: $temp_password"
        
        # 设置root密码
        sudo mysql -u root -p"$temp_password" -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Offercome2024!';"
        sudo mysql -u root -p'Offercome2024!' -e "FLUSH PRIVILEGES;"
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "在macOS上安装MySQL..."
    brew install mysql
    
    # 启动MySQL服务
    brew services start mysql
    
    # 设置root密码
    mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Offercome2024!';"
    mysql -u root -p'Offercome2024!' -e "FLUSH PRIVILEGES;"
fi

echo "MySQL安装完成"
EOF
    
    # 上传并执行安装脚本
    if [ -z "$password" ]; then
        scp temp_install_mysql.sh "$user@$server:/tmp/"
        ssh "$user@$server" "chmod +x /tmp/temp_install_mysql.sh && sudo /tmp/temp_install_mysql.sh"
    else
        sshpass -p "$password" scp temp_install_mysql.sh "$user@$server:/tmp/"
        sshpass -p "$password" ssh "$user@$server" "chmod +x /tmp/temp_install_mysql.sh && sudo /tmp/temp_install_mysql.sh"
    fi
    
    rm temp_install_mysql.sh
    
    if [ $? -eq 0 ]; then
        print_success "MySQL安装完成"
    else
        print_error "MySQL安装失败"
        exit 1
    fi
}

# 配置数据库
configure_database() {
    local server=$1
    local user=$2
    local password=$3
    local db_port=${4:-3306}
    local db_name=${5:-offercome}
    
    print_info "配置数据库: $db_name"
    
    # 创建配置脚本
    cat > temp_configure_db.sh << EOF
#!/bin/bash

DB_NAME="$db_name"
DB_USER="offercome_user"
DB_PASSWORD="Offercome2024!"

# 创建数据库
mysql -u root -p'Offercome2024!' -e "CREATE DATABASE IF NOT EXISTS \${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 创建用户
mysql -u root -p'Offercome2024!' -e "CREATE USER IF NOT EXISTS '\${DB_USER}'@'%' IDENTIFIED BY '\${DB_PASSWORD}';"

# 授权
mysql -u root -p'Offercome2024!' -e "GRANT ALL PRIVILEGES ON \${DB_NAME}.* TO '\${DB_USER}'@'%';"
mysql -u root -p'Offercome2024!' -e "FLUSH PRIVILEGES;"

# 配置MySQL允许远程连接
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || \
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || \
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/my.cnf 2>/dev/null || \
echo "bind-address = 0.0.0.0" | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf

# 重启MySQL服务
sudo systemctl restart mysql 2>/dev/null || sudo systemctl restart mysqld 2>/dev/null || brew services restart mysql

echo "数据库配置完成"
echo "数据库名: \${DB_NAME}"
echo "用户名: \${DB_USER}"
echo "密码: \${DB_PASSWORD}"
EOF
    
    # 上传并执行配置脚本
    if [ -z "$password" ]; then
        scp temp_configure_db.sh "$user@$server:/tmp/"
        ssh "$user@$server" "chmod +x /tmp/temp_configure_db.sh && sudo /tmp/temp_configure_db.sh"
    else
        sshpass -p "$password" scp temp_configure_db.sh "$user@$server:/tmp/"
        sshpass -p "$password" ssh "$user@$server" "chmod +x /tmp/temp_configure_db.sh && sudo /tmp/temp_configure_db.sh"
    fi
    
    rm temp_configure_db.sh
    
    if [ $? -eq 0 ]; then
        print_success "数据库配置完成"
    else
        print_error "数据库配置失败"
        exit 1
    fi
}

# 部署数据库结构
deploy_database_schema() {
    local server=$1
    local user=$2
    local password=$3
    local db_name=${4:-offercome}
    
    print_info "部署数据库结构到服务器..."
    
    # 创建部署脚本
    cat > temp_deploy_schema.sh << 'EOF'
#!/bin/bash

# 创建项目目录
mkdir -p /opt/offercome
cd /opt/offercome

# 创建数据库配置文件
cat > .env << 'ENV_EOF'
# 数据库配置
DB_HOST=localhost
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome
DB_PORT=3306

# 环境配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
ENV_EOF

echo "环境配置文件创建完成"
EOF
    
    # 上传部署脚本
    if [ -z "$password" ]; then
        scp temp_deploy_schema.sh "$user@$server:/tmp/"
        ssh "$user@$server" "chmod +x /tmp/temp_deploy_schema.sh && sudo /tmp/temp_deploy_schema.sh"
    else
        sshpass -p "$password" scp temp_deploy_schema.sh "$user@$server:/tmp/"
        sshpass -p "$password" ssh "$user@$server" "chmod +x /tmp/temp_deploy_schema.sh && sudo /tmp/temp_deploy_schema.sh"
    fi
    
    rm temp_deploy_schema.sh
    
    # 上传数据库文件
    if [ -z "$password" ]; then
        scp server/database-schema.sql "$user@$server:/opt/offercome/"
        scp server/config/database-enhanced.js "$user@$server:/opt/offercome/"
        scp server/init-database.js "$user@$server:/opt/offercome/"
        scp package.json "$user@$server:/opt/offercome/"
    else
        sshpass -p "$password" scp server/database-schema.sql "$user@$server:/opt/offercome/"
        sshpass -p "$password" scp server/config/database-enhanced.js "$user@$server:/opt/offercome/"
        sshpass -p "$password" scp server/init-database.js "$user@$server:/opt/offercome/"
        sshpass -p "$password" scp package.json "$user@$server:/opt/offercome/"
    fi
    
    # 在服务器上安装依赖并初始化数据库
    if [ -z "$password" ]; then
        ssh "$user@$server" "cd /opt/offercome && npm install mysql2 && node init-database.js"
    else
        sshpass -p "$password" ssh "$user@$server" "cd /opt/offercome && npm install mysql2 && node init-database.js"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "数据库结构部署完成"
    else
        print_error "数据库结构部署失败"
        exit 1
    fi
}

# 创建数据库管理脚本
create_database_management() {
    local server=$1
    local user=$2
    local password=$3
    
    print_info "创建数据库管理脚本..."
    
    # 创建管理脚本
    cat > temp_create_management.sh << 'EOF'
#!/bin/bash

# 创建数据库管理脚本
cat > /opt/offercome/manage-db.sh << 'MANAGE_EOF'
#!/bin/bash

# OfferCome 数据库管理脚本 (服务器版)
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# 数据库配置
DB_HOST="localhost"
DB_USER="offercome_user"
DB_PASSWORD="Offercome2024!"
DB_NAME="offercome"

# 备份数据库
backup_database() {
    print_info "备份数据库..."
    BACKUP_DIR="/opt/offercome/backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/offercome_backup_\$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction --routines --triggers \
        "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份完成: $BACKUP_FILE"
        print_info "备份文件大小: \$(du -h "$BACKUP_FILE" | cut -f1)"
    else
        print_error "数据库备份失败"
        exit 1
    fi
}

# 恢复数据库
restore_database() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        print_error "请指定备份文件路径"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    print_info "恢复数据库..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "数据库恢复完成"
    else
        print_error "数据库恢复失败"
        exit 1
    fi
}

# 检查数据库状态
check_status() {
    print_info "检查数据库状态..."
    
    # 检查MySQL服务
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
        print_success "MySQL服务运行正常"
    else
        print_error "MySQL服务未运行"
        return 1
    fi
    
    # 检查数据库连接
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null; then
        print_success "数据库连接正常"
    else
        print_error "数据库连接失败"
        return 1
    fi
    
    # 显示表信息
    print_info "数据库表信息:"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "
    USE $DB_NAME;
    SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
    FROM information_schema.tables 
    WHERE table_schema = '$DB_NAME'
    ORDER BY table_name;
    " 2>/dev/null || print_warning "无法获取表信息"
}

# 主函数
case "\${1:-help}" in
    backup)
        backup_database
        ;;
    restore)
        restore_database "\$2"
        ;;
    status)
        check_status
        ;;
    *)
        echo "用法: \$0 {backup|restore|status}"
        echo "  backup              - 备份数据库"
        echo "  restore <file>      - 恢复数据库"
        echo "  status              - 检查数据库状态"
        ;;
esac
MANAGE_EOF

chmod +x /opt/offercome/manage-db.sh
echo "数据库管理脚本创建完成"
EOF
    
    # 上传并执行脚本
    if [ -z "$password" ]; then
        scp temp_create_management.sh "$user@$server:/tmp/"
        ssh "$user@$server" "chmod +x /tmp/temp_create_management.sh && sudo /tmp/temp_create_management.sh"
    else
        sshpass -p "$password" scp temp_create_management.sh "$user@$server:/tmp/"
        sshpass -p "$password" ssh "$user@$server" "chmod +x /tmp/temp_create_management.sh && sudo /tmp/temp_create_management.sh"
    fi
    
    rm temp_create_management.sh
    
    if [ $? -eq 0 ]; then
        print_success "数据库管理脚本创建完成"
    else
        print_error "数据库管理脚本创建失败"
        exit 1
    fi
}

# 设置定时备份
setup_backup_cron() {
    local server=$1
    local user=$2
    local password=$3
    
    print_info "设置定时备份..."
    
    # 创建备份脚本
    cat > temp_setup_backup.sh << 'EOF'
#!/bin/bash

# 创建定时备份脚本
cat > /opt/offercome/backup-cron.sh << 'BACKUP_EOF'
#!/bin/bash

# 定时备份脚本
cd /opt/offercome
./manage-db.sh backup

# 清理旧备份 (保留7天)
find /opt/offercome/backups -name "*.sql" -mtime +7 -delete
BACKUP_EOF

chmod +x /opt/offercome/backup-cron.sh

# 添加到crontab (每天凌晨2点备份)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/offercome/backup-cron.sh") | crontab -

echo "定时备份设置完成 (每天凌晨2点)"
EOF
    
    # 上传并执行脚本
    if [ -z "$password" ]; then
        scp temp_setup_backup.sh "$user@$server:/tmp/"
        ssh "$user@$server" "chmod +x /tmp/temp_setup_backup.sh && sudo /tmp/temp_setup_backup.sh"
    else
        sshpass -p "$password" scp temp_setup_backup.sh "$user@$server:/tmp/"
        sshpass -p "$password" ssh "$user@$server" "chmod +x /tmp/temp_setup_backup.sh && sudo /tmp/temp_setup_backup.sh"
    fi
    
    rm temp_setup_backup.sh
    
    if [ $? -eq 0 ]; then
        print_success "定时备份设置完成"
    else
        print_error "定时备份设置失败"
        exit 1
    fi
}

# 完整部署
deploy_database() {
    local server=$1
    local user=$2
    local password=$3
    local db_port=${4:-3306}
    
    print_info "开始部署数据库服务器..."
    
    # 检查服务器连接
    if ! check_server_connection "$server" "$user" "$password"; then
        exit 1
    fi
    
    # 安装MySQL
    install_mysql_server "$server" "$user" "$password"
    
    # 配置数据库
    configure_database "$server" "$user" "$password" "$db_port"
    
    # 部署数据库结构
    deploy_database_schema "$server" "$user" "$password"
    
    # 创建管理脚本
    create_database_management "$server" "$user" "$password"
    
    # 设置定时备份
    setup_backup_cron "$server" "$user" "$password"
    
    print_success "数据库服务器部署完成！"
    print_info "数据库信息:"
    print_info "  服务器: $server"
    print_info "  端口: $db_port"
    print_info "  数据库: offercome"
    print_info "  用户名: offercome_user"
    print_info "  密码: Offercome2024!"
    print_info ""
    print_info "管理命令:"
    print_info "  ssh $user@$server 'cd /opt/offercome && ./manage-db.sh status'"
    print_info "  ssh $user@$server 'cd /opt/offercome && ./manage-db.sh backup'"
}

# 主函数
main() {
    # 解析命令行参数
    COMMAND=""
    SERVER=""
    USER=""
    PASSWORD=""
    DB_PORT="3306"
    FORCE="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            deploy|install|configure|migrate|backup|restore|monitor|help)
                COMMAND="$1"
                shift
                ;;
            --env)
                ENV="$2"
                shift 2
                ;;
            --server)
                SERVER="$2"
                shift 2
                ;;
            --user)
                USER="$2"
                shift 2
                ;;
            --password)
                PASSWORD="$2"
                shift 2
                ;;
            --port)
                DB_PORT="$2"
                shift 2
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查命令
    if [ -z "$COMMAND" ]; then
        print_error "请指定命令"
        show_help
        exit 1
    fi
    
    # 执行命令
    case $COMMAND in
        deploy)
            if [ -z "$SERVER" ] || [ -z "$USER" ]; then
                print_error "部署需要指定 --server 和 --user 参数"
                exit 1
            fi
            deploy_database "$SERVER" "$USER" "$PASSWORD" "$DB_PORT"
            ;;
        install)
            if [ -z "$SERVER" ] || [ -z "$USER" ]; then
                print_error "安装需要指定 --server 和 --user 参数"
                exit 1
            fi
            install_mysql_server "$SERVER" "$USER" "$PASSWORD"
            ;;
        configure)
            if [ -z "$SERVER" ] || [ -z "$USER" ]; then
                print_error "配置需要指定 --server 和 --user 参数"
                exit 1
            fi
            configure_database "$SERVER" "$USER" "$PASSWORD" "$DB_PORT"
            ;;
        migrate)
            print_info "数据库迁移功能待实现"
            ;;
        backup)
            print_info "备份功能待实现"
            ;;
        restore)
            print_info "恢复功能待实现"
            ;;
        monitor)
            print_info "监控功能待实现"
            ;;
        help)
            show_help
            ;;
        *)
            print_error "未知命令: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 