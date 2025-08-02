# 腾讯会议记录处理流水线

## 项目概述

这是一个完整的腾讯会议记录处理流水线，实现了从腾讯会议API获取记录 → 下载音频 → Kimi ASR转写 → LLM摘要分类 → 结构化入库的端到端自动化处理。

## 功能特性

- ✅ **腾讯会议API集成**: 自动获取会议记录列表和下载地址
- ✅ **音频处理**: 自动下载MP4文件并提取音频轨道
- ✅ **Kimi ASR转写**: 使用Kimi API进行高精度语音转写
- ✅ **智能摘要**: 使用Kimi LLM生成会议摘要和分类
- ✅ **数据库存储**: 结构化存储到MySQL数据库
- ✅ **定时任务**: 支持每日增量处理
- ✅ **错误处理**: 完善的错误处理和日志记录
- ✅ **监控统计**: 学生参与统计和处理进度监控

## 目录结构

```
meeting_pipeline/
├── .env                    # 环境变量配置
├── requirements.txt        # Python依赖
├── record_worker.py       # 核心处理逻辑
├── cron_incremental.py    # 增量处理脚本
├── deploy.sh             # 部署脚本
├── sql/
│   └── init.sql          # 数据库初始化脚本
├── logs/                 # 日志目录
└── README.md             # 项目文档
```

## 快速开始

### 1. 环境准备

确保系统已安装：
- Python 3.8+
- ffmpeg
- aria2
- MySQL客户端

### 2. 配置环境变量

编辑 `.env` 文件，填入真实的API密钥：

```env
# 腾讯会议开放平台
TQM_SECRET_ID=your_secret_id
TQM_SECRET_KEY=your_secret_key
ENTERPRISE_ID=your_enterprise_id
APP_ID=your_app_id

# 数据库配置
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

# Kimi API配置
KIMI_API_KEY=your_kimi_api_key
KIMI_BASE_URL=https://kimi.moonshot.cn/api

# 其他配置
TEACHER_WHITELIST=["teacher_001","teacher_002"]
LOG_LEVEL=INFO
```

### 3. 一键部署

```bash
cd meeting_pipeline
./deploy.sh
```

部署脚本会自动：
- 检查Python环境
- 安装系统依赖
- 创建虚拟环境
- 安装Python依赖
- 测试API连接
- 初始化数据库
- 配置定时任务

### 4. 手动测试

```bash
# 激活虚拟环境
source venv/bin/activate

# 测试全量处理（指定时间范围）
python3 record_worker.py 1640995200 1641081600

# 测试增量处理
python3 cron_incremental.py
```

## API接口说明

### 腾讯会议API

- **获取访问令牌**: `POST /v1/oauth/token`
- **获取记录列表**: `GET /v1/records`
- **获取下载地址**: `GET /v1/addresses`

### Kimi API

- **语音转写**: 使用Kimi Audio API
- **文本摘要**: 使用Kimi Chat API

## 数据库表结构

### recordings 表（会议记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 会议记录ID（主键） |
| meeting_id | VARCHAR(64) | 会议ID |
| start_ts | DATETIME | 开始时间 |
| end_ts | DATETIME | 结束时间 |
| student_ids | JSON | 学生ID列表 |
| phase | ENUM | 会议类型（简历优化/项目深挖/面试模拟/Offer后续/其他） |
| transcript | LONGTEXT | 转写文本 |
| summary | TEXT | 会议摘要 |
| play_url | TEXT | 播放地址 |
| download_url | TEXT | 下载地址 |
| status | ENUM | 处理状态 |
| created_at | TIMESTAMP | 创建时间 |

### student_stats 表（学生统计）

| 字段 | 类型 | 说明 |
|------|------|------|
| student_id | VARCHAR(64) | 学生ID（主键） |
| record_cnt | INT | 参与记录数 |
| total_duration | INT | 总时长（分钟） |
| last_record_at | DATETIME | 最后参与时间 |

## 定时任务配置

系统会自动配置crontab定时任务，每天凌晨3点执行增量处理：

```bash
0 3 * * * /tmp/meeting_cron.sh
```

## 日志监控

### 日志文件

- `logs/record_worker.log`: 主处理日志
- `logs/cron_incremental.log`: 增量处理日志
- `logs/cron.log`: 定时任务日志

### 监控命令

```bash
# 查看实时日志
tail -f logs/record_worker.log

# 查看处理状态
tail -f logs/cron_incremental.log

# 查看错误日志
grep ERROR logs/*.log
```

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查 `.env` 中的密钥配置
   - 确认网络连接正常
   - 验证API权限

2. **音频下载失败**
   - 检查aria2c是否安装
   - 确认网络带宽充足
   - 验证下载地址有效性

3. **数据库连接失败**
   - 检查数据库配置
   - 确认数据库服务运行
   - 验证用户权限

4. **Kimi API调用失败**
   - 检查API密钥配置
   - 确认API配额充足
   - 验证请求格式

### 调试模式

启用详细日志：

```bash
export LOG_LEVEL=DEBUG
python3 record_worker.py <start_ts> <end_ts>
```

## 性能优化

### 并发处理

可以通过修改 `record_worker.py` 中的处理逻辑，实现并发下载和处理：

```python
import asyncio
import aiohttp

async def process_records_concurrent(records):
    tasks = [process_record(record) for record in records]
    await asyncio.gather(*tasks)
```

### 缓存优化

- Token缓存：自动缓存2小时
- 文件缓存：避免重复下载
- 数据库连接池：复用连接

## 安全注意事项

1. **密钥安全**
   - `.env` 文件不要提交到Git
   - 定期轮换API密钥
   - 使用最小权限原则

2. **数据安全**
   - 音频文件及时清理
   - 敏感信息加密存储
   - 定期备份数据库

3. **访问控制**
   - 限制服务器访问
   - 监控异常访问
   - 记录操作日志

## 扩展功能

### 自定义处理逻辑

可以在 `process_record` 函数中添加自定义处理逻辑：

```python
def process_record(meta):
    # 现有处理逻辑
    ...
    
    # 自定义扩展
    custom_analysis(transcript)
    send_notification(record_data)
```

### 集成其他服务

- 企业微信通知
- 邮件报告
- 数据可视化
- 机器学习分析

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题，请联系项目维护者。 