#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动会议记录处理
处理从2024年10月1日到今天的会议记录
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from loguru import logger

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from record_worker import RecordProcessor

# 加载环境变量
load_dotenv()

# 配置日志
logger.add("logs/start_processing.log", rotation="1 day", retention="30 days", level="INFO")


def main():
    """主函数"""
    # 创建日志目录
    os.makedirs("logs", exist_ok=True)
    
    # 设置时间范围：从2024年10月1日到今天
    start_date = datetime(2024, 10, 1)
    end_date = datetime.now()
    
    start_ts = int(start_date.timestamp())
    end_ts = int(end_date.timestamp())
    
    logger.info(f"开始处理会议记录")
    logger.info(f"时间范围: {start_date.strftime('%Y-%m-%d')} 到 {end_date.strftime('%Y-%m-%d')}")
    logger.info(f"时间戳范围: {start_ts} 到 {end_ts}")
    
    try:
        # 创建处理器
        processor = RecordProcessor()
        
        # 开始批量处理
        processor.run_batch(start_ts, end_ts)
        
        logger.info("会议记录处理完成")
        
    except Exception as e:
        logger.error(f"处理失败: {e}")
        raise


if __name__ == "__main__":
    main() 