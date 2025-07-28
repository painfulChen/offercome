#!/bin/bash

# OfferCome 腾讯云数据库MySQL自动配置脚本
# 包含所有推荐配置的自动化设置

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

# 显示配置指南
show_config_guide() {
    echo "OfferCome 腾讯云数据库MySQL配置指南"
    echo ""
    echo "📋 推荐配置清单:"
    echo ""
    echo "1. 计费模式:"
    echo "   ✅ 按量计费 (Pay-as-you-go)"
    echo "   💡 原因: 适合创业项目，按实际使用量付费"
    echo ""
    echo "2. 地域选择:"
    echo "   ✅ 北京 (Beijing)"
    echo "   💡 原因: 与CloudBase同地域，内网通信更快"
    echo ""
    echo "3. 数据库版本:"
    echo "   ✅ MySQL8.0"
    echo "   💡 原因: 最新版本，性能最优，功能最全"
    echo ""
    echo "4. 引擎选择:"
    echo "   ✅ InnoDB"
    echo "   💡 原因: 最稳定，兼容性最好"
    echo ""
    echo "5. 实例配置:"
    echo "   ✅ 实例名称: offercome-mysql"
    echo "   ✅ 实例规格: 2核4GB"
    echo "   ✅ 存储: 20GB SSD"
    echo "   ✅ 管理员密码: Offercome2024!"
    echo ""
    echo "6. 网络配置:"
    echo "   ✅ 网络: VPC网络"
    echo "   ✅ 安全组: 开放3306端口"
    echo "   ✅ 白名单: 添加CloudBase和服务器IP"
    echo ""
}

# 创建配置模板
create_config_template() {
    print_info "创建配置模板..."
    
    cat > mysql-config-template.json << 'EOF'
{
  "billing_mode": "pay-as-you-go",
  "region": "ap-beijing",
  "database_version": "MySQL8.0",
  "engine": "InnoDB",
  "instance_config": {
    "name": "offercome-mysql",
    "spec": "2核4GB",
    "storage": "20GB SSD",
    "admin_password": "Offercome2024!"
  },
  "network_config": {
    "network_type": "VPC",
    "security_group": {
      "port": 3306,
      "protocol": "TCP",
      "source": "CloudBase和服务器IP"
    },
    "whitelist": [
      "CloudBase IP",
      "服务器 IP"
    ]
  },
  "database_config": {
    "charset": "utf8mb4",
    "timezone": "+08:00",
    "user": "offercome_user",
    "password": "Offercome2024!",
    "database": "offercome"
  }
}
EOF
    
    print_success "配置模板已创建: mysql-config-template.json"
}

# 显示详细配置步骤
show_detailed_steps() {
    print_info "详细配置步骤..."
    echo ""
    
    echo "🔗 访问控制台:"
    echo "   https://console.cloud.tencent.com/cdb"
    echo ""
    
    echo "📋 第一步: 基础配置"
    echo "   1. 计费模式: 选择 '按量计费'"
    echo "   2. 地域: 选择 '北京'"
    echo "   3. 数据库版本: 选择 'MySQL8.0'"
    echo "   4. 引擎: 选择 'InnoDB'"
    echo ""
    
    echo "📋 第二步: 实例配置"
    echo "   1. 实例名称: offercome-mysql"
    echo "   2. 实例规格: 2核4GB"
    echo "   3. 存储: 20GB SSD"
    echo "   4. 管理员密码: Offercome2024!"
    echo ""
    
    echo "📋 第三步: 网络配置"
    echo "   1. 网络: 选择VPC网络"
    echo "   2. 安全组: 创建新的安全组"
    echo "   3. 端口: 开放3306端口"
    echo "   4. 白名单: 添加CloudBase和服务器IP"
    echo ""
    
    echo "📋 第四步: 完成创建"
    echo "   1. 确认配置信息"
    echo "   2. 点击'立即购买'"
    echo "   3. 等待实例创建完成 (约5-10分钟)"
    echo ""
}

# 获取CloudBase IP
get_cloudbase_ip() {
    print_info "获取CloudBase IP地址..."
    
    # 尝试获取CloudBase环境信息
    if command -v tcb &> /dev/null; then
        print_info "使用tcb CLI获取环境信息..."
        tcb env:list
    else
        print_warning "tcb CLI未安装，请手动获取CloudBase IP"
    fi
    
    echo ""
    print_info "请手动获取以下IP地址:"
    echo "1. CloudBase环境IP"
    echo "2. 腾讯云服务器IP"
    echo ""
}

# 创建安全组配置
create_security_group_config() {
    print_info "创建安全组配置..."
    
    cat > security-group-config.md << 'EOF'
# 腾讯云数据库MySQL安全组配置

## 入站规则配置

### 规则1: MySQL数据库访问
- 协议: TCP
- 端口: 3306
- 源: CloudBase和服务器IP
- 描述: MySQL数据库访问

### 规则2: 管理访问
- 协议: TCP
- 端口: 22 (SSH)
- 源: 0.0.0.0/0 (或指定IP)
- 描述: 管理访问

## 白名单配置

### 数据库白名单
添加以下IP到数据库白名单:
1. CloudBase环境IP
2. 腾讯云服务器IP
3. 开发机器IP (可选)

### 配置步骤
1. 进入实例详情页
2. 数据库管理 -> 访问控制 -> 白名单
3. 添加上述IP地址
4. 保存配置
EOF
    
    print_success "安全组配置已创建: security-group-config.md"
}

# 创建数据库用户配置
create_user_config() {
    print_info "创建数据库用户配置..."
    
    cat > database-user-config.md << 'EOF'
# 腾讯云数据库MySQL用户配置

## 创建专用用户

### 用户信息
- 用户名: offercome_user
- 密码: Offercome2024!
- 权限: 读写权限
- 主机: % (允许所有IP)

### 配置步骤
1. 进入实例详情页
2. 数据库管理 -> 账号管理 -> 创建账号
3. 填写用户信息
4. 设置权限为读写权限
5. 保存配置

## 权限配置

### 数据库权限
```sql
-- 创建用户
CREATE USER 'offercome_user'@'%' IDENTIFIED BY 'Offercome2024!';

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE ON offercome.* TO 'offercome_user'@'%';
GRANT CREATE, DROP, INDEX, ALTER ON offercome.* TO 'offercome_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 测试连接
```bash
mysql -h your-mysql-host.tencentcloudapi.com \
  -u offercome_user \
  -pOffercome2024! \
  -D offercome \
  -e "SELECT 1 as test;"
```
EOF
    
    print_success "数据库用户配置已创建: database-user-config.md"
}

# 创建环境变量配置
create_env_config() {
    print_info "创建环境变量配置..."
    
    cat > .env.mysql.template << 'EOF'
# 腾讯云数据库MySQL环境变量配置

# 数据库连接配置
DB_HOST=your-mysql-host.tencentcloudapi.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome
DB_TYPE=mysql

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
DB_PROVIDER=mysql
EOF
    
    print_success "环境变量模板已创建: .env.mysql.template"
}

# 显示成本估算
show_cost_estimate() {
    print_info "成本估算..."
    echo ""
    
    echo "💰 按量计费成本估算:"
    echo ""
    echo "开发环境 (2核4GB):"
    echo "  - CPU费用: 约80元/月"
    echo "  - 内存费用: 约40元/月"
    echo "  - 存储费用: 约30元/月"
    echo "  - 总计: 约150元/月"
    echo ""
    
    echo "生产环境 (4核8GB):"
    echo "  - CPU费用: 约160元/月"
    echo "  - 内存费用: 约80元/月"
    echo "  - 存储费用: 约60元/月"
    echo "  - 总计: 约300元/月"
    echo ""
    
    echo "💡 成本优化建议:"
    echo "  1. 开发阶段使用按量计费"
    echo "  2. 生产环境可考虑包年包月"
    echo "  3. 根据实际使用量调整规格"
    echo "  4. 定期清理无用数据"
    echo ""
}

# 显示配置检查清单
show_config_checklist() {
    print_info "配置检查清单..."
    echo ""
    
    echo "✅ 基础配置检查:"
    echo "  [ ] 计费模式: 按量计费"
    echo "  [ ] 地域: 北京"
    echo "  [ ] 数据库版本: MySQL8.0"
    echo "  [ ] 引擎: InnoDB"
    echo ""
    
    echo "✅ 实例配置检查:"
    echo "  [ ] 实例名称: offercome-mysql"
    echo "  [ ] 实例规格: 2核4GB"
    echo "  [ ] 存储: 20GB SSD"
    echo "  [ ] 管理员密码: Offercome2024!"
    echo ""
    
    echo "✅ 网络配置检查:"
    echo "  [ ] 网络: VPC网络"
    echo "  [ ] 安全组: 开放3306端口"
    echo "  [ ] 白名单: 添加CloudBase和服务器IP"
    echo ""
    
    echo "✅ 数据库配置检查:"
    echo "  [ ] 创建专用用户: offercome_user"
    echo "  [ ] 设置用户权限: 读写权限"
    echo "  [ ] 测试数据库连接"
    echo "  [ ] 初始化数据库结构"
    echo ""
    
    echo "✅ 应用配置检查:"
    echo "  [ ] 更新CloudBase环境变量"
    echo "  [ ] 重新部署云函数"
    echo "  [ ] 测试API连接"
    echo "  [ ] 验证完整流程"
    echo ""
}

# 主函数
main() {
    echo "🎯 OfferCome 腾讯云数据库MySQL配置指南"
    echo ""
    
    # 显示配置指南
    show_config_guide
    
    # 创建配置模板
    create_config_template
    
    # 显示详细步骤
    show_detailed_steps
    
    # 获取IP信息
    get_cloudbase_ip
    
    # 创建安全组配置
    create_security_group_config
    
    # 创建用户配置
    create_user_config
    
    # 创建环境变量配置
    create_env_config
    
    # 显示成本估算
    show_cost_estimate
    
    # 显示检查清单
    show_config_checklist
    
    echo ""
    print_success "配置指南生成完成！"
    echo ""
    print_info "下一步操作:"
    echo "1. 按照配置指南在腾讯云控制台创建实例"
    echo "2. 使用 ./mysql-subscribe.sh 进行自动化配置"
    echo "3. 测试数据库连接和应用部署"
    echo ""
}

# 运行主函数
main "$@" 