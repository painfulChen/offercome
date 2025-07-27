#!/bin/bash

echo "📤 上传修复后的package.json..."

expect << 'EOF'
spawn scp package.json ubuntu@124.222.117.47:~/deploy-package/
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

echo "✅ 上传完成！" 