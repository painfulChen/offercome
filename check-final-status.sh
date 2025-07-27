#!/bin/bash

echo "🔍 检查最终部署状态..."

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

send "echo '=== 端口检查 ==='\r"
expect "$ "
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "echo '=== MongoDB状态 ==='\r"
expect "$ "
send "sudo systemctl status mongod\r"
expect "$ "

send "echo '=== Redis状态 ==='\r"
expect "$ "
send "sudo systemctl status redis-server\r"
expect "$ "

send "echo '=== 项目目录 ==='\r"
expect "$ "
send "ls -la ~/deploy-package/\r"
expect "$ "

send "echo '=== 日志文件 ==='\r"
expect "$ "
send "ls -la ~/deploy-package/logs/\r"
expect "$ "

send "echo '=== 手动启动测试 ==='\r"
expect "$ "
send "cd ~/deploy-package && node server/index.js\r"
expect "$ "

send "exit\r"
expect eof
EOF 