# OfferCome 腾讯云TDSQL-C订阅指南

## 🎯 当前服务状态

### ✅ 已有服务
- **腾讯云CloudBase**: 已配置，环境ID: `offercome2025-9g14jitp22f4ddfc`
- **腾讯云服务器**: 已有，可运行应用和数据库
- **云函数API**: 已部署，支持HTTP触发器

### ⏳ 需要订阅的服务
- **腾讯云TDSQL-C**: 云数据库服务 (推荐订阅)

---

## 🚀 订阅腾讯云TDSQL-C

### 第一步：访问腾讯云控制台

1. **登录腾讯云控制台**
   ```
   访问: https://console.cloud.tencent.com/
   使用您的腾讯云账号登录
   ```

2. **进入TDSQL-C产品页面**
   ```
   搜索: "TDSQL-C" 或 "云数据库"
   点击: "TDSQL-C MySQL"
   ```

### 第二步：创建TDSQL-C实例

#### 基础配置
```
产品类型: TDSQL-C MySQL
地域: 北京 (ap-beijing) - 与CloudBase同地域
可用区: 北京一区
实例名称: offercome-db
```

#### 实例规格
```
开发环境推荐:
- 实例规格: 2核4GB
- 存储: 20GB SSD
- 预估成本: 约200元/月

生产环境推荐:
- 实例规格: 4核8GB  
- 存储: 100GB SSD
- 预估成本: 约800元/月
```

#### 网络配置
```
网络: 选择VPC网络
安全组: 创建新的安全组
端口: 开放3306端口
白名单: 添加CloudBase和服务器IP
```

#### 数据库配置
```
管理员密码: Offercome2024!
字符集: utf8mb4
时区: +08:00
```

### 第三步：完成创建

1. **确认配置信息**
   ```
   检查所有配置参数
   确认费用信息
   点击"立即购买"
   ```

2. **等待实例创建**
   ```
   创建时间: 约5-10分钟
   状态: 运行中
   连接状态: 正常
   ```

---

## 🔧 配置数据库连接

### 第一步：获取连接信息

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

### 第二步：创建数据库用户

1. **进入用户管理**
   ```
   数据库管理 -> 用户管理 -> 创建用户
   ```

2. **创建专用用户**
   ```
   用户名: offercome_user
   密码: Offercome2024!
   权限: 读写权限
   主机: % (允许所有IP)
   ```

### 第三步：配置网络访问

1. **配置安全组**
   ```
   安全组 -> 入站规则 -> 添加规则
   协议: TCP
   端口: 3306
   源: CloudBase和服务器IP
   描述: MySQL数据库访问
   ```

2. **配置白名单**
   ```
   数据库管理 -> 访问控制 -> 白名单
   添加IP: CloudBase和服务器IP
   ```

---

## 🛠️ 使用脚本配置

### 第一步：配置数据库连接

```bash
# 使用脚本配置数据库连接
./tencent-cloud-setup.sh configure \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

### 第二步：初始化数据库

```bash
# 初始化数据库结构
./tencent-cloud-setup.sh init \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

### 第三步：测试连接

```bash
# 测试数据库连接
./tencent-cloud-setup.sh test \
  --host tdsql-xxxxx.tencentcloudapi.com \
  --username offercome_user \
  --password Offercome2024! \
  --database offercome
```

---

## 🔄 更新CloudBase配置

### 第一步：设置环境变量

1. **进入CloudBase控制台**
   ```
   访问: https://console.cloud.tencent.com/tcb
   选择环境: offercome2025-9g14jitp22f4ddfc
   ```

2. **设置环境变量**
   ```
   云函数 -> api -> 环境变量
   添加以下变量:
   
   DB_HOST=tdsql-xxxxx.tencentcloudapi.com
   DB_PORT=3306
   DB_USER=offercome_user
   DB_PASSWORD=Offercome2024!
   DB_NAME=offercome
   NODE_ENV=production
   ```

### 第二步：重新部署云函数

```bash
# 重新部署API
tcb framework deploy

# 或者只部署云函数
tcb function:deploy api
```

### 第三步：测试API连接

```bash
# 测试健康检查
curl https://your-cloudbase-domain.com/api/health

# 测试数据库连接
curl https://your-cloudbase-domain.com/api/db/test
```

---

## 💰 成本优化建议

### 开发环境配置
```
实例规格: 2核4GB
存储: 20GB SSD
预估成本: 约200元/月
适用场景: 开发测试
```

### 生产环境配置
```
实例规格: 4核8GB
存储: 100GB SSD
预估成本: 约800元/月
适用场景: 正式运营
```

### 成本优化策略
1. **预留实例**: 1年或3年预留，享受折扣
2. **按需付费**: 开发阶段使用按需付费
3. **存储优化**: 定期清理无用数据
4. **监控告警**: 设置合理的告警阈值

---

## 🔒 安全配置

### 网络安全
- ✅ SSL加密连接
- ✅ IP白名单
- ✅ 安全组配置
- ✅ VPC网络隔离

### 数据库安全
- ✅ 强密码策略
- ✅ 最小权限原则
- ✅ 定期密码更换
- ✅ 访问审计日志

---

## 📊 监控和备份

### 自动监控
```
监控指标:
- CPU使用率
- 内存使用率  
- 磁盘使用率
- 连接数
- 慢查询数

告警配置:
- CPU使用率 > 80%
- 内存使用率 > 80%
- 磁盘使用率 > 85%
- 连接数 > 1000
```

### 自动备份
```
备份策略:
- 备份周期: 每天
- 备份时间: 凌晨2点
- 保留天数: 7天
- 备份类型: 全量备份
- 备份加密: 启用
```

---

## 🚨 故障排除

### 常见问题

#### 1. 连接被拒绝
```bash
# 检查网络连接
ping tdsql-xxxxx.tencentcloudapi.com

# 检查端口是否开放
telnet tdsql-xxxxx.tencentcloudapi.com 3306

# 检查安全组设置
确认CloudBase和服务器IP在白名单中
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

#### 3. 权限错误
```sql
-- 检查用户权限
SHOW GRANTS FOR 'offercome_user'@'%';

-- 重新授权
GRANT ALL PRIVILEGES ON offercome.* TO 'offercome_user'@'%';
FLUSH PRIVILEGES;
```

---

## 📞 技术支持

### 腾讯云支持
- **技术支持**: 400-9100-100
- **在线工单**: https://console.cloud.tencent.com/workorder
- **文档中心**: https://cloud.tencent.com/document

### 项目支持
- **GitHub Issues**: 提交技术问题
- **项目文档**: 查看详细配置说明
- **社区论坛**: 寻求帮助

---

## 🎉 完成订阅

### 订阅完成检查清单
- [ ] 腾讯云TDSQL-C实例已创建
- [ ] 数据库用户已创建
- [ ] 网络白名单已配置
- [ ] 安全组规则已设置
- [ ] 数据库连接测试通过
- [ ] CloudBase环境变量已更新
- [ ] 云函数已重新部署
- [ ] API连接测试通过

### 下一步操作
1. **测试完整流程**: 确保所有功能正常
2. **配置监控告警**: 设置数据库监控
3. **定期备份**: 确保数据安全
4. **性能优化**: 根据使用情况优化配置
5. **安全加固**: 定期更新密码和权限

恭喜！您的OfferCome平台现在拥有了完整的云架构！ 