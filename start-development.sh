#!/bin/bash

# 🚀 招生管理系统开发环境启动脚本

echo "🎯 启动招生管理系统开发环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker服务未启动，请启动Docker服务${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker检查通过${NC}"
}

# 检查Node.js是否安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装，请先安装Node.js${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js版本: $NODE_VERSION${NC}"
}

# 创建项目目录结构
create_project_structure() {
    echo -e "${BLUE}📁 创建项目目录结构...${NC}"
    
    # 创建主要目录
    mkdir -p recruitment-system/{backend,frontend,ai-services,crawlers,infrastructure}
    mkdir -p recruitment-system/backend/{user-service,lead-service,assessment-service,coaching-service,payment-service}
    mkdir -p recruitment-system/frontend/{admin-dashboard,student-app,teacher-app,marketing-site}
    mkdir -p recruitment-system/ai-services/{content-generator,interview-ai,recommendation}
    mkdir -p recruitment-system/crawlers/{job-crawler,content-crawler,experience-crawler}
    mkdir -p recruitment-system/infrastructure/{docker,kubernetes,monitoring}
    
    echo -e "${GREEN}✅ 项目目录结构创建完成${NC}"
}

# 创建Docker Compose配置
create_docker_compose() {
    echo -e "${BLUE}🐳 创建Docker Compose配置...${NC}"
    
    cat > recruitment-system/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # 后端服务
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - MONGODB_URI=mongodb://mongodb:27017/recruitment
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
      - redis
      - mongodb
    networks:
      - recruitment-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: recruitment123
      MYSQL_DATABASE: recruitment_db
      MYSQL_USER: recruitment_user
      MYSQL_PASSWORD: recruitment123
    volumes:
      - mysql_data:/var/lib/mysql
      - ./infrastructure/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - recruitment-network

  # Redis缓存
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - recruitment-network

  # MongoDB文档数据库
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: recruitment123
      MONGO_INITDB_DATABASE: recruitment
    volumes:
      - mongo_data:/data/db
    networks:
      - recruitment-network

  # Elasticsearch搜索引擎
  elasticsearch:
    image: elasticsearch:7.17.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - recruitment-network

  # 管理后台前端
  admin-dashboard:
    build: ./frontend/admin-dashboard
    ports:
      - "3001:3000"
    volumes:
      - ./frontend/admin-dashboard:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api/v1
    networks:
      - recruitment-network

  # 营销网站前端
  marketing-site:
    build: ./frontend/marketing-site
    ports:
      - "3002:3000"
    volumes:
      - ./frontend/marketing-site:/app
      - /app/node_modules
    environment:
      - VUE_APP_API_URL=http://localhost:3000/api/v1
    networks:
      - recruitment-network

  # AI服务
  ai-service:
    build: ./ai-services
    ports:
      - "3003:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - KIMI_API_KEY=${KIMI_API_KEY}
    volumes:
      - ./ai-services:/app
      - /app/node_modules
    networks:
      - recruitment-network

  # 爬虫服务
  crawler-service:
    build: ./crawlers
    ports:
      - "3004:3000"
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - ./crawlers:/app
      - /app/node_modules
    networks:
      - recruitment-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - admin-dashboard
      - marketing-site
    networks:
      - recruitment-network

volumes:
  mysql_data:
  redis_data:
  mongo_data:
  elasticsearch_data:

networks:
  recruitment-network:
    driver: bridge
EOF

    echo -e "${GREEN}✅ Docker Compose配置创建完成${NC}"
}

# 创建后端服务配置
create_backend_config() {
    echo -e "${BLUE}🔧 创建后端服务配置...${NC}"
    
    # 用户服务
    cat > recruitment-system/backend/user-service/package.json << 'EOF'
{
  "name": "user-service",
  "version": "1.0.0",
  "description": "用户管理服务",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
EOF

    # 获客服务
    cat > recruitment-system/backend/lead-service/package.json << 'EOF'
{
  "name": "lead-service",
  "version": "1.0.0",
  "description": "获客管理服务",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "redis": "^4.6.8",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
EOF

    echo -e "${GREEN}✅ 后端服务配置创建完成${NC}"
}

# 创建前端配置
create_frontend_config() {
    echo -e "${BLUE}🎨 创建前端配置...${NC}"
    
    # 管理后台
    cat > recruitment-system/frontend/admin-dashboard/package.json << 'EOF'
{
  "name": "admin-dashboard",
  "version": "1.0.0",
  "description": "管理后台",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "antd": "^5.6.1",
    "@ant-design/icons": "^5.1.4",
    "axios": "^1.4.0",
    "moment": "^2.29.4",
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

    # 营销网站
    cat > recruitment-system/frontend/marketing-site/package.json << 'EOF'
{
  "name": "marketing-site",
  "version": "1.0.0",
  "description": "营销网站",
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "vuex": "^4.1.0",
    "element-plus": "^2.3.8",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vue/cli-service": "^5.0.8",
    "@vue/compiler-sfc": "^3.3.4"
  }
}
EOF

    echo -e "${GREEN}✅ 前端配置创建完成${NC}"
}

# 创建环境变量文件
create_env_files() {
    echo -e "${BLUE}🔐 创建环境变量文件...${NC}"
    
    cat > recruitment-system/.env << 'EOF'
# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=recruitment_db
DB_USER=recruitment_user
DB_PASSWORD=recruitment123

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379

# MongoDB配置
MONGODB_URI=mongodb://admin:recruitment123@mongodb:27017/recruitment

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7200

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
KIMI_API_KEY=your-kimi-api-key

# 第三方服务配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key

# 文件存储配置
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=recruitment-system
COS_REGION=ap-shanghai

# 邮件服务配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@qq.com
SMTP_PASS=your-email-password

# 短信服务配置
SMS_ACCESS_KEY_ID=your-sms-access-key
SMS_ACCESS_KEY_SECRET=your-sms-secret
SMS_SIGN_NAME=招生系统
SMS_TEMPLATE_CODE=SMS_123456789
EOF

    echo -e "${GREEN}✅ 环境变量文件创建完成${NC}"
}

# 创建数据库初始化脚本
create_database_init() {
    echo -e "${BLUE}🗄️ 创建数据库初始化脚本...${NC}"
    
    mkdir -p recruitment-system/infrastructure/mysql
    
    cat > recruitment-system/infrastructure/mysql/init.sql << 'EOF'
-- 创建数据库
CREATE DATABASE IF NOT EXISTS recruitment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recruitment_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    real_name VARCHAR(50),
    avatar_url VARCHAR(255),
    role_id INT NOT NULL DEFAULT 1,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    source VARCHAR(50),
    referrer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_status (status)
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认角色
INSERT INTO roles (name, description) VALUES 
('admin', '系统管理员'),
('teacher', '辅导老师'),
('student', '学生用户');

-- 创建获客线索表
CREATE TABLE IF NOT EXISTS leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    wechat VARCHAR(50),
    source VARCHAR(50) NOT NULL,
    source_detail VARCHAR(100),
    status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
    score INT DEFAULT 0,
    tags JSON,
    requirements TEXT,
    assigned_to BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    INDEX idx_source (source),
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to)
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    service_package JSON,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('unpaid', 'paid', 'failed', 'refunded') DEFAULT 'unpaid',
    contract_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
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
    INDEX idx_created_at (created_at)
);
EOF

    echo -e "${GREEN}✅ 数据库初始化脚本创建完成${NC}"
}

# 创建Nginx配置
create_nginx_config() {
    echo -e "${BLUE}🌐 创建Nginx配置...${NC}"
    
    mkdir -p recruitment-system/infrastructure/nginx
    
    cat > recruitment-system/infrastructure/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream admin-dashboard {
        server admin-dashboard:3000;
    }

    upstream marketing-site {
        server marketing-site:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # 管理后台
        location /admin {
            proxy_pass http://admin-dashboard;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 营销网站
        location / {
            proxy_pass http://marketing-site;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API接口
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    echo -e "${GREEN}✅ Nginx配置创建完成${NC}"
}

# 启动服务
start_services() {
    echo -e "${BLUE}🚀 启动服务...${NC}"
    
    cd recruitment-system
    
    # 构建并启动服务
    docker-compose up -d --build
    
    echo -e "${GREEN}✅ 服务启动完成${NC}"
    echo -e "${YELLOW}📋 服务访问地址:${NC}"
    echo -e "  🌐 营销网站: http://localhost"
    echo -e "  📊 管理后台: http://localhost/admin"
    echo -e "  🔌 API接口: http://localhost/api"
    echo -e "  🗄️ MySQL: localhost:3306"
    echo -e "  ⚡ Redis: localhost:6379"
    echo -e "  📄 MongoDB: localhost:27017"
    echo -e "  🔍 Elasticsearch: localhost:9200"
}

# 显示服务状态
show_status() {
    echo -e "${BLUE}📊 服务状态:${NC}"
    docker-compose ps
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}🛑 停止服务...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ 服务已停止${NC}"
}

# 清理环境
cleanup() {
    echo -e "${YELLOW}🧹 清理环境...${NC}"
    docker-compose down -v
    docker system prune -f
    echo -e "${GREEN}✅ 环境清理完成${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}🎯 招生管理系统开发环境启动脚本${NC}"
    echo -e "${BLUE}================================${NC}"
    
    # 检查依赖
    check_docker
    check_nodejs
    
    # 创建项目结构
    create_project_structure
    create_docker_compose
    create_backend_config
    create_frontend_config
    create_env_files
    create_database_init
    create_nginx_config
    
    # 启动服务
    start_services
    
    # 显示状态
    show_status
    
    echo -e "${GREEN}🎉 开发环境启动完成！${NC}"
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "  - 使用 './start-development.sh stop' 停止服务"
    echo -e "  - 使用 './start-development.sh status' 查看状态"
    echo -e "  - 使用 './start-development.sh cleanup' 清理环境"
}

# 命令行参数处理
case "$1" in
    "start")
        main
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo -e "${YELLOW}用法: $0 {start|stop|status|cleanup}${NC}"
        echo -e "  start   - 启动开发环境"
        echo -e "  stop    - 停止服务"
        echo -e "  status  - 查看服务状态"
        echo -e "  cleanup - 清理环境"
        exit 1
        ;;
esac 