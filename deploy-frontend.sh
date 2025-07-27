#!/bin/bash

echo "🔧 部署前端页面到服务器..."

# 创建public目录
mkdir -p public

# 上传前端文件
expect << 'EOF'
spawn scp -r public/ ubuntu@124.222.117.47:~/deploy-package/
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

echo "✅ 前端文件上传完成"

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

send "echo '=== 测试前端页面 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/ | head -20\r"
expect "$ "

send "echo '=== 测试外部访问 ==='\r"
expect "$ "
send "curl -s http://124.222.117.47:3000/ | head -10\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 前端页面部署完成！"
echo "🌐 访问地址: http://124.222.117.47:3000/" 