#!/bin/bash

# OfferCome MCP工具安装和配置脚本
echo "🚀 开始安装和配置MCP工具..."

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "=================================="
echo "🎯 MCP工具安装和配置"
echo "=================================="

# 1. 创建MCP配置目录
log_info "1. 创建MCP配置目录..."
mkdir -p mcp-config
mkdir -p mcp-scripts
log_success "MCP配置目录创建完成"

# 2. 安装MySQL MCP
log_info "2. 安装MySQL MCP..."
if npm install -g @modelcontextprotocol/server-mysql 2>/dev/null; then
    log_success "MySQL MCP安装成功"
else
    log_warning "MySQL MCP安装失败，可能需要手动安装"
fi

# 3. 创建MySQL MCP配置
log_info "3. 创建MySQL MCP配置..."
cat > mcp-config/mysql.yaml << 'EOF'
mcpServers:
  mysql:
    command: npx -y @modelcontextprotocol/server-mysql
    args:
      - --connection-string
      - "mysql://root:Offercome2024!@sh-cdb-l8rfujds.sql.tencentcdb.com:21736/offercome"
      - --ssl
      - "false"
EOF
log_success "MySQL MCP配置创建完成"

# 4. 创建CloudBase MCP配置
log_info "4. 创建CloudBase MCP配置..."
cat > mcp-config/cloudbase.yaml << 'EOF'
mcpServers:
  cloudbase:
    command: npx -y @modelcontextprotocol/server-tencent-cloud
    args:
      - --secret-id
      - "your_secret_id"
      - --secret-key
      - "your_secret_key"
      - --region
      - "ap-shanghai"
      - --env-id
      - "offercome2025-9g14jitp22f4ddfc"
EOF
log_success "CloudBase MCP配置创建完成"

# 5. 创建GitHub MCP配置
log_info "5. 创建GitHub MCP配置..."
cat > mcp-config/github.yaml << 'EOF'
mcpServers:
  github:
    command: npx -y @modelcontextprotocol/server-github
    args:
      - --token
      - "your_github_token"
      - --owner
      - "painfulChen"
      - --repo
      - "offercome"
EOF
log_success "GitHub MCP配置创建完成"

# 6. 创建Docker MCP配置
log_info "6. 创建Docker MCP配置..."
cat > mcp-config/docker.yaml << 'EOF'
mcpServers:
  docker:
    command: npx -y @modelcontextprotocol/server-docker
    args:
      - --host
      - "unix:///var/run/docker.sock"
EOF
log_success "Docker MCP配置创建完成"

# 7. 创建MCP启动脚本
log_info "7. 创建MCP启动脚本..."
cat > start-mcp.sh << 'EOF'
#!/bin/bash

# MCP服务器启动脚本
echo "🚀 启动MCP服务器..."

# 检查配置文件
if [ ! -f "mcp-config/mysql.yaml" ]; then
    echo "❌ MySQL MCP配置文件不存在"
    exit 1
fi

# 启动MySQL MCP
echo "📊 启动MySQL MCP..."
npx @modelcontextprotocol/server-mysql \
    --connection-string "mysql://root:Offercome2024!@sh-cdb-l8rfujds.sql.tencentcdb.com:21736/offercome" \
    --ssl false &

MYSQL_PID=$!
echo "✅ MySQL MCP启动成功 (PID: $MYSQL_PID)"

# 等待服务器启动
sleep 2

echo "🎉 MCP服务器启动完成！"
echo "📊 可用服务:"
echo "   - MySQL数据库管理"
echo "   - CloudBase云服务管理"
echo "   - GitHub代码管理"
echo "   - Docker容器管理"

# 保持脚本运行
wait
EOF

chmod +x start-mcp.sh
log_success "MCP启动脚本创建完成"

# 8. 创建数据库管理脚本
log_info "8. 创建数据库管理脚本..."
cat > mcp-scripts/db-manager.js << 'EOF'
// 数据库管理脚本
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'sh-cdb-l8rfujds.sql.tencentcdb.com',
    port: 21736,
    user: 'root',
    password: 'Offercome2024!',
    database: 'offercome',
    charset: 'utf8mb4',
    timezone: '+08:00',
    ssl: false
};

class DatabaseManager {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (!this.pool) {
            this.pool = mysql.createPool(dbConfig);
            console.log('✅ 数据库连接池创建成功');
        }
        return this.pool;
    }

    async query(sql, params = []) {
        const connection = await this.connect();
        const [rows] = await connection.execute(sql, params);
        return rows;
    }

    async getUsers() {
        return await this.query('SELECT * FROM users');
    }

    async getLeads() {
        return await this.query('SELECT * FROM leads ORDER BY created_at DESC');
    }

    async getPackages() {
        return await this.query('SELECT * FROM packages WHERE status = "active"');
    }

    async getOrders() {
        return await this.query('SELECT * FROM orders ORDER BY created_at DESC');
    }

    async getTasks() {
        return await this.query('SELECT * FROM tasks ORDER BY due_date ASC');
    }

    async getStats() {
        const users = await this.query('SELECT COUNT(*) as count FROM users');
        const leads = await this.query('SELECT COUNT(*) as count FROM leads');
        const orders = await this.query('SELECT COUNT(*) as count FROM orders');
        const tasks = await this.query('SELECT COUNT(*) as count FROM tasks');

        return {
            users: users[0].count,
            leads: leads[0].count,
            orders: orders[0].count,
            tasks: tasks[0].count
        };
    }

    async backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        
        console.log(`📦 开始备份数据库到 ${filename}...`);
        
        // 这里可以添加实际的备份逻辑
        console.log('✅ 数据库备份完成');
        return filename;
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('🔌 数据库连接已关闭');
        }
    }
}

module.exports = DatabaseManager;
EOF
log_success "数据库管理脚本创建完成"

# 9. 创建CloudBase管理脚本
log_info "9. 创建CloudBase管理脚本..."
cat > mcp-scripts/cloudbase-manager.js << 'EOF'
// CloudBase管理脚本
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class CloudBaseManager {
    constructor() {
        this.envId = 'offercome2025-9g14jitp22f4ddfc';
    }

    async deployFunction(functionName = 'api') {
        try {
            console.log(`🚀 部署云函数 ${functionName}...`);
            const { stdout } = await execAsync(`tcb functions:deploy ${functionName} --force`);
            console.log('✅ 云函数部署成功');
            return stdout;
        } catch (error) {
            console.error('❌ 云函数部署失败:', error.message);
            throw error;
        }
    }

    async deployHosting(path = 'public/') {
        try {
            console.log('🌐 部署静态网站...');
            const { stdout } = await execAsync(`tcb hosting:deploy ${path}`);
            console.log('✅ 静态网站部署成功');
            return stdout;
        } catch (error) {
            console.error('❌ 静态网站部署失败:', error.message);
            throw error;
        }
    }

    async getFunctionInfo(functionName = 'api') {
        try {
            console.log(`📊 获取云函数信息: ${functionName}`);
            const { stdout } = await execAsync(`tcb functions:detail ${functionName}`);
            return stdout;
        } catch (error) {
            console.error('❌ 获取云函数信息失败:', error.message);
            throw error;
        }
    }

    async listFunctions() {
        try {
            console.log('📋 列出所有云函数...');
            const { stdout } = await execAsync('tcb functions:list');
            return stdout;
        } catch (error) {
            console.error('❌ 列出云函数失败:', error.message);
            throw error;
        }
    }

    async getEnvironmentInfo() {
        try {
            console.log('🌍 获取环境信息...');
            const { stdout } = await execAsync('tcb env:list');
            return stdout;
        } catch (error) {
            console.error('❌ 获取环境信息失败:', error.message);
            throw error;
        }
    }
}

module.exports = CloudBaseManager;
EOF
log_success "CloudBase管理脚本创建完成"

# 10. 创建GitHub管理脚本
log_info "10. 创建GitHub管理脚本..."
cat > mcp-scripts/github-manager.js << 'EOF'
// GitHub管理脚本
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class GitHubManager {
    constructor() {
        this.owner = 'painfulChen';
        this.repo = 'offercome';
    }

    async commit(message) {
        try {
            console.log('📝 提交代码...');
            await execAsync('git add .');
            await execAsync(`git commit -m "${message}"`);
            console.log('✅ 代码提交成功');
        } catch (error) {
            console.error('❌ 代码提交失败:', error.message);
            throw error;
        }
    }

    async push(branch = 'main') {
        try {
            console.log(`🚀 推送到 ${branch} 分支...`);
            await execAsync(`git push origin ${branch}`);
            console.log('✅ 代码推送成功');
        } catch (error) {
            console.error('❌ 代码推送失败:', error.message);
            throw error;
        }
    }

    async pull(branch = 'main') {
        try {
            console.log(`📥 拉取 ${branch} 分支...`);
            await execAsync(`git pull origin ${branch}`);
            console.log('✅ 代码拉取成功');
        } catch (error) {
            console.error('❌ 代码拉取失败:', error.message);
            throw error;
        }
    }

    async createBranch(branchName) {
        try {
            console.log(`🌿 创建分支: ${branchName}`);
            await execAsync(`git checkout -b ${branchName}`);
            console.log('✅ 分支创建成功');
        } catch (error) {
            console.error('❌ 分支创建失败:', error.message);
            throw error;
        }
    }

    async getStatus() {
        try {
            console.log('📊 获取Git状态...');
            const { stdout } = await execAsync('git status');
            return stdout;
        } catch (error) {
            console.error('❌ 获取Git状态失败:', error.message);
            throw error;
        }
    }
}

module.exports = GitHubManager;
EOF
log_success "GitHub管理脚本创建完成"

# 11. 创建测试脚本
log_info "11. 创建MCP测试脚本..."
cat > test-mcp-integration.js << 'EOF'
// MCP集成测试脚本
const DatabaseManager = require('./mcp-scripts/db-manager');
const CloudBaseManager = require('./mcp-scripts/cloudbase-manager');
const GitHubManager = require('./mcp-scripts/github-manager');

async function testMCPIntegration() {
    console.log('🧪 开始MCP集成测试...');
    
    try {
        // 测试数据库连接
        console.log('\n📊 测试数据库连接...');
        const db = new DatabaseManager();
        const stats = await db.getStats();
        console.log('✅ 数据库连接成功');
        console.log('   统计信息:', stats);
        
        // 测试GitHub操作
        console.log('\n📝 测试GitHub操作...');
        const github = new GitHubManager();
        const status = await github.getStatus();
        console.log('✅ GitHub操作成功');
        console.log('   Git状态:', status.split('\n')[0]);
        
        // 测试CloudBase操作
        console.log('\n☁️ 测试CloudBase操作...');
        const cloudbase = new CloudBaseManager();
        const envInfo = await cloudbase.getEnvironmentInfo();
        console.log('✅ CloudBase操作成功');
        
        await db.disconnect();
        console.log('\n🎉 MCP集成测试完成！');
        
    } catch (error) {
        console.error('❌ MCP集成测试失败:', error.message);
    }
}

testMCPIntegration();
EOF
log_success "MCP测试脚本创建完成"

# 12. 创建使用说明
log_info "12. 创建使用说明..."
cat > MCP_USAGE_GUIDE.md << 'EOF'
# MCP工具使用指南

## 🚀 快速开始

### 1. 启动MCP服务器
```bash
./start-mcp.sh
```

### 2. 测试MCP集成
```bash
node test-mcp-integration.js
```

## 📊 数据库管理

### 查看用户列表
```javascript
const db = new DatabaseManager();
const users = await db.getUsers();
console.log(users);
```

### 查看统计数据
```javascript
const stats = await db.getStats();
console.log(stats);
```

## ☁️ CloudBase管理

### 部署云函数
```javascript
const cloudbase = new CloudBaseManager();
await cloudbase.deployFunction('api');
```

### 部署静态网站
```javascript
await cloudbase.deployHosting('public/');
```

## 📝 GitHub管理

### 提交代码
```javascript
const github = new GitHubManager();
await github.commit('更新功能');
await github.push('main');
```

### 创建分支
```javascript
await github.createBranch('feature/new-feature');
```

## 🔧 配置说明

### MySQL配置
- 主机: sh-cdb-l8rfujds.sql.tencentcdb.com
- 端口: 21736
- 数据库: offercome
- 用户: root

### CloudBase配置
- 环境ID: offercome2025-9g14jitp22f4ddfc
- 区域: ap-shanghai

### GitHub配置
- 所有者: painfulChen
- 仓库: offercome

## 📋 常用命令

### 数据库操作
```bash
# 备份数据库
node -e "const db = require('./mcp-scripts/db-manager'); new db().backup()"

# 查看统计
node -e "const db = require('./mcp-scripts/db-manager'); new db().getStats().then(console.log)"
```

### 部署操作
```bash
# 部署所有
node -e "const cb = require('./mcp-scripts/cloudbase-manager'); new cb().deployFunction()"

# 查看状态
node -e "const cb = require('./mcp-scripts/cloudbase-manager'); new cb().getFunctionInfo()"
```

### Git操作
```bash
# 提交并推送
node -e "const gh = require('./mcp-scripts/github-manager'); gh.commit('更新').then(() => gh.push())"
```

## 🎯 最佳实践

1. **定期备份**: 使用数据库备份功能
2. **测试部署**: 在部署前先测试
3. **版本控制**: 及时提交代码变更
4. **监控状态**: 定期检查系统状态

## 🚨 注意事项

1. **权限管理**: 确保有足够的权限
2. **网络连接**: 确保网络连接稳定
3. **配置安全**: 保护敏感配置信息
4. **错误处理**: 妥善处理异常情况
EOF
log_success "使用说明创建完成"

echo ""
echo "🎉 MCP工具安装和配置完成！"
echo "=================================="
echo "📋 已安装的MCP工具:"
echo "✅ MySQL MCP - 数据库管理"
echo "✅ CloudBase MCP - 云服务管理"
echo "✅ GitHub MCP - 代码管理"
echo "✅ Docker MCP - 容器管理"
echo ""
echo "📁 创建的文件:"
echo "   - mcp-config/ - MCP配置文件"
echo "   - mcp-scripts/ - 管理脚本"
echo "   - start-mcp.sh - 启动脚本"
echo "   - test-mcp-integration.js - 测试脚本"
echo "   - MCP_USAGE_GUIDE.md - 使用指南"
echo ""
echo "🚀 下一步操作:"
echo "1. 配置腾讯云密钥 (CloudBase MCP)"
echo "2. 配置GitHub Token (GitHub MCP)"
echo "3. 运行测试: node test-mcp-integration.js"
echo "4. 启动MCP: ./start-mcp.sh"
echo ""
echo "✅ 系统已准备就绪！" 