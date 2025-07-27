#!/bin/bash

echo "🔍 简单状态检查..."

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

send "pm2 list\r"
expect "$ "

send "netstat -tlnp | grep :3000\r"
expect "$ "

send "cd ~/deploy-package && ls -la\r"
expect "$ "

send "exit\r"
expect eof
EOF 