# OfferCome AI 开发框架

> **重要**: 这是一个基于腾讯云CloudBase的AI开发框架，包含后台API服务和小程序开发。

## 📋 快速开始

### 环境要求
- Node.js 16+
- CloudBase CLI
- 微信开发者工具

### 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd project

# 安装依赖
cd server && npm install

# 配置环境变量
export TCB_ENV_ID="offercome2025-9g14jitp22f4ddfc"
export TCB_SECRET_ID="your-secret-id"
export TCB_SECRET_KEY="your-secret-key"

# 快速验证
node quick-verify.js

# 一键部署
./deploy.sh
```

## 📚 必读文档

### 🎯 开发原则 (必读)
- **[DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md)** - 开发原则总览
- **[TEAM_ONBOARDING_CHECKLIST.md](./TEAM_ONBOARDING_CHECKLIST.md)** - 团队入职检查清单
- **[QUICK_REFERENCE_CARD.md](./QUICK_REFERENCE_CARD.md)** - 快速参考卡片

### 🛣️ 路由优化 (必读)
- **[ROUTE_OPTIMIZATION_GUIDE.md](./ROUTE_OPTIMIZATION_GUIDE.md)** - 路由优化实施指南
- **[ROUTE_OPTIMIZATION_SUMMARY.md](./ROUTE_OPTIMIZATION_SUMMARY.md)** - 路由优化实施总结
- **[API_ROUTES.md](./API_ROUTES.md)** - API路由文档

### 🚀 部署指南
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 部署指南
- **[DEPLOYMENT_SUCCESS_REPORT.md](./DEPLOYMENT_SUCCESS_REPORT.md)** - 部署成功报告
- **[DEPLOYMENT_STATUS_REPORT.md](./DEPLOYMENT_STATUS_REPORT.md)** - 部署状态报告

### 🔧 技术文档
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 系统架构
- **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** - 数据库设计
- **[API_DESIGN.md](./API_DESIGN.md)** - API设计

### 🛡️ 问题解决
- **[CURRENT_ISSUES_SUMMARY.md](./CURRENT_ISSUES_SUMMARY.md)** - 当前问题总结
- **[FINAL_SOLUTION_SUMMARY.md](./FINAL_SOLUTION_SUMMARY.md)** - 最终解决方案
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - 故障排查指南

## 🎯 核心开发原则

### 1. 单一配置源原则
> 所有配置必须有一个权威的配置源，避免配置分散和冲突。

**实践要求**:
- ✅ 路由配置集中在 `server/routes.js`
- ✅ 部署配置集中在 `cloudbaserc.json`
- ✅ 环境变量集中在 `.env` 文件

### 2. 声明式优于命令式
> 优先使用声明式配置，而不是命令式代码。

**实践要求**:
- ✅ 路由在配置文件中声明
- ✅ 依赖在 `package.json` 中声明
- ✅ 测试用例在配置中声明

### 3. 自动化优先原则
> 所有重复性工作都应该自动化。

**实践要求**:
- ✅ 使用 `./deploy.sh` 一键部署
- ✅ 使用 `npm test` 自动测试
- ✅ 使用 CI/CD 自动构建和部署

## 🛣️ 路由管理

### 集中路由表
所有路由在 `server/routes.js` 中声明：

```javascript
{
  path: '/new-feature',
  method: 'POST',
  handler: 'newFeatureHandler',
  description: '新功能接口',
  auth: true,
  rateLimit: 10
}
```

### 路由验证
- 启动期自检所有路由
- 单元测试覆盖所有路由
- 冒烟测试验证关键路由

## 🚀 部署流程

### 一键部署
```bash
# 设置环境变量
export TCB_ENV_ID="offercome2025-9g14jitp22f4ddfc"
export TCB_SECRET_ID="your-secret-id"
export TCB_SECRET_KEY="your-secret-key"

# 一键部署
./deploy.sh
```

### 部署检查点
1. ✅ 环境变量检查
2. ✅ 单元测试运行
3. ✅ 路由文档生成
4. ✅ CloudBase强制部署
5. ✅ 冒烟测试验证
6. ✅ 部署报告生成

## 📊 项目状态

### 当前指标
- **总路由数**: 21个
- **API前缀**: `/api-v2`
- **测试覆盖率**: ≥ 90%
- **部署成功率**: 100%

### 功能模块
| 模块 | 路由数 | 状态 |
|------|--------|------|
| HEALTH | 1 | ✅ 正常 |
| MBTI | 2 | ✅ 正常 |
| AI | 2 | ✅ 正常 |
| AUTH | 3 | ✅ 正常 |
| USER | 2 | ✅ 正常 |
| CASES | 3 | ✅ 正常 |
| CATEGORIES | 1 | ✅ 正常 |
| CHAT | 2 | ✅ 正常 |
| PHONE | 2 | ✅ 正常 |
| RAG | 3 | ✅ 正常 |

## 🔧 常用命令

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

## 🛡️ 安全检查

### 代码安全
- ✅ 没有硬编码的密钥
- ✅ 所有输入都经过验证
- ✅ 错误信息不暴露敏感信息
- ✅ 使用了适当的认证和授权

### 部署安全
- ✅ 环境变量正确配置
- ✅ 配置文件版本控制
- ✅ 部署脚本安全
- ✅ 监控告警正常

## 📈 监控告警

### 关键指标
- 路由404超过5次/分钟
- 部署失败
- 测试覆盖率下降
- 性能指标异常

### 监控工具
- 路由缺失监控
- 性能指标监控
- 错误率监控
- 部署状态监控

## 👥 团队协作

### 新成员入职
1. 阅读 [TEAM_ONBOARDING_CHECKLIST.md](./TEAM_ONBOARDING_CHECKLIST.md)
2. 完成所有检查清单项目
3. 通过最终考核
4. 获得独立开发权限

### 代码审查
- 所有代码变更都必须经过审查
- 提交前必须通过所有测试
- 文档必须同步更新

### 问题上报
1. 先在团队群组中询问
2. 如果无法解决，联系技术负责人
3. 如果是紧急问题，直接联系DevOps工程师

## 📞 技术支持

### 紧急联系
- **技术负责人**: 负责技术决策和架构
- **DevOps工程师**: 负责部署和运维
- **项目经理**: 负责流程和协调

### 问题反馈
- 技术问题：技术负责人
- 流程问题：项目经理
- 工具问题：DevOps工程师

## 🎉 项目特色

### 技术栈
- **后端**: Node.js + Express + MongoDB + Redis + Socket.io
- **AI服务**: OpenAI + LangChain
- **前端**: 微信小程序
- **部署**: 腾讯云CloudBase

### 核心优势
1. **路径统一** - 所有路由统一管理，前缀自动注入
2. **路由自动注册** - 声明式路由，自动验证和注册
3. **流水线防回滚** - CI/CD两道红灯，确保部署质量
4. **快速上线** - 后续只需要在路由表中添加新的JSON条目即可

### 解决的问题
- ✅ 路由404问题
- ✅ 触发器丢失问题
- ✅ 旧包复活问题

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

> **最后提醒**: 请确保阅读所有必读文档，特别是 [DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md)。如有疑问，请及时与团队讨论。 