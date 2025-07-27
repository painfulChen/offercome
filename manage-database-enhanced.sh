#!/bin/bash

# 🗄️ 招生管理系统 - 数据库管理工具
# 支持MongoDB、Redis、MySQL的安装、配置、备份、恢复

echo "🗄️ 招生管理系统 - 数据库管理工具"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
MONGODB_VERSION="6.0"
REDIS_VERSION="7.0"
MYSQL_VERSION="8.0"
BACKUP_DIR="./database-backups"
LOG_DIR="./logs"

# 创建必要的目录
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR

# 显示管理选项
show_management_options() {
    echo ""
    echo -e "${CYAN}📋 数据库管理选项:${NC}"
    echo "1. 🚀 安装数据库服务"
    echo "2. ⚙️ 配置数据库连接"
    echo "3. 📊 检查数据库状态"
    echo "4. 💾 备份数据库"
    echo "5. 🔄 恢复数据库"
    echo "6. 🧹 清理数据库"
    echo "7. 📈 性能监控"
    echo "8. 🔧 数据库优化"
    echo "9. 📝 查看数据库日志"
    echo "0. ❌ 退出"
    echo ""
    read -p "请输入选项 (0-9): " choice
}

# 安装数据库服务
install_databases() {
    echo -e "${BLUE}🚀 开始安装数据库服务...${NC}"
    
    echo -e "${YELLOW}选择要安装的数据库:${NC}"
    echo "1. MongoDB"
    echo "2. Redis"
    echo "3. MySQL"
    echo "4. 全部安装"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " db_choice
    
    case $db_choice in
        1) install_mongodb ;;
        2) install_redis ;;
        3) install_mysql ;;
        4) install_all_databases ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 安装MongoDB
install_mongodb() {
    echo -e "${BLUE}📦 安装MongoDB...${NC}"
    
    if command -v mongod &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB已安装${NC}"
        return
    fi
    
    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo -e "${YELLOW}🍎 在macOS上安装MongoDB...${NC}"
        brew install mongodb-community@$MONGODB_VERSION
        
        # 启动MongoDB服务
        brew services start mongodb-community@$MONGODB_VERSION
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo -e "${YELLOW}🐧 在Linux上安装MongoDB...${NC}"
        
        # 添加MongoDB官方仓库
        wget -qO - https://www.mongodb.org/static/pgp/server-$MONGODB_VERSION.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/$MONGODB_VERSION multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-$MONGODB_VERSION.list
        
        # 更新包列表并安装
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        
        # 启动MongoDB服务
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
    else
        echo -e "${RED}❌ 不支持的操作系统${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ MongoDB安装完成${NC}"
}

# 安装Redis
install_redis() {
    echo -e "${BLUE}📦 安装Redis...${NC}"
    
    if command -v redis-server &> /dev/null; then
        echo -e "${GREEN}✅ Redis已安装${NC}"
        return
    fi
    
    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo -e "${YELLOW}🍎 在macOS上安装Redis...${NC}"
        brew install redis
        
        # 启动Redis服务
        brew services start redis
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo -e "${YELLOW}🐧 在Linux上安装Redis...${NC}"
        
        # 安装Redis
        sudo apt-get update
        sudo apt-get install -y redis-server
        
        # 启动Redis服务
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        
    else
        echo -e "${RED}❌ 不支持的操作系统${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Redis安装完成${NC}"
}

# 安装MySQL
install_mysql() {
    echo -e "${BLUE}📦 安装MySQL...${NC}"
    
    if command -v mysql &> /dev/null; then
        echo -e "${GREEN}✅ MySQL已安装${NC}"
        return
    fi
    
    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo -e "${YELLOW}🍎 在macOS上安装MySQL...${NC}"
        brew install mysql@$MYSQL_VERSION
        
        # 启动MySQL服务
        brew services start mysql@$MYSQL_VERSION
        
        # 设置root密码
        echo -e "${YELLOW}🔐 设置MySQL root密码...${NC}"
        mysql_secure_installation
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo -e "${YELLOW}🐧 在Linux上安装MySQL...${NC}"
        
        # 安装MySQL
        sudo apt-get update
        sudo apt-get install -y mysql-server
        
        # 启动MySQL服务
        sudo systemctl start mysql
        sudo systemctl enable mysql
        
        # 设置root密码
        echo -e "${YELLOW}🔐 设置MySQL root密码...${NC}"
        sudo mysql_secure_installation
        
    else
        echo -e "${RED}❌ 不支持的操作系统${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ MySQL安装完成${NC}"
}

# 安装所有数据库
install_all_databases() {
    echo -e "${BLUE}📦 安装所有数据库服务...${NC}"
    
    install_mongodb
    install_redis
    install_mysql
    
    echo -e "${GREEN}✅ 所有数据库安装完成${NC}"
}

# 配置数据库连接
configure_databases() {
    echo -e "${BLUE}⚙️ 配置数据库连接...${NC}"
    
    echo -e "${YELLOW}📝 请输入数据库配置信息:${NC}"
    
    # MongoDB配置
    read -p "MongoDB URI (默认: mongodb://localhost:27017/offercome): " mongodb_uri
    mongodb_uri=${mongodb_uri:-"mongodb://localhost:27017/offercome"}
    
    # Redis配置
    read -p "Redis URL (默认: redis://localhost:6379): " redis_url
    redis_url=${redis_url:-"redis://localhost:6379"}
    
    # MySQL配置
    read -p "MySQL Host (默认: localhost): " mysql_host
    mysql_host=${mysql_host:-"localhost"}
    
    read -p "MySQL Port (默认: 3306): " mysql_port
    mysql_port=${mysql_port:-"3306"}
    
    read -p "MySQL User (默认: root): " mysql_user
    mysql_user=${mysql_user:-"root"}
    
    read -p "MySQL Password: " mysql_password
    
    read -p "MySQL Database (默认: offercome): " mysql_database
    mysql_database=${mysql_database:-"offercome"}
    
    # 创建环境变量文件
    cat > .env << EOF
# 数据库配置
MONGODB_URI=$mongodb_uri
REDIS_URL=$redis_url
MYSQL_HOST=$mysql_host
MYSQL_PORT=$mysql_port
MYSQL_USER=$mysql_user
MYSQL_PASSWORD=$mysql_password
MYSQL_DATABASE=$mysql_database

# 其他配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
LOG_FILE=logs/app.log
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
EOF
    
    echo -e "${GREEN}✅ 数据库配置完成${NC}"
}

# 检查数据库状态
check_database_status() {
    echo -e "${BLUE}📊 检查数据库状态...${NC}"
    
    # 检查MongoDB
    echo -e "${YELLOW}🔍 检查MongoDB...${NC}"
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            echo -e "${GREEN}✅ MongoDB运行正常${NC}"
        else
            echo -e "${RED}❌ MongoDB未运行${NC}"
        fi
    else
        echo -e "${RED}❌ MongoDB未安装${NC}"
    fi
    
    # 检查Redis
    echo -e "${YELLOW}🔍 检查Redis...${NC}"
    if command -v redis-server &> /dev/null; then
        if pgrep -x "redis-server" > /dev/null; then
            echo -e "${GREEN}✅ Redis运行正常${NC}"
        else
            echo -e "${RED}❌ Redis未运行${NC}"
        fi
    else
        echo -e "${RED}❌ Redis未安装${NC}"
    fi
    
    # 检查MySQL
    echo -e "${YELLOW}🔍 检查MySQL...${NC}"
    if command -v mysql &> /dev/null; then
        if pgrep -x "mysqld" > /dev/null; then
            echo -e "${GREEN}✅ MySQL运行正常${NC}"
        else
            echo -e "${RED}❌ MySQL未运行${NC}"
        fi
    else
        echo -e "${RED}❌ MySQL未安装${NC}"
    fi
    
    # 测试连接
    echo -e "${YELLOW}🧪 测试数据库连接...${NC}"
    node -e "
    const { connectDB, healthCheck } = require('./server/config/database-enhanced.js');
    
    async function testConnections() {
        try {
            console.log('连接数据库...');
            await connectDB();
            
            console.log('健康检查...');
            const status = await healthCheck();
            console.log('数据库状态:', JSON.stringify(status, null, 2));
        } catch (error) {
            console.error('连接测试失败:', error);
        }
    }
    
    testConnections();
    "
}

# 备份数据库
backup_databases() {
    echo -e "${BLUE}💾 备份数据库...${NC}"
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_path="$BACKUP_DIR/backup_$timestamp"
    mkdir -p "$backup_path"
    
    echo -e "${YELLOW}选择要备份的数据库:${NC}"
    echo "1. MongoDB"
    echo "2. Redis"
    echo "3. MySQL"
    echo "4. 全部备份"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " backup_choice
    
    case $backup_choice in
        1) backup_mongodb "$backup_path" ;;
        2) backup_redis "$backup_path" ;;
        3) backup_mysql "$backup_path" ;;
        4) backup_all_databases "$backup_path" ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 备份MongoDB
backup_mongodb() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 备份MongoDB...${NC}"
    
    if command -v mongodump &> /dev/null; then
        mongodump --uri="mongodb://localhost:27017/offercome" --out="$backup_path/mongodb"
        echo -e "${GREEN}✅ MongoDB备份完成: $backup_path/mongodb${NC}"
    else
        echo -e "${RED}❌ mongodump未安装${NC}"
    fi
}

# 备份Redis
backup_redis() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 备份Redis...${NC}"
    
    if command -v redis-cli &> /dev/null; then
        redis-cli --rdb "$backup_path/redis/dump.rdb"
        echo -e "${GREEN}✅ Redis备份完成: $backup_path/redis/dump.rdb${NC}"
    else
        echo -e "${RED}❌ redis-cli未安装${NC}"
    fi
}

# 备份MySQL
backup_mysql() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 备份MySQL...${NC}"
    
    if command -v mysqldump &> /dev/null; then
        mysqldump -u root -p offercome > "$backup_path/mysql/offercome.sql"
        echo -e "${GREEN}✅ MySQL备份完成: $backup_path/mysql/offercome.sql${NC}"
    else
        echo -e "${RED}❌ mysqldump未安装${NC}"
    fi
}

# 备份所有数据库
backup_all_databases() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 备份所有数据库...${NC}"
    
    backup_mongodb "$backup_path"
    backup_redis "$backup_path"
    backup_mysql "$backup_path"
    
    echo -e "${GREEN}✅ 所有数据库备份完成: $backup_path${NC}"
}

# 恢复数据库
restore_databases() {
    echo -e "${BLUE}🔄 恢复数据库...${NC}"
    
    # 列出可用的备份
    if [ ! "$(ls -A $BACKUP_DIR)" ]; then
        echo -e "${RED}❌ 没有找到备份文件${NC}"
        return
    fi
    
    echo -e "${YELLOW}可用的备份:${NC}"
    ls -la $BACKUP_DIR | grep backup
    
    read -p "请输入备份目录名: " backup_name
    
    if [ ! -d "$BACKUP_DIR/$backup_name" ]; then
        echo -e "${RED}❌ 备份目录不存在${NC}"
        return
    fi
    
    echo -e "${YELLOW}选择要恢复的数据库:${NC}"
    echo "1. MongoDB"
    echo "2. Redis"
    echo "3. MySQL"
    echo "4. 全部恢复"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " restore_choice
    
    case $restore_choice in
        1) restore_mongodb "$BACKUP_DIR/$backup_name" ;;
        2) restore_redis "$BACKUP_DIR/$backup_name" ;;
        3) restore_mysql "$BACKUP_DIR/$backup_name" ;;
        4) restore_all_databases "$BACKUP_DIR/$backup_name" ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 恢复MongoDB
restore_mongodb() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 恢复MongoDB...${NC}"
    
    if command -v mongorestore &> /dev/null; then
        mongorestore --uri="mongodb://localhost:27017/offercome" "$backup_path/mongodb"
        echo -e "${GREEN}✅ MongoDB恢复完成${NC}"
    else
        echo -e "${RED}❌ mongorestore未安装${NC}"
    fi
}

# 恢复Redis
restore_redis() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 恢复Redis...${NC}"
    
    if [ -f "$backup_path/redis/dump.rdb" ]; then
        cp "$backup_path/redis/dump.rdb" /var/lib/redis/dump.rdb
        systemctl restart redis-server
        echo -e "${GREEN}✅ Redis恢复完成${NC}"
    else
        echo -e "${RED}❌ Redis备份文件不存在${NC}"
    fi
}

# 恢复MySQL
restore_mysql() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 恢复MySQL...${NC}"
    
    if command -v mysql &> /dev/null; then
        mysql -u root -p offercome < "$backup_path/mysql/offercome.sql"
        echo -e "${GREEN}✅ MySQL恢复完成${NC}"
    else
        echo -e "${RED}❌ mysql未安装${NC}"
    fi
}

# 恢复所有数据库
restore_all_databases() {
    local backup_path="$1"
    echo -e "${YELLOW}📦 恢复所有数据库...${NC}"
    
    restore_mongodb "$backup_path"
    restore_redis "$backup_path"
    restore_mysql "$backup_path"
    
    echo -e "${GREEN}✅ 所有数据库恢复完成${NC}"
}

# 清理数据库
cleanup_databases() {
    echo -e "${BLUE}🧹 清理数据库...${NC}"
    
    echo -e "${YELLOW}⚠️ 警告: 此操作将删除所有数据！${NC}"
    read -p "确认继续? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️ 清理MongoDB...${NC}"
        mongo offercome --eval "db.dropDatabase()"
        
        echo -e "${YELLOW}🗑️ 清理Redis...${NC}"
        redis-cli flushall
        
        echo -e "${YELLOW}🗑️ 清理MySQL...${NC}"
        mysql -u root -p -e "DROP DATABASE IF EXISTS offercome; CREATE DATABASE offercome;"
        
        echo -e "${GREEN}✅ 数据库清理完成${NC}"
    else
        echo -e "${YELLOW}❌ 取消清理操作${NC}"
    fi
}

# 性能监控
monitor_performance() {
    echo -e "${BLUE}📈 数据库性能监控...${NC}"
    
    echo -e "${YELLOW}选择监控类型:${NC}"
    echo "1. MongoDB性能"
    echo "2. Redis性能"
    echo "3. MySQL性能"
    echo "4. 系统资源"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " monitor_choice
    
    case $monitor_choice in
        1) monitor_mongodb ;;
        2) monitor_redis ;;
        3) monitor_mysql ;;
        4) monitor_system ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 监控MongoDB
monitor_mongodb() {
    echo -e "${YELLOW}📊 MongoDB性能监控...${NC}"
    mongo --eval "
    db.stats()
    db.serverStatus()
    "
}

# 监控Redis
monitor_redis() {
    echo -e "${YELLOW}📊 Redis性能监控...${NC}"
    redis-cli info
}

# 监控MySQL
monitor_mysql() {
    echo -e "${YELLOW}📊 MySQL性能监控...${NC}"
    mysql -u root -p -e "SHOW STATUS; SHOW PROCESSLIST;"
}

# 监控系统资源
monitor_system() {
    echo -e "${YELLOW}📊 系统资源监控...${NC}"
    echo "CPU使用率:"
    top -l 1 | grep "CPU usage"
    echo ""
    echo "内存使用:"
    free -h || vm_stat
    echo ""
    echo "磁盘使用:"
    df -h
}

# 数据库优化
optimize_databases() {
    echo -e "${BLUE}🔧 数据库优化...${NC}"
    
    echo -e "${YELLOW}选择优化类型:${NC}"
    echo "1. MongoDB优化"
    echo "2. Redis优化"
    echo "3. MySQL优化"
    echo "4. 全部优化"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " optimize_choice
    
    case $optimize_choice in
        1) optimize_mongodb ;;
        2) optimize_redis ;;
        3) optimize_mysql ;;
        4) optimize_all_databases ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 优化MongoDB
optimize_mongodb() {
    echo -e "${YELLOW}🔧 优化MongoDB...${NC}"
    mongo --eval "
    db.runCommand({compact: 'users'})
    db.runCommand({compact: 'students'})
    db.runCommand({compact: 'coaching'})
    "
    echo -e "${GREEN}✅ MongoDB优化完成${NC}"
}

# 优化Redis
optimize_redis() {
    echo -e "${YELLOW}🔧 优化Redis...${NC}"
    redis-cli --eval /dev/stdin << 'EOF'
    redis.call('BGSAVE')
    return 'Redis优化完成'
EOF
    echo -e "${GREEN}✅ Redis优化完成${NC}"
}

# 优化MySQL
optimize_mysql() {
    echo -e "${YELLOW}🔧 优化MySQL...${NC}"
    mysql -u root -p -e "
    OPTIMIZE TABLE offercome.users;
    OPTIMIZE TABLE offercome.students;
    OPTIMIZE TABLE offercome.coaching;
    "
    echo -e "${GREEN}✅ MySQL优化完成${NC}"
}

# 优化所有数据库
optimize_all_databases() {
    echo -e "${YELLOW}🔧 优化所有数据库...${NC}"
    optimize_mongodb
    optimize_redis
    optimize_mysql
    echo -e "${GREEN}✅ 所有数据库优化完成${NC}"
}

# 查看数据库日志
view_database_logs() {
    echo -e "${BLUE}📝 查看数据库日志...${NC}"
    
    echo -e "${YELLOW}选择日志类型:${NC}"
    echo "1. MongoDB日志"
    echo "2. Redis日志"
    echo "3. MySQL日志"
    echo "4. 系统日志"
    echo "0. 返回"
    
    read -p "请选择 (0-4): " log_choice
    
    case $log_choice in
        1) tail -f /var/log/mongodb/mongod.log ;;
        2) tail -f /var/log/redis/redis-server.log ;;
        3) tail -f /var/log/mysql/error.log ;;
        4) tail -f /var/log/syslog ;;
        0) return ;;
        *) echo -e "${RED}❌ 无效选择${NC}" ;;
    esac
}

# 主菜单循环
while true; do
    show_management_options
    
    case $choice in
        1)
            install_databases
            ;;
        2)
            configure_databases
            ;;
        3)
            check_database_status
            ;;
        4)
            backup_databases
            ;;
        5)
            restore_databases
            ;;
        6)
            cleanup_databases
            ;;
        7)
            monitor_performance
            ;;
        8)
            optimize_databases
            ;;
        9)
            view_database_logs
            ;;
        0)
            echo -e "${GREEN}👋 再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择，请重新输入${NC}"
            ;;
    esac
    
    echo ""
    read -p "按回车键继续..."
done 