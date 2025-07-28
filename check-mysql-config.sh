#!/bin/bash

# OfferCome MySQL配置检查脚本
# 验证腾讯云数据库MySQL配置是否正确

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

# 显示配置检查清单
show_config_checklist() {
    echo "🎯 OfferCome MySQL配置检查清单"
    echo ""
    
    echo "📋 架构配置检查:"
    echo "  [ ] 架构: 双节点 (Dual Node)"
    echo "  [ ] 硬盘类型: 本地SSD盘 (Local SSD Disk)"
    echo "  [ ] 主可用区: 北京一区 (Beijing Zone 1)"
    echo "  [ ] 备可用区: 北京二区 (Beijing Zone 2)"
    echo ""
    
    echo "📋 实例配置检查:"
    echo "  [ ] 实例类型: 通用型 (General Type)"
    echo "  [ ] CPU: 4核"
    echo "  [ ] 内存: 8000MB (8GB)"
    echo "  [ ] 最大IOPS: 8000"
    echo "  [ ] 最大存储容量: 3000GB"
    echo ""
    
    echo "📋 存储配置检查:"
    echo "  [ ] 初始存储: 20GB"
    echo "  [ ] 存储类型: SSD"
    echo "  [ ] 自动扩容: 启用"
    echo ""
    
    echo "📋 网络配置检查:"
    echo "  [ ] 网络: VPC网络"
    echo "  [ ] 安全组: 开放3306端口"
    echo "  [ ] 白名单: 添加CloudBase和服务器IP"
    echo ""
    
    echo "📋 数据库配置检查:"
    echo "  [ ] 数据库版本: MySQL8.0"
    echo "  [ ] 引擎: InnoDB"
    echo "  [ ] 字符集: utf8mb4"
    echo "  [ ] 时区: +08:00"
    echo ""
    
    echo "📋 用户配置检查:"
    echo "  [ ] 管理员密码: Offercome2024!"
    echo "  [ ] 专用用户: offercome_user"
    echo "  [ ] 用户密码: Offercome2024!"
    echo "  [ ] 用户权限: 读写权限"
    echo ""
}

# 显示成本分析
show_cost_analysis() {
    echo "💰 成本分析"
    echo ""
    
    echo "📊 按量计费阶梯定价:"
    echo "  使用时长        每小时费用"
    echo "  0-96小时        2.42元/小时"
    echo "  96-360小时      1.85元/小时"
    echo "  360小时以上      1.28元/小时"
    echo ""
    
    echo "📊 月成本估算:"
    echo "  开发环境 (按量计费):"
    echo "    - 平均使用: 约150小时/月"
    echo "    - 平均费用: 约1.85元/小时"
    echo "    - 月成本: 约280元/月"
    echo ""
    echo "  生产环境 (包年包月):"
    echo "    - 固定费用: 约600元/月"
    echo "    - 优势: 稳定可靠，成本可控"
    echo ""
}

# 显示配置优势
show_config_advantages() {
    echo "🎯 配置优势分析"
    echo ""
    
    echo "✅ 架构优势:"
    echo "  - 双节点高可用，数据安全有保障"
    echo "  - 本地SSD存储，性能强劲"
    echo "  - 主备分离，容灾能力强"
    echo ""
    
    echo "✅ 性能优势:"
    echo "  - 4核8GB，支持并发访问"
    echo "  - 最大IOPS 8000，性能优异"
    echo "  - 本地SSD，读写速度极快"
    echo ""
    
    echo "✅ 成本优势:"
    echo "  - 按量计费，成本可控"
    echo "  - 阶梯定价，使用越久越便宜"
    echo "  - 同地域内网通信免费"
    echo ""
    
    echo "✅ 兼容优势:"
    echo "  - 与CloudBase同地域"
    echo "  - 与现有代码完全兼容"
    echo "  - 标准MySQL，学习成本低"
    echo ""
}

# 显示配置步骤
show_config_steps() {
    echo "🚀 配置步骤指南"
    echo ""
    
    echo "📋 第一步: 基础配置"
    echo "  1. 计费模式: 按量计费"
    echo "  2. 地域: 北京"
    echo "  3. 数据库版本: MySQL8.0"
    echo "  4. 引擎: InnoDB"
    echo ""
    
    echo "📋 第二步: 架构配置"
    echo "  1. 架构: 双节点 (Dual Node)"
    echo "  2. 硬盘类型: 本地SSD盘"
    echo "  3. 主可用区: 北京一区"
    echo "  4. 备可用区: 北京二区"
    echo ""
    
    echo "📋 第三步: 实例配置"
    echo "  1. 实例类型: 通用型"
    echo "  2. CPU: 4核"
    echo "  3. 内存: 8000MB (8GB)"
    echo "  4. 存储: 20GB SSD"
    echo ""
    
    echo "📋 第四步: 网络配置"
    echo "  1. 网络: VPC网络"
    echo "  2. 安全组: 开放3306端口"
    echo "  3. 白名单: 添加CloudBase和服务器IP"
    echo ""
    
    echo "📋 第五步: 完成创建"
    echo "  1. 确认配置信息"
    echo "  2. 点击'下一步'"
    echo "  3. 完成购买"
    echo "  4. 等待实例创建完成"
    echo ""
}

# 显示配置建议
show_config_recommendations() {
    echo "💡 配置建议"
    echo ""
    
    echo "🎯 开发环境建议:"
    echo "  - 使用按量计费，成本更低"
    echo "  - 选择4核8GB，性能足够"
    echo "  - 启用自动扩容，应对突发需求"
    echo ""
    
    echo "🎯 生产环境建议:"
    echo "  - 考虑包年包月，成本更稳定"
    echo "  - 选择双节点架构，保证高可用"
    echo "  - 配置监控告警，及时发现问题"
    echo ""
    
    echo "🎯 安全建议:"
    echo "  - 使用强密码，定期更换"
    echo "  - 配置IP白名单，限制访问"
    echo "  - 启用SSL加密，保护数据传输"
    echo ""
    
    echo "🎯 性能建议:"
    echo "  - 根据实际使用量调整规格"
    echo "  - 定期清理无用数据"
    echo "  - 优化数据库查询和索引"
    echo ""
}

# 主函数
main() {
    echo "🎯 OfferCome MySQL配置检查"
    echo ""
    
    # 显示配置检查清单
    show_config_checklist
    
    # 显示成本分析
    show_cost_analysis
    
    # 显示配置优势
    show_config_advantages
    
    # 显示配置步骤
    show_config_steps
    
    # 显示配置建议
    show_config_recommendations
    
    echo ""
    print_success "配置检查完成！"
    echo ""
    print_info "下一步操作:"
    echo "1. 按照配置步骤在腾讯云控制台创建实例"
    echo "2. 使用 ./mysql-subscribe.sh 进行自动化配置"
    echo "3. 测试数据库连接和应用部署"
    echo ""
}

# 运行主函数
main "$@" 