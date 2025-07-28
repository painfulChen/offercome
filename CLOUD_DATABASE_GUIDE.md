# OfferCome 云数据库部署指南

## 🎯 选择云数据库服务商

### 推荐方案对比

| 服务商 | 产品 | 优势 | 适用场景 | 成本 |
|--------|------|------|----------|------|
| **腾讯云** | TDSQL-C | 国内访问快，价格实惠 | 国内业务 | 低 |
| **阿里云** | RDS | 功能全面，生态完善 | 企业级应用 | 中 |
| **AWS** | RDS | 全球部署，稳定性高 | 国际化业务 | 高 |
| **华为云** | RDS | 安全性高，合规性好 | 政府企业 | 中 |

---

## 🚀 腾讯云 TDSQL-C 部署

### 1. 创建 TDSQL-C 实例

#### 控制台操作步骤：
1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/
   - 搜索 "TDSQL-C"

2. **创建实例**
   ```
   地域：选择离用户最近的地域（如：北京）
   网络：选择VPC网络
   实例规格：2核4GB（开发环境）
   存储：20GB SSD
   管理员密码：设置强密码
   ```

3. **配置网络**
   ```
   安全组：开放3306端口
   白名单：添加应用服务器IP
   ```

### 2. 配置数据库

#### 使用脚本配置：
```bash
# 配置腾讯云TDSQL-C
./cloud-database-setup.sh tencent \
  --region ap-beijing \
  --instance tdsql-xxxxx \
  --username offercome_user \
  --password Offercome2024!
```

#### 手动配置：
```bash
# 1. 更新配置文件
DB_HOST=your-tdsql-c-instance.tencentcloudapi.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome

# 2. 初始化数据库
node init-tencent-db.js
```

### 3. 测试连接
```bash
# 测试数据库连接
./cloud-database-setup.sh test \
  --host your-tdsql-c-instance.tencentcloudapi.com \
  --port 3306 \
  --username offercome_user \
  --password Offercome2024!
```

---

## ☁️ 阿里云 RDS 部署

### 1. 创建 RDS 实例

#### 控制台操作步骤：
1. **登录阿里云控制台**
   - 访问：https://rds.console.aliyun.com/
   - 点击 "创建实例"

2. **配置实例**
   ```
   地域：选择合适的地域（如：杭州）
   数据库类型：MySQL 8.0
   实例规格：2核4GB
   存储：20GB ESSD云盘
   管理员密码：设置强密码
   ```

3. **网络配置**
   ```
   网络类型：专有网络VPC
   安全组：开放3306端口
   白名单：添加应用服务器IP
   ```

### 2. 配置数据库

#### 使用脚本配置：
```bash
# 配置阿里云RDS
./cloud-database-setup.sh aliyun \
  --region cn-hangzhou \
  --instance rm-xxxxx \
  --username offercome_user \
  --password Offercome2024!
```

#### 手动配置：
```bash
# 1. 更新配置文件
DB_HOST=your-rds-instance.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome

# 2. 初始化数据库
node init-aliyun-db.js
```

### 3. 测试连接
```bash
# 测试数据库连接
./cloud-database-setup.sh test \
  --host your-rds-instance.mysql.rds.aliyuncs.com \
  --port 3306 \
  --username offercome_user \
  --password Offercome2024!
```

---

## 🌍 AWS RDS 部署

### 1. 创建 RDS 实例

#### 控制台操作步骤：
1. **登录AWS控制台**
   - 访问：https://console.aws.amazon.com/rds/
   - 点击 "创建数据库"

2. **配置实例**
   ```
   数据库引擎：MySQL 8.0
   模板：生产环境
   实例规格：db.t3.micro（开发环境）
   存储：20GB GP2
   管理员密码：设置强密码
   ```

3. **网络配置**
   ```
   VPC：选择默认VPC
   安全组：开放3306端口
   子网组：选择私有子网
   ```

### 2. 配置数据库

#### 使用脚本配置：
```bash
# 配置AWS RDS
./cloud-database-setup.sh aws \
  --region us-east-1 \
  --instance db-xxxxx \
  --username offercome_user \
  --password Offercome2024!
```

#### 手动配置：
```bash
# 1. 更新配置文件
DB_HOST=your-rds-instance.region.rds.amazonaws.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome

# 2. 初始化数据库
node init-aws-db.js
```

### 3. 测试连接
```bash
# 测试数据库连接
./cloud-database-setup.sh test \
  --host your-rds-instance.region.rds.amazonaws.com \
  --port 3306 \
  --username offercome_user \
  --password Offercome2024!
```

---

## 🔧 环境配置

### 1. 创建环境配置文件

#### 开发环境 (.env.development)
```bash
# 云数据库配置
DB_HOST=your-cloud-db-host.com
DB_PORT=3306
DB_USER=offercome_user
DB_PASSWORD=Offercome2024!
DB_NAME=offercome

# 环境配置
NODE_ENV=development
PORT=3000
JWT_SECRET=dev_jwt_secret
LOG_LEVEL=debug
```

#### 生产环境 (.env.production)
```bash
# 云数据库配置
DB_HOST=your-production-db-host.com
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

### 2. 更新应用配置

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
    // 云数据库SSL配置
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
协议：TCP
端口：3306
源：应用服务器IP地址
描述：MySQL数据库访问

# 阿里云安全组规则
协议类型：MySQL
端口范围：3306/3306
授权对象：应用服务器IP地址
优先级：1
```

#### 白名单配置
```bash
# 只允许特定IP访问
# 腾讯云
白名单IP：your-app-server-ip

# 阿里云
白名单IP：your-app-server-ip

# AWS
安全组：只允许应用服务器安全组访问
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
- 定期更换密码
```

---

## 📊 监控和备份

### 1. 数据库监控

#### 腾讯云监控
```bash
# 监控指标
- CPU使用率
- 内存使用率
- 磁盘使用率
- 连接数
- 慢查询数

# 告警配置
- CPU使用率 > 80%
- 内存使用率 > 80%
- 磁盘使用率 > 85%
- 连接数 > 1000
```

#### 阿里云监控
```bash
# 监控指标
- 实例CPU使用率
- 实例内存使用率
- 实例磁盘使用率
- 实例连接数
- 实例IOPS

# 告警配置
- CPU使用率 > 80%
- 内存使用率 > 80%
- 磁盘使用率 > 85%
- 连接数 > 1000
```

### 2. 自动备份

#### 腾讯云备份
```bash
# 备份策略
备份周期：每天
备份时间：凌晨2点
保留天数：7天
备份类型：全量备份

# 恢复测试
定期测试备份恢复功能
验证数据完整性
```

#### 阿里云备份
```bash
# 备份策略
备份周期：每天
备份时间：凌晨2点
保留天数：7天
备份类型：全量备份

# 跨地域备份
启用跨地域备份
选择备份地域
```

---

## 💰 成本优化

### 1. 实例规格选择

#### 开发环境
```bash
# 腾讯云TDSQL-C
实例规格：2核4GB
存储：20GB SSD
预估成本：约200元/月

# 阿里云RDS
实例规格：2核4GB
存储：20GB ESSD云盘
预估成本：约300元/月

# AWS RDS
实例规格：db.t3.micro
存储：20GB GP2
预估成本：约400元/月
```

#### 生产环境
```bash
# 腾讯云TDSQL-C
实例规格：4核8GB
存储：100GB SSD
预估成本：约800元/月

# 阿里云RDS
实例规格：4核8GB
存储：100GB ESSD云盘
预估成本：约1000元/月

# AWS RDS
实例规格：db.t3.medium
存储：100GB GP2
预估成本：约1200元/月
```

### 2. 成本优化策略

#### 预留实例
```bash
# 腾讯云
预留实例：1年或3年
折扣：最高可享受3折优惠

# 阿里云
预留实例：1年或3年
折扣：最高可享受3折优惠

# AWS
预留实例：1年或3年
折扣：最高可享受6折优惠
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
```

#### 查询优化
```sql
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM users WHERE openid = 'xxx';

-- 优化慢查询
-- 添加适当的索引
-- 避免SELECT *
-- 使用LIMIT限制结果集
```

---

## 🔄 迁移和升级

### 1. 数据迁移

#### 从本地数据库迁移
```bash
# 1. 备份本地数据库
mysqldump -u root -p offercome > local_backup.sql

# 2. 迁移到云数据库
./cloud-database-setup.sh migrate \
  --source-host localhost \
  --source-user root \
  --source-password your-password \
  --target-host your-cloud-db-host.com \
  --target-user offercome_user \
  --target-password Offercome2024!
```

#### 从其他云服务商迁移
```bash
# 1. 备份源数据库
mysqldump -h source-host -u user -p database > source_backup.sql

# 2. 迁移到目标数据库
mysql -h target-host -u user -p database < source_backup.sql
```

### 2. 版本升级

#### 数据库版本升级
```bash
# 1. 备份当前版本
./cloud-database-setup.sh backup \
  --host your-db-host.com \
  --user offercome_user \
  --password Offercome2024!

# 2. 升级数据库结构
node server/migrate-database.js

# 3. 验证升级结果
./cloud-database-setup.sh test \
  --host your-db-host.com \
  --user offercome_user \
  --password Offercome2024!
```

---

## 📞 故障排除

### 常见问题

#### 1. 连接被拒绝
```bash
# 检查网络连接
ping your-db-host.com

# 检查端口是否开放
telnet your-db-host.com 3306

# 检查安全组设置
# 确认应用服务器IP在白名单中
```

#### 2. SSL连接错误
```bash
# 检查SSL配置
mysql -h your-db-host.com -u user -p --ssl-mode=REQUIRED

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

---

## 📚 相关资源

### 官方文档
- [腾讯云TDSQL-C文档](https://cloud.tencent.com/document/product/1003)
- [阿里云RDS文档](https://help.aliyun.com/product/26093.html)
- [AWS RDS文档](https://docs.aws.amazon.com/rds/)

### 最佳实践
- [数据库安全最佳实践](https://cloud.tencent.com/document/product/1003/30577)
- [性能优化指南](https://help.aliyun.com/document_detail/53608.html)
- [备份恢复策略](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html)

---

## 🆘 技术支持

### 获取帮助
1. **查看日志**: 检查应用和数据库日志
2. **监控面板**: 查看云服务商监控面板
3. **官方支持**: 联系云服务商技术支持
4. **社区论坛**: 在技术社区寻求帮助

### 联系方式
- **腾讯云**: 400-9100-100
- **阿里云**: 95187
- **AWS**: 通过AWS Support Center 