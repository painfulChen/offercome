#!/bin/bash

echo "🚀 完成服务器部署..."

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

send "cd ~/deploy-package\r"
expect "$ "

send "echo '=== 安装MongoDB ==='\r"
expect "$ "
send "sudo apt-get update\r"
expect "$ "
send "wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -\r"
expect "$ "
send "echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list\r"
expect "$ "
send "sudo apt-get update\r"
expect "$ "
send "sudo apt-get install -y mongodb-org\r"
expect "$ "
send "sudo systemctl start mongod\r"
expect "$ "
send "sudo systemctl enable mongod\r"
expect "$ "

send "echo '=== 安装Redis ==='\r"
expect "$ "
send "sudo apt-get install -y redis-server\r"
expect "$ "
send "sudo systemctl start redis-server\r"
expect "$ "
send "sudo systemctl enable redis-server\r"
expect "$ "

send "echo '=== 安装项目依赖 ==='\r"
expect "$ "
send "npm install\r"
expect "$ "

send "echo '=== 创建日志目录 ==='\r"
expect "$ "
send "mkdir -p logs\r"
expect "$ "

send "echo '=== 启动API服务 ==='\r"
expect "$ "
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

send "echo '=== 保存PM2配置 ==='\r"
expect "$ "
send "pm2 save\r"
expect "$ "
send "pm2 startup\r"
expect "$ "

send "echo '=== 检查服务状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 检查端口 ==='\r"
expect "$ "
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "echo '=== 测试API ==='\r"
expect "$ "
send "curl -s http://localhost:3000/api/health\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 部署完成！" 