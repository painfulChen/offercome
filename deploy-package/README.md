# CloudBase AI 开发框架

这是一个兼容CodeBuddy和CloudBase的AI工具编程框架，专为后台API和小程序开发而设计。

## 功能特性

- 🚀 **快速开发**: 基于Express.js的后台API框架
- 🤖 **AI集成**: 集成OpenAI和LangChain，支持智能对话
- ☁️ **云开发**: 完全兼容腾讯云CloudBase
- 📱 **小程序支持**: 内置小程序开发模板
- 🔐 **安全认证**: JWT认证和权限管理
- 📊 **数据存储**: 支持MongoDB和Redis
- 🔄 **实时通信**: Socket.io实时消息推送
- 🧪 **测试支持**: Jest单元测试框架

## 项目结构

```
project/
├── server/                 # 后台API服务
│   ├── controllers/        # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── middleware/        # 中间件
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   └── config/            # 配置文件
├── miniprogram/           # 小程序代码
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   ├── utils/             # 工具函数
│   └── app.js             # 小程序入口
├── cloudbase/             # CloudBase云函数
│   ├── functions/         # 云函数
│   └── database/          # 数据库配置
├── ai/                    # AI相关功能
│   ├── chat/              # 聊天功能
│   ├── image/             # 图像处理
│   └── analysis/          # 数据分析
└── docs/                  # 文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.example` 到 `.env` 并配置您的环境变量：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
# 启动后台API服务
npm run dev

# 启动小程序开发工具
# 使用微信开发者工具打开 miniprogram/ 目录
```

### 4. 部署到CloudBase

```bash
# 安装CloudBase CLI
npm install -g @cloudbase/cli

# 登录腾讯云
tcb login

# 部署项目
npm run deploy
```

## 配置说明

### 腾讯云配置

在 `.env` 文件中配置您的腾讯云信息：

```env
# 腾讯云配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
CLOUDBASE_ENV_ID=your_env_id

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/your_db
REDIS_URL=redis://localhost:6379

# AI服务配置
OPENAI_API_KEY=your_openai_key
```

### 小程序配置

在 `miniprogram/app.json` 中配置小程序信息：

```json
{
  "pages": [
    "pages/index/index",
    "pages/chat/chat",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "AI助手",
    "navigationBarTextStyle": "black"
  }
}
```

## API文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### AI接口

- `POST /api/ai/chat` - AI对话
- `POST /api/ai/image` - 图像生成
- `POST /api/ai/analysis` - 数据分析

### 用户接口

- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/history` - 获取历史记录

## 开发指南

### 添加新的API接口

1. 在 `server/controllers/` 创建控制器
2. 在 `server/routes/` 定义路由
3. 在 `server/models/` 定义数据模型

### 添加新的小程序页面

1. 在 `miniprogram/pages/` 创建页面目录
2. 创建 `.js`、`.wxml`、`.wxss` 文件
3. 在 `app.json` 中注册页面

### 使用AI功能

```javascript
// 在控制器中使用AI服务
const { AIService } = require('../services/ai');

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await AIService.chat(message);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testNamePattern="auth"
```

## 部署

### 本地部署

```bash
npm run build
npm start
```

### CloudBase部署

```bash
npm run deploy
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License 