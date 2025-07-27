#!/bin/bash

echo "🔧 部署混合Kimi API (真实API + 模拟备用)..."

# 上传混合Kimi API文件
expect << 'EOF'
spawn scp server/services/kimi-hybrid.js ubuntu@124.222.117.47:~/deploy-package/server/services/kimi-real.js
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
spawn scp server/index-hybrid.js ubuntu@124.222.117.47:~/deploy-package/server/index.js
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

echo "✅ 混合Kimi API文件上传完成"

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

send "echo '=== 等待启动 ==='\r"
expect "$ "
send "sleep 5\r"
expect "$ "

send "echo '=== 检查状态 ==='\r"
expect "$ "
send "pm2 status\r"
expect "$ "

send "echo '=== 测试AI聊天 ==='\r"
expect "$ "
send "curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{\"message\":\"我想了解美国计算机科学硕士申请\"}'\r"
expect "$ "

send "echo '=== 测试招生建议 ==='\r"
expect "$ "
send "curl -s -X POST http://localhost:3000/api/ai/admission-advice -H 'Content-Type: application/json' -d '{\"name\":\"张三\",\"age\":\"25\",\"education\":\"本科计算机科学\",\"targetMajor\":\"计算机科学硕士\",\"budget\":\"50万人民币\",\"specialNeeds\":\"希望申请美国TOP50大学\"}'\r"
expect "$ "

send "echo '=== 测试AI状态 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/api/ai/status\r"
expect "$ "

send "echo '=== 测试外部访问 ==='\r"
expect "$ "
send "curl -s http://124.222.117.47:3000/api/health\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 混合Kimi API部署完成！" 