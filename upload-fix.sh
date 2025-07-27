#!/bin/bash

echo "🔧 上传修复文件并重启服务..."

# 上传修复的文件
expect << 'EOF'
spawn scp server/routes/ai.js ubuntu@124.222.117.47:~/deploy-package/server/routes/
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

expect << 'EOF'
spawn scp server/services/ai.js ubuntu@124.222.117.47:~/deploy-package/server/services/
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

echo "✅ 文件上传完成"

# 重启服务
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

send "echo '=== 检查状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 查看日志 ==='\r"
expect "$ "
send "pm2 logs offercome-api --lines 10\r"
expect "$ "

send "echo '=== 测试API ==='\r"
expect "$ "
send "sleep 3 && curl -s http://localhost:3000/api/health\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 服务重启完成！" 