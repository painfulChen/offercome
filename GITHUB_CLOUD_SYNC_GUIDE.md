# 🔄 GitHub到云服务同步指南

## 📋 同步方案概览

### 🎯 三种同步方式：

#### 1. 自动化同步（推荐）
- **GitHub Actions**: 代码推送时自动部署
- **Webhook**: 实时触发部署
- **优势**: 完全自动化，无需手动操作

#### 2. 手动同步
- **脚本化**: 一键同步脚本
- **灵活控制**: 可选择性部署
- **优势**: 可控性强，适合调试

#### 3. 定时同步
- **Cron任务**: 定期从GitHub拉取
- **自动更新**: 定时检查更新
- **优势**: 适合稳定版本管理

## 🚀 自动化同步设置

### 步骤1: 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

```bash
TCB_SECRETID=您的腾讯云SecretId
TCB_SECRETKEY=您的腾讯云SecretKey
TCB_ENVID=offercome2025-9g14jitp22f4ddfc
```

### 步骤2: 启用GitHub Actions

1. 推送代码到GitHub
2. 在仓库页面查看Actions标签
3. 确认工作流正常运行

### 步骤3: 测试自动部署

```bash
# 修改代码后推送
git add .
git commit -m "feat: 新功能"
git push origin main
```

## 🔧 手动同步操作

### 使用同步脚本

```bash
# 运行同步脚本
./sync-from-github.sh

# 选择操作：
# 1. 从GitHub拉取最新代码并部署
# 2. 仅拉取代码（不部署）
# 3. 仅部署当前代码
# 4. 查看部署状态
```

### 手动操作步骤

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 部署到云服务
./deploy-complete-api.sh

# 3. 验证部署
curl https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2/health
```

## 📊 同步流程

### 开发流程
```mermaid
graph LR
    A[本地开发] --> B[提交到GitHub]
    B --> C[GitHub Actions触发]
    C --> D[自动部署到CloudBase]
    D --> E[在线服务更新]
```

### 手动同步流程
```mermaid
graph LR
    A[GitHub代码更新] --> B[本地拉取代码]
    B --> C[运行部署脚本]
    C --> D[部署到CloudBase]
    D --> E[验证部署结果]
```

## 🛠️ 配置说明

### GitHub Actions配置
- **触发条件**: 推送到main分支
- **部署目标**: CloudBase云函数和静态托管
- **环境变量**: 腾讯云密钥和环境ID

### 同步脚本功能
- **代码拉取**: 从GitHub获取最新代码
- **依赖安装**: 自动安装Node.js依赖
- **云函数部署**: 部署API服务
- **前端部署**: 部署静态文件
- **服务配置**: 配置HTTP访问服务

## 📈 监控和维护

### 部署状态监控
```bash
# 检查云函数状态
tcb fn list

# 检查HTTP服务状态
tcb service:list

# 检查前端访问
curl -I https://offercome2025-9g14jitp22f4ddfc.tcloudbaseapp.com/
```

### 日志查看
```bash
# 查看云函数日志
tcb fn log api

# 查看部署日志
tcb hosting:list
```

## 🔄 常见同步场景

### 场景1: 日常开发
```bash
# 1. 本地开发完成
git add .
git commit -m "feat: 新功能"
git push origin main

# 2. GitHub Actions自动部署
# 无需手动操作
```

### 场景2: 紧急修复
```bash
# 1. 快速修复
git pull origin main
# 修改代码
git push origin main

# 2. 自动部署
# GitHub Actions自动处理
```

### 场景3: 手动同步
```bash
# 1. 拉取最新代码
./sync-from-github.sh

# 2. 选择选项1：拉取并部署
# 脚本自动完成所有操作
```

## 🎯 最佳实践

### 开发建议
1. **分支管理**: 使用feature分支开发
2. **提交规范**: 使用规范的commit message
3. **测试验证**: 部署前进行本地测试
4. **回滚准备**: 保留可回滚的版本

### 部署建议
1. **灰度发布**: 先部署到测试环境
2. **监控告警**: 设置部署状态监控
3. **备份策略**: 定期备份重要数据
4. **文档更新**: 同步更新相关文档

## 📞 故障排除

### 常见问题
1. **部署失败**: 检查腾讯云密钥配置
2. **代码冲突**: 先解决冲突再推送
3. **服务异常**: 查看云函数日志
4. **网络问题**: 检查网络连接

### 应急处理
```bash
# 1. 回滚到上一个版本
git reset --hard HEAD~1
git push origin main --force

# 2. 手动重新部署
./deploy-complete-api.sh

# 3. 检查服务状态
./sync-from-github.sh
# 选择选项4：查看部署状态
```

---

**🎉 通过以上配置，您可以实现GitHub代码与云服务的完美同步！** 