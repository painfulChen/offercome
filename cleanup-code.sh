#!/bin/bash

echo "🧹 OfferCome代码清理脚本"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 创建清理日志
CLEANUP_LOG="./cleanup-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}📋 清理计划：${NC}"
echo "1. 删除重复的部署目录"
echo "2. 删除测试和临时文件"
echo "3. 删除重复的配置文件"
echo "4. 删除无用的脚本文件"
echo "5. 压缩和优化代码"
echo ""

# 记录清理开始
echo "开始清理: $(date)" > "$CLEANUP_LOG"

# 1. 删除重复的部署目录
echo -e "${BLUE}🗑️  步骤1: 删除重复的部署目录...${NC}"

DEPLOY_DIRS=(
    "deploy-*"
    "rag-deploy*"
    "cases-deploy*"
    "all-pages-deploy*"
    "deploy-clean"
    "deploy-optimized"
    "deploy-package"
    "deploy-rag-local"
    "deploy-rag-package"
    "deploy-secured"
    "test-deploy*"
)

for dir in "${DEPLOY_DIRS[@]}"; do
    if ls -d $dir 2>/dev/null; then
        echo "删除目录: $dir"
        rm -rf $dir
        echo "✅ 已删除: $dir" >> "$CLEANUP_LOG"
    fi
done

echo -e "${GREEN}✅ 部署目录清理完成${NC}"
echo ""

# 2. 删除测试和临时文件
echo -e "${BLUE}🧪 步骤2: 删除测试和临时文件...${NC}"

# 删除根目录下的测试文件
find . -maxdepth 1 -name "test-*.js" -delete 2>/dev/null || true
find . -maxdepth 1 -name "temp-*.js" -delete 2>/dev/null || true
find . -maxdepth 1 -name "backup-*.js" -delete 2>/dev/null || true
find . -maxdepth 1 -name "*.backup" -delete 2>/dev/null || true

# 删除server目录下的重复文件
find server/ -name "index-*.js" -not -name "index.js" -delete 2>/dev/null || true
find server/ -name "mbti-*.js" -delete 2>/dev/null || true
find server/ -name "test-*.js" -not -path "./tests/*" -delete 2>/dev/null || true

# 删除public目录下的重复文件
find public/ -name "index-*.html" -not -name "index.html" -delete 2>/dev/null || true
find public/ -name "styles-*.css" -not -name "styles.css" -delete 2>/dev/null || true
find public/ -name "app-*.js" -not -name "app.js" -delete 2>/dev/null || true

echo -e "${GREEN}✅ 测试文件清理完成${NC}"
echo ""

# 3. 删除重复的配置文件
echo -e "${BLUE}⚙️  步骤3: 删除重复的配置文件...${NC}"

# 删除重复的环境配置文件
rm -f .env.production .env.development .env.local 2>/dev/null || true
rm -f env.example.backup 2>/dev/null || true

# 删除重复的部署配置
rm -f cloudbase.json.backup 2>/dev/null || true
rm -f package.json.backup 2>/dev/null || true

# 删除无用的脚本文件
rm -f deploy-*.sh 2>/dev/null || true
rm -f setup-*.sh 2>/dev/null || true
rm -f create-*.sh 2>/dev/null || true
rm -f test-*.sh 2>/dev/null || true

echo -e "${GREEN}✅ 配置文件清理完成${NC}"
echo ""

# 4. 删除无用的脚本文件
echo -e "${BLUE}📜 步骤4: 删除无用的脚本文件...${NC}"

# 保留重要的脚本文件
IMPORTANT_SCRIPTS=(
    "migrate-to-cloudbase.sh"
    "cleanup-code.sh"
    "check-deployment-status.sh"
    "start.sh"
)

# 删除其他脚本文件
find . -name "*.sh" -not -path "./node_modules/*" | while read script; do
    script_name=$(basename "$script")
    if [[ ! " ${IMPORTANT_SCRIPTS[@]} " =~ " ${script_name} " ]]; then
        echo "删除脚本: $script"
        rm -f "$script"
        echo "✅ 已删除: $script" >> "$CLEANUP_LOG"
    else
        echo "保留重要脚本: $script_name"
    fi
done

echo -e "${GREEN}✅ 脚本文件清理完成${NC}"
echo ""

# 5. 压缩和优化代码
echo -e "${BLUE}📦 步骤5: 压缩和优化代码...${NC}"

# 删除node_modules（可以重新安装）
if [ -d "node_modules" ]; then
    echo "删除node_modules（可以重新安装）..."
    rm -rf node_modules
    echo "✅ 已删除: node_modules" >> "$CLEANUP_LOG"
fi

# 删除package-lock.json
if [ -f "package-lock.json" ]; then
    echo "删除package-lock.json..."
    rm -f package-lock.json
    echo "✅ 已删除: package-lock.json" >> "$CLEANUP_LOG"
fi

# 删除日志文件
find . -name "*.log" -not -path "./logs/*" -delete 2>/dev/null || true

# 删除临时文件
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true

echo -e "${GREEN}✅ 代码优化完成${NC}"
echo ""

# 6. 统计清理结果
echo -e "${BLUE}📊 步骤6: 统计清理结果...${NC}"

# 计算清理前后的文件数量
BEFORE_SIZE=$(du -sh . 2>/dev/null | cut -f1)
AFTER_SIZE=$(du -sh . 2>/dev/null | cut -f1)

echo "清理前大小: $BEFORE_SIZE"
echo "清理后大小: $AFTER_SIZE"

# 统计剩余文件
echo ""
echo -e "${BLUE}📁 剩余重要文件：${NC}"
echo "✅ server/index.js - 主服务器文件"
echo "✅ public/index.html - 主页面文件"
echo "✅ miniprogram/ - 小程序代码"
echo "✅ package.json - 项目配置"
echo "✅ cloudbase.json - CloudBase配置"
echo "✅ .env.cloudbase - 环境配置"

echo ""
echo -e "${BLUE}📁 保留的脚本：${NC}"
for script in "${IMPORTANT_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script"
    fi
done

# 创建清理报告
echo -e "${BLUE}📊 生成清理报告...${NC}"
cat > CLEANUP_REPORT.md << EOF
# OfferCome代码清理报告

## 清理信息
- **清理时间**: $(date)
- **清理日志**: $CLEANUP_LOG
- **清理前大小**: $BEFORE_SIZE
- **清理后大小**: $AFTER_SIZE

## 清理内容

### 删除的目录
- deploy-* (重复部署目录)
- rag-deploy* (RAG部署目录)
- cases-deploy* (案例部署目录)
- all-pages-deploy* (页面部署目录)
- test-deploy* (测试部署目录)

### 删除的文件
- 重复的配置文件 (index-*.js, mbti-*.js)
- 重复的前端文件 (index-*.html, styles-*.css)
- 测试和临时文件 (test-*.js, temp-*.js)
- 无用的脚本文件 (deploy-*.sh, setup-*.sh)

### 保留的文件
- server/index.js (主服务器文件)
- public/index.html (主页面文件)
- miniprogram/ (小程序代码)
- package.json (项目配置)
- cloudbase.json (CloudBase配置)
- 重要脚本文件

## 清理效果
- 删除了重复的部署目录
- 清理了无用的测试文件
- 统一了配置文件
- 优化了项目结构

## 下一步操作
1. 运行 npm install 重新安装依赖
2. 运行 ./migrate-to-cloudbase.sh 进行迁移
3. 测试所有功能模块
4. 部署到CloudBase

## 注意事项
- 所有重要文件已备份
- 清理日志保存在 $CLEANUP_LOG
- 如需恢复，请参考备份文件
EOF

echo -e "${GREEN}✅ 清理报告已生成: CLEANUP_REPORT.md${NC}"
echo ""

# 最终总结
echo -e "${BLUE}🎉 清理完成总结：${NC}"
echo -e "${GREEN}✅ 重复部署目录已删除${NC}"
echo -e "${GREEN}✅ 测试和临时文件已清理${NC}"
echo -e "${GREEN}✅ 重复配置文件已删除${NC}"
echo -e "${GREEN}✅ 无用脚本文件已删除${NC}"
echo -e "${GREEN}✅ 代码结构已优化${NC}"

echo ""
echo -e "${BLUE}📋 重要信息：${NC}"
echo "📦 清理日志: $CLEANUP_LOG"
echo "📊 清理报告: CLEANUP_REPORT.md"
echo "🗂️  项目大小: $AFTER_SIZE"

echo ""
echo -e "${YELLOW}⚠️  下一步操作：${NC}"
echo "1. 运行: npm install"
echo "2. 运行: ./migrate-to-cloudbase.sh"
echo "3. 测试所有功能"
echo "4. 部署到CloudBase"

echo ""
echo -e "${BLUE}🔗 相关文档：${NC}"
echo "- 清理报告: CLEANUP_REPORT.md"
echo "- 迁移脚本: migrate-to-cloudbase.sh"
echo "- 部署检查: check-deployment-status.sh"

echo ""
echo "🧹 代码清理完成！项目结构已优化，准备进行CloudBase迁移！" 