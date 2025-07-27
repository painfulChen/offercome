#!/bin/bash

echo "🔄 重启服务器服务..."

# 使用expect自动化SSH连接
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

send "echo '=== 检查当前状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 停止所有服务 ==='\r"
expect "$ "
send "pm2 delete all\r"
expect "$ "

send "echo '=== 检查项目目录 ==='\r"
expect "$ "
send "cd ~/deploy-package && ls -la\r"
expect "$ "

send "echo '=== 检查server目录 ==='\r"
expect "$ "
send "ls -la server/\r"
expect "$ "

send "echo '=== 重新安装依赖 ==='\r"
expect "$ "
send "npm install\r"
expect "$ "

send "echo '=== 启动服务 ==='\r"
expect "$ "
send "pm2 start server/index.js --name offercome-api\r"
expect "$ "

send "echo '=== 等待启动 ==='\r"
expect "$ "
send "sleep 5\r"
expect "$ "

send "echo '=== 检查服务状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 检查端口 ==='\r"
expect "$ "
send "netstat -tlnp | grep :3000\r"
expect "$ "

send "echo '=== 测试健康检查 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/api/health\r"
expect "$ "

send "echo '=== 测试AI聊天 ==='\r"
expect "$ "
send "curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{\"message\":\"你好\"}'\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 服务器重启完成！" 