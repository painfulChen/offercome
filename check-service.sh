#!/bin/bash

echo "🔍 检查服务状态和日志..."

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

send "echo '=== PM2状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== PM2日志 ==='\r"
expect "$ "
send "pm2 logs offercome-api --lines 20\r"
expect "$ "

send "echo '=== 端口检查 ==='\r"
expect "$ "
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "echo '=== 进程检查 ==='\r"
expect "$ "
send "ps aux | grep node\r"
expect "$ "

send "echo '=== 手动测试 ==='\r"
expect "$ "
send "curl -v http://localhost:3000/api/health\r"
expect "$ "

send "echo '=== 检查环境变量 ==='\r"
expect "$ "
send "cd ~/deploy-package && cat .env.production\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 检查完成！" 