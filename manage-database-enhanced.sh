#!/bin/bash

# OfferCome 数据库管理脚本
# 支持完整的数据库操作和管理

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

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL 客户端未安装，某些功能可能不可用"
    fi
    
    print_success "依赖检查完成"
}

# 显示帮助信息
show_help() {
    echo "OfferCome 数据库管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  init         初始化数据库（创建表结构和初始数据）"
    echo "  status       检查数据库状态"
    echo "  backup       备份数据库"
    echo "  restore      恢复数据库"
    echo "  reset        重置数据库（删除所有数据）"
    echo "  migrate      数据库迁移"
    echo "  seed         插入测试数据"
    echo "  clean        清理数据库"
    echo "  help         显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --env        指定环境 (dev/prod)"
    echo "  --force      强制执行（不询问确认）"
    echo "  --backup-dir 指定备份目录"
    echo ""
    echo "示例:"
    echo "  $0 init                    # 初始化数据库"
    echo "  $0 status                  # 检查数据库状态"
    echo "  $0 backup --backup-dir ./backups  # 备份数据库"
    echo "  $0 reset --force           # 强制重置数据库"
}

# 初始化数据库
init_database() {
    print_info "开始初始化数据库..."
    
    if [[ "$FORCE" != "true" ]]; then
        read -p "确定要初始化数据库吗？这将创建所有表结构 (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "操作已取消"
            exit 0
        fi
    fi
    
    # 运行初始化脚本
    node server/init-database.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库初始化完成"
    else
        print_error "数据库初始化失败"
        exit 1
    fi
}

# 检查数据库状态
check_status() {
    print_info "检查数据库状态..."
    
    # 创建临时状态检查脚本
    cat > temp_status_check.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function checkStatus() {
    try {
        await dbManager.connect();
        
        // 检查表数量
        const tables = await dbManager.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [dbManager.config.database]);
        
        console.log(`📊 数据库表数量: ${tables[0].count}`);
        
        // 检查各表记录数
        const tableNames = [
            'users', 'sales_consultants', 'teachers', 'leads', 
            'assessments', 'packages', 'orders', 'tasks', 
            'courses', 'interviews', 'files', 'notifications',
            'referral_codes', 'referral_records', 'system_configs', 'operation_logs'
        ];
        
        for (const tableName of tableNames) {
            try {
                const result = await dbManager.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                console.log(`   ${tableName}: ${result[0].count} 条记录`);
            } catch (error) {
                console.log(`   ${tableName}: 表不存在`);
            }
        }
        
        // 检查系统配置
        const configs = await dbManager.query('SELECT config_key, config_value FROM system_configs LIMIT 5');
        console.log('\n⚙️  系统配置:');
        for (const config of configs) {
            console.log(`   ${config.config_key}: ${config.config_value}`);
        }
        
        await dbManager.disconnect();
        console.log('\n✅ 数据库状态检查完成');
        
    } catch (error) {
        console.error('❌ 数据库状态检查失败:', error.message);
        process.exit(1);
    }
}

checkStatus();
EOF
    
    node temp_status_check.js
    rm temp_status_check.js
}

# 备份数据库
backup_database() {
    print_info "开始备份数据库..."
    
    BACKUP_DIR=${BACKUP_DIR:-"./database-backups"}
    BACKUP_FILE="${BACKUP_DIR}/offercome_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 检查MySQL客户端
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL 客户端未安装，无法进行备份"
        exit 1
    fi
    
    # 获取数据库配置
    DB_HOST=${DB_HOST:-"localhost"}
    DB_USER=${DB_USER:-"root"}
    DB_PASSWORD=${DB_PASSWORD:-""}
    DB_NAME=${DB_NAME:-"offercome"}
    
    # 执行备份
    mysqldump -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} \
        --single-transaction --routines --triggers \
        "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份完成: $BACKUP_FILE"
        print_info "备份文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        print_error "数据库备份失败"
        exit 1
    fi
}

# 恢复数据库
restore_database() {
    print_info "开始恢复数据库..."
    
    if [ -z "$BACKUP_FILE" ]; then
        print_error "请指定备份文件路径"
        echo "用法: $0 restore --backup-file <文件路径>"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    if [[ "$FORCE" != "true" ]]; then
        read -p "确定要恢复数据库吗？这将覆盖现有数据 (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "操作已取消"
            exit 0
        fi
    fi
    
    # 获取数据库配置
    DB_HOST=${DB_HOST:-"localhost"}
    DB_USER=${DB_USER:-"root"}
    DB_PASSWORD=${DB_PASSWORD:-""}
    DB_NAME=${DB_NAME:-"offercome"}
    
    # 执行恢复
    mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} \
        "$DB_NAME" < "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "数据库恢复完成"
    else
        print_error "数据库恢复失败"
        exit 1
    fi
}

# 重置数据库
reset_database() {
    print_info "开始重置数据库..."
    
    if [[ "$FORCE" != "true" ]]; then
        read -p "确定要重置数据库吗？这将删除所有数据 (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "操作已取消"
            exit 0
        fi
    fi
    
    # 创建重置脚本
    cat > temp_reset.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function resetDatabase() {
    try {
        await dbManager.connect();
        
        const tables = [
            'operation_logs', 'referral_records', 'referral_codes', 
            'notifications', 'files', 'interviews', 'courses', 
            'tasks', 'orders', 'packages', 'assessments', 
            'leads', 'teachers', 'sales_consultants', 'users'
        ];
        
        console.log('🗑️  删除所有表...');
        for (const table of tables) {
            try {
                await dbManager.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`   ✅ 删除表: ${table}`);
            } catch (error) {
                console.log(`   ⚠️  删除表失败: ${table} - ${error.message}`);
            }
        }
        
        await dbManager.disconnect();
        console.log('\n✅ 数据库重置完成');
        
    } catch (error) {
        console.error('❌ 数据库重置失败:', error.message);
        process.exit(1);
    }
}

resetDatabase();
EOF
    
    node temp_reset.js
    rm temp_reset.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库重置完成"
    else
        print_error "数据库重置失败"
        exit 1
    fi
}

# 插入测试数据
seed_database() {
    print_info "开始插入测试数据..."
    
    # 创建测试数据脚本
    cat > temp_seed.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function seedDatabase() {
    try {
        await dbManager.connect();
        
        console.log('🌱 插入测试用户...');
        const testUsers = [
            {
                id: dbManager.generateId(),
                openid: 'test_openid_1',
                name: '张三',
                phone: '13800138001',
                email: 'zhangsan@example.com',
                country: '美国',
                university: '斯坦福大学',
                major: '计算机科学',
                graduation_year: 2025
            },
            {
                id: dbManager.generateId(),
                openid: 'test_openid_2',
                name: '李四',
                phone: '13800138002',
                email: 'lisi@example.com',
                country: '英国',
                university: '牛津大学',
                major: '商科',
                graduation_year: 2024
            }
        ];
        
        for (const user of testUsers) {
            await dbManager.createUser(user);
            console.log(`   ✅ 创建用户: ${user.name}`);
        }
        
        console.log('🌱 插入测试测评记录...');
        const testAssessments = [
            {
                id: dbManager.generateId(),
                user_id: testUsers[0].id,
                type: 'mbti',
                title: 'MBTI性格测评',
                description: '了解你的性格类型',
                questions: ['你更喜欢独处还是社交？', '你更注重细节还是整体？'],
                answers: ['社交', '整体'],
                result: { type: 'ENFP', description: '热情洋溢的探索者' },
                score: 85.5,
                feedback: '你的性格类型是ENFP，适合创意和人际交往工作',
                status: 'completed',
                duration: 300
            }
        ];
        
        for (const assessment of testAssessments) {
            await dbManager.createAssessment(assessment);
            console.log(`   ✅ 创建测评: ${assessment.title}`);
        }
        
        console.log('🌱 插入测试任务...');
        const testTasks = [
            {
                id: dbManager.generateId(),
                user_id: testUsers[0].id,
                title: '优化简历',
                description: '根据AI分析结果优化简历内容',
                type: 'resume',
                priority: 'high',
                status: 'pending',
                progress: 0,
                due_date: '2024-12-31',
                estimated_hours: 2,
                tags: ['简历', '优化']
            }
        ];
        
        for (const task of testTasks) {
            await dbManager.createTask(task);
            console.log(`   ✅ 创建任务: ${task.title}`);
        }
        
        await dbManager.disconnect();
        console.log('\n✅ 测试数据插入完成');
        
    } catch (error) {
        console.error('❌ 测试数据插入失败:', error.message);
        process.exit(1);
    }
}

seedDatabase();
EOF
    
    node temp_seed.js
    rm temp_seed.js
    
    if [ $? -eq 0 ]; then
        print_success "测试数据插入完成"
    else
        print_error "测试数据插入失败"
        exit 1
    fi
}

# 清理数据库
clean_database() {
    print_info "开始清理数据库..."
    
    if [[ "$FORCE" != "true" ]]; then
        read -p "确定要清理数据库吗？这将删除所有用户数据 (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "操作已取消"
            exit 0
        fi
    fi
    
    # 创建清理脚本
    cat > temp_clean.js << 'EOF'
const dbManager = require('./server/config/database-enhanced');

async function cleanDatabase() {
    try {
        await dbManager.connect();
        
        const tables = [
            'operation_logs', 'referral_records', 'notifications', 
            'files', 'interviews', 'courses', 'tasks', 'orders', 
            'assessments', 'leads', 'users'
        ];
        
        console.log('🧹 清理用户数据...');
        for (const table of tables) {
            try {
                const result = await dbManager.query(`DELETE FROM ${table}`);
                console.log(`   ✅ 清理表 ${table}: ${result.affectedRows} 条记录`);
            } catch (error) {
                console.log(`   ⚠️  清理表失败: ${table} - ${error.message}`);
            }
        }
        
        await dbManager.disconnect();
        console.log('\n✅ 数据库清理完成');
        
    } catch (error) {
        console.error('❌ 数据库清理失败:', error.message);
        process.exit(1);
    }
}

cleanDatabase();
EOF
    
    node temp_clean.js
    rm temp_clean.js
    
    if [ $? -eq 0 ]; then
        print_success "数据库清理完成"
    else
        print_error "数据库清理失败"
        exit 1
    fi
}

# 主函数
main() {
    # 解析命令行参数
    COMMAND=""
    FORCE="false"
    BACKUP_DIR=""
    BACKUP_FILE=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            init|status|backup|restore|reset|migrate|seed|clean|help)
                COMMAND="$1"
                shift
                ;;
            --env)
                ENV="$2"
                shift 2
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --backup-file)
                BACKUP_FILE="$2"
                shift 2
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
    
    # 检查依赖
    check_dependencies
    
    # 执行命令
    case $COMMAND in
        init)
            init_database
            ;;
        status)
            check_status
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database
            ;;
        reset)
            reset_database
            ;;
        migrate)
            print_info "数据库迁移功能待实现"
            ;;
        seed)
            seed_database
            ;;
        clean)
            clean_database
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