# 🚀 GitHub同步指南

## 📋 前置准备

### 1. 确保Git配置正确
```bash
# 设置用户名和邮箱
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的邮箱地址"

# 检查配置
git config --list
```

### 2. 检查当前项目状态
```bash
# 查看Git状态
git status

# 查看提交历史
git log --oneline
```

## 🎯 同步步骤

### 步骤1: 在GitHub上创建仓库

1. 访问 [GitHub新建仓库页面](https://github.com/new)
2. 填写仓库信息：
   - **Repository name**: `offercome`
   - **Description**: `智能求职辅导平台 - 基于腾讯云CloudBase的AI驱动求职服务`
   - **Visibility**: 选择 `Public` 或 `Private`
   - **不要勾选** "Add a README file"
   - **不要勾选** "Add .gitignore"
   - **不要勾选** "Choose a license"
3. 点击 "Create repository"

### 步骤2: 获取仓库URL

创建完成后，GitHub会显示仓库URL，类似：
- HTTPS: `https://github.com/yourusername/offercome.git`
- SSH: `git@github.com:yourusername/offercome.git`

### 步骤3: 添加远程仓库

```bash
# 使用HTTPS（推荐）
git remote add origin https://github.com/yourusername/offercome.git

# 或使用SSH（需要配置SSH密钥）
git remote add origin git@github.com:yourusername/offercome.git
```

### 步骤4: 推送代码

```bash
# 推送主分支
git push -u origin main

# 如果遇到分支名称问题，可能需要：
git branch -M main
git push -u origin main
```

## 🔧 常见问题解决

### 问题1: 分支名称不匹配
```bash
# 查看当前分支
git branch

# 重命名分支为main
git branch -M main
```

### 问题2: 认证失败
```bash
# 如果使用HTTPS，需要输入GitHub用户名和密码
# 如果使用SSH，需要配置SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 问题3: 推送被拒绝
```bash
# 强制推送（谨慎使用）
git push -u origin main --force

# 或者先拉取远程更改
git pull origin main --allow-unrelated-histories
```

## 📊 项目信息

### 项目概览
- **项目名称**: OfferCome智能求职辅导平台
- **技术栈**: Node.js + CloudBase + HTML5 + CSS3 + JavaScript
- **部署平台**: 腾讯云CloudBase
- **在线地址**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/

### 主要功能
- ✅ 用户注册/登录系统
- ✅ AI智能聊天助手
- ✅ 求职建议生成
- ✅ 简历优化建议
- ✅ 面试技巧指导
- ✅ 响应式前端设计
- ✅ 云函数API服务

### 项目结构
```
offercome/
├── server/              # 后端API服务
├── public/              # 前端静态文件
├── miniprogram/         # 微信小程序
├── deploy-package/      # 部署包
├── docs/               # 文档
└── scripts/            # 部署脚本
```

## 🎉 同步完成后的操作

### 1. 完善GitHub仓库信息
- 添加项目描述
- 设置仓库主题标签
- 上传项目截图

### 2. 设置GitHub Pages（可选）
```bash
# 在仓库设置中启用GitHub Pages
# 选择分支: main
# 选择文件夹: / (root)
```

### 3. 创建Issues和Projects
- 创建功能需求Issues
- 设置项目看板
- 添加里程碑

### 4. 设置Actions（可选）
创建 `.github/workflows/deploy.yml` 来自动化部署

## 📝 后续维护

### 日常开发流程
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/new-feature

# 3. 开发完成后提交
git add .
git commit -m "feat: 添加新功能"

# 4. 推送到远程
git push origin feature/new-feature

# 5. 创建Pull Request
```

### 版本发布
```bash
# 创建标签
git tag -a v1.0.0 -m "发布版本1.0.0"
git push origin v1.0.0
```

## 🎯 一键同步脚本

运行以下命令使用自动同步脚本：
```bash
./sync-to-github.sh
```

## 📞 技术支持

如果遇到问题，可以：
1. 查看GitHub帮助文档
2. 检查网络连接
3. 验证Git配置
4. 确认仓库权限

---

**🎉 恭喜！您的项目已成功同步到GitHub！** 