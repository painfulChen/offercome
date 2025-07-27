# 🔌 招生管理系统API设计

## 📋 API概述

基于RESTful规范的API设计，支持招生管理系统的所有核心功能。

## 🏗️ API架构

### 基础信息
- **基础URL**: `https://api.recruitment-system.com`
- **版本**: v1
- **认证**: JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 错误响应格式
```json
{
  "success": false,
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔐 认证接口

### 1. 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "student123",
  "email": "student@example.com",
  "password": "password123",
  "phone": "13800138000",
  "real_name": "张三",
  "role": "student"
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 123,
      "username": "student123",
      "email": "student@example.com",
      "role": "student",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "student123",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 123,
      "username": "student123",
      "email": "student@example.com",
      "role": "student",
      "profile": {
        "real_name": "张三",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  }
}
```

### 3. Token验证
```http
GET /api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "Token有效",
  "data": {
    "user": {
      "id": 123,
      "username": "student123",
      "role": "student",
      "status": "active"
    }
  }
}
```

## 👥 用户管理接口

### 1. 获取用户信息
```http
GET /api/v1/users/profile
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 123,
    "username": "student123",
    "email": "student@example.com",
    "phone": "13800138000",
    "real_name": "张三",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "student",
    "status": "active",
    "profile": {
      "education": "本科",
      "major": "计算机科学",
      "graduation_year": 2024,
      "target_industry": "互联网",
      "target_position": "产品经理"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 更新用户信息
```http
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "real_name": "张三",
  "phone": "13800138000",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "profile": {
    "education": "本科",
    "major": "计算机科学",
    "graduation_year": 2024,
    "target_industry": "互联网",
    "target_position": "产品经理"
  }
}
```

### 3. 修改密码
```http
PUT /api/v1/users/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

## 🎯 获客管理接口

### 1. 创建获客线索
```http
POST /api/v1/leads
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "李四",
  "phone": "13900139000",
  "email": "lisi@example.com",
  "wechat": "lisi_wechat",
  "source": "xiaohongshu",
  "source_detail": "小红书笔记引流",
  "requirements": "希望找到互联网产品经理工作",
  "tags": ["应届生", "产品经理", "互联网"]
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "线索创建成功",
  "data": {
    "id": 456,
    "name": "李四",
    "phone": "13900139000",
    "email": "lisi@example.com",
    "source": "xiaohongshu",
    "status": "new",
    "score": 75,
    "assigned_to": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 获取线索列表
```http
GET /api/v1/leads?page=1&limit=20&status=new&source=xiaohongshu
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "leads": [
      {
        "id": 456,
        "name": "李四",
        "phone": "13900139000",
        "email": "lisi@example.com",
        "source": "xiaohongshu",
        "status": "new",
        "score": 75,
        "assigned_to": null,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### 3. 更新线索状态
```http
PUT /api/v1/leads/{lead_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "contacted",
  "notes": "已通过微信联系，对方有意向"
}
```

### 4. 分配线索
```http
PUT /api/v1/leads/{lead_id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "assigned_to": 789
}
```

## 📊 测评接口

### 1. 创建测评
```http
POST /api/v1/assessments
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "mbti",
  "title": "MBTI人格测试",
  "description": "了解你的性格类型，找到最适合的职业方向"
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "测评创建成功",
  "data": {
    "id": 789,
    "type": "mbti",
    "title": "MBTI人格测试",
    "questions": [
      {
        "id": 1,
        "question": "在社交场合，你更倾向于：",
        "options": [
          {"key": "E", "text": "与很多人交谈"},
          {"key": "I", "text": "与少数人深入交谈"}
        ]
      }
    ],
    "status": "in_progress",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 提交测评答案
```http
POST /api/v1/assessments/{assessment_id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [
    {"question_id": 1, "answer": "E"},
    {"question_id": 2, "answer": "N"},
    {"question_id": 3, "answer": "T"},
    {"question_id": 4, "answer": "J"}
  ]
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "测评完成",
  "data": {
    "result": {
      "mbti_type": "ENTJ",
      "description": "指挥官型人格",
      "career_recommendations": [
        "产品经理",
        "项目经理",
        "企业管理者"
      ],
      "compatibility_score": 85,
      "detailed_analysis": "..."
    },
    "score": 85,
    "status": "completed",
    "completed_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 获取测评结果
```http
GET /api/v1/assessments/{assessment_id}/result
Authorization: Bearer {token}
```

## 💼 简历管理接口

### 1. 创建简历
```http
POST /api/v1/resumes
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "我的简历",
  "template": "modern",
  "content": {
    "basic_info": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "location": "北京"
    },
    "education": [
      {
        "school": "北京大学",
        "major": "计算机科学",
        "degree": "本科",
        "graduation_year": 2024,
        "gpa": "3.8"
      }
    ],
    "experience": [
      {
        "company": "腾讯",
        "position": "产品实习生",
        "start_date": "2023-06-01",
        "end_date": "2023-09-01",
        "description": "负责微信小程序产品设计..."
      }
    ],
    "skills": ["产品设计", "用户研究", "数据分析"],
    "projects": [
      {
        "name": "校园二手交易平台",
        "role": "产品负责人",
        "description": "设计并开发校园二手交易平台..."
      }
    ]
  }
}
```

### 2. 获取简历列表
```http
GET /api/v1/resumes
Authorization: Bearer {token}
```

### 3. 更新简历
```http
PUT /api/v1/resumes/{resume_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "更新后的简历",
  "content": {
    "basic_info": {
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  }
}
```

### 4. 生成PDF
```http
POST /api/v1/resumes/{resume_id}/generate-pdf
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "PDF生成成功",
  "data": {
    "pdf_url": "https://example.com/resumes/123.pdf",
    "download_url": "https://example.com/resumes/123.pdf"
  }
}
```

## 🎯 岗位管理接口

### 1. 搜索岗位
```http
GET /api/v1/jobs/search?keyword=产品经理&location=北京&salary_min=10000&salary_max=20000&page=1&limit=20
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "搜索成功",
  "data": {
    "jobs": [
      {
        "id": "job_123",
        "title": "产品经理",
        "company": "腾讯",
        "industry": "互联网",
        "location": "北京",
        "salary_range": {
          "min": 15000,
          "max": 25000,
          "currency": "CNY"
        },
        "requirements": {
          "education": "本科及以上",
          "experience": "1-3年",
          "skills": ["产品设计", "用户研究", "数据分析"]
        },
        "platform": "boss",
        "url": "https://www.zhipin.com/job_detail/123",
        "posted_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### 2. 获取推荐岗位
```http
GET /api/v1/jobs/recommendations
Authorization: Bearer {token}
```

### 3. 投递岗位
```http
POST /api/v1/jobs/{job_id}/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "resume_id": 123,
  "greeting": "您好，我对贵公司的产品经理岗位很感兴趣..."
}
```

### 4. 获取投递记录
```http
GET /api/v1/applications?page=1&limit=20&status=applied
Authorization: Bearer {token}
```

## 🎤 面试管理接口

### 1. 创建模拟面试
```http
POST /api/v1/interviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "mock",
  "target_job": {
    "company": "腾讯",
    "position": "产品经理",
    "industry": "互联网"
  },
  "duration": 30
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "面试创建成功",
  "data": {
    "id": "interview_123",
    "type": "mock",
    "target_job": {
      "company": "腾讯",
      "position": "产品经理",
      "industry": "互联网"
    },
    "questions": [
      {
        "id": 1,
        "question": "请介绍一下你自己",
        "type": "behavioral",
        "time_limit": 120
      },
      {
        "id": 2,
        "question": "你如何理解产品经理这个岗位？",
        "type": "situational",
        "time_limit": 180
      }
    ],
    "status": "scheduled",
    "scheduled_at": "2024-01-01T10:00:00Z",
    "duration": 30
  }
}
```

### 2. 开始面试
```http
POST /api/v1/interviews/{interview_id}/start
Authorization: Bearer {token}
```

### 3. 提交面试答案
```http
POST /api/v1/interviews/{interview_id}/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "question_id": 1,
  "answer": "您好，我是张三，毕业于北京大学计算机科学专业...",
  "recording_url": "https://example.com/recordings/answer_1.mp3"
}
```

### 4. 完成面试
```http
POST /api/v1/interviews/{interview_id}/complete
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "面试完成",
  "data": {
    "analysis": {
      "overall_score": 85,
      "feedback": "整体表现良好，逻辑清晰...",
      "strengths": ["表达清晰", "逻辑性强"],
      "weaknesses": ["时间控制需要改进"],
      "suggestions": [
        "可以多准备一些具体的项目案例",
        "注意控制回答时间"
      ]
    },
    "recording_url": "https://example.com/recordings/interview_123.mp3",
    "transcript": "面试文字记录...",
    "completed_at": "2024-01-01T10:30:00Z"
  }
}
```

## 📚 辅导管理接口

### 1. 创建辅导计划
```http
POST /api/v1/coaching/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_type": "comprehensive",
  "goals": [
    "提升产品设计能力",
    "完善简历",
    "提高面试技巧"
  ],
  "timeline": {
    "start_date": "2024-01-01",
    "end_date": "2024-03-01"
  }
}
```

### 2. 获取辅导计划
```http
GET /api/v1/coaching/plans/{plan_id}
Authorization: Bearer {token}
```

### 3. 创建任务
```http
POST /api/v1/coaching/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": 123,
  "title": "完成产品设计作业",
  "description": "设计一个校园二手交易平台的产品原型",
  "type": "homework",
  "priority": "high",
  "due_date": "2024-01-15T23:59:59Z"
}
```

### 4. 提交任务
```http
PUT /api/v1/coaching/tasks/{task_id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "任务完成内容...",
  "attachments": [
    "https://example.com/attachments/prototype.pdf"
  ]
}
```

## 💰 订单支付接口

### 1. 创建订单
```http
POST /api/v1/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_type": "comprehensive_coaching",
  "service_package": {
    "name": "全方位辅导套餐",
    "services": [
      "简历优化",
      "模拟面试",
      "职业规划"
    ],
    "duration": "3个月"
  },
  "amount": 5000.00
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "订单创建成功",
  "data": {
    "id": 456,
    "order_no": "ORD202401010001",
    "service_type": "comprehensive_coaching",
    "amount": 5000.00,
    "status": "pending",
    "payment_url": "https://pay.example.com/pay/456",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 获取订单详情
```http
GET /api/v1/orders/{order_id}
Authorization: Bearer {token}
```

### 3. 支付回调
```http
POST /api/v1/payments/callback
Content-Type: application/json

{
  "order_no": "ORD202401010001",
  "transaction_id": "TXN123456789",
  "amount": 5000.00,
  "status": "success",
  "payment_method": "wechat_pay"
}
```

## 📊 数据统计接口

### 1. 获客统计
```http
GET /api/v1/analytics/leads?period=30d
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_leads": 150,
    "new_leads": 45,
    "converted_leads": 12,
    "conversion_rate": 8.0,
    "sources": {
      "xiaohongshu": 60,
      "zhihu": 30,
      "referral": 40,
      "other": 20
    },
    "trend": [
      {"date": "2024-01-01", "count": 5},
      {"date": "2024-01-02", "count": 8}
    ]
  }
}
```

### 2. 转化统计
```http
GET /api/v1/analytics/conversions?period=30d
Authorization: Bearer {token}
```

### 3. 收入统计
```http
GET /api/v1/analytics/revenue?period=30d
Authorization: Bearer {token}
```

## 🔔 通知接口

### 1. 获取通知列表
```http
GET /api/v1/notifications?page=1&limit=20&unread_only=true
Authorization: Bearer {token}
```

### 2. 标记通知为已读
```http
PUT /api/v1/notifications/{notification_id}/read
Authorization: Bearer {token}
```

### 3. 批量标记已读
```http
PUT /api/v1/notifications/read-all
Authorization: Bearer {token}
```

## 🔍 搜索接口

### 1. 全局搜索
```http
GET /api/v1/search?q=产品经理&type=all&page=1&limit=20
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "搜索成功",
  "data": {
    "jobs": [
      {
        "id": "job_123",
        "title": "产品经理",
        "company": "腾讯",
        "highlight": "产品经理"
      }
    ],
    "resumes": [
      {
        "id": 123,
        "title": "我的简历",
        "highlight": "产品经理"
      }
    ],
    "interviews": [
      {
        "id": "interview_123",
        "title": "产品经理模拟面试",
        "highlight": "产品经理"
      }
    ]
  }
}
```

## 📝 错误码定义

### 通用错误码
```json
{
  "200": "成功",
  "201": "创建成功",
  "400": "请求参数错误",
  "401": "未授权",
  "403": "禁止访问",
  "404": "资源不存在",
  "409": "资源冲突",
  "422": "数据验证失败",
  "500": "服务器内部错误"
}
```

### 业务错误码
```json
{
  "1001": "用户名已存在",
  "1002": "邮箱已存在",
  "1003": "密码错误",
  "1004": "Token已过期",
  "1005": "用户不存在",
  "2001": "线索不存在",
  "2002": "线索已分配",
  "3001": "测评不存在",
  "3002": "测评已完成",
  "4001": "简历不存在",
  "5001": "岗位不存在",
  "5002": "已投递该岗位",
  "6001": "面试不存在",
  "6002": "面试已开始",
  "7001": "订单不存在",
  "7002": "订单已支付",
  "8001": "辅导计划不存在"
}
```

## 🔒 安全规范

### 1. 认证要求
- 所有API请求（除公开接口外）都需要携带JWT Token
- Token格式：`Bearer {token}`
- Token过期时间：2小时

### 2. 权限控制
- 基于角色的访问控制（RBAC）
- 资源级别的权限验证
- API调用频率限制

### 3. 数据验证
- 所有输入参数都需要验证
- 使用JSON Schema进行数据验证
- 防止SQL注入和XSS攻击

### 4. 日志记录
- 记录所有API调用日志
- 包含用户ID、IP地址、请求参数
- 敏感信息脱敏处理

这个API设计将支持你的招生管理系统的所有核心功能，确保系统的可扩展性和安全性！ 