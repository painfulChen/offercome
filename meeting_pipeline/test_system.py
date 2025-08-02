#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统测试脚本
用于验证各个组件的功能
"""

import os
import sys
import json
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from loguru import logger

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from record_worker import TokenManager, MeetingAPI, KimiProcessor, DatabaseManager

# 加载环境变量
load_dotenv()

# 配置日志
logger.add("logs/test_system.log", rotation="1 day", retention="7 days", level="INFO")


def test_token_manager():
    """测试Token管理器"""
    print("🔑 测试Token管理器...")
    try:
        token_manager = TokenManager()
        token = token_manager.get_token()
        print(f"✅ Token获取成功: {token[:20]}...")
        return True
    except Exception as e:
        print(f"❌ Token获取失败: {e}")
        return False


def test_meeting_api():
    """测试腾讯会议API"""
    print("📞 测试腾讯会议API...")
    try:
        api = MeetingAPI()
        
        # 测试获取记录列表
        end_time = int(datetime.now().timestamp())
        start_time = end_time - 86400  # 24小时前
        
        records, total_pages = api.list_records(start_time, end_time, page=1, page_size=10)
        print(f"✅ API连接成功，获取到 {len(records)} 条记录")
        
        if records:
            # 测试获取记录地址
            record_id = records[0]['meeting_record_id']
            address_data = api.get_record_address(record_id)
            print(f"✅ 记录地址获取成功: {record_id}")
        
        return True
    except Exception as e:
        print(f"❌ API测试失败: {e}")
        return False


def test_database():
    """测试数据库连接"""
    print("🗄️  测试数据库连接...")
    try:
        db_manager = DatabaseManager()
        
        # 测试连接
        import pymysql
        conn = pymysql.connect(**db_manager.config)
        cursor = conn.cursor()
        
        # 测试查询
        cursor.execute("SELECT COUNT(*) FROM recordings")
        count = cursor.fetchone()[0]
        print(f"✅ 数据库连接成功，现有记录数: {count}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False


def test_kimi_api():
    """测试Kimi API"""
    print("🤖 测试Kimi API...")
    try:
        kimi = KimiProcessor()
        
        # 测试文本摘要
        test_text = "这是一个测试文本，用于验证Kimi API的功能。"
        summary, phase = kimi.summarize_text(test_text)
        print(f"✅ Kimi API测试成功，摘要: {summary[:50]}...")
        return True
    except Exception as e:
        print(f"❌ Kimi API测试失败: {e}")
        return False


def test_audio_tools():
    """测试音频处理工具"""
    print("🎵 测试音频处理工具...")
    
    # 检查ffmpeg
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ ffmpeg可用")
        else:
            print("❌ ffmpeg不可用")
            return False
    except Exception as e:
        print(f"❌ ffmpeg检查失败: {e}")
        return False
    
    # 检查aria2c
    try:
        result = subprocess.run(['aria2c', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ aria2c可用")
        else:
            print("❌ aria2c不可用")
            return False
    except Exception as e:
        print(f"❌ aria2c检查失败: {e}")
        return False
    
    return True


def test_environment():
    """测试环境变量"""
    print("🔧 测试环境变量...")
    
    required_vars = [
        'TQM_SECRET_ID',
        'TQM_SECRET_KEY', 
        'ENTERPRISE_ID',
        'APP_ID',
        'DB_HOST',
        'DB_USER',
        'DB_PASS',
        'DB_NAME',
        'KIMI_API_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            print(f"✅ {var}: {'*' * len(value)}")
    
    if missing_vars:
        print(f"❌ 缺少环境变量: {', '.join(missing_vars)}")
        return False
    
    print("✅ 所有必需的环境变量都已配置")
    return True


def run_all_tests():
    """运行所有测试"""
    print("🚀 开始系统测试...")
    print("=" * 50)
    
    tests = [
        ("环境变量", test_environment),
        ("Token管理器", test_token_manager),
        ("腾讯会议API", test_meeting_api),
        ("数据库连接", test_database),
        ("Kimi API", test_kimi_api),
        ("音频工具", test_audio_tools),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ 测试异常: {e}")
            results.append((test_name, False))
    
    # 输出测试结果
    print("\n" + "=" * 50)
    print("📊 测试结果汇总:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"{test_name:<15} {status}")
        if success:
            passed += 1
    
    print("-" * 50)
    print(f"总计: {total} 项测试")
    print(f"通过: {passed} 项")
    print(f"失败: {total - passed} 项")
    
    if passed == total:
        print("🎉 所有测试通过！系统可以正常运行。")
        return True
    else:
        print("⚠️  部分测试失败，请检查配置。")
        return False


def main():
    """主函数"""
    # 创建日志目录
    os.makedirs("logs", exist_ok=True)
    
    success = run_all_tests()
    
    if success:
        print("\n📋 下一步操作:")
        print("1. 运行全量处理测试:")
        print("   python record_worker.py --start-date 2024-01-01 --end-date 2024-01-01")
        print("2. 运行增量处理测试:")
        print("   python cron_incremental.py")
        print("3. 配置定时任务")
    else:
        print("\n🔧 故障排除:")
        print("1. 检查.env文件配置")
        print("2. 确保所有依赖已安装")
        print("3. 检查网络连接")
        print("4. 查看logs/test_system.log获取详细错误信息")


if __name__ == "__main__":
    main() 