# CloudBase AI 开发框架 - 项目结构

## 📁 项目目录结构

```
project/
├── 📄 package.json                 # 项目依赖配置
├── 📄 README.md                    # 项目说明文档
├── 📄 env.example                  # 环境变量示例
├── 📄 cloudbase.json              # CloudBase部署配置
├── 📄 Dockerfile                   # Docker容器配置
├── 📄 docker-compose.yml          # Docker Compose配置
├── 📄 start.sh                    # 快速启动脚本
├── 📄 PROJECT_STRUCTURE.md        # 项目结构说明
│
├── 🖥️ server/                     # 后台API服务
│   ├── 📄 index.js                # 服务器入口文件
│   ├── 📁 config/                 # 配置文件
│   │   └── 📄 database.js         # 数据库连接配置
│   ├── 📁 controllers/            # 控制器（待实现）
│   ├── 📁 models/                 # 数据模型
│   │   └── 📄 User.js             # 用户模型
│   ├── 📁 routes/                 # 路由文件
│   │   ├── 📄 auth.js             # 认证路由
│   │   ├── 📄 user.js             # 用户路由
│   │   ├── 📄 ai.js               # AI功能路由
│   │   └── 📄 chat.js             # 聊天路由
│   ├── 📁 middleware/             # 中间件
│   │   ├── 📄 auth.js             # JWT认证中间件
│   │   └── 📄 errorHandler.js     # 错误处理中间件
│   ├── 📁 services/               # 业务逻辑服务
│   │   └── 📄 ai.js               # AI服务
│   ├── 📁 utils/                  # 工具函数
│   │   ├── 📄 logger.js           # 日志工具
│   │   └── 📄 api.js              # API工具
│   └── 📁 functions/              # CloudBase云函数（待实现）
│       ├── 📁 ai-chat/
│       ├── 📁 ai-image/
│       └── 📁 user-auth/
│
├── 📱 miniprogram/                 # 小程序代码
│   ├── 📄 app.js                  # 小程序入口
│   ├── 📄 app.json                # 小程序配置
│   ├── 📁 pages/                  # 页面文件
│   │   └── 📁 index/              # 首页
│   │       ├── 📄 index.js        # 页面逻辑
│   │       ├── 📄 index.wxml      # 页面模板
│   │       └── 📄 index.wxss      # 页面样式
│   ├── 📁 components/             # 组件（待实现）
│   ├── 📁 utils/                  # 工具函数（待实现）
│   └── 📁 images/                 # 图片资源（待实现）
│
├── 🤖 ai/                         # AI相关功能
│   ├── 📁 chat/                   # 聊天功能（待实现）
│   ├── 📁 image/                  # 图像处理（待实现）
│   └── 📁 analysis/               # 数据分析（待实现）
│
├── ☁️ cloudbase/                  # CloudBase配置
│   ├── 📁 functions/              # 云函数（待实现）
│   └── 📁 database/               # 数据库配置（待实现）
│
├── 📊 tests/                      # 测试文件
│   └── 📄 auth.test.js            # 认证测试
│
├── 📁 logs/                       # 日志文件（运行时创建）
├── 📁 uploads/                    # 上传文件（运行时创建）
└── 📁 docs/                       # 文档（待实现）
```

## 🚀 快速开始

### 1. 环境要求
- Node.js 16+
- npm 或 yarn
- MongoDB（可选，支持Docker）
- Redis（可选，支持Docker）

### 2. 安装和启动
```bash
# 克隆项目
git clone <your-repo-url>
cd project

# 快速启动
./start.sh

# 或手动启动
npm install
cp env.example .env
# 编辑 .env 文件配置环境变量
npm run dev
```

### 3. 配置说明

#### 环境变量配置 (.env)
```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 腾讯云配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
CLOUDBASE_ENV_ID=your_env_id

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/cloudbase_ai
REDIS_URL=redis://localhost:6379

# AI服务配置
OPENAI_API_KEY=your_openai_api_key

# JWT配置
JWT_SECRET=your_jwt_secret_key
```

#### 小程序配置
1. 使用微信开发者工具打开 `miniprogram/` 目录
2. 在 `app.js` 中配置API地址
3. 在微信公众平台配置服务器域名

## 🔧 开发指南

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

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testNamePattern="auth"
```

## 🚀 部署

### 本地部署
```bash
npm run build
npm start
```

### Docker部署
```bash
docker-compose up -d
```

### CloudBase部署
```bash
npm run deploy
```

## 📊 监控

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 🔗 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取用户信息
- `PUT /api/auth/me` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

### AI接口
- `POST /api/ai/chat` - AI对话
- `POST /api/ai/image` - 图像生成
- `POST /api/ai/analyze` - 文本分析
- `POST /api/ai/code` - 代码生成
- `POST /api/ai/qa` - 智能问答

### 用户接口
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料
- `GET /api/user/history` - 获取历史记录
- `GET /api/user/api-usage` - 获取API使用统计

## 🛠️ 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Redis** - 缓存
- **Socket.io** - 实时通信
- **JWT** - 身份认证
- **OpenAI** - AI服务
- **LangChain** - AI框架

### 前端（小程序）
- **微信小程序** - 前端框架
- **WXML/WXSS** - 模板和样式
- **JavaScript** - 逻辑处理

### 部署和运维
- **Docker** - 容器化
- **CloudBase** - 云开发平台
- **Nginx** - 反向代理
- **Prometheus** - 监控
- **Grafana** - 可视化

## 📝 开发规范

### 代码风格
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循JavaScript标准规范

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 分支管理
- main: 主分支
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 热修复分支

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 微信联系

---

**注意**: 这是一个开发框架，请根据实际需求进行定制和扩展。 