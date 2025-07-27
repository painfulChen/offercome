#!/bin/bash

echo "在服务器上部署..."

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装MongoDB
if ! command -v mongod &> /dev/null; then
    echo "安装MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# 安装Redis
if ! command -v redis-server &> /dev/null; then
    echo "安装Redis..."
    sudo apt-get install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    sudo npm install -g pm2
fi

# 安装项目依赖
echo "安装项目依赖..."
npm install

# 创建日志目录
mkdir -p logs

# 启动服务
echo "启动服务..."
pm2 start server/index.js --name offercome-api

# 保存PM2配置
pm2 save
pm2 startup

echo "部署完成！"
echo "服务状态："
pm2 status
