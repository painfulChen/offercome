#!/bin/bash

echo "🔍 检查服务器安装状态..."

SERVER_IP="124.222.117.47"
SERVER_USER="ubuntu"
SERVER_PASSWORD="Somkouny2016@g"

expect << EOF
spawn ssh $SERVER_USER@$SERVER_IP
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$SERVER_PASSWORD\r"
    }
}
expect "$ "

send "echo '=== 检查Node.js安装状态 ==='\r"
expect "$ "
send "node --version\r"
expect "$ "

send "echo '=== 检查npm安装状态 ==='\r"
expect "$ "
send "npm --version\r"
expect "$ "

send "echo '=== 检查MongoDB安装状态 ==='\r"
expect "$ "
send "mongod --version\r"
expect "$ "

send "echo '=== 检查Redis安装状态 ==='\r"
expect "$ "
send "redis-server --version\r"
expect "$ "

send "echo '=== 检查PM2安装状态 ==='\r"
expect "$ "
send "pm2 --version\r"
expect "$ "

send "echo '=== 检查当前进程 ==='\r"
expect "$ "
send "ps aux | grep -E '(node|npm|apt|install)' | grep -v grep\r"
expect "$ "

send "echo '=== 检查部署目录 ==='\r"
expect "$ "
send "ls -la ~/deploy-package/\r"
expect "$ "

send "echo '=== 检查端口3000 ==='\r"
expect "$ "
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "exit\r"
expect eof
EOF 