#!/bin/bash

echo "🔍 检查服务器错误..."

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

send "echo '=== 检查PM2状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 查看错误日志 ==='\r"
expect "$ "
send "pm2 logs offercome-api --lines 20\r"
expect "$ "

send "echo '=== 检查文件是否存在 ==='\r"
expect "$ "
send "ls -la public/\r"
expect "$ "

send "echo '=== 检查服务器文件 ==='\r"
expect "$ "
send "ls -la server/\r"
expect "$ "

send "echo '=== 手动启动测试 ==='\r"
expect "$ "
send "cd server && node index.js\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 错误检查完成！" 