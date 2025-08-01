# 数据持久化部署指南

## 快速部署

### 1. 环境准备
```bash
# 设置环境变量
export DB_HOST=your-db-host
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export DB_NAME=cloudbase_ai
export ENV_ID=your-env-id
```

### 2. 初始化数据库
```bash
# 运行数据库初始化脚本
node server/scripts/init-database-persistent.js
```

### 3. 部署到CloudBase
```bash
# 使用部署脚本
chmod +x deploy-persistent.sh
./deploy-persistent.sh
```

## 数据备份

### 备份所有表
```bash
node server/scripts/backup-restore.js backup
```

### 恢复数据
```bash
node server/scripts/backup-restore.js restore database-backups/users_2024-01-01.json
```

## 监控和维护

### 健康检查
```bash
curl -f http://your-api-domain/api/health
```

### 查看日志
```bash
pm2 logs cloudbase-ai
```

## 故障排除

### 数据库连接问题
```bash
# 测试连接
node -e "
const { createPool } = require('./server/config/database-persistent');
createPool().then(() => console.log('✅ 连接成功')).catch(err => console.error('❌ 连接失败:', err.message));
"
```

### 服务重启
```bash
pm2 restart cloudbase-ai
```

## 安全配置

### 环境变量
```bash
# 设置强密码
JWT_SECRET=your-very-long-secret-key
DB_PASSWORD=your-strong-db-password
```

### 防火墙
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 完成！

您的数据持久化部署已完成！🎉 