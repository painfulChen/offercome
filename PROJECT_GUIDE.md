# OfferCome 智能招生管理系统 - 使用指南

## 项目概述

OfferCome是一个基于腾讯云CloudBase的AI驱动招生管理系统，集成了智能聊天、招生建议生成、成本跟踪等功能。

## 系统架构

```
project/
├── server/          # 后台API服务
│   ├── simple-api.js    # 主要API服务器
│   ├── index.js         # 完整版API服务器
│   └── services/        # AI服务模块
├── miniprogram/     # 微信小程序
├── public/          # 前端静态文件
├── logs/            # 日志文件
└── scripts/         # 管理脚本
```

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js (>= 16.0.0)
- npm
- Git

### 2. 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd project

# 一键启动系统
./start-system.sh
```

### 3. 手动启动

```bash
# 安装依赖
npm install

# 启动API服务器
node server/simple-api.js

# 或启动完整版服务器
node server/index.js
```

## 功能模块

### 1. AI聊天服务

**接口地址**: `POST /api/ai/chat`

**功能**: 提供智能招生咨询服务

**请求示例**:
```json
{
  "message": "我想申请美国计算机科学硕士"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "作为专业的招生顾问，我建议您...",
  "model": "kimi-simulated",
  "timestamp": "2025-07-26T07:10:45.123Z"
}
```

### 2. 招生建议生成

**接口地址**: `POST /api/ai/admission-advice`

**功能**: 根据学生信息生成个性化申请建议

### 3. 健康检查

**接口地址**: `GET /api/health`

**功能**: 检查系统运行状态

### 4. 成本统计

**接口地址**: `GET /api/cost/stats`

**功能**: 查看API调用成本统计

## 监控和管理

### 1. 系统状态检查

```bash
# 检查所有组件状态
./system-status.sh
```

### 2. 性能监控

```bash
# 启动性能监控
node performance-monitor.js
```

### 3. 日志查看

```bash
# 查看服务器日志
tail -f logs/server.log

# 查看成本跟踪日志
tail -f logs/cost-tracker.log

# 查看请求跟踪日志
tail -f logs/request-tracker.log
```

## 配置说明

### 环境变量

复制 `env.example` 为 `.env` 并配置：

```bash
# 服务器配置
NODE_ENV=development
PORT=3000

# AI服务配置
KIMI_API_KEY=your_kimi_api_key_here

# 监控配置
ENABLE_MONITORING=true
COST_TRACKING_ENABLED=true
```

### CloudBase配置

1. 在腾讯云控制台创建CloudBase环境
2. 配置环境变量中的CloudBase参数
3. 部署前端文件到CloudBase

## 部署指南

### 本地开发

```bash
# 开发模式启动
npm run dev

# 生产模式启动
npm start
```

### CloudBase部署

```bash
# 部署到CloudBase
./deploy-cloud-complete.sh
```

### 小程序部署

1. 使用微信开发者工具打开 `miniprogram/` 目录
2. 配置小程序AppID
3. 上传代码到微信小程序平台

## 故障排除

### 常见问题

1. **API服务无法启动**
   - 检查端口3000是否被占用
   - 检查Node.js版本是否符合要求
   - 查看错误日志: `tail -f logs/server.log`

2. **AI服务无响应**
   - 检查Kimi API Key配置
   - 确认网络连接正常
   - 查看API调用日志

3. **前端页面无法访问**
   - 检查API服务器是否正常运行
   - 确认CORS配置正确
   - 查看浏览器控制台错误

### 性能优化

1. **启用缓存**
   - 静态文件已配置缓存头
   - 考虑使用Redis缓存

2. **监控资源使用**
   - 使用性能监控脚本
   - 定期检查日志文件

3. **成本控制**
   - 监控API调用成本
   - 设置调用频率限制

## 开发规范

### 代码风格
- 使用ESLint进行代码检查
- 遵循JavaScript标准规范
- 使用中文注释

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

### 测试
```bash
# 运行测试
npm test

# 测试API接口
./test-api.sh
```

## 联系支持

如有问题或建议，请：
1. 查看项目文档
2. 检查日志文件
3. 提交Issue到项目仓库

---

**版本**: 1.0.0  
**最后更新**: 2025-07-26  
**维护者**: OfferCome团队 