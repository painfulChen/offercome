# 路由优化实施指南

## 概述

本指南实现了"路径统一 + 路由自动注册 + 流水线防回滚"的优化方案，通过三层改造彻底解决路由404、触发器丢失、旧包复活等问题。

## 三层改造架构

### 1. 代码层：声明式路由 + 自动校验

#### 核心文件
- `server/routes.ts` - 集中路由表
- `server/utils/routeManager.js` - 路由管理器
- `server/utils/monitor.js` - 监控工具

#### 主要特性
- **集中路由表**: 所有路由在 `routes.ts` 中声明
- **前缀注入**: 自动添加 `/api-v2` 前缀
- **启动期自检**: 云函数启动时验证所有路由
- **路由覆盖单测**: Jest测试确保路由完整性

### 2. 部署层：`cloudbaserc.json` 即真理

#### 配置要点
```json
{
  "service": {
    "name": "offercome-api-v2",
    "path": "api-v2",          // 只写一级前缀
    "target": "api"
  }
}
```

#### 防回滚机制
1. `tcb framework:deploy` 读取service配置
2. 不存在即创建，存在则diff更新
3. CI强制 `--force` 上传，旧版本永无翻身机会

### 3. CI/CD：两道"红灯"防呆

#### 测试阶段
- 单元测试覆盖率 ≥ 90%
- 路由覆盖测试确保所有路由可用
- 测试失败禁止合并

#### 部署阶段
- 强制部署到CloudBase
- 关键API冒烟测试
- 部署详情保存为artefacts

## 实施步骤

### 第一步：安装依赖

```bash
cd server
npm install jest supertest --save-dev
```

### 第二步：运行测试

```bash
# 运行所有测试
npm test

# 运行覆盖率测试
npm run test:coverage

# 监听模式
npm run test:watch
```

### 第三步：本地验证

```bash
# 生成路由文档
node scripts/generate-route-docs.js

# 查看路由统计
cat API_ROUTES.md
```

### 第四步：部署验证

```bash
# 设置环境变量
export TCB_ENV_ID="your-env-id"
export TCB_SECRET_ID="your-secret-id"
export TCB_SECRET_KEY="your-secret-key"

# 一键部署
./deploy.sh
```

## 监控告警

### 路由缺失监控
- 实时记录404请求
- 每分钟超过5次触发告警
- 支持企业微信、钉钉等告警渠道

### 监控指标
- 路由缺失次数
- 响应时间
- 错误率
- 部署状态

## 新增路由流程

### 1. 在路由表中添加
```typescript
// server/routes.ts
{
  path: '/new-feature',
  method: 'POST',
  handler: 'newFeatureHandler',
  description: '新功能接口',
  auth: true,
  rateLimit: 10
}
```

### 2. 注册处理函数
```javascript
// 在相应的路由文件中
routeManager.registerHandler('newFeatureHandler', newFeatureHandler);
```

### 3. 添加测试
```javascript
// tests/route-coverage.test.js
test('新功能路由应该正常工作', () => {
  // 测试逻辑
});
```

### 4. 部署验证
```bash
npm test && ./deploy.sh
```

## 故障排查

### 常见问题

#### 1. 路由404
- 检查路由是否在 `routes.ts` 中声明
- 验证处理函数是否已注册
- 查看启动期自检日志

#### 2. 触发器丢失
- 检查 `cloudbaserc.json` 配置
- 确认 `tcb framework:deploy` 执行成功
- 查看部署详情

#### 3. 旧包复活
- 确认使用了 `--force` 参数
- 检查CI/CD配置
- 验证部署时间戳

### 调试命令

```bash
# 查看路由统计
node -e "console.log(require('./server/routes').routes.length)"

# 检查处理函数注册
node -e "const rm = require('./server/utils/routeManager'); const r = new rm(); r.selfCheck()"

# 查看监控报告
node -e "const m = require('./server/utils/monitor'); const monitor = new m(); console.log(monitor.generateReport())"
```

## 性能优化

### 路由缓存
- 路由解析结果缓存
- 处理函数映射缓存
- 定期清理过期缓存

### 监控优化
- 批量处理告警
- 智能阈值调整
- 历史数据分析

## 安全考虑

### 路由安全
- 输入验证
- 速率限制
- 认证授权

### 部署安全
- 环境变量加密
- 密钥轮换
- 访问控制

## 扩展功能

### 路由版本管理
```typescript
// 支持多版本路由
export const routes = {
  v1: [...],
  v2: [...],
  v3: [...]
};
```

### 动态路由
```typescript
// 支持动态路由配置
export const dynamicRoutes = [
  {
    pattern: '/api/:version/:resource',
    handler: 'dynamicHandler'
  }
];
```

### 路由分析
```javascript
// 路由使用统计
const routeAnalytics = {
  getUsageStats: () => { /* 实现 */ },
  getPopularRoutes: () => { /* 实现 */ },
  getSlowRoutes: () => { /* 实现 */ }
};
```

## 总结

通过实施这个三层改造方案，我们实现了：

1. **路径统一**: 所有路由统一管理，前缀自动注入
2. **路由自动注册**: 声明式路由，自动验证和注册
3. **流水线防回滚**: CI/CD两道红灯，确保部署质量

这样既根治了"旧包复活/触发器被删"的问题，又为后续功能快速上线腾出了空间。后续只需要在路由表中添加新的JSON条目即可快速上线新功能。 