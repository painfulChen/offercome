# OfferCome 数据库部署指南

## 📋 部署选项

### 1. 🐳 Docker 部署 (推荐)
最简单的方式，适合快速部署和开发环境。

### 2. 🖥️ 服务器部署
适合生产环境，直接在服务器上安装MySQL。

### 3. ☁️ 云数据库
使用云服务商的托管数据库服务。

---

## 🐳 Docker 部署

### 快速开始
```bash
# 1. 启动数据库服务
docker-compose -f docker-compose-database.yml up -d

# 2. 检查服务状态
docker-compose -f docker-compose-database.yml ps

# 3. 查看日志
docker-compose -f docker-compose-database.yml logs mysql
```

### 数据库连接信息
- **主机**: localhost
- **端口**: 3306
- **数据库**: offercome
- **用户名**: offercome_user
- **密码**: Offercome2024!

### 管理工具
- **phpMyAdmin**: http://localhost:8080
- **用户名**: offercome_user
- **密码**: Offercome2024!

### 备份和恢复
```bash
# 备份数据库
docker exec offercome-mysql mysqldump -u offercome_user -pOffercome2024! offercome > backup.sql

# 恢复数据库
docker exec -i offercome-mysql mysql -u offercome_user -pOffercome2024! offercome < backup.sql
```

---

## 🖥️ 服务器部署

### 1. 准备服务器
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git
```

### 2. 部署数据库
```bash
# 使用部署脚本
./deploy-database-server.sh deploy --server your-server.com --user root

# 或者手动安装
./deploy-database-server.sh install --server your-server.com --user root
./deploy-database-server.sh configure --server your-server.com --user root
```

### 3. 配置防火墙
```bash
# 开放MySQL端口 (生产环境建议使用内网)
sudo ufw allow 3306/tcp

# 或者只允许特定IP访问
sudo ufw allow from your-app-server-ip to any port 3306
```

### 4. 安全配置
```bash
# 设置MySQL安全配置
sudo mysql_secure_installation

# 创建专用用户
mysql -u root -p
CREATE USER 'offercome_user'@'%' IDENTIFIED BY 'Offercome2024!';
GRANT ALL PRIVILEGES ON offercome.* TO 'offercome_user'@'%';
FLUSH PRIVILEGES;
```

---

## ☁️ 云数据库部署

### 腾讯云 TDSQL-C
```bash
# 1. 在腾讯云控制台创建TDSQL-C实例
# 2. 获取连接信息
# 3. 修改配置文件

# 更新数据库配置
DB_HOST=your-tdsql-c-instance.tencentcloudapi.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=offercome
```

### 阿里云 RDS
```bash
# 1. 在阿里云控制台创建RDS实例
# 2. 获取连接信息
# 3. 修改配置文件

# 更新数据库配置
DB_HOST=your-rds-instance.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=offercome
```

---

## 🔧 环境配置

### 1. 本地开发环境
```bash
# 创建环境配置文件
cp .env.example .env

# 编辑配置文件
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=offercome
```

### 2. 生产环境配置
```bash
# 创建生产环境配置
cp .env.example .env.production

# 编辑配置文件
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=your-secure-password
DB_NAME=offercome
NODE_ENV=production
```

---

## 📊 数据库管理

### 初始化数据库
```bash
# 本地初始化
./manage-database-enhanced.sh init

# 服务器初始化
ssh user@server 'cd /opt/offercome && node init-database.js'
```

### 备份和恢复
```bash
# 本地备份
./manage-database-enhanced.sh backup

# 服务器备份
ssh user@server 'cd /opt/offercome && ./manage-db.sh backup'

# 恢复数据库
./manage-database-enhanced.sh restore --backup-file backup.sql
```

### 监控数据库
```bash
# 检查状态
./manage-database-enhanced.sh status

# 查看连接数
mysql -u root -p -e "SHOW PROCESSLIST;"

# 查看性能指标
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

---

## 🔒 安全建议

### 1. 密码安全
- 使用强密码 (至少12位，包含大小写字母、数字、特殊字符)
- 定期更换密码
- 不同环境使用不同密码

### 2. 网络安全
- 生产环境不要直接暴露MySQL端口到公网
- 使用VPN或内网访问
- 配置防火墙规则

### 3. 数据安全
- 定期备份数据
- 测试备份恢复流程
- 加密敏感数据

### 4. 访问控制
- 创建专用数据库用户
- 限制用户权限
- 监控异常访问

---

## 🚀 性能优化

### 1. MySQL配置优化
```ini
# my.cnf 配置
[mysqld]
# 内存配置
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# 连接配置
max_connections = 200
max_connect_errors = 1000

# 查询缓存
query_cache_size = 64M
query_cache_type = 1
```

### 2. 索引优化
```sql
-- 为常用查询添加索引
CREATE INDEX idx_user_openid ON users(openid);
CREATE INDEX idx_assessment_user_type ON assessments(user_id, type);
CREATE INDEX idx_order_user_status ON orders(user_id, status);
```

### 3. 分区表
```sql
-- 为大表添加分区
ALTER TABLE operation_logs PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);
```

---

## 📈 监控和告警

### 1. 设置监控
```bash
# 创建监控脚本
cat > /opt/offercome/monitor-db.sh << 'EOF'
#!/bin/bash
# 检查数据库连接
mysql -u offercome_user -pOffercome2024! -e "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "数据库连接失败" | mail -s "数据库告警" admin@offercome.com
fi
EOF

chmod +x /opt/offercome/monitor-db.sh

# 添加到crontab
echo "*/5 * * * * /opt/offercome/monitor-db.sh" | crontab -
```

### 2. 日志监控
```bash
# 查看MySQL错误日志
tail -f /var/log/mysql/error.log

# 查看慢查询日志
tail -f /var/log/mysql/slow.log
```

---

## 🔄 迁移和升级

### 1. 数据库迁移
```bash
# 导出数据
mysqldump -u root -p offercome > offercome_backup.sql

# 导入数据
mysql -u root -p new_database < offercome_backup.sql
```

### 2. 版本升级
```bash
# 备份当前版本
./manage-database-enhanced.sh backup

# 升级数据库结构
node server/migrate-database.js

# 验证升级结果
./manage-database-enhanced.sh status
```

---

## 📞 故障排除

### 常见问题

#### 1. 连接被拒绝
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 检查端口是否开放
netstat -tlnp | grep 3306

# 检查防火墙设置
sudo ufw status
```

#### 2. 权限错误
```bash
# 重新授权用户
mysql -u root -p
GRANT ALL PRIVILEGES ON offercome.* TO 'offercome_user'@'%';
FLUSH PRIVILEGES;
```

#### 3. 磁盘空间不足
```bash
# 检查磁盘使用情况
df -h

# 清理日志文件
sudo find /var/log -name "*.log" -mtime +7 -delete
```

---

## 📚 相关文档

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [腾讯云 TDSQL-C 文档](https://cloud.tencent.com/document/product/1003)
- [阿里云 RDS 文档](https://help.aliyun.com/product/26093.html)

---

## 🆘 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查配置文件
3. 联系技术支持团队
4. 提交 Issue 到项目仓库 