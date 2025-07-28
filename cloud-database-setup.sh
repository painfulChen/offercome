#!/bin/bash

# OfferCome 云数据库配置脚本
# 支持腾讯云、阿里云、AWS等主流云服务商

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
    echo "OfferCome 云数据库配置脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  tencent        配置腾讯云TDSQL-C"
    echo "  aliyun         配置阿里云RDS"
    echo "  aws            配置AWS RDS"
    echo "  test           测试数据库连接"
    echo "  migrate        迁移数据到云数据库"
    echo "  backup         备份云数据库"
    echo "  help           显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --region       指定地域"
    echo "  --instance     指定实例ID"
    echo "  --username     指定用户名"
    echo "  --password     指定密码"
    echo "  --database     指定数据库名"
    echo "  --port         指定端口"
    echo "  --force        强制执行"
    echo ""
    echo "示例:"
    echo "  $0 tencent --region ap-beijing --instance tdsql-xxxxx"
    echo "  $0 aliyun --region cn-hangzhou --instance rm-xxxxx"
    echo "  $0 test --host your-db-host.com --port 3306"
}

# 配置腾讯云TDSQL-C
setup_tencent_cloud() {
    local region=$1
    local instance=$2
    local username=${3:-"offercome_user"}
    local password=${4:-"Offercome2024!"}
    local database=${5:-"offercome"}
    
    print_info "配置腾讯云TDSQL-C..."
    
    # 检查腾讯云CLI
    if ! command -v tcb &> /dev/null; then
        print_warning "腾讯云CLI未安装，请先安装: https://cloud.tencent.com/document/product/440/6184"
        print_info "或者手动在腾讯云控制台创建TDSQL-C实例"
    fi
    
    # 创建配置文件
    cat > cloud-database-tencent.json << EOF
{
  "provider": "tencent",
  "region": "$region",
  "instance": "$instance",
  "database": {
    "host": "your-tdsql-c-host.tencentcloudapi.com",
    "port": 3306,
    "user": "$username",
    "password": "$password",
    "name": "$database"
  },
  "connection": {
    "ssl": true,
    "timeout": 30000,
    "pool": {
      "min": 5,
      "max": 20
    }
  }
}
EOF
    
    print_info "腾讯云TDSQL-C配置模板已创建: cloud-database-tencent.json"
    print_info "请手动更新以下信息:"
    print_info "  1. 在腾讯云控制台创建TDSQL-C实例"
    print_info "  2. 获取实例连接地址"
    print_info "  3. 创建数据库用户"
    print_info "  4. 更新配置文件中的host地址"
    
    # 创建初始化脚本
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
        
        await dbManager.connect();
        await dbManager.initDatabase();
        await dbManager.disconnect();
        
        console.log('✅ 腾讯云TDSQL-C数据库初始化完成');
        
    } catch (error) {
        console.error('❌ 腾讯云TDSQL-C数据库初始化失败:', error.message);
        process.exit(1);
    }
}

initTencentDB();
EOF
    
    print_success "腾讯云TDSQL-C配置完成"
}

# 配置阿里云RDS
setup_aliyun() {
    local region=$1
    local instance=$2
    local username=${3:-"offercome_user"}
    local password=${4:-"Offercome2024!"}
    local database=${5:-"offercome"}
    
    print_info "配置阿里云RDS..."
    
    # 检查阿里云CLI
    if ! command -v aliyun &> /dev/null; then
        print_warning "阿里云CLI未安装，请先安装: https://help.aliyun.com/document_detail/121541.html"
        print_info "或者手动在阿里云控制台创建RDS实例"
    fi
    
    # 创建配置文件
    cat > cloud-database-aliyun.json << EOF
{
  "provider": "aliyun",
  "region": "$region",
  "instance": "$instance",
  "database": {
    "host": "your-rds-instance.mysql.rds.aliyuncs.com",
    "port": 3306,
    "user": "$username",
    "password": "$password",
    "name": "$database"
  },
  "connection": {
    "ssl": true,
    "timeout": 30000,
    "pool": {
      "min": 5,
      "max": 20
    }
  }
}
EOF
    
    print_info "阿里云RDS配置模板已创建: cloud-database-aliyun.json"
    print_info "请手动更新以下信息:"
    print_info "  1. 在阿里云控制台创建RDS实例"
    print_info "  2. 获取实例连接地址"
    print_info "  3. 创建数据库用户"
    print_info "  4. 更新配置文件中的host地址"
    
    # 创建初始化脚本
    cat > init-aliyun-db.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function initAliyunDB() {
    try {
        console.log('🚀 初始化阿里云RDS数据库...');
        
        // 更新数据库配置
        dbManager.config = {
            host: process.env.DB_HOST || 'your-rds-instance.mysql.rds.aliyuncs.com',
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
        
        await dbManager.connect();
        await dbManager.initDatabase();
        await dbManager.disconnect();
        
        console.log('✅ 阿里云RDS数据库初始化完成');
        
    } catch (error) {
        console.error('❌ 阿里云RDS数据库初始化失败:', error.message);
        process.exit(1);
    }
}

initAliyunDB();
EOF
    
    print_success "阿里云RDS配置完成"
}

# 配置AWS RDS
setup_aws() {
    local region=$1
    local instance=$2
    local username=${3:-"offercome_user"}
    local password=${4:-"Offercome2024!"}
    local database=${5:-"offercome"}
    
    print_info "配置AWS RDS..."
    
    # 检查AWS CLI
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI未安装，请先安装: https://aws.amazon.com/cli/"
        print_info "或者手动在AWS控制台创建RDS实例"
    fi
    
    # 创建配置文件
    cat > cloud-database-aws.json << EOF
{
  "provider": "aws",
  "region": "$region",
  "instance": "$instance",
  "database": {
    "host": "your-rds-instance.region.rds.amazonaws.com",
    "port": 3306,
    "user": "$username",
    "password": "$password",
    "name": "$database"
  },
  "connection": {
    "ssl": true,
    "timeout": 30000,
    "pool": {
      "min": 5,
      "max": 20
    }
  }
}
EOF
    
    print_info "AWS RDS配置模板已创建: cloud-database-aws.json"
    print_info "请手动更新以下信息:"
    print_info "  1. 在AWS控制台创建RDS实例"
    print_info "  2. 获取实例连接地址"
    print_info "  3. 创建数据库用户"
    print_info "  4. 更新配置文件中的host地址"
    
    # 创建初始化脚本
    cat > init-aws-db.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function initAWSDB() {
    try {
        console.log('🚀 初始化AWS RDS数据库...');
        
        // 更新数据库配置
        dbManager.config = {
            host: process.env.DB_HOST || 'your-rds-instance.region.rds.amazonaws.com',
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
        
        await dbManager.connect();
        await dbManager.initDatabase();
        await dbManager.disconnect();
        
        console.log('✅ AWS RDS数据库初始化完成');
        
    } catch (error) {
        console.error('❌ AWS RDS数据库初始化失败:', error.message);
        process.exit(1);
    }
}

initAWSDB();
EOF
    
    print_success "AWS RDS配置完成"
}

# 测试数据库连接
test_connection() {
    local host=$1
    local port=${2:-3306}
    local user=${3:-"offercome_user"}
    local password=${4:-"Offercome2024!"}
    local database=${5:-"offercome"}
    
    print_info "测试数据库连接..."
    
    # 创建测试脚本
    cat > test-cloud-db.js << EOF
const dbManager = require('./server/config/database-enhanced');

async function testConnection() {
    try {
        console.log('🧪 测试云数据库连接...');
        
        // 更新配置
        dbManager.config = {
            host: '$host',
            user: '$user',
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
        
        await dbManager.disconnect();
        console.log('✅ 连接测试完成');
        
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF
    
    # 运行测试
    node test-cloud-db.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库连接测试成功"
    else
        print_error "数据库连接测试失败"
        exit 1
    fi
    
    # 清理测试文件
    rm test-cloud-db.js
}

# 迁移数据到云数据库
migrate_to_cloud() {
    local source_host=$1
    local source_user=$2
    local source_password=$3
    local source_database=$4
    local target_host=$5
    local target_user=$6
    local target_password=$7
    local target_database=$8
    
    print_info "迁移数据到云数据库..."
    
    # 创建迁移脚本
    cat > migrate-to-cloud.sh << EOF
#!/bin/bash

echo "开始数据迁移..."

# 导出源数据库
echo "导出源数据库..."
mysqldump -h "$source_host" -u "$source_user" -p"$source_password" \\
    --single-transaction --routines --triggers \\
    "$source_database" > cloud_migration_backup.sql

if [ \$? -ne 0 ]; then
    echo "❌ 导出失败"
    exit 1
fi

echo "✅ 导出完成"

# 导入到目标数据库
echo "导入到云数据库..."
mysql -h "$target_host" -u "$target_user" -p"$target_password" \\
    "$target_database" < cloud_migration_backup.sql

if [ \$? -ne 0 ]; then
    echo "❌ 导入失败"
    exit 1
fi

echo "✅ 导入完成"

# 清理临时文件
rm cloud_migration_backup.sql

echo "🎉 数据迁移完成"
EOF
    
    chmod +x migrate-to-cloud.sh
    
    if [[ "$FORCE" != "true" ]]; then
        read -p "确定要迁移数据吗？这将覆盖目标数据库 (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "迁移已取消"
            exit 0
        fi
    fi
    
    ./migrate-to-cloud.sh
    
    if [ $? -eq 0 ]; then
        print_success "数据迁移完成"
    else
        print_error "数据迁移失败"
        exit 1
    fi
    
    # 清理迁移脚本
    rm migrate-to-cloud.sh
}

# 备份云数据库
backup_cloud_database() {
    local host=$1
    local user=$2
    local password=$3
    local database=$4
    
    print_info "备份云数据库..."
    
    # 创建备份目录
    mkdir -p cloud-backups
    
    # 执行备份
    backup_file="cloud-backups/cloud_db_backup_\$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump -h "$host" -u "$user" -p"$password" \\
        --single-transaction --routines --triggers \\
        "$database" > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "云数据库备份完成: $backup_file"
        print_info "备份文件大小: \$(du -h "$backup_file" | cut -f1)"
        
        # 压缩备份文件
        gzip "$backup_file"
        print_info "备份文件已压缩: \${backup_file}.gz"
    else
        print_error "云数据库备份失败"
        exit 1
    fi
}

# 创建环境配置文件
create_env_config() {
    local provider=$1
    local host=$2
    local user=$3
    local password=$4
    local database=$5
    local port=${6:-3306}
    
    print_info "创建环境配置文件..."
    
    # 创建.env文件
    cat > .env.cloud << EOF
# 云数据库配置
DB_HOST=$host
DB_PORT=$port
DB_USER=$user
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

# 云数据库提供商
CLOUD_PROVIDER=$provider
CLOUD_REGION=your-region
CLOUD_INSTANCE=your-instance-id
EOF
    
    print_success "环境配置文件已创建: .env.cloud"
    print_info "请根据实际情况更新配置信息"
}

# 主函数
main() {
    # 解析命令行参数
    COMMAND=""
    REGION=""
    INSTANCE=""
    USERNAME=""
    PASSWORD=""
    DATABASE=""
    PORT="3306"
    HOST=""
    FORCE="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            tencent|aliyun|aws|test|migrate|backup|help)
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
            --port)
                PORT="$2"
                shift 2
                ;;
            --host)
                HOST="$2"
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
        tencent)
            if [ -z "$REGION" ] || [ -z "$INSTANCE" ]; then
                print_error "腾讯云配置需要指定 --region 和 --instance 参数"
                exit 1
            fi
            setup_tencent_cloud "$REGION" "$INSTANCE" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        aliyun)
            if [ -z "$REGION" ] || [ -z "$INSTANCE" ]; then
                print_error "阿里云配置需要指定 --region 和 --instance 参数"
                exit 1
            fi
            setup_aliyun "$REGION" "$INSTANCE" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        aws)
            if [ -z "$REGION" ] || [ -z "$INSTANCE" ]; then
                print_error "AWS配置需要指定 --region 和 --instance 参数"
                exit 1
            fi
            setup_aws "$REGION" "$INSTANCE" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        test)
            if [ -z "$HOST" ]; then
                print_error "测试连接需要指定 --host 参数"
                exit 1
            fi
            test_connection "$HOST" "$PORT" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        migrate)
            print_info "数据迁移功能需要手动指定参数"
            print_info "用法: $0 migrate --source-host <源主机> --target-host <目标主机>"
            ;;
        backup)
            if [ -z "$HOST" ]; then
                print_error "备份需要指定 --host 参数"
                exit 1
            fi
            backup_cloud_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE"
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