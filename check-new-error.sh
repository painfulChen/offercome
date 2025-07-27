#!/bin/bash

echo "🔍 检查新API Key的错误日志..."

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

send "echo '=== 检查文件内容 ==='\r"
expect "$ "
send "head -10 server/services/kimi-real.js\r"
expect "$ "

send "echo '=== 手动启动测试 ==='\r"
expect "$ "
send "cd ~/deploy-package && node server/index.js\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 新错误日志检查完成！" 