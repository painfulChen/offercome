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
