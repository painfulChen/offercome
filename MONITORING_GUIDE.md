# 📊 API监控系统使用指南

## 🚀 快速启动

### 1. 部署服务器端监控
```bash
./deploy-monitoring.sh
```

### 2. 测试服务器端监控
```bash
./test-server-monitoring.sh
```

### 3. 本地监控 (开发环境)
```bash
./start-monitoring.sh
```

### 4. 选择监控方式
- **选项1**: 实时API监控 (命令行)
- **选项2**: 成本分析器 (交互式)
- **选项3**: Web监控面板
- **选项4**: 完整监控系统
- **选项5**: 查看当前成本统计

## 📊 监控功能

### 🔍 实时API监控
- **功能**: 监控API调用情况、响应时间、成功率
- **启动**: `./monitor-api-cost.sh`
- **特点**: 
  - 实时监控API健康状态
  - 跟踪AI聊天调用
  - 记录成本数据
  - 自动检测异常

### 💰 成本分析器
- **功能**: 详细分析API调用成本
- **启动**: `./cost-analyzer.sh`
- **特点**:
  - 按日期统计成本
  - 按API类型分析
  - 成功率统计
  - 成本预测
  - 生成成本报告

### 🌐 Web监控面板
- **访问**: http://localhost:3000/cost-dashboard.html
- **功能**:
  - 实时成本统计
  - 可视化图表
  - 自动刷新
  - 移动端适配

## 📈 监控指标

### API调用统计
| 指标 | 说明 | 成本 |
|------|------|------|
| Kimi AI聊天 | 真实Kimi API调用 | ¥0.01/次 |
| 模拟AI聊天 | 本地模拟响应 | 免费 |
| 健康检查 | API状态检查 | 免费 |
| 建议生成 | 招生建议生成 | 免费 |
| 状态检查 | 服务状态检查 | 免费 |

### 成本跟踪
- **总调用次数**: 所有API调用的累计次数
- **总成本**: 所有付费API调用的累计成本
- **平均成本**: 每次调用的平均成本
- **API类型数**: 不同API类型的数量

## 🔧 配置说明

### 环境变量
```bash
# .env 文件
NODE_ENV=development
PORT=3000
KIMI_API_KEY=your_kimi_api_key_here
CLOUDBASE_ENV_ID=offercome2025-9g14jitp22f4ddfc
```

### 日志文件
- **API监控日志**: `logs/api-monitor.log`
- **成本跟踪日志**: `logs/cost-tracker.log`
- **成本报告**: `logs/cost-report-YYYYMMDD.txt`

## 📱 访问地址

### 服务器端访问
- **Web监控面板**: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/cost-dashboard.html
- **监控路由**: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/monitor
- **API统计接口**: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/cost/stats
- **健康检查**: https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api/health

### 本地访问 (开发环境)
- **Web监控面板**: http://localhost:3000/cost-dashboard.html
- **API统计接口**: http://localhost:3000/api/cost/stats
- **健康检查**: http://localhost:3000/api/health

## 🛠️ 故障排除

### 常见问题

#### 1. 监控面板无法访问
```bash
# 检查服务器状态
curl http://localhost:3000/api/health

# 重启服务器
pkill -f "node server/simple-api.js"
node server/simple-api.js
```

#### 2. 成本数据不更新
```bash
# 检查日志文件
tail -f logs/cost-tracker.log

# 手动触发API调用
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "测试"}'
```

#### 3. Kimi API配置
```bash
# 配置Kimi API Key
./setup-real-kimi.sh

# 检查配置
echo $KIMI_API_KEY
```

## 📊 监控命令

### 查看实时统计
```bash
curl -s "http://localhost:3000/api/cost/stats" | python3 -m json.tool
```

### 查看成本日志
```bash
tail -f logs/cost-tracker.log
```

### 生成成本报告
```bash
./cost-analyzer.sh
# 选择选项3: 生成成本报告
```

## 🎯 最佳实践

### 1. 定期监控
- 每天检查成本统计
- 每周生成成本报告
- 监控异常调用

### 2. 成本控制
- 设置成本预警
- 监控Kimi API使用量
- 优化调用频率

### 3. 性能优化
- 监控API响应时间
- 检查成功率
- 优化调用策略

## 📞 技术支持

### 日志位置
- `/logs/api-monitor.log` - API监控日志
- `/logs/cost-tracker.log` - 成本跟踪日志
- `/logs/auto-monitor.log` - 自动监控日志

### 调试命令
```bash
# 查看服务器日志
tail -f logs/api-monitor.log

# 检查成本数据
cat logs/cost-tracker.log

# 测试API功能
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "测试消息"}'
```

---

**🎉 监控系统已完全配置！现在可以实时跟踪API调用情况和成本了！** 