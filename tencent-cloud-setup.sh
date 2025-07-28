#!/bin/bash

# OfferCome 腾讯云TDSQL-C部署脚本
# 完整的腾讯云数据库配置和初始化

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
    echo "OfferCome 腾讯云TDSQL-C部署脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  create         创建TDSQL-C实例"
    echo "  configure      配置数据库连接"
    echo "  init           初始化数据库结构"
    echo "  test           测试数据库连接"
    echo "  backup         备份数据库"
    echo "  restore        恢复数据库"
    echo "  monitor        监控数据库"
    echo "  help           显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --region       指定地域 (默认: ap-beijing)"
    echo "  --instance     指定实例ID"
    echo "  --username     指定用户名 (默认: offercome_user)"
    echo "  --password     指定密码 (默认: Offercome2024!)"
    echo "  --database     指定数据库名 (默认: offercome)"
    echo "  --host         指定数据库主机"
    echo "  --port         指定端口 (默认: 3306)"
    echo "  --force        强制执行"
    echo ""
    echo "示例:"
    echo "  $0 create --region ap-beijing"
    echo "  $0 configure --host tdsql-xxxxx.tencentcloudapi.com"
    echo "  $0 test --host your-tdsql-host.com"
}

# 检查腾讯云CLI
check_tencent_cli() {
    if ! command -v tcb &> /dev/null; then
        print_warning "腾讯云CLI未安装"
        print_info "请先安装腾讯云CLI:"
        print_info "  npm install -g @tencent/cloudbase-cli"
        print_info "  或者访问: https://cloud.tencent.com/document/product/440/6184"
        return 1
    fi
    return 0
}

# 创建TDSQL-C实例
create_tdsql_instance() {
    local region=${1:-"ap-beijing"}
    
    print_info "创建腾讯云TDSQL-C实例..."
    
    if ! check_tencent_cli; then
        print_info "请手动在腾讯云控制台创建TDSQL-C实例:"
        print_info "  1. 访问: https://console.cloud.tencent.com/tdsql"
        print_info "  2. 点击'创建实例'"
        print_info "  3. 选择地域: $region"
        print_info "  4. 选择配置: 2核4GB (开发环境)"
        print_info "  5. 设置管理员密码"
        print_info "  6. 创建实例"
        return 0
    fi
    
    # 创建实例配置
    cat > tdsql-instance-config.json << EOF
{
  "Region": "$region",
  "Zone": "${region}-1",
  "InstanceName": "offercome-db",
  "InstanceType": "TDSQL_C_MYSQL",
  "Cpu": 2,
  "Memory": 4096,
  "Storage": 20,
  "PayMode": "POSTPAID",
  "Period": 1,
  "AutoRenewFlag": 0,
  "VpcId": "",
  "SubnetId": "",
  "SecurityGroupIds": [],
  "DbEngineVersion": "8.0",
  "AdminPassword": "Offercome2024!",
  "Charset": "utf8mb4"
}
EOF
    
    print_info "TDSQL-C实例配置已创建: tdsql-instance-config.json"
    print_info "请手动在腾讯云控制台创建实例，或使用腾讯云CLI:"
    print_info "  tcb tdsql create --config tdsql-instance-config.json"
    
    print_success "TDSQL-C实例创建配置完成"
}

# 配置数据库连接
configure_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    local port=${5:-3306}
    
    print_info "配置腾讯云TDSQL-C数据库连接..."
    
    # 创建数据库配置文件
    cat > tencent-db-config.json << EOF
{
  "provider": "tencent",
  "region": "ap-beijing",
  "database": {
    "host": "$host",
    "port": $port,
    "user": "$username",
    "password": "$password",
    "database": "$database"
  },
  "connection": {
    "ssl": true,
    "timeout": 30000,
    "pool": {
      "min": 5,
      "max": 20
    }
  },
  "security": {
    "whitelist_ips": [],
    "ssl_required": true
  }
}
EOF
    
    # 创建环境配置文件
    cat > .env.tencent << EOF
# 腾讯云TDSQL-C配置
DB_HOST=$host
DB_PORT=$port
DB_USER=$username
DB_PASSWORD=$password
DB_NAME=$database

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

# 腾讯云配置
TENCENT_REGION=ap-beijing
TENCENT_INSTANCE=your-instance-id
CLOUD_PROVIDER=tencent
EOF
    
    # 创建数据库初始化脚本
    cat > init-tencent-db.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function initTencentDB() {
    try {
        console.log('🚀 初始化腾讯云TDSQL-C数据库...');
        
        // 更新数据库配置
        dbManager.config = {
            host: process.env.DB_HOST || 'your-tdsql-c-host.tencentcloudapi.com',
            user: process.env.DB_USER || 'offercome_user',
            password: process.env.DB_PASSWORD || 'Offercome2024!',
            database: process.env.DB_NAME || 'offercome',
            port: process.env.DB_PORT || 3306,
            charset: 'utf8mb4',
            timezone: '+08:00',
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            ssl: {
                rejectUnauthorized: false
            }
        };
        
        console.log('📊 数据库配置:', {
            host: dbManager.config.host,
            port: dbManager.config.port,
            database: dbManager.config.database,
            user: dbManager.config.user
        });
        
        await dbManager.connect();
        console.log('✅ 数据库连接成功');
        
        await dbManager.initDatabase();
        console.log('✅ 数据库结构初始化完成');
        
        await dbManager.disconnect();
        console.log('✅ 腾讯云TDSQL-C数据库初始化完成');
        
    } catch (error) {
        console.error('❌ 腾讯云TDSQL-C数据库初始化失败:', error.message);
        process.exit(1);
    }
}

initTencentDB();
EOF
    
    print_success "数据库连接配置完成"
    print_info "配置文件:"
    print_info "  - tencent-db-config.json (数据库配置)"
    print_info "  - .env.tencent (环境变量)"
    print_info "  - init-tencent-db.js (初始化脚本)"
}

# 初始化数据库结构
init_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    
    print_info "初始化腾讯云TDSQL-C数据库结构..."
    
    # 设置环境变量
    export DB_HOST="$host"
    export DB_USER="$username"
    export DB_PASSWORD="$password"
    export DB_NAME="$database"
    export DB_PORT="3306"
    
    # 运行初始化脚本
    node init-tencent-db.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库结构初始化完成"
    else
        print_error "数据库结构初始化失败"
        exit 1
    fi
}

# 测试数据库连接
test_connection() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    local port=${5:-3306}
    
    print_info "测试腾讯云TDSQL-C数据库连接..."
    
    # 创建测试脚本
    cat > test-tencent-db.js << EOF
const dbManager = require('./server/config/database-enhanced');

async function testTencentConnection() {
    try {
        console.log('🧪 测试腾讯云TDSQL-C连接...');
        
        // 更新配置
        dbManager.config = {
            host: '$host',
            user: '$username',
            password: '$password',
            database: '$database',
            port: $port,
            charset: 'utf8mb4',
            timezone: '+08:00',
            connectionLimit: 5,
            acquireTimeout: 30000,
            timeout: 30000,
            reconnect: true,
            ssl: {
                rejectUnauthorized: false
            }
        };
        
        console.log('📊 连接配置:', {
            host: dbManager.config.host,
            port: dbManager.config.port,
            database: dbManager.config.database,
            user: dbManager.config.user
        });
        
        await dbManager.connect();
        console.log('✅ 数据库连接成功');
        
        // 测试查询
        const result = await dbManager.query('SELECT 1 as test');
        console.log('✅ 查询测试成功:', result[0].test);
        
        // 检查表是否存在
        const tables = await dbManager.query(\`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = '\$database'
        \`);
        console.log('📊 数据库表数量:', tables[0].count);
        
        // 检查系统配置
        const configs = await dbManager.query('SELECT config_key, config_value FROM system_configs LIMIT 3');
        console.log('⚙️  系统配置数量:', configs.length);
        
        await dbManager.disconnect();
        console.log('✅ 连接测试完成');
        
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
        process.exit(1);
    }
}

testTencentConnection();
EOF
    
    # 运行测试
    node test-tencent-db.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库连接测试成功"
    else
        print_error "数据库连接测试失败"
        exit 1
    fi
    
    # 清理测试文件
    rm test-tencent-db.js
}

# 备份数据库
backup_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    
    print_info "备份腾讯云TDSQL-C数据库..."
    
    # 创建备份目录
    mkdir -p tencent-backups
    
    # 执行备份
    backup_file="tencent-backups/tencent_db_backup_\$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump -h "$host" -u "$username" -p"$password" \\
        --single-transaction --routines --triggers \\
        "$database" > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份完成: $backup_file"
        print_info "备份文件大小: \$(du -h "$backup_file" | cut -f1)"
        
        # 压缩备份文件
        gzip "$backup_file"
        print_info "备份文件已压缩: \${backup_file}.gz"
    else
        print_error "数据库备份失败"
        exit 1
    fi
}

# 恢复数据库
restore_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    local backup_file=$5
    
    if [ -z "$backup_file" ]; then
        print_error "请指定备份文件路径"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    print_info "恢复腾讯云TDSQL-C数据库..."
    
    # 如果是压缩文件，先解压
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | mysql -h "$host" -u "$username" -p"$password" "$database"
    else
        mysql -h "$host" -u "$username" -p"$password" "$database" < "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "数据库恢复完成"
    else
        print_error "数据库恢复失败"
        exit 1
    fi
}

# 监控数据库
monitor_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    
    print_info "监控腾讯云TDSQL-C数据库..."
    
    # 创建监控脚本
    cat > monitor-tencent-db.js << EOF
const dbManager = require('./server/config/database-enhanced');

async function monitorTencentDB() {
    try {
        console.log('📊 监控腾讯云TDSQL-C数据库...');
        
        // 更新配置
        dbManager.config = {
            host: '$host',
            user: '$username',
            password: '$password',
            database: '$database',
            port: 3306,
            charset: 'utf8mb4',
            timezone: '+08:00',
            connectionLimit: 5,
            acquireTimeout: 30000,
            timeout: 30000,
            reconnect: true,
            ssl: {
                rejectUnauthorized: false
            }
        };
        
        await dbManager.connect();
        
        // 获取数据库状态
        const status = await dbManager.query('SHOW STATUS');
        console.log('📈 数据库状态:');
        
        const importantMetrics = [
            'Threads_connected',
            'Threads_running', 
            'Queries',
            'Slow_queries',
            'Uptime'
        ];
        
        for (const metric of importantMetrics) {
            const result = status.find(s => s.Variable_name === metric);
            if (result) {
                console.log(\`  \${metric}: \${result.Value}\`);
            }
        }
        
        // 获取表信息
        const tables = await dbManager.query(\`
            SELECT 
                table_name,
                table_rows,
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
            FROM information_schema.tables 
            WHERE table_schema = '\$database'
            ORDER BY (data_length + index_length) DESC
        \`);
        
        console.log('\\n📊 表信息:');
        tables.forEach(table => {
            console.log(\`  \${table.table_name}: \${table['Size (MB)']}MB (\${table.table_rows} 行)\`);
        });
        
        await dbManager.disconnect();
        console.log('\\n✅ 监控完成');
        
    } catch (error) {
        console.error('❌ 监控失败:', error.message);
        process.exit(1);
    }
}

monitorTencentDB();
EOF
    
    # 运行监控
    node monitor-tencent-db.js
    
    # 清理监控文件
    rm monitor-tencent-db.js
}

# 创建管理脚本
create_management_scripts() {
    print_info "创建腾讯云数据库管理脚本..."
    
    # 创建管理脚本
    cat > manage-tencent-db.sh << 'EOF'
#!/bin/bash

# 腾讯云TDSQL-C数据库管理脚本
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

# 加载配置
if [ -f ".env.tencent" ]; then
    export $(cat .env.tencent | grep -v '^#' | xargs)
fi

# 备份数据库
backup() {
    print_info "备份腾讯云TDSQL-C数据库..."
    ./tencent-cloud-setup.sh backup --host "$DB_HOST" --username "$DB_USER" --password "$DB_PASSWORD" --database "$DB_NAME"
}

# 恢复数据库
restore() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        print_error "请指定备份文件路径"
        exit 1
    fi
    ./tencent-cloud-setup.sh restore --host "$DB_HOST" --username "$DB_USER" --password "$DB_PASSWORD" --database "$DB_NAME" --backup-file "$backup_file"
}

# 监控数据库
monitor() {
    print_info "监控腾讯云TDSQL-C数据库..."
    ./tencent-cloud-setup.sh monitor --host "$DB_HOST" --username "$DB_USER" --password "$DB_PASSWORD" --database "$DB_NAME"
}

# 测试连接
test() {
    print_info "测试腾讯云TDSQL-C数据库连接..."
    ./tencent-cloud-setup.sh test --host "$DB_HOST" --username "$DB_USER" --password "$DB_PASSWORD" --database "$DB_NAME"
}

# 主函数
case "${1:-help}" in
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    monitor)
        monitor
        ;;
    test)
        test
        ;;
    *)
        echo "用法: $0 {backup|restore|monitor|test}"
        echo "  backup              - 备份数据库"
        echo "  restore <file>      - 恢复数据库"
        echo "  monitor             - 监控数据库"
        echo "  test                - 测试连接"
        ;;
esac
EOF
    
    chmod +x manage-tencent-db.sh
    
    print_success "腾讯云数据库管理脚本创建完成: manage-tencent-db.sh"
}

# 主函数
main() {
    # 解析命令行参数
    COMMAND=""
    REGION="ap-beijing"
    INSTANCE=""
    USERNAME="offercome_user"
    PASSWORD="Offercome2024!"
    DATABASE="offercome"
    HOST=""
    PORT="3306"
    BACKUP_FILE=""
    FORCE="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            create|configure|init|test|backup|restore|monitor|help)
                COMMAND="$1"
                shift
                ;;
            --region)
                REGION="$2"
                shift 2
                ;;
            --instance)
                INSTANCE="$2"
                shift 2
                ;;
            --username)
                USERNAME="$2"
                shift 2
                ;;
            --password)
                PASSWORD="$2"
                shift 2
                ;;
            --database)
                DATABASE="$2"
                shift 2
                ;;
            --host)
                HOST="$2"
                shift 2
                ;;
            --port)
                PORT="$2"
                shift 2
                ;;
            --backup-file)
                BACKUP_FILE="$2"
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
        create)
            create_tdsql_instance "$REGION"
            ;;
        configure)
            if [ -z "$HOST" ]; then
                print_error "配置需要指定 --host 参数"
                exit 1
            fi
            configure_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE" "$PORT"
            ;;
        init)
            if [ -z "$HOST" ]; then
                print_error "初始化需要指定 --host 参数"
                exit 1
            fi
            init_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        test)
            if [ -z "$HOST" ]; then
                print_error "测试需要指定 --host 参数"
                exit 1
            fi
            test_connection "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE" "$PORT"
            ;;
        backup)
            if [ -z "$HOST" ]; then
                print_error "备份需要指定 --host 参数"
                exit 1
            fi
            backup_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        restore)
            if [ -z "$HOST" ] || [ -z "$BACKUP_FILE" ]; then
                print_error "恢复需要指定 --host 和 --backup-file 参数"
                exit 1
            fi
            restore_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE" "$BACKUP_FILE"
            ;;
        monitor)
            if [ -z "$HOST" ]; then
                print_error "监控需要指定 --host 参数"
                exit 1
            fi
            monitor_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE"
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
    
    # 创建管理脚本
    if [ "$COMMAND" = "configure" ]; then
        create_management_scripts
    fi
}

# 运行主函数
main "$@" 