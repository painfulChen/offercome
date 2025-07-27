#!/bin/bash

echo "🔍 检查服务器上的文件内容..."

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

send "cd ~/deploy-package/server/routes\r"
expect "$ "

send "echo '=== AI路由文件内容 ==='\r"
expect "$ "
send "head -20 ai.js\r"
expect "$ "

send "echo '=== 检查asyncHandler导入 ==='\r"
expect "$ "
send "grep -n 'asyncHandler' ai.js\r"
expect "$ "

send "echo '=== 检查第8行内容 ==='\r"
expect "$ "
send "sed -n '8p' ai.js\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 检查完成！" 