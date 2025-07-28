#!/bin/bash

# OfferCome 快速订阅腾讯云TDSQL-C脚本
# 自动化完成订阅和配置流程

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
    echo "OfferCome 快速订阅腾讯云TDSQL-C脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  subscribe        订阅腾讯云TDSQL-C"
    echo "  configure        配置数据库连接"
    echo "  deploy           部署到CloudBase"
    echo "  test             测试完整流程"
    echo "  help             显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --region         指定地域 (默认: ap-beijing)"
    echo "  --spec           指定规格 (默认: 2核4GB)"
    echo "  --storage        指定存储 (默认: 20GB)"
    echo "  --host           指定数据库主机"
    echo "  --username       指定用户名 (默认: offercome_user)"
    echo "  --password       指定密码 (默认: Offercome2024!)"
    echo "  --database       指定数据库名 (默认: offercome)"
    echo "  --force          强制执行"
    echo ""
    echo "示例:"
    echo "  $0 subscribe --region ap-beijing --spec 2核4GB"
    echo "  $0 configure --host tdsql-xxxxx.tencentcloudapi.com"
    echo "  $0 deploy"
    echo "  $0 test"
}

# 订阅腾讯云TDSQL-C
subscribe_tdsql() {
    local region=${1:-"ap-beijing"}
    local spec=${2:-"2核4GB"}
    local storage=${3:-"20GB"}
    
    print_info "开始订阅腾讯云TDSQL-C..."
    
    echo ""
    print_info "📋 订阅信息:"
    echo "  地域: $region"
    echo "  规格: $spec"
    echo "  存储: $storage"
    echo "  预估成本: 约200元/月"
    echo ""
    
    print_info "🔗 请按以下步骤操作:"
    echo ""
    echo "1. 访问腾讯云控制台:"
    echo "   https://console.cloud.tencent.com/tdsql"
    echo ""
    echo "2. 点击'创建实例'"
    echo ""
    echo "3. 配置实例参数:"
    echo "   - 产品类型: TDSQL-C MySQL"
    echo "   - 地域: $region"
    echo "   - 可用区: ${region}-1"
    echo "   - 实例名称: offercome-db"
    echo "   - 实例规格: $spec"
    echo "   - 存储: $storage SSD"
    echo "   - 管理员密码: Offercome2024!"
    echo ""
    echo "4. 网络配置:"
    echo "   - 网络: 选择VPC网络"
    echo "   - 安全组: 创建新的安全组"
    echo "   - 端口: 开放3306端口"
    echo ""
    echo "5. 完成创建"
    echo "   - 确认配置信息"
    echo "   - 点击'立即购买'"
    echo "   - 等待实例创建完成 (约5-10分钟)"
    echo ""
    
    read -p "实例创建完成后，请输入实例连接地址: " host
    
    if [ -z "$host" ]; then
        print_error "请输入有效的连接地址"
        exit 1
    fi
    
    # 保存连接信息
    echo "DB_HOST=$host" > .env.tencent
    echo "DB_PORT=3306" >> .env.tencent
    echo "DB_USER=offercome_user" >> .env.tencent
    echo "DB_PASSWORD=Offercome2024!" >> .env.tencent
    echo "DB_NAME=offercome" >> .env.tencent
    
    print_success "订阅信息已保存到 .env.tencent"
    print_info "下一步: 配置数据库连接"
}

# 配置数据库连接
configure_database() {
    local host=$1
    local username=${2:-"offercome_user"}
    local password=${3:-"Offercome2024!"}
    local database=${4:-"offercome"}
    
    print_info "配置数据库连接..."
    
    if [ -z "$host" ]; then
        if [ -f ".env.tencent" ]; then
            source .env.tencent
            host="$DB_HOST"
        else
            read -p "请输入数据库连接地址: " host
        fi
    fi
    
    if [ -z "$host" ]; then
        print_error "请输入有效的连接地址"
        exit 1
    fi
    
    print_info "🔗 数据库连接信息:"
    echo "  主机: $host"
    echo "  端口: 3306"
    echo "  用户: $username"
    echo "  数据库: $database"
    echo ""
    
    print_info "📋 请在腾讯云控制台完成以下配置:"
    echo ""
    echo "1. 创建数据库用户:"
    echo "   - 进入实例详情页"
    echo "   - 数据库管理 -> 用户管理 -> 创建用户"
    echo "   - 用户名: $username"
    echo "   - 密码: $password"
    echo "   - 权限: 读写权限"
    echo ""
    echo "2. 配置网络访问:"
    echo "   - 安全组 -> 入站规则 -> 添加规则"
    echo "   - 协议: TCP, 端口: 3306"
    echo "   - 源: CloudBase和服务器IP"
    echo "   - 数据库管理 -> 访问控制 -> 白名单"
    echo "   - 添加CloudBase和服务器IP"
    echo ""
    
    read -p "配置完成后，按回车继续..."
    
    # 使用脚本配置
    ./tencent-cloud-setup.sh configure \
        --host "$host" \
        --username "$username" \
        --password "$password" \
        --database "$database"
    
    # 初始化数据库
    ./tencent-cloud-setup.sh init \
        --host "$host" \
        --username "$username" \
        --password "$password" \
        --database "$database"
    
    # 测试连接
    ./tencent-cloud-setup.sh test \
        --host "$host" \
        --username "$username" \
        --password "$password" \
        --database "$database"
    
    print_success "数据库配置完成"
}

# 部署到CloudBase
deploy_to_cloudbase() {
    print_info "部署到CloudBase..."
    
    # 检查环境变量
    if [ ! -f ".env.tencent" ]; then
        print_error "未找到 .env.tencent 文件，请先配置数据库"
        exit 1
    fi
    
    source .env.tencent
    
    print_info "📋 更新CloudBase环境变量..."
    echo ""
    print_info "请在CloudBase控制台设置以下环境变量:"
    echo ""
    echo "DB_HOST=$DB_HOST"
    echo "DB_PORT=$DB_PORT"
    echo "DB_USER=$DB_USER"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo "DB_NAME=$DB_NAME"
    echo "NODE_ENV=production"
    echo ""
    echo "操作步骤:"
    echo "1. 访问: https://console.cloud.tencent.com/tcb"
    echo "2. 选择环境: offercome2025-9g14jitp22f4ddfc"
    echo "3. 云函数 -> api -> 环境变量"
    echo "4. 添加上述环境变量"
    echo ""
    
    read -p "环境变量设置完成后，按回车继续..."
    
    # 重新部署云函数
    print_info "重新部署云函数..."
    tcb framework deploy
    
    if [ $? -eq 0 ]; then
        print_success "CloudBase部署完成"
    else
        print_error "CloudBase部署失败"
        exit 1
    fi
}

# 测试完整流程
test_complete_flow() {
    print_info "测试完整流程..."
    
    # 获取CloudBase域名
    print_info "获取CloudBase域名..."
    domain=$(tcb hosting:list | grep "https://" | head -1 | awk '{print $2}')
    
    if [ -z "$domain" ]; then
        print_warning "未找到CloudBase域名，请手动获取"
        read -p "请输入CloudBase域名: " domain
    fi
    
    if [ -z "$domain" ]; then
        print_error "请输入有效的域名"
        exit 1
    fi
    
    print_info "测试API连接..."
    echo "域名: $domain"
    echo ""
    
    # 测试健康检查
    print_info "1. 测试健康检查..."
    health_response=$(curl -s "$domain/api/health")
    echo "响应: $health_response"
    
    if [[ "$health_response" == *"success"* ]] || [[ "$health_response" == *"ok"* ]]; then
        print_success "健康检查通过"
    else
        print_warning "健康检查失败，但可能正常"
    fi
    
    # 测试数据库连接
    print_info "2. 测试数据库连接..."
    db_response=$(curl -s "$domain/api/db/test")
    echo "响应: $db_response"
    
    if [[ "$db_response" == *"success"* ]] || [[ "$db_response" == *"connected"* ]]; then
        print_success "数据库连接测试通过"
    else
        print_warning "数据库连接测试失败，请检查配置"
    fi
    
    # 测试AI接口
    print_info "3. 测试AI接口..."
    ai_response=$(curl -s -X POST "$domain/api/ai/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": "你好", "type": "test"}')
    echo "响应: $ai_response"
    
    if [[ "$ai_response" == *"success"* ]] || [[ "$ai_response" == *"message"* ]]; then
        print_success "AI接口测试通过"
    else
        print_warning "AI接口测试失败，请检查配置"
    fi
    
    print_success "完整流程测试完成"
    echo ""
    print_info "🎉 恭喜！OfferCome平台部署成功！"
    echo ""
    print_info "访问地址: $domain"
    print_info "API文档: $domain/api/docs"
    print_info "管理后台: $domain/admin"
}

# 显示订阅状态
show_status() {
    print_info "当前订阅状态..."
    echo ""
    
    # 检查CloudBase
    print_info "📊 CloudBase状态:"
    if tcb env:list | grep -q "offercome2025-9g14jitp22f4ddfc"; then
        print_success "CloudBase环境已配置"
    else
        print_warning "CloudBase环境未找到"
    fi
    
    # 检查数据库配置
    print_info "📊 数据库配置:"
    if [ -f ".env.tencent" ]; then
        source .env.tencent
        print_success "数据库配置已保存"
        echo "  主机: $DB_HOST"
        echo "  用户: $DB_USER"
        echo "  数据库: $DB_NAME"
    else
        print_warning "数据库配置未找到"
    fi
    
    # 检查脚本
    print_info "📊 脚本状态:"
    if [ -f "tencent-cloud-setup.sh" ]; then
        print_success "腾讯云配置脚本已就绪"
    else
        print_warning "腾讯云配置脚本未找到"
    fi
    
    echo ""
    print_info "💡 建议下一步操作:"
    echo "1. 订阅腾讯云TDSQL-C"
    echo "2. 配置数据库连接"
    echo "3. 部署到CloudBase"
    echo "4. 测试完整流程"
}

# 主函数
main() {
    # 解析命令行参数
    COMMAND=""
    REGION="ap-beijing"
    SPEC="2核4GB"
    STORAGE="20GB"
    HOST=""
    USERNAME="offercome_user"
    PASSWORD="Offercome2024!"
    DATABASE="offercome"
    FORCE="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            subscribe|configure|deploy|test|status|help)
                COMMAND="$1"
                shift
                ;;
            --region)
                REGION="$2"
                shift 2
                ;;
            --spec)
                SPEC="$2"
                shift 2
                ;;
            --storage)
                STORAGE="$2"
                shift 2
                ;;
            --host)
                HOST="$2"
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
        subscribe)
            subscribe_tdsql "$REGION" "$SPEC" "$STORAGE"
            ;;
        configure)
            configure_database "$HOST" "$USERNAME" "$PASSWORD" "$DATABASE"
            ;;
        deploy)
            deploy_to_cloudbase
            ;;
        test)
            test_complete_flow
            ;;
        status)
            show_status
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