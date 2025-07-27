#!/bin/bash

echo "📦 安装项目依赖..."

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

send "echo '=== 安装npm依赖 ==='\r"
expect "$ "
send "npm install\r"
expect "$ "

send "echo '=== 检查node_modules ==='\r"
expect "$ "
send "ls -la node_modules/ | head -10\r"
expect "$ "

send "echo '=== 启动服务 ==='\r"
expect "$ "
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

send "echo '=== 检查PM2状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 测试API ==='\r"
expect "$ "
send "sleep 3 && curl -s http://localhost:3000/api/health\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 依赖安装完成！" 