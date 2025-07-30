# 快速参考卡片

> **重要**: 这是团队开发的快速参考，包含最常用的命令和配置。

## 🚀 常用命令

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage

# 快速验证
node quick-verify.js
```

### 部署命令
```bash
# 一键部署
./deploy.sh

# 手动部署
tcb framework:deploy -e $TCB_ENV_ID --force

# 查看部署状态
tcb functions:detail api -e $TCB_ENV_ID
```

### 路由管理
```bash
# 生成路由文档
node server/scripts/generate-route-docs.js

# 路由自检
node -e "const rm = require('./server/utils/routeManager'); const r = new rm(); r.selfCheck()"

# 查看路由统计
node -e "console.log(require('./server/routes').routes.length)"
```

## 📋 开发检查清单

### 新功能开发
- [ ] 在 `server/routes.js` 中添加路由
- [ ] 实现处理函数
- [ ] 编写测试用例
- [ ] 更新文档
- [ ] 运行验证脚本

### 代码提交前
- [ ] 运行 `npm test`
- [ ] 运行 `node quick-verify.js`
- [ ] 检查代码规范
- [ ] 更新相关文档

### 部署前
- [ ] 通过所有测试
- [ ] 检查环境变量
- [ ] 验证配置文件
- [ ] 准备回滚方案

## 🔧 常见问题解决

### 路由404
```bash
# 1. 检查路由配置
node -e "const routes = require('./server/routes'); console.log(routes.routes.map(r => r.path))"

# 2. 检查处理函数注册
node -e "const rm = require('./server/utils/routeManager'); const r = new rm(); r.selfCheck()"

# 3. 查看监控报告
node -e "const m = require('./server/utils/monitor'); const monitor = new m(); console.log(monitor.generateReport())"
```

### 部署失败
```bash
# 1. 检查环境变量
echo $TCB_ENV_ID
echo $TCB_SECRET_ID
echo $TCB_SECRET_KEY

# 2. 检查配置文件
cat cloudbaserc.json

# 3. 强制重新部署
tcb framework:deploy -e $TCB_ENV_ID --force
```

### 测试失败
```bash
# 1. 运行单个测试
npm test -- --testNamePattern="测试名称"

# 2. 查看详细错误
npm test -- --verbose

# 3. 检查测试覆盖率
npm run test:coverage
```

## 📊 关键配置

### 环境变量
```bash
# 必需的环境变量
export TCB_ENV_ID="offercome2025-9g14jitp22f4ddfc"
export TCB_SECRET_ID="your-secret-id"
export TCB_SECRET_KEY="your-secret-key"
```

### 路由配置模板
```javascript
// 新路由配置模板
{
  path: '/new-feature',
  method: 'POST',
  handler: 'newFeatureHandler',
  description: '新功能接口',
  auth: true,           // 是否需要认证
  rateLimit: 10         // 速率限制 (次/分钟)
}
```

### 测试模板
```javascript
// 路由测试模板
test('新功能路由应该正常工作', () => {
  const result = routeManager.resolveRoute('/api-v2/new-feature', 'POST');
  expect(result).toBeTruthy();
  expect(result.route.handler).toBe('newFeatureHandler');
});
```

## 🛡️ 安全检查

### 代码安全
- [ ] 没有硬编码的密钥
- [ ] 所有输入都经过验证
- [ ] 错误信息不暴露敏感信息
- [ ] 使用了适当的认证和授权

### 部署安全
- [ ] 环境变量正确配置
- [ ] 配置文件版本控制
- [ ] 部署脚本安全
- [ ] 监控告警正常

## 📈 监控指标

### 关键指标
- **路由总数**: 21个
- **API前缀**: `/api-v2`
- **测试覆盖率**: ≥ 90%
- **部署成功率**: 100%

### 监控告警
- 路由404超过5次/分钟
- 部署失败
- 测试覆盖率下降
- 性能指标异常

## 📞 紧急联系

### 技术支持
- **技术负责人**: 负责技术决策和架构
- **DevOps工程师**: 负责部署和运维
- **项目经理**: 负责流程和协调

### 问题上报
1. 先在团队群组中询问
2. 如果无法解决，联系技术负责人
3. 如果是紧急问题，直接联系DevOps工程师

## 📚 必读文档

### 核心文档
1. [DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md) - 开发原则
2. [ROUTE_OPTIMIZATION_GUIDE.md](./ROUTE_OPTIMIZATION_GUIDE.md) - 路由优化指南
3. [API_ROUTES.md](./API_ROUTES.md) - API文档

### 工具文档
4. [quick-verify.js](./quick-verify.js) - 验证脚本
5. [deploy.sh](./deploy.sh) - 部署脚本

### 配置文件
6. [cloudbaserc.json](./cloudbaserc.json) - 部署配置
7. [server/routes.js](./server/routes.js) - 路由配置

## 🎯 开发原则速查

### 核心原则
1. **单一配置源** - 所有配置集中管理
2. **声明式优于命令式** - 优先使用配置而非代码
3. **自动化优先** - 所有重复工作自动化
4. **测试驱动** - 先写测试再写代码
5. **文档即代码** - 文档和代码同步更新

### 路由原则
1. **集中路由表** - 所有路由在 `routes.js` 中声明
2. **前缀统一** - 使用 `/api-v2` 前缀
3. **路由验证** - 启动期自检所有路由

### 部署原则
1. **强制部署** - 使用 `--force` 参数
2. **测试先行** - 部署前必须通过测试
3. **配置即代码** - 所有配置版本控制

---

> **提醒**: 此参考卡片会定期更新，请确保使用最新版本。如有疑问，请查阅完整文档或联系技术支持。 