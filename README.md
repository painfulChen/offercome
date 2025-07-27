# OfferCome - 智能求职辅导平台

## 🎯 项目简介

OfferCome是一个基于腾讯云CloudBase的智能求职辅导平台，提供AI驱动的求职服务，包括简历优化、面试技巧、职业规划等功能。

## 🚀 技术栈

- **后端**: Node.js + Express + CloudBase云函数
- **数据库**: MongoDB + Redis + MySQL
- **前端**: HTML5 + CSS3 + JavaScript
- **AI服务**: 智能聊天机器人
- **部署**: 腾讯云CloudBase

## 📁 项目结构

```
project/
├── server/              # 后端API服务
│   ├── cloudbase-function.js  # 云函数入口
│   ├── config/          # 配置文件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   └── services/        # 业务服务
├── public/              # 前端静态文件
│   ├── index.html       # 主页面
│   ├── styles.css       # 样式文件
│   └── app.js          # 前端脚本
├── miniprogram/         # 微信小程序
├── deploy-package/      # 部署包
└── docs/               # 文档
```

## 🌐 在线访问

- **前端页面**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/
- **API接口**: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2

## 🔧 主要功能

### 用户管理
- ✅ 用户注册/登录
- ✅ 用户信息管理
- ✅ 权限控制

### AI服务
- ✅ 智能聊天助手
- ✅ 求职建议生成
- ✅ 简历优化建议
- ✅ 面试技巧指导

### 数据管理
- ✅ 用户数据存储
- ✅ 聊天记录保存
- ✅ 统计分析

## 🚀 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/offercome.git
cd offercome
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp env.example .env
# 编辑.env文件，填入必要的配置信息
```

4. 启动开发服务器
```bash
npm run dev
```

### 云部署

1. 安装CloudBase CLI
```bash
npm install -g @cloudbase/cli
```

2. 登录腾讯云
```bash
tcb login
```

3. 部署云函数
```bash
tcb fn deploy api
```

4. 创建HTTP服务
```bash
tcb service:create -e your-env-id -p /api -f api
```

5. 部署前端
```bash
tcb hosting:deploy ./public -e your-env-id
```

## 📊 API接口

### 健康检查
```bash
GET /api/health
```

### 用户注册
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 用户登录
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### AI聊天
```bash
POST /api/ai/chat
Content-Type: application/json

{
  "message": "你好，我想了解求职技巧"
}
```

## 🛠️ 开发工具

### 部署脚本
- `deploy-complete-api.sh` - 完整API部署脚本
- `setup-http-trigger-manual.sh` - HTTP触发器配置脚本
- `create-http-trigger-real.sh` - HTTP触发器创建脚本

### 测试工具
- `test-cloud-function.js` - 云函数测试脚本
- `test-api.sh` - API接口测试脚本

## 📈 项目状态

### 已完成功能
- ✅ 云函数部署
- ✅ HTTP服务配置
- ✅ 前端页面优化
- ✅ 用户认证系统
- ✅ AI聊天功能
- ✅ 数据库集成

### 进行中功能
- 🔄 HTTP触发器优化
- 🔄 前端用户体验改进

### 计划功能
- 📋 更多AI功能
- 📋 微信小程序
- 📋 数据分析面板
- 📋 移动端优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: [您的姓名]
- 邮箱: [您的邮箱]
- 项目链接: https://github.com/yourusername/offercome

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**🎉 如果这个项目对您有帮助，请给我们一个星标！** 