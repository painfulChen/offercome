# 🎯 分组RAG系统架构设计

## 📋 系统概述

基于您的需求，我设计了一个按学生和模块分组的RAG系统，支持：
- **每个学生一个RAG**：学生专属的文档管理和检索
- **每个辅导服务模块一个RAG**：按服务类型分组的文档管理
- **学生+模块组合RAG**：精确的学生和模块组合管理
- **汇总所有学生**：全局文档管理和统计

## 🏗️ 系统架构

### 1. 数据模型设计

#### RAGDocument 模型增强
```javascript
{
  // 基础信息
  documentId: "唯一标识",
  title: "文档标题",
  type: "文档类型",
  
  // 分组信息
  studentId: "学生ID",           // 按学生分组
  moduleId: "模块ID",           // 按模块分组
  serviceType: "服务类型",       // 按服务类型分组
  
  // 内容信息
  content: "文档内容",
  vectors: [向量数据],
  
  // 元数据
  metadata: {
    studentName: "学生姓名",
    moduleName: "模块名称",
    sessionId: "会话ID",
    coachId: "教练ID"
  }
}
```

### 2. 服务类型定义

```javascript
const SERVICE_TYPES = {
  'resume': '简历服务',
  'interview': '面试服务', 
  'career_planning': '职业规划',
  'skills_training': '技能培训',
  'job_search': '求职服务',
  'general': '通用服务'
};
```

### 3. 模块类型定义

```javascript
const MODULE_TYPES = {
  'resume_building': '简历构建',
  'interview_preparation': '面试准备',
  'career_planning': '职业规划',
  'skills_assessment': '技能评估',
  'job_matching': '职位匹配',
  'general': '通用模块'
};
```

## 🚀 核心功能

### 1. 学生RAG服务

#### 功能特点
- **专属文档管理**：每个学生独立的文档存储
- **个性化搜索**：基于学生历史数据的智能检索
- **进度跟踪**：学生学习进度和文档使用统计

#### API端点
```bash
# 学生文档上传
POST /api/rag-manager/student/:studentId/upload

# 学生文档搜索
POST /api/rag-manager/student/:studentId/search

# 获取学生文档列表
GET /api/rag-manager/student/:studentId/documents

# 获取学生统计信息
GET /api/rag-manager/student/:studentId/stats
```

### 2. 模块RAG服务

#### 功能特点
- **模块化文档管理**：按服务模块组织文档
- **专业知识库**：模块特定的知识积累
- **跨学生共享**：模块内学生间的知识共享

#### API端点
```bash
# 模块文档上传
POST /api/rag-manager/module/:moduleId/upload

# 模块文档搜索
POST /api/rag-manager/module/:moduleId/search

# 获取模块文档列表
GET /api/rag-manager/module/:moduleId/documents

# 获取模块统计信息
GET /api/rag-manager/module/:moduleId/stats
```

### 3. 学生模块组合RAG服务

#### 功能特点
- **精确分组**：学生+模块的精确文档管理
- **个性化模块**：学生特定的模块内容
- **进度跟踪**：学生在特定模块的学习进度

#### API端点
```bash
# 学生模块组合文档上传
POST /api/rag-manager/student/:studentId/module/:moduleId/upload

# 学生模块组合文档搜索
POST /api/rag-manager/student/:studentId/module/:moduleId/search

# 获取学生模块组合文档列表
GET /api/rag-manager/student/:studentId/module/:moduleId/documents
```

### 4. 全局管理功能

#### 统计和监控
```bash
# 获取所有学生列表
GET /api/rag-manager/students

# 获取所有模块列表
GET /api/rag-manager/modules

# 获取所有服务类型列表
GET /api/rag-manager/service-types

# 获取管理器状态
GET /api/rag-manager/status
```

## 📊 使用场景

### 1. 学生个人RAG
```javascript
// 学生上传个人简历
await ragManager.processStudentDocument('student001', filePath, {
  serviceType: 'resume',
  moduleId: 'resume_building',
  studentName: '张三',
  category: 'resume',
  tags: ['简历', '求职', '个人']
});

// 搜索学生个人文档
const results = await ragManager.searchStudentDocuments('student001', '面试技巧');
```

### 2. 模块RAG
```javascript
// 上传面试技巧模块文档
await ragManager.processModuleDocument('interview_skills', filePath, {
  serviceType: 'interview',
  moduleName: '面试技巧模块',
  category: 'interview',
  tags: ['面试', '技巧', '指导']
});

// 搜索模块文档
const results = await ragManager.searchModuleDocuments('interview_skills', '面试问题');
```

### 3. 学生模块组合RAG
```javascript
// 学生特定模块文档
await ragManager.processStudentModuleDocument('student001', 'career_planning', filePath, {
  serviceType: 'career_planning',
  studentName: '张三',
  moduleName: '职业规划模块',
  category: 'career_planning',
  tags: ['职业规划', '个人发展']
});

// 搜索学生特定模块文档
const results = await ragManager.searchStudentModuleDocuments('student001', 'career_planning', '职业发展');
```

## 🔧 技术实现

### 1. RAGManager 类

```javascript
class RAGManager {
  constructor() {
    this.ragServices = new Map(); // 存储不同分组的RAG服务
    this.defaultService = new RAGService(); // 默认服务
  }
  
  // 获取学生RAG服务
  getStudentRAGService(studentId) { /* ... */ }
  
  // 获取模块RAG服务
  getModuleRAGService(moduleId) { /* ... */ }
  
  // 获取学生模块组合RAG服务
  getStudentModuleRAGService(studentId, moduleId) { /* ... */ }
}
```

### 2. 数据库索引优化

```javascript
// 复合索引
ragDocumentSchema.index({ studentId: 1, moduleId: 1 });
ragDocumentSchema.index({ studentId: 1, serviceType: 1 });
ragDocumentSchema.index({ moduleId: 1, serviceType: 1 });
```

### 3. 查询方法

```javascript
// 按学生查询
ragDocumentSchema.statics.findByStudent = function(studentId) { /* ... */ };

// 按模块查询
ragDocumentSchema.statics.findByModule = function(moduleId) { /* ... */ };

// 按学生和模块查询
ragDocumentSchema.statics.findByStudentAndModule = function(studentId, moduleId) { /* ... */ };
```

## 📈 数据流程

### 1. 文档上传流程
```
用户上传文档 → 选择学生/模块 → 处理文档 → 生成向量 → 保存到数据库 → 更新索引
```

### 2. 文档搜索流程
```
用户搜索查询 → 选择搜索范围 → 向量化查询 → 相似度计算 → 返回结果
```

### 3. 数据同步流程
```
内存文档 → 数据库同步 → 索引更新 → 状态确认
```

## 🎯 优势特点

### 1. 精确分组
- ✅ 每个学生独立的RAG服务
- ✅ 每个模块独立的RAG服务
- ✅ 学生+模块精确组合

### 2. 数据隔离
- ✅ 学生数据完全隔离
- ✅ 模块数据可共享
- ✅ 权限控制精确

### 3. 灵活扩展
- ✅ 支持新增学生
- ✅ 支持新增模块
- ✅ 支持新增服务类型

### 4. 性能优化
- ✅ 按需创建RAG服务
- ✅ 数据库索引优化
- ✅ 缓存机制

## 🧪 测试验证

### 运行测试
```bash
# 运行分组RAG系统测试
node test-rag-grouped.js
```

### 测试覆盖
- ✅ 学生文档上传和搜索
- ✅ 模块文档上传和搜索
- ✅ 学生模块组合文档上传和搜索
- ✅ 文档列表查询
- ✅ 统计信息获取
- ✅ 分组管理功能

## 📋 API文档

### 学生相关API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/rag-manager/student/:studentId/upload` | 学生文档上传 |
| POST | `/api/rag-manager/student/:studentId/search` | 学生文档搜索 |
| GET | `/api/rag-manager/student/:studentId/documents` | 获取学生文档列表 |
| GET | `/api/rag-manager/student/:studentId/stats` | 获取学生统计信息 |

### 模块相关API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/rag-manager/module/:moduleId/upload` | 模块文档上传 |
| POST | `/api/rag-manager/module/:moduleId/search` | 模块文档搜索 |
| GET | `/api/rag-manager/module/:moduleId/documents` | 获取模块文档列表 |
| GET | `/api/rag-manager/module/:moduleId/stats` | 获取模块统计信息 |

### 学生模块组合API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/rag-manager/student/:studentId/module/:moduleId/upload` | 学生模块组合文档上传 |
| POST | `/api/rag-manager/student/:studentId/module/:moduleId/search` | 学生模块组合文档搜索 |
| GET | `/api/rag-manager/student/:studentId/module/:moduleId/documents` | 获取学生模块组合文档列表 |

### 全局管理API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/rag-manager/students` | 获取所有学生列表 |
| GET | `/api/rag-manager/modules` | 获取所有模块列表 |
| GET | `/api/rag-manager/service-types` | 获取所有服务类型列表 |
| GET | `/api/rag-manager/status` | 获取管理器状态 |

## 🎉 总结

这个分组RAG系统完全满足您的需求：

1. **每个学生一个RAG** ✅
2. **每个辅导服务模块一个RAG** ✅
3. **按学生分组** ✅
4. **按模块分组** ✅
5. **汇总所有学生** ✅
6. **每个服务模块一个RAG** ✅

系统具备完整的文档管理、搜索、统计功能，支持灵活的分组和扩展。 