# O3需要阅读的文件列表

## 核心配置文件

### 1. CloudBase配置
- `cloudbaserc.json` - 主要CloudBase配置文件
- `cloudbase.json` - 框架配置文件
- `server/package.json` - 函数依赖配置

### 2. 函数代码
- `server/index.js` - 当前部署的函数入口（最小健康检查函数）
- `server/cloudbase-function.js` - 备用函数文件
- `server/simple-test.js` - 简单测试函数

### 3. 问题分析文档
- `O3_HELP_REQUEST.md` - 详细问题描述
- `DEPLOYMENT_SUCCESS_FINAL.md` - 部署状态报告
- `FRONTEND_OPTIMIZATION_SUMMARY.md` - 前端优化总结

### 4. 部署脚本
- `deploy-cloudbase-fixed.sh` - 修复部署脚本
- `deploy-cloudbase-simple.sh` - 简单部署脚本
- `fix-cloudbase-deployment.sh` - 部署修复脚本

### 5. 测试文件
- `test-cloudbase-deployed.js` - 部署测试
- `test-cloudbase-direct.js` - 直接测试
- `test-cloudbase-function.js` - 函数测试

## 关键问题文件

### 6. 当前问题核心
- `server/index.js` (476字节) - 新代码
- 但部署后显示6512字节 - 说明有缓存问题

### 7. 环境配置
- `.env.cloudbase` - CloudBase环境变量
- `cloudbase-key.json` - API密钥配置

## 日志文件
- `logs/` 目录下的所有日志文件

## 建议O3重点关注的文件

1. **`cloudbaserc.json`** - 主要配置，需要检查entry和runtime设置
2. **`server/index.js`** - 当前函数代码，476字节但部署6512字节
3. **`O3_HELP_REQUEST.md`** - 详细问题描述
4. **`server/package.json`** - 依赖配置，可能影响部署包大小

## 问题复现步骤

1. 检查 `tcb functions:detail api` 显示的代码大小
2. 对比 `server/index.js` 的实际大小
3. 检查 `tcb service:list` 的HTTP触发器配置
4. 测试 `curl /api-v2/health` 的响应 