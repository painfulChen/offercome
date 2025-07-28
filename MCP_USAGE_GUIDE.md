# MCP工具使用指南

## 🚀 快速开始

### 1. 启动MCP服务器
```bash
./start-mcp.sh
```

### 2. 测试MCP集成
```bash
node test-mcp-integration.js
```

## 📊 数据库管理

### 查看用户列表
```javascript
const db = new DatabaseManager();
const users = await db.getUsers();
console.log(users);
```

### 查看统计数据
```javascript
const stats = await db.getStats();
console.log(stats);
```

## ☁️ CloudBase管理

### 部署云函数
```javascript
const cloudbase = new CloudBaseManager();
await cloudbase.deployFunction('api');
```

### 部署静态网站
```javascript
await cloudbase.deployHosting('public/');
```

## 📝 GitHub管理

### 提交代码
```javascript
const github = new GitHubManager();
await github.commit('更新功能');
await github.push('main');
```

### 创建分支
```javascript
await github.createBranch('feature/new-feature');
```

## 🔧 配置说明

### MySQL配置
- 主机: sh-cdb-l8rfujds.sql.tencentcdb.com
- 端口: 21736
- 数据库: offercome
- 用户: root

### CloudBase配置
- 环境ID: offercome2025-9g14jitp22f4ddfc
- 区域: ap-shanghai

### GitHub配置
- 所有者: painfulChen
- 仓库: offercome

## 📋 常用命令

### 数据库操作
```bash
# 备份数据库
node -e "const db = require('./mcp-scripts/db-manager'); new db().backup()"

# 查看统计
node -e "const db = require('./mcp-scripts/db-manager'); new db().getStats().then(console.log)"
```

### 部署操作
```bash
# 部署所有
node -e "const cb = require('./mcp-scripts/cloudbase-manager'); new cb().deployFunction()"

# 查看状态
node -e "const cb = require('./mcp-scripts/cloudbase-manager'); new cb().getFunctionInfo()"
```

### Git操作
```bash
# 提交并推送
node -e "const gh = require('./mcp-scripts/github-manager'); gh.commit('更新').then(() => gh.push())"
```

## 🎯 最佳实践

1. **定期备份**: 使用数据库备份功能
2. **测试部署**: 在部署前先测试
3. **版本控制**: 及时提交代码变更
4. **监控状态**: 定期检查系统状态

## 🚨 注意事项

1. **权限管理**: 确保有足够的权限
2. **网络连接**: 确保网络连接稳定
3. **配置安全**: 保护敏感配置信息
4. **错误处理**: 妥善处理异常情况
