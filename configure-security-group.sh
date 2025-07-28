#!/bin/bash

# 配置安全组规则
echo "🔧 配置安全组规则..."

# 安全组信息
SECURITY_GROUP_ID="sg-askzjc3u"
REGION="ap-shanghai"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 检查腾讯云CLI
if ! command -v tcb &> /dev/null; then
    log_warning "tcb CLI未安装，请手动配置安全组"
    echo ""
    echo "📋 手动配置步骤:"
    echo "1. 登录腾讯云控制台"
    echo "2. 进入'云数据库MySQL'"
    echo "3. 点击实例 cdb-l8rfujds"
    echo "4. 在'连接信息'部分找到'安全组'"
    echo "5. 点击'配置安全组'"
    echo "6. 添加以下规则:"
    echo ""
    echo "规则1:"
    echo "  协议: TCP"
    echo "  端口: 21736"
    echo "  源IP: 0.0.0.0/0"
    echo "  描述: MySQL外网访问"
    echo ""
    echo "规则2:"
    echo "  协议: TCP"
    echo "  端口: 3306"
    echo "  源IP: 0.0.0.0/0"
    echo "  描述: MySQL内网访问"
    echo ""
    exit 1
fi

# 检查登录状态
if ! tcb auth:list &> /dev/null; then
    log_warning "请先登录腾讯云CLI"
    echo "运行: tcb auth:login"
    exit 1
fi

log_info "开始配置安全组规则..."

# 添加MySQL外网访问规则
echo "添加MySQL外网访问规则 (端口 21736)..."
tcb security-group:add-rule \
    --security-group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 21736 \
    --source-ip 0.0.0.0/0 \
    --description "MySQL外网访问" \
    --region "$REGION" 2>/dev/null

if [ $? -eq 0 ]; then
    log_success "外网访问规则添加成功"
else
    log_warning "外网访问规则添加失败，可能需要手动配置"
fi

# 添加MySQL内网访问规则
echo "添加MySQL内网访问规则 (端口 3306)..."
tcb security-group:add-rule \
    --security-group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 3306 \
    --source-ip 0.0.0.0/0 \
    --description "MySQL内网访问" \
    --region "$REGION" 2>/dev/null

if [ $? -eq 0 ]; then
    log_success "内网访问规则添加成功"
else
    log_warning "内网访问规则添加失败，可能需要手动配置"
fi

echo ""
log_info "安全组配置完成！"
echo ""
echo "📋 配置信息:"
echo "  安全组ID: $SECURITY_GROUP_ID"
echo "  外网端口: 21736"
echo "  内网端口: 3306"
echo "  源IP: 0.0.0.0/0 (临时)"
echo ""
echo "⚠️  注意: 生产环境建议限制源IP范围"
echo ""
echo "🔍 测试连接:"
echo "  mysql -h sh-cdb-l8rfujds.sql.tencentcdb.com -P 21736 -u root -p" 