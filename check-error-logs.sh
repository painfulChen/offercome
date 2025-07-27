#!/bin/bash

echo "🔍 检查服务器错误日志..."

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

send "echo '=== PM2 错误日志 ==='\r"
expect "$ "
send "pm2 logs offercome-api --lines 20\r"
expect "$ "

send "echo '=== 检查文件是否存在 ==='\r"
expect "$ "
send "ls -la server/services/\r"
expect "$ "

send "echo '=== 检查index.js内容 ==='\r"
expect "$ "
send "head -20 server/index.js\r"
expect "$ "

send "echo '=== 手动启动测试 ==='\r"
expect "$ "
send "cd ~/deploy-package && node server/index.js\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 错误日志检查完成！" 