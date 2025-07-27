#!/bin/bash

echo "🔧 手动启动服务..."

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

send "echo '=== 检查防火墙 ==='\r"
expect "$ "
send "sudo ufw status\r"
expect "$ "

send "echo '=== 检查端口3000 ==='\r"
expect "$ "
send "sudo lsof -i :3000\r"
expect "$ "

send "echo '=== 手动启动服务 ==='\r"
expect "$ "
send "cd ~/deploy-package\r"
expect "$ "
send "NODE_ENV=production PORT=3000 node server/index.js\r"
expect "$ "

send "exit\r"
expect eof
EOF 