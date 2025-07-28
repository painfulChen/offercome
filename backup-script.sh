#!/bin/sh

# OfferCome 数据库备份脚本 (Docker版本)

# 配置
DB_HOST=${DB_HOST:-"mysql"}
DB_USER=${DB_USER:-"offercome_user"}
DB_PASSWORD=${DB_PASSWORD:-"Offercome2024!"}
DB_NAME=${DB_NAME:-"offercome"}
BACKUP_DIR=${BACKUP_DIR:-"/backups"}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份函数
backup_database() {
    echo "开始备份数据库..."
    
    BACKUP_FILE="$BACKUP_DIR/offercome_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # 执行备份
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction --routines --triggers \
        "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库备份完成: $BACKUP_FILE"
        echo "📊 备份文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"
        
        # 压缩备份文件
        gzip "$BACKUP_FILE"
        echo "📦 备份文件已压缩: ${BACKUP_FILE}.gz"
        
        # 清理旧备份 (保留7天)
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
        echo "🧹 已清理7天前的备份文件"
    else
        echo "❌ 数据库备份失败"
        exit 1
    fi
}

# 恢复函数
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo "❌ 请指定备份文件路径"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ 备份文件不存在: $backup_file"
        exit 1
    fi
    
    echo "开始恢复数据库..."
    
    # 如果是压缩文件，先解压
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    else
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库恢复完成"
    else
        echo "❌ 数据库恢复失败"
        exit 1
    fi
}

# 检查数据库状态
check_status() {
    echo "检查数据库状态..."
    
    # 检查数据库连接
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" 2>/dev/null; then
        echo "✅ 数据库连接正常"
        
        # 显示表信息
        echo "📊 数据库表信息:"
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "
        USE $DB_NAME;
        SELECT 
            table_name,
            table_rows,
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
        FROM information_schema.tables 
        WHERE table_schema = '$DB_NAME'
        ORDER BY table_name;
        " 2>/dev/null || echo "⚠️ 无法获取表信息"
    else
        echo "❌ 数据库连接失败"
        return 1
    fi
}

# 列出备份文件
list_backups() {
    echo "📋 可用的备份文件:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "没有找到备份文件"
    else
        echo "备份目录不存在"
    fi
}

# 主函数
case "${1:-backup}" in
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    status)
        check_status
        ;;
    list)
        list_backups
        ;;
    *)
        echo "用法: $0 {backup|restore|status|list}"
        echo "  backup              - 备份数据库"
        echo "  restore <file>      - 恢复数据库"
        echo "  status              - 检查数据库状态"
        echo "  list                - 列出备份文件"
        ;;
esac 