#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
演示处理脚本
生成模拟的腾讯会议数据，展示完整的流水线效果
"""

import os
import time
import json
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pymysql
from loguru import logger

# 加载环境变量
load_dotenv()

# 配置日志
logger.add("logs/demo_processing.log", rotation="1 day", retention="7 days", level="INFO")

# 数据库配置
DB_CONFIG = {
    'host': os.getenv("DB_HOST"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASS"),
    'database': os.getenv("DB_NAME"),
    'charset': 'utf8mb4'
}

# Kimi API配置
KIMI_API_KEY = os.getenv("KIMI_API_KEY")
KIMI_BASE_URL = os.getenv("KIMI_BASE_URL", "https://kimi.moonshot.cn/api")

def generate_mock_meetings(count=10):
    """生成模拟的会议数据"""
    meetings = []
    
    # 会议类型
    phases = ['简历优化', '项目深挖', '面试模拟', 'Offer后续', '其他']
    
    # 学生ID列表
    student_ids = [
        "student_001", "student_002", "student_003", "student_004", "student_005",
        "student_006", "student_007", "student_008", "student_009", "student_010"
    ]
    
    # 教师ID列表
    teacher_ids = ["teacher_001", "teacher_002", "teacher_003"]
    
    # 模拟会议内容模板
    meeting_templates = [
        {
            "phase": "简历优化",
            "transcript": "今天我们主要讨论简历优化的问题。首先，你的简历结构需要调整，把最重要的项目经验放在前面。其次，每个项目都要用STAR法则来描述，即情境(Situation)、任务(Task)、行动(Action)、结果(Result)。最后，简历要突出你的技术栈和核心能力。",
            "summary": "会议主要讨论了简历优化的三个要点：结构调整、STAR法则应用、技术栈突出。"
        },
        {
            "phase": "项目深挖",
            "transcript": "关于你的项目经验，我们需要深入挖掘技术细节。这个电商系统你使用了哪些技术栈？数据库设计是如何考虑的？高并发场景下是如何处理的？缓存策略是什么？这些都是面试官会重点关注的。",
            "summary": "深入讨论了项目技术细节，包括技术栈、数据库设计、高并发处理和缓存策略。"
        },
        {
            "phase": "面试模拟",
            "transcript": "现在开始面试模拟。请介绍一下你自己。好的，接下来我们模拟技术面试环节。请解释一下什么是设计模式？单例模式有哪些实现方式？线程安全如何保证？这些问题你要准备充分。",
            "summary": "进行了面试模拟，包括自我介绍和技术面试环节，重点讨论了设计模式和线程安全。"
        },
        {
            "phase": "Offer后续",
            "transcript": "恭喜你拿到了Offer！现在我们来讨论后续的准备工作。入职前需要了解公司的技术栈，熟悉团队的工作流程。同时要准备一些入职后的学习计划，尽快融入团队。",
            "summary": "讨论了Offer后续准备工作，包括技术栈了解、工作流程熟悉和学习计划制定。"
        },
        {
            "phase": "其他",
            "transcript": "今天我们讨论一下职业规划的问题。短期目标是掌握核心技术，中期目标是成为团队的技术骨干，长期目标是技术管理或者架构师方向。每个阶段都要有明确的学习计划。",
            "summary": "讨论了职业规划，包括短期、中期和长期目标的设定和学习计划。"
        }
    ]
    
    # 生成最近30天的会议数据
    end_time = datetime.now()
    start_time = end_time - timedelta(days=30)
    
    for i in range(count):
        # 随机选择会议模板
        template = random.choice(meeting_templates)
        
        # 随机生成会议时间
        meeting_start = start_time + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(9, 18),
            minutes=random.randint(0, 59)
        )
        meeting_end = meeting_start + timedelta(
            hours=random.randint(1, 3),
            minutes=random.randint(0, 59)
        )
        
        # 随机选择参与者
        participants = random.sample(student_ids, random.randint(1, 3))
        participants.extend(random.sample(teacher_ids, random.randint(1, 2)))
        
        meeting = {
            "id": f"mock_record_{1000000 + i}",
            "meeting_id": f"meeting_{1000000 + i}",
            "start_ts": meeting_start.strftime("%Y-%m-%d %H:%M:%S"),
            "end_ts": meeting_end.strftime("%Y-%m-%d %H:%M:%S"),
            "student_ids": participants,
            "phase": template["phase"],
            "transcript": template["transcript"],
            "summary": template["summary"],
            "play_url": f"https://demo.com/play/{1000000 + i}",
            "download_url": f"https://demo.com/download/{1000000 + i}",
            "status": "completed"
        }
        
        meetings.append(meeting)
    
    return meetings

def save_to_database(meetings):
    """保存会议数据到数据库"""
    try:
        conn = pymysql.connect(**DB_CONFIG, autocommit=True)
        
        with conn.cursor() as cursor:
            for meeting in meetings:
                # 插入会议记录
                insert_sql = """
                INSERT IGNORE INTO recordings 
                (id, meeting_id, start_ts, end_ts, student_ids, phase, transcript, summary, 
                 play_url, download_url, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                cursor.execute(insert_sql, (
                    meeting['id'],
                    meeting['meeting_id'],
                    meeting['start_ts'],
                    meeting['end_ts'],
                    json.dumps(meeting['student_ids'], ensure_ascii=False),
                    meeting['phase'],
                    meeting['transcript'],
                    meeting['summary'],
                    meeting['play_url'],
                    meeting['download_url'],
                    meeting['status']
                ))
                
                # 更新学生统计
                for student_id in meeting['student_ids']:
                    if not student_id.startswith('teacher_'):
                        update_sql = """
                        INSERT INTO student_stats (student_id, record_cnt, last_record_at)
                        VALUES (%s, 1, %s)
                        ON DUPLICATE KEY UPDATE 
                        record_cnt = record_cnt + 1,
                        last_record_at = VALUES(last_record_at)
                        """
                        cursor.execute(update_sql, (student_id, meeting['start_ts']))
        
        conn.close()
        logger.info(f"成功保存 {len(meetings)} 条会议记录到数据库")
        
    except Exception as e:
        logger.error(f"数据库保存失败: {e}")
        raise

def test_kimi_api():
    """测试Kimi API连接"""
    try:
        import requests
        
        url = f"{KIMI_BASE_URL}/chat-messages"
        
        headers = {
            "Authorization": f"Bearer {KIMI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "你好，请简单回复一下测试消息。"
                }
            ],
            "stream": False
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        logger.info("✅ Kimi API连接成功")
        return True
        
    except Exception as e:
        logger.error(f"❌ Kimi API连接失败: {e}")
        return False

def main():
    """主函数"""
    logger.info("🚀 开始演示处理...")
    
    # 测试数据库连接
    try:
        conn = pymysql.connect(**DB_CONFIG)
        conn.close()
        logger.info("✅ 数据库连接成功")
    except Exception as e:
        logger.error(f"❌ 数据库连接失败: {e}")
        return
    
    # 测试Kimi API
    if test_kimi_api():
        logger.info("✅ Kimi API连接成功")
    else:
        logger.warning("⚠️ Kimi API连接失败，将使用模拟数据")
    
    # 生成模拟会议数据
    logger.info("📊 生成模拟会议数据...")
    meetings = generate_mock_meetings(20)  # 生成20条记录
    
    # 保存到数据库
    logger.info("💾 保存数据到数据库...")
    save_to_database(meetings)
    
    # 显示统计信息
    logger.info("📈 数据统计:")
    logger.info(f"   - 总会议数: {len(meetings)}")
    
    phase_stats = {}
    for meeting in meetings:
        phase = meeting['phase']
        phase_stats[phase] = phase_stats.get(phase, 0) + 1
    
    for phase, count in phase_stats.items():
        logger.info(f"   - {phase}: {count}条")
    
    logger.info("✅ 演示处理完成！")
    logger.info("现在可以访问管理后台查看数据: https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/admin-meetings-luxury.html")

if __name__ == "__main__":
    main() 