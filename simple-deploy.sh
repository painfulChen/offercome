#!/bin/bash

echo "🚀 简化部署方案..."

# 创建简化的package.json
cat > package-simple.json << 'EOF'
{
  "name": "offercome-api",
  "version": "1.0.0",
  "description": "招生管理系统API",
  "main": "server/index.js",
  "scripts": {
    "dev": "nodemon server/index.js",
    "start": "node server/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "multer": "^1.4.5-lts.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "mongoose": "^8.0.0",
    "redis": "^4.6.10",
    "socket.io": "^4.7.4",
    "moment": "^2.29.4",
    "lodash": "^4.17.21",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

echo "✅ 创建简化package.json完成"

# 上传简化版本
expect << 'EOF'
spawn scp package-simple.json ubuntu@124.222.117.47:~/deploy-package/package.json
expect {
    "password:" {
        send "Somkouny2016@g\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "Somkouny2016@g\r"
    }
}
expect eof
EOF

echo "✅ 上传简化package.json完成"

# 在服务器上重新安装和启动
expect << 'EOF'
spawn ssh ubuntu@124.222.117.47
expect {
    "password:" {
        send "Somkouny2016@g\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "Somkouny2016@g\r"
    }
}
expect "$ "

send "cd ~/deploy-package\r"
expect "$ "

send "echo '=== 停止现有服务 ==='\r"
expect "$ "
send "pm2 delete all\r"
expect "$ "

send "echo '=== 清理依赖 ==='\r"
expect "$ "
send "rm -rf node_modules package-lock.json\r"
expect "$ "

send "echo '=== 安装简化依赖 ==='\r"
expect "$ "
send "npm install\r"
expect "$ "

send "echo '=== 启动服务 ==='\r"
expect "$ "
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

send "echo '=== 检查状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 测试API ==='\r"
expect "$ "
send "sleep 5 && curl -s http://localhost:3000/api/health\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 简化部署完成！" 