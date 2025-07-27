# 🗄️ 招生管理系统数据库设计

## 📋 数据库概述

基于MySQL + MongoDB的混合数据库架构，支持高并发、大数据量的招生管理系统。

## 🏗️ 数据库架构

### 数据库选型
- **MySQL**: 用户、订单、支付等结构化数据
- **MongoDB**: 内容、简历、面试记录等文档数据
- **Redis**: 缓存、会话、实时数据

### 数据库关系图
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🗄️ 数据库架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  📊 MySQL (结构化数据)                                                     │
│  ├── 用户管理 (users, roles, permissions)                                 │
│  ├── 获客管理 (leads, campaigns, sources)                                 │
│  ├── 订单管理 (orders, payments, contracts)                               │
│  ├── 测评管理 (assessments, questions, results)                           │
│  └── 系统管理 (logs, settings, notifications)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  📄 MongoDB (文档数据)                                                     │
│  ├── 内容管理 (contents, templates, media)                               │
│  ├── 简历管理 (resumes, experiences, skills)                             │
│  ├── 面试管理 (interviews, recordings, analysis)                         │
│  ├── 岗位管理 (jobs, applications, tracking)                             │
│  └── 辅导管理 (coaching, tasks, progress)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⚡ Redis (缓存数据)                                                       │
│  ├── 会话缓存 (sessions, tokens)                                         │
│  ├── 数据缓存 (user_profiles, job_cache)                                 │
│  ├── 实时数据 (online_users, notifications)                              │
│  └── 队列数据 (tasks, messages, events)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 MySQL 数据库设计

### 1. 用户管理模块

#### 1.1 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    real_name VARCHAR(50),
    avatar_url VARCHAR(255),
    role_id INT NOT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    source VARCHAR(50), -- 获客来源
    referrer_id BIGINT, -- 推荐人ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_status (status),
    INDEX idx_source (source),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (referrer_id) REFERENCES users(id)
);
```

#### 1.2 角色表 (roles)
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.3 权限表 (permissions)
```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 获客管理模块

#### 2.1 获客线索表 (leads)
```sql
CREATE TABLE leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    wechat VARCHAR(50),
    source VARCHAR(50) NOT NULL, -- 获客来源
    source_detail VARCHAR(100), -- 具体来源
    status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
    score INT DEFAULT 0, -- 线索评分
    tags JSON, -- 标签
    requirements TEXT, -- 需求描述
    assigned_to BIGINT, -- 分配给的销售
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    INDEX idx_source (source),
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

#### 2.2 获客活动表 (campaigns)
```sql
CREATE TABLE campaigns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('social_media', 'email', 'referral', 'advertising') NOT NULL,
    platform VARCHAR(50), -- 平台
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    budget DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    target_audience JSON,
    content_template TEXT,
    metrics JSON, -- 活动指标
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 2.3 获客来源表 (sources)
```sql
CREATE TABLE sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    platform VARCHAR(50),
    account_info JSON, -- 账号信息
    status ENUM('active', 'inactive') DEFAULT 'active',
    performance_metrics JSON, -- 表现指标
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. 订单管理模块

#### 3.1 订单表 (orders)
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    service_package JSON, -- 服务包详情
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('unpaid', 'paid', 'failed', 'refunded') DEFAULT 'unpaid',
    contract_id BIGINT, -- 合同ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 3.2 支付记录表 (payments)
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_no VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_channel VARCHAR(50), -- 支付渠道
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100), -- 第三方交易ID
    callback_data JSON, -- 回调数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_payment_no (payment_no),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### 3.3 合同表 (contracts)
```sql
CREATE TABLE contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_no VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL, -- 合同内容
    status ENUM('draft', 'pending', 'signed', 'expired', 'cancelled') DEFAULT 'draft',
    sign_data JSON, -- 签章数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    signed_at TIMESTAMP NULL,
    INDEX idx_contract_no (contract_no),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. 测评管理模块

#### 4.1 测评表 (assessments)
```sql
CREATE TABLE assessments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- MBTI, 职业倾向等
    title VARCHAR(100) NOT NULL,
    description TEXT,
    questions JSON, -- 问题列表
    answers JSON, -- 答案
    result JSON, -- 测评结果
    score DECIMAL(5,2), -- 评分
    status ENUM('in_progress', 'completed', 'expired') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4.2 问题库表 (questions)
```sql
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL, -- 问题类型
    category VARCHAR(50), -- 问题分类
    question TEXT NOT NULL,
    options JSON, -- 选项
    correct_answer VARCHAR(10), -- 正确答案
    weight DECIMAL(3,2) DEFAULT 1.0, -- 权重
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    tags JSON, -- 标签
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_active (is_active)
);
```

### 5. 系统管理模块

#### 5.1 系统日志表 (system_logs)
```sql
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50),
    resource_id BIGINT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 5.2 通知表 (notifications)
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSON, -- 额外数据
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 📄 MongoDB 数据库设计

### 1. 内容管理集合

#### 1.1 内容集合 (contents)
```javascript
{
  _id: ObjectId,
  title: String,
  type: String, // 笔记、私信、邮件等
  platform: String, // 小红书、知乎等
  content: String,
  variables: Object, // 变量
  tags: Array,
  status: String, // draft, published, archived
  author_id: Number,
  publish_time: Date,
  performance: {
    views: Number,
    likes: Number,
    shares: Number,
    comments: Number
  },
  created_at: Date,
  updated_at: Date
}
```

#### 1.2 模板集合 (templates)
```javascript
{
  _id: ObjectId,
  name: String,
  type: String,
  platform: String,
  content: String,
  variables: Array, // 变量定义
  category: String,
  tags: Array,
  usage_count: Number,
  is_active: Boolean,
  created_by: Number,
  created_at: Date,
  updated_at: Date
}
```

### 2. 简历管理集合

#### 2.1 简历集合 (resumes)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  title: String,
  template: String,
  content: {
    basic_info: {
      name: String,
      email: String,
      phone: String,
      location: String
    },
    education: Array,
    experience: Array,
    skills: Array,
    projects: Array,
    certificates: Array
  },
  status: String, // draft, published, archived
  version: Number,
  is_current: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### 2.2 项目经历集合 (projects)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  title: String,
  company: String,
  role: String,
  start_date: Date,
  end_date: Date,
  description: String,
  achievements: Array,
  skills_used: Array,
  impact: String,
  created_at: Date,
  updated_at: Date
}
```

### 3. 面试管理集合

#### 3.1 面试记录集合 (interviews)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  type: String, // mock, real
  target_job: {
    company: String,
    position: String,
    industry: String
  },
  questions: Array,
  answers: Array,
  recording_url: String,
  analysis: {
    score: Number,
    feedback: String,
    suggestions: Array,
    strengths: Array,
    weaknesses: Array
  },
  status: String, // scheduled, in_progress, completed
  duration: Number, // 面试时长(分钟)
  created_at: Date,
  completed_at: Date
}
```

#### 3.2 面试问题集合 (interview_questions)
```javascript
{
  _id: ObjectId,
  category: String, // behavioral, technical, situational
  difficulty: String, // easy, medium, hard
  question: String,
  context: String,
  expected_answer: String,
  keywords: Array,
  tags: Array,
  usage_count: Number,
  success_rate: Number,
  created_at: Date
}
```

### 4. 岗位管理集合

#### 4.1 岗位集合 (jobs)
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  industry: String,
  location: String,
  salary_range: {
    min: Number,
    max: Number,
    currency: String
  },
  requirements: {
    education: String,
    experience: String,
    skills: Array,
    responsibilities: Array
  },
  platform: String, // BOSS直聘、猎聘等
  platform_job_id: String,
  url: String,
  status: String, // active, closed, expired
  posted_at: Date,
  expires_at: Date,
  created_at: Date,
  updated_at: Date
}
```

#### 4.2 投递记录集合 (applications)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  job_id: ObjectId,
  platform: String,
  status: String, // applied, viewed, interviewed, offered, rejected
  greeting: String,
  resume_version: Number,
  tracking: {
    applied_at: Date,
    viewed_at: Date,
    responded_at: Date,
    interview_scheduled: Date,
    offer_received: Date
  },
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

### 5. 辅导管理集合

#### 5.1 辅导计划集合 (coaching_plans)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  teacher_id: Number,
  service_type: String,
  goals: Array,
  timeline: {
    start_date: Date,
    end_date: Date,
    milestones: Array
  },
  progress: {
    current_stage: String,
    completion_rate: Number,
    next_milestone: String
  },
  status: String, // active, completed, paused
  created_at: Date,
  updated_at: Date
}
```

#### 5.2 任务集合 (tasks)
```javascript
{
  _id: ObjectId,
  user_id: Number,
  teacher_id: Number,
  title: String,
  description: String,
  type: String, // homework, practice, review
  priority: String, // low, medium, high
  status: String, // pending, in_progress, completed, overdue
  due_date: Date,
  completed_at: Date,
  feedback: String,
  attachments: Array,
  created_at: Date,
  updated_at: Date
}
```

## ⚡ Redis 缓存设计

### 1. 会话缓存
```redis
# 用户会话
SET session:{user_id} {session_data} EX 3600

# 用户Token
SET token:{token} {user_id} EX 7200

# 在线用户
SADD online_users {user_id}
EXPIRE online_users 300
```

### 2. 数据缓存
```redis
# 用户信息缓存
SET user:{user_id} {user_data} EX 1800

# 岗位缓存
SET job:{job_id} {job_data} EX 3600

# 热门岗位列表
SET hot_jobs {job_list} EX 1800
```

### 3. 实时数据
```redis
# 实时通知
LPUSH notifications:{user_id} {notification_data}

# 消息队列
LPUSH message_queue {message_data}

# 系统事件
PUBLISH system_events {event_data}
```

## 🔄 数据同步策略

### 1. MySQL与MongoDB同步
```javascript
// 数据同步服务
class DataSyncService {
    // 用户数据同步
    async syncUserData(userId) {
        const mysqlUser = await this.mysqlService.getUser(userId);
        await this.mongoService.updateUser(userId, mysqlUser);
    }

    // 订单数据同步
    async syncOrderData(orderId) {
        const mysqlOrder = await this.mysqlService.getOrder(orderId);
        await this.mongoService.updateOrder(orderId, mysqlOrder);
    }
}
```

### 2. 缓存更新策略
```javascript
// 缓存管理服务
class CacheService {
    // 更新用户缓存
    async updateUserCache(userId) {
        const userData = await this.mysqlService.getUser(userId);
        await this.redisService.set(`user:${userId}`, userData, 1800);
    }

    // 清除相关缓存
    async invalidateCache(pattern) {
        const keys = await this.redisService.keys(pattern);
        if (keys.length > 0) {
            await this.redisService.del(keys);
        }
    }
}
```

## 📊 数据库性能优化

### 1. 索引优化
```sql
-- 复合索引
CREATE INDEX idx_leads_source_status ON leads(source, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_assessments_user_type ON assessments(user_id, type);

-- 全文索引
CREATE FULLTEXT INDEX idx_jobs_search ON jobs(title, company, requirements);
```

### 2. 分表策略
```sql
-- 按时间分表
CREATE TABLE orders_2024_01 LIKE orders;
CREATE TABLE orders_2024_02 LIKE orders;

-- 按用户分表
CREATE TABLE user_data_001 LIKE user_data;
CREATE TABLE user_data_002 LIKE user_data;
```

### 3. 读写分离
```javascript
// 数据库连接配置
const dbConfig = {
    master: {
        host: 'master-db.example.com',
        port: 3306
    },
    slaves: [
        {
            host: 'slave1-db.example.com',
            port: 3306
        },
        {
            host: 'slave2-db.example.com',
            port: 3306
        }
    ]
};
```

这个数据库设计将支持你的招生管理系统的高并发、大数据量需求，确保系统的稳定性和可扩展性！ 