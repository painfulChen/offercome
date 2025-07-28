# OfferCome 腾讯云TDSQL-C部署指南

## 🎯 腾讯云TDSQL-C优势

### 产品特点
- **高性能**: 基于MySQL 8.0，性能优异
- **高可用**: 99.99%可用性保证
- **弹性扩展**: 支持在线扩容
- **安全可靠**: 多重安全防护
- **成本优化**: 按需付费，成本可控

### 适用场景
- ✅ 企业级应用
- ✅ 高并发业务
- ✅ 数据密集型应用
- ✅ 需要高可用性的业务

---

## 🚀 快速开始

### 1. 创建TDSQL-C实例

#### 控制台操作步骤：

1. **登录腾讯云控制台**
   ```
   访问: https://console.cloud.tencent.com/tdsql
   登录您的腾讯云账号
   ```

2. **创建实例**
   ```
   点击"创建实例"
   选择"TDSQL-C MySQL"
   配置实例参数:
   - 地域: 北京 (ap-beijing)
   - 可用区: 北京一区
   - 实例名称: offercome-db
   - 实例规格: 2核4GB (开发环境)
   - 存储: 20GB SSD
   - 管理员密码: Offercome2024!
   ```

3. **网络配置**
   ```
   网络: 选择VPC网络
   安全组: 创建新的安全组
   端口: 开放3306端口
   ```

4. **完成创建**
   ```
   确认配置信息
   点击"立即购买"
   等待实例创建完成 (约5-10分钟)
   ```

#### 使用脚本创建：
```bash
# 创建TDSQL-C实例配置
./tencent-cloud-setup.sh create --region ap-beijing
```

### 2. 获取连接信息

#### 在控制台获取：
1. **进入实例详情页**
   ```
   访问: https://console.cloud.tencent.com/tdsql
   点击您的实例ID
   ```

2. **查看连接信息**
   ```
   基本信息 -> 连接地址
   记录以下信息:
   - 内网地址: tdsql-xxxxx.tencentcloudapi.com
   - 外网地址: tdsql-xxxxx.tencentcloudapi.com
   - 端口: 3306
   ```

3. **创建数据库用户**
   ```
   数据库管理 -> 用户管理 -> 创建用户
   用户名: offercome_user
   密码: Offercome2024!
   权限: 读写权限
   ```

### 3. 配置数据库连接

#### 使用脚本配置：
```bash
# 配置数据库连接
./tencent-cloud-setup.sh configure \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

#### 手动配置：
```bash
# 创建环境配置文件
cat > .env.tencent << EOF
# 腾讯云TDSQL-C配置
DB_HOST=tdsql-xxxxx.tencentcloudapi.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome

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
TENCENT_INSTANCE=tdsql-xxxxx
CLOUD_PROVIDER=tencent
EOF
```

### 4. 初始化数据库

#### 使用脚本初始化：
```bash
# 初始化数据库结构
./tencent-cloud-setup.sh init \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

#### 手动初始化：
```bash
# 运行初始化脚本
node init-tencent-db.js
```

### 5. 测试连接

#### 使用脚本测试：
```bash
# 测试数据库连接
./tencent-cloud-setup.sh test \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

#### 手动测试：
```bash
# 使用MySQL客户端测试
mysql -h tdsql-xxxxx.tencentcloudapi.com \
  -u offercome_user \
  -pOffercome2024! \
  -D offercome \
  -e "SELECT 1 as test;"
```

---

## 🔧 配置管理

### 1. 环境配置文件

#### 开发环境 (.env.tencent.dev)
```bash
# 腾讯云TDSQL-C配置 (开发环境)
DB_HOST=tdsql-dev-xxxxx.tencentcloudapi.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome_dev

# 环境配置
NODE_ENV=development
PORT=3000
JWT_SECRET=dev_jwt_secret
LOG_LEVEL=debug
```

#### 生产环境 (.env.tencent.prod)
```bash
# 腾讯云TDSQL-C配置 (生产环境)
DB_HOST=tdsql-prod-xxxxx.tencentcloudapi.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=your-secure-production-password
DB_NAME=offercome

# 环境配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret
LOG_LEVEL=info
```

### 2. 应用配置更新

#### 更新数据库连接配置
```javascript
// server/config/database-enhanced.js
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'offercome',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+08:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // 腾讯云SSL配置
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};
```

---

## 🔒 安全配置

### 1. 网络安全

#### 安全组配置
```bash
# 腾讯云安全组规则
协议: TCP
端口: 3306
源: 应用服务器IP地址
描述: MySQL数据库访问

# 白名单配置
只允许特定IP访问数据库
添加应用服务器IP到白名单
```

#### 网络访问控制
```bash
# 内网访问 (推荐)
使用内网地址连接数据库
确保应用服务器和数据库在同一VPC

# 外网访问 (谨慎使用)
仅在必要时开放外网访问
使用强密码和IP白名单
```

### 2. 数据库安全

#### 用户权限管理
```sql
-- 创建专用用户
CREATE USER 'offercome_user'@'%' IDENTIFIED BY 'Offercome2024!';

-- 授权最小权限
GRANT SELECT, INSERT, UPDATE, DELETE ON offercome.* TO 'offercome_user'@'%';
GRANT CREATE, DROP, INDEX, ALTER ON offercome.* TO 'offercome_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

#### 密码策略
```bash
# 强密码要求
- 最少12位字符
- 包含大小写字母
- 包含数字
- 包含特殊字符
- 定期更换密码 (建议3个月)
```

---

## 📊 监控和备份

### 1. 数据库监控

#### 腾讯云监控指标
```bash
# 基础监控指标
- CPU使用率
- 内存使用率
- 磁盘使用率
- 连接数
- 慢查询数
- IOPS
- 网络流量

# 告警配置
- CPU使用率 > 80%
- 内存使用率 > 80%
- 磁盘使用率 > 85%
- 连接数 > 1000
- 慢查询数 > 10/分钟
```

#### 监控设置
```bash
# 在腾讯云控制台设置监控
1. 进入实例详情页
2. 点击"监控"标签
3. 配置告警规则
4. 设置通知方式 (邮件/短信)
```

### 2. 自动备份

#### 备份策略
```bash
# 腾讯云自动备份
备份周期: 每天
备份时间: 凌晨2点
保留天数: 7天
备份类型: 全量备份
备份加密: 启用

# 手动备份
./tencent-cloud-setup.sh backup \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

#### 备份恢复
```bash
# 恢复数据库
./tencent-cloud-setup.sh restore \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome \
  --backup-file tencent-backups/backup_20241201_020000.sql.gz
```

---

## 💰 成本优化

### 1. 实例规格选择

#### 开发环境
```bash
# 推荐配置
实例规格: 2核4GB
存储: 20GB SSD
预估成本: 约200元/月
适用场景: 开发测试

# 配置说明
- CPU: 2核足够开发使用
- 内存: 4GB满足基本需求
- 存储: 20GB SSD性能好
```

#### 生产环境
```bash
# 推荐配置
实例规格: 4核8GB
存储: 100GB SSD
预估成本: 约800元/月
适用场景: 正式运营

# 配置说明
- CPU: 4核支持并发访问
- 内存: 8GB缓存更多数据
- 存储: 100GB SSD高性能
```

#### 高并发环境
```bash
# 推荐配置
实例规格: 8核16GB
存储: 200GB SSD
预估成本: 约1500元/月
适用场景: 高并发业务

# 配置说明
- CPU: 8核支持高并发
- 内存: 16GB大缓存
- 存储: 200GB SSD大容量
```

### 2. 成本优化策略

#### 预留实例
```bash
# 腾讯云预留实例
预留期限: 1年或3年
折扣优惠: 最高可享受3折优惠
适用场景: 长期稳定使用

# 购买建议
- 确定使用时长
- 选择合适的规格
- 享受折扣优惠
```

#### 存储优化
```bash
# 数据压缩
启用表压缩
定期清理无用数据
优化索引结构

# 备份优化
启用增量备份
设置合理的保留期
压缩备份文件
```

---

## 🚀 性能优化

### 1. 连接池配置

#### 优化连接池参数
```javascript
// 连接池配置
const poolConfig = {
    min: 5,           // 最小连接数
    max: 20,          // 最大连接数
    acquireTimeout: 60000,  // 获取连接超时
    timeout: 60000,         // 查询超时
    reconnect: true,        // 自动重连
    ssl: {
        rejectUnauthorized: false
    }
};
```

### 2. 查询优化

#### 索引优化
```sql
-- 为常用查询添加索引
CREATE INDEX idx_user_openid ON users(openid);
CREATE INDEX idx_assessment_user_type ON assessments(user_id, type);
CREATE INDEX idx_order_user_status ON orders(user_id, status);
CREATE INDEX idx_task_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_notification_user_status ON notifications(user_id, status);
```

#### 查询优化
```sql
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM users WHERE openid = 'xxx';

-- 优化建议
- 避免SELECT *
- 使用LIMIT限制结果集
- 合理使用索引
- 避免全表扫描
```

---

## 🔄 迁移和升级

### 1. 数据迁移

#### 从本地数据库迁移
```bash
# 1. 备份本地数据库
mysqldump -u root -p offercome > local_backup.sql

# 2. 迁移到腾讯云TDSQL-C
./tencent-cloud-setup.sh restore \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome \
  --backup-file local_backup.sql
```

#### 从其他云服务商迁移
```bash
# 1. 备份源数据库
mysqldump -h source-host -u user -p database > source_backup.sql

# 2. 迁移到腾讯云TDSQL-C
mysql -h tdsql-xxxxx.tencentcloudapi.com \
  -u offercome_user \
  -pOffercome2024! \
  -D offercome < source_backup.sql
```

### 2. 版本升级

#### 数据库版本升级
```bash
# 1. 备份当前版本
./tencent-cloud-setup.sh backup \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome

# 2. 升级数据库结构
node server/migrate-database.js

# 3. 验证升级结果
./tencent-cloud-setup.sh test \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

---

## 📞 故障排除

### 常见问题

#### 1. 连接被拒绝
```bash
# 检查网络连接
ping tdsql-xxxxx.tencentcloudapi.com

# 检查端口是否开放
telnet tdsql-xxxxx.tencentcloudapi.com 3306

# 检查安全组设置
确认应用服务器IP在白名单中
```

#### 2. SSL连接错误
```bash
# 检查SSL配置
mysql -h tdsql-xxxxx.tencentcloudapi.com \
  -u offercome_user \
  -pOffercome2024! \
  --ssl-mode=REQUIRED

# 更新SSL配置
ssl: {
    rejectUnauthorized: false
}
```

#### 3. 性能问题
```bash
# 检查连接数
SHOW PROCESSLIST;

# 检查慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

# 优化查询
EXPLAIN your-slow-query;
```

#### 4. 磁盘空间不足
```bash
# 检查磁盘使用情况
SELECT 
    table_schema,
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
GROUP BY table_schema;

# 清理无用数据
DELETE FROM operation_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 📚 相关资源

### 官方文档
- [腾讯云TDSQL-C产品文档](https://cloud.tencent.com/document/product/1003)
- [TDSQL-C快速入门](https://cloud.tencent.com/document/product/1003/30577)
- [TDSQL-C最佳实践](https://cloud.tencent.com/document/product/1003/30578)

### 最佳实践
- [数据库安全最佳实践](https://cloud.tencent.com/document/product/1003/30577)
- [性能优化指南](https://cloud.tencent.com/document/product/1003/30579)
- [备份恢复策略](https://cloud.tencent.com/document/product/1003/30580)

### 技术支持
- **腾讯云技术支持**: 400-9100-100
- **在线工单**: https://console.cloud.tencent.com/workorder
- **开发者社区**: https://cloud.tencent.com/developer

---

## 🎉 部署完成

恭喜！您的OfferCome平台已成功部署到腾讯云TDSQL-C！

### 下一步操作：
1. **测试应用连接**: 确保应用能正常连接数据库
2. **配置监控告警**: 设置数据库监控和告警
3. **定期备份**: 确保数据安全
4. **性能优化**: 根据实际使用情况优化配置
5. **安全加固**: 定期更新密码和权限

### 联系支持：
如果在部署过程中遇到问题，请：
1. 查看腾讯云控制台日志
2. 检查网络连接配置
3. 联系腾讯云技术支持
4. 在项目仓库提交Issue 