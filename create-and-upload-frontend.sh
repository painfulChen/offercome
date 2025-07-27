#!/bin/bash

echo "📁 创建目录并上传前端文件..."

# 在服务器上创建public目录并上传文件
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

send "echo '=== 创建public目录 ==='\r"
expect "$ "
send "mkdir -p public\r"
expect "$ "

send "echo '=== 检查目录创建 ==='\r"
expect "$ "
send "ls -la\r"
expect "$ "

send "exit\r"
expect eof
EOF

# 上传前端文件
expect << 'EOF'
spawn scp public/index.html ubuntu@124.222.117.47:~/deploy-package/public/
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
spawn scp public/styles.css ubuntu@124.222.117.47:~/deploy-package/public/
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
spawn scp public/app.js ubuntu@124.222.117.47:~/deploy-package/public/
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

# 验证并重启服务
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

send "echo '=== 检查文件上传 ==='\r"
expect "$ "
send "ls -la public/\r"
expect "$ "

send "echo '=== 重启服务 ==='\r"
expect "$ "
send "pm2 restart offercome-api\r"
expect "$ "

send "echo '=== 等待启动 ==='\r"
expect "$ "
send "sleep 5\r"
expect "$ "

send "echo '=== 测试前端页面 ==='\r"
expect "$ "
send "curl -s http://localhost:3000/ | head -10\r"
expect "$ "

send "echo '=== 测试外部访问 ==='\r"
expect "$ "
send "curl -s http://124.222.117.47:3000/ | head -5\r"
expect "$ "

send "exit\r"
expect eof
EOF

echo "✅ 前端部署完成！"
echo "🌐 访问地址: http://124.222.117.47:3000/" 