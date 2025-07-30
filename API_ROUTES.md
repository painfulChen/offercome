# API 路由文档

API前缀: `/api-v2`

| 方法 | 路径 | 描述 | 认证 | 速率限制 |
|------|------|------|------|----------|
| GET | `/api-v2/health` | 健康检查接口 | 否 | 无限制 |
| GET | `/api-v2/mbti/questions` | 获取MBTI测试问题 | 否 | 无限制 |
| POST | `/api-v2/mbti/calculate` | 计算MBTI类型 | 否 | 10/min |
| POST | `/api-v2/ai/chat` | AI聊天接口 | 是 | 20/min |
| POST | `/api-v2/ai/rag` | RAG知识库查询 | 是 | 15/min |
| POST | `/api-v2/auth/login` | 用户登录 | 否 | 无限制 |
| POST | `/api-v2/auth/register` | 用户注册 | 否 | 无限制 |
| POST | `/api-v2/auth/logout` | 用户登出 | 是 | 无限制 |
| GET | `/api-v2/user/profile` | 获取用户资料 | 是 | 无限制 |
| PUT | `/api-v2/user/profile` | 更新用户资料 | 是 | 无限制 |
| GET | `/api-v2/cases` | 获取案例列表 | 否 | 无限制 |
| GET | `/api-v2/cases/:id` | 获取单个案例详情 | 否 | 无限制 |
| POST | `/api-v2/cases` | 创建新案例 | 是 | 无限制 |
| GET | `/api-v2/categories` | 获取案例分类 | 否 | 无限制 |
| GET | `/api-v2/chat/history` | 获取聊天历史 | 是 | 无限制 |
| POST | `/api-v2/chat/clear` | 清空聊天历史 | 是 | 无限制 |
| POST | `/api-v2/phone/send-code` | 发送手机验证码 | 否 | 5/min |
| POST | `/api-v2/phone/verify` | 验证手机验证码 | 否 | 无限制 |
| POST | `/api-v2/rag/upload` | 上传RAG文档 | 是 | 无限制 |
| GET | `/api-v2/rag/documents` | 获取RAG文档列表 | 是 | 无限制 |
| DELETE | `/api-v2/rag/documents/:id` | 删除RAG文档 | 是 | 无限制 |

总路由数: 21

## 按功能分组
### HEALTH (1个)
- `GET /api-v2/health` - 健康检查接口

### MBTI (2个)
- `GET /api-v2/mbti/questions` - 获取MBTI测试问题
- `POST /api-v2/mbti/calculate` - 计算MBTI类型

### AI (2个)
- `POST /api-v2/ai/chat` - AI聊天接口
- `POST /api-v2/ai/rag` - RAG知识库查询

### AUTH (3个)
- `POST /api-v2/auth/login` - 用户登录
- `POST /api-v2/auth/register` - 用户注册
- `POST /api-v2/auth/logout` - 用户登出

### USER (2个)
- `GET /api-v2/user/profile` - 获取用户资料
- `PUT /api-v2/user/profile` - 更新用户资料

### CASES (3个)
- `GET /api-v2/cases` - 获取案例列表
- `GET /api-v2/cases/:id` - 获取单个案例详情
- `POST /api-v2/cases` - 创建新案例

### CATEGORIES (1个)
- `GET /api-v2/categories` - 获取案例分类

### CHAT (2个)
- `GET /api-v2/chat/history` - 获取聊天历史
- `POST /api-v2/chat/clear` - 清空聊天历史

### PHONE (2个)
- `POST /api-v2/phone/send-code` - 发送手机验证码
- `POST /api-v2/phone/verify` - 验证手机验证码

### RAG (3个)
- `POST /api-v2/rag/upload` - 上传RAG文档
- `GET /api-v2/rag/documents` - 获取RAG文档列表
- `DELETE /api-v2/rag/documents/:id` - 删除RAG文档

