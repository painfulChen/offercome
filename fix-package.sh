#!/bin/bash

echo "🔧 修复package.json并重新安装依赖..."

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

send "echo '=== 停止PM2服务 ==='\r"
expect "$ "
send "pm2 delete all\r"
expect "$ "

send "echo '=== 删除node_modules ==='\r"
expect "$ "
send "rm -rf node_modules package-lock.json\r"
expect "$ "

send "echo '=== 重新安装依赖 ==='\r"
expect "$ "
send "npm install\r"
expect "$ "

send "echo '=== 启动服务 ==='\r"
expect "$ "
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

send "echo '=== 检查服务状态 ==='\r"
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

echo "✅ 修复完成！" 