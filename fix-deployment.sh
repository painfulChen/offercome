#!/bin/bash

echo "🔧 修复部署问题..."

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

send "echo '=== 修复Redis安装 ==='\r"
expect "$ "
send "sudo apt-get install -y redis-server\r"
expect "$ "
send "sudo systemctl start redis-server\r"
expect "$ "
send "sudo systemctl enable redis-server\r"
expect "$ "

send "echo '=== 检查MongoDB ==='\r"
expect "$ "
send "sudo systemctl start mongod\r"
expect "$ "
send "sudo systemctl enable mongod\r"
expect "$ "

send "echo '=== 重新安装项目依赖 ==='\r"
expect "$ "
send "cd ~/deploy-package && npm install\r"
expect "$ "

send "echo '=== 启动API服务 ==='\r"
expect "$ "
send "pm2 delete all\r"
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