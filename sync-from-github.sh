#!/bin/bash

# GitHub到云服务同步脚本
echo "🔄 GitHub到云服务同步脚本"
echo "=========================="

# 配置信息
GITHUB_REPO="https://github.com/painfulChen/offercome.git"
CLOUD_ENV_ID="offercome2025-9g14jitp22f4ddfc"

echo "📋 同步配置："
echo "   GitHub仓库: $GITHUB_REPO"
echo "   云环境ID: $CLOUD_ENV_ID"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ] && [ ! -f "server/package.json" ]; then
    echo "❌ 当前目录不是项目根目录"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查Git状态
echo "📊 检查Git状态..."
git status

echo ""
echo "🎯 选择同步方式："
echo "1. 从GitHub拉取最新代码并部署"
echo "2. 仅拉取代码（不部署）"
echo "3. 仅部署当前代码"
echo "4. 查看部署状态"
echo ""

read -p "请选择操作 (1-4): " choice

case $choice in
    1)
        echo "🔄 从GitHub拉取最新代码并部署..."
        
        # 拉取最新代码
        echo "📥 拉取最新代码..."
        git pull origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ 代码拉取成功"
            
            # 部署到云服务
            echo "🚀 部署到云服务..."
            ./deploy-complete-api.sh
            
            if [ $? -eq 0 ]; then
                echo "🎉 同步和部署完成！"
                echo ""
                echo "📊 项目信息："
                echo "   - 前端地址: https://$CLOUD_ENV_ID.tcloudbaseapp.com/"
                echo "   - API地址: https://$CLOUD_ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
                echo "   - GitHub仓库: $GITHUB_REPO"
            else
                echo "❌ 部署失败"
            fi
        else
            echo "❌ 代码拉取失败"
        fi
        ;;
        
    2)
        echo "📥 仅拉取最新代码..."
        git pull origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ 代码拉取成功"
            echo "💡 如需部署，请运行: ./deploy-complete-api.sh"
        else
            echo "❌ 代码拉取失败"
        fi
        ;;
        
    3)
        echo "🚀 部署当前代码到云服务..."
        ./deploy-complete-api.sh
        
        if [ $? -eq 0 ]; then
            echo "🎉 部署完成！"
            echo ""
            echo "📊 项目信息："
            echo "   - 前端地址: https://$CLOUD_ENV_ID.tcloudbaseapp.com/"
            echo "   - API地址: https://$CLOUD_ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
        else
            echo "❌ 部署失败"
        fi
        ;;
        
    4)
        echo "📊 查看部署状态..."
        
        # 检查云函数状态
        echo "🔍 检查云函数状态..."
        tcb fn list
        
        # 检查HTTP服务状态
        echo "🔍 检查HTTP服务状态..."
        tcb service:list
        
        # 检查前端部署状态
        echo "🔍 检查前端部署状态..."
        curl -s "https://$CLOUD_ENV_ID.tcloudbaseapp.com/" | head -5
        
        echo ""
        echo "📊 项目链接："
        echo "   - 前端地址: https://$CLOUD_ENV_ID.tcloudbaseapp.com/"
        echo "   - API地址: https://$CLOUD_ENV_ID-1256790827.ap-shanghai.app.tcloudbase.com/api-v2"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "💡 提示："
echo "   - 如需自动同步，可设置GitHub Actions"
echo "   - 如需定时同步，可设置cron任务"
echo "   - 如需手动同步，运行此脚本即可" 