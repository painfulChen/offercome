#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
定时增量处理脚本
每天凌晨3点运行，处理前一天的会议记录
"""

import sys
import os
import logging
from datetime import datetime, timedelta

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from record_worker import run_incremental_processing

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/incremental_processing.log'),
        logging.StreamHandler()
    ]
)

def main():
    """主函数"""
    try:
        logging.info("🚀 开始定时增量处理")
        
        # 运行增量处理
        run_incremental_processing()
        
        logging.info("✅ 定时增量处理完成")
        
    except Exception as e:
        logging.error(f"❌ 定时增量处理失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 