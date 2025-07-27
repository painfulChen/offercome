#!/bin/bash

echo "🔍 检查并修复前端问题..."

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

send "echo '=== 检查PM2日志 ==='\r"
expect "$ "
send "pm2 logs offercome-api --lines 10\r"
expect "$ "

send "echo '=== 删除空文件 ==='\r"
expect "$ "
send "rm -f public/app.js public/styles.css\r"
expect "$ "

send "echo '=== 检查文件大小 ==='\r"
expect "$ "
send "ls -la public/\r"
expect "$ "

send "exit\r"
expect eof
EOF

# 重新上传文件
echo "📤 重新上传前端文件..."

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

# 验证上传
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

send "echo '=== 检查文件内容 ==='\r"
expect "$ "
send "head -5 public/index.html\r"
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

send "exit\r"
expect eof
EOF

echo "✅ 前端修复完成！" 