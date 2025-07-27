#!/bin/bash

echo "🧪 测试简化版本..."

# 上传简化版本
expect << 'EOF'
spawn scp server/routes/ai-simple.js ubuntu@124.222.117.47:~/deploy-package/server/routes/ai.js
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
expect eof
EOF

echo "✅ 简化版本上传完成"

# 重启服务并测试
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

send "echo '=== 重启服务 ==='\r"
expect "$ "
send "pm2 restart offercome-api\r"
expect "$ "

send "echo '=== 等待服务启动 ==='\r"
expect "$ "
send "sleep 5\r"
expect "$ "

send "echo '=== 测试健康检查 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/api/ai/health\r"
expect "$ "

send "echo '=== 测试聊天接口 ==='\r"
expect "$ "
send "curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{\"message\":\"你好\"}'\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 简化版本测试完成！" 