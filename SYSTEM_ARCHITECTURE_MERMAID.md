# 🏗️ OfferCome智能求职辅导平台 - Mermaid架构图

## 📋 系统概述

OfferCome是一个基于腾讯云CloudBase的智能求职辅导平台，采用现代化的微服务架构，支持按学生和模块分组的RAG文档管理。

## 🎯 整体系统架构

```mermaid
graph TB
    subgraph "前端层 (Frontend Layer)"
        A[微信小程序] 
        B[Web管理端]
        C[静态托管]
    end
    
    subgraph "API网关层 (API Gateway)"
        D[CloudBase HTTP触发器]
        E[API路由分发]
    end
    
    subgraph "服务层 (Service Layer)"
        F[RAG管理器]
        G[AI服务管理器]
        H[业务服务管理器]
        I[数据管理器]
    end
    
    subgraph "数据层 (Data Layer)"
        J[MongoDB]
        K[Redis]
        L[MySQL]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    F --> I
    G --> I
    H --> I
    I --> J
    I --> K
    I --> L
```

## 🔄 RAG系统详细架构

```mermaid
graph TB
    subgraph "RAG管理器 (RAG Manager)"
        A1[学生RAG服务]
        A2[模块RAG服务]
        A3[组合RAG服务]
        A4[RAG管理器核心]
    end
    
    subgraph "文档处理流程"
        B1[文档上传]
        B2[内容提取]
        B3[向量化]
        B4[存储索引]
    end
    
    subgraph "搜索流程"
        C1[查询输入]
        C2[向量化查询]
        C3[相似度计算]
        C4[结果排序]
    end
    
    subgraph "数据存储"
        D1[MongoDB文档]
        D2[Redis缓存]
        D3[向量索引]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> D1
    B4 --> D2
    B4 --> D3
    
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> A1
    C4 --> A2
    C4 --> A3
    
    D1 --> C3
    D2 --> C3
    D3 --> C3
```

## 🎯 分组RAG架构

```mermaid
graph LR
    subgraph "用户操作"
        U1[学生上传文档]
        U2[模块上传文档]
        U3[组合上传文档]
    end
    
    subgraph "RAG管理器"
        R1[学生RAG服务]
        R2[模块RAG服务]
        R3[组合RAG服务]
    end
    
    subgraph "数据分组"
        D1[学生文档集合]
        D2[模块文档集合]
        D3[组合文档集合]
    end
    
    subgraph "搜索服务"
        S1[学生搜索]
        S2[模块搜索]
        S3[组合搜索]
    end
    
    U1 --> R1
    U2 --> R2
    U3 --> R3
    
    R1 --> D1
    R2 --> D2
    R3 --> D3
    
    D1 --> S1
    D2 --> S2
    D3 --> S3
```

## 🔄 数据流程图

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API网关
    participant S as 服务层
    participant D as 数据层
    
    U->>F: 用户请求
    F->>A: API调用
    A->>S: 路由分发
    S->>D: 数据操作
    D-->>S: 数据返回
    S-->>A: 业务处理
    A-->>F: 响应数据
    F-->>U: 界面更新
```

## 🏛️ 服务层详细架构

```mermaid
graph TB
    subgraph "服务层架构"
        subgraph "RAG管理器"
            R1[学生RAG服务]
            R2[模块RAG服务]
            R3[组合RAG服务]
            R4[文档同步队列]
        end
        
        subgraph "AI服务管理器"
            A1[Kimi AI服务]
            A2[OpenAI服务]
            A3[模拟AI服务]
            A4[成本追踪器]
        end
        
        subgraph "业务服务管理器"
            B1[用户服务]
            B2[案例服务]
            B3[短信服务]
            B4[MBTI服务]
        end
        
        subgraph "数据管理器"
            C1[数据库连接池]
            C2[缓存管理器]
            C3[事务管理器]
            C4[监控管理器]
        end
    end
    
    R1 --> C1
    R2 --> C1
    R3 --> C1
    R4 --> C1
    
    A1 --> C2
    A2 --> C2
    A3 --> C2
    A4 --> C3
    
    B1 --> C1
    B2 --> C1
    B3 --> C1
    B4 --> C1
```

## 📊 数据库关系图

```mermaid
erDiagram
    RAGDocument {
        string documentId PK
        string title
        string type
        string studentId FK
        string moduleId FK
        string serviceType
        string content
        array vectors
        object metadata
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    User {
        string id PK
        string username
        string email
        string password
        string role
        boolean isActive
        datetime createdAt
    }
    
    StudentCase {
        string id PK
        string studentId FK
        string caseType
        string description
        string status
        datetime createdAt
    }
    
    AICall {
        string id PK
        string userId FK
        string apiType
        string request
        string response
        number cost
        datetime timestamp
    }
    
    RAGDocument ||--o{ User : "uploadedBy"
    RAGDocument ||--o{ StudentCase : "relatedTo"
    AICall ||--o{ User : "belongsTo"
```

## 🔧 部署架构

```mermaid
graph TB
    subgraph "腾讯云CloudBase"
        A1[云函数]
        A2[静态托管]
        A3[HTTP触发器]
        A4[API网关]
    end
    
    subgraph "数据库服务"
        B1[MongoDB Atlas]
        B2[Redis Cloud]
        B3[MySQL RDS]
    end
    
    subgraph "AI服务"
        C1[Kimi AI]
        C2[OpenAI]
        C3[腾讯云SMS]
    end
    
    subgraph "监控服务"
        D1[CloudBase监控]
        D2[自定义监控]
        D3[日志服务]
    end
    
    A1 --> A3
    A3 --> A4
    A4 --> B1
    A4 --> B2
    A4 --> B3
    A1 --> C1
    A1 --> C2
    A1 --> C3
    A1 --> D1
    A1 --> D2
    A1 --> D3
```

## 🎯 核心功能模块关系

```mermaid
graph LR
    subgraph "核心功能"
        A[用户认证]
        B[AI服务]
        C[RAG文档管理]
        D[MBTI测试]
        E[案例管理]
        F[短信服务]
    end
    
    subgraph "支持功能"
        G[成本追踪]
        H[性能监控]
        I[错误处理]
        J[日志记录]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    B --> G
    C --> H
    D --> I
    E --> J
    F --> G
```

## 📈 系统特点总结

```mermaid
mindmap
  root((OfferCome系统))
    高可用性
      多AI服务提供商
      数据库连接池
      错误处理机制
    可扩展性
      模块化架构
      服务层抽象
      插件化扩展
    安全性
      JWT认证
      输入验证
      权限控制
    性能优化
      数据库索引
      缓存机制
      异步处理
    分组管理
      学生RAG
      模块RAG
      组合RAG
```

## 🎉 架构优势

1. **分层清晰**：前端、API、服务、数据四层架构
2. **模块化设计**：每个功能模块独立，易于维护和扩展
3. **高可用性**：多服务提供商备份，完善的错误处理
4. **灵活分组**：支持按学生、模块、组合的精确分组
5. **现代化技术栈**：CloudBase + Node.js + MongoDB + Redis
6. **完整监控**：性能监控、错误追踪、成本控制

这个Mermaid架构图清晰地展示了OfferCome系统的整体架构、数据流程和组件关系，为系统的开发和维护提供了直观的指导。 