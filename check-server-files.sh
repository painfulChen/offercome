#!/bin/bash

echo "🔍 检查服务器文件结构..."

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

send "echo '=== 检查目录结构 ==='\r"
expect "$ "
send "ls -la\r"
expect "$ "

send "echo '=== 检查public目录 ==='\r"
expect "$ "
send "ls -la public/\r"
expect "$ "

send "echo '=== 检查server目录 ==='\r"
expect "$ "
send "ls -la server/\r"
expect "$ "

send "echo '=== 检查index.html是否存在 ==='\r"
expect "$ "
send "ls -la public/index.html\r"
expect "$ "

send "echo '=== 检查styles.css是否存在 ==='\r"
expect "$ "
send "ls -la public/styles.css\r"
expect "$ "

send "echo '=== 检查app.js是否存在 ==='\r"
expect "$ "
send "ls -la public/app.js\r"
expect "$ "

send "echo '=== 测试静态文件访问 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/styles.css | head -5\r"
expect "$ "

send "echo '=== 测试app.js访问 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/app.js | head -5\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 文件结构检查完成！" 