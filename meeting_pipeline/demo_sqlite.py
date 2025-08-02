#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
演示会议记录处理流程 (SQLite版本)
模拟300多个会议记录的处理
"""

import os
import time
import json
import random
import sqlite3
from datetime import datetime, timedelta
from dotenv import load_dotenv
from loguru import logger

# 加载环境变量
load_dotenv()

# 配置日志
logger.add("logs/demo_processing.log", rotation="1 day", retention="30 days", level="INFO")

# SQLite数据库文件
DB_FILE = "meeting_data.db"

# 模拟数据
PHASES = ['简历优化', '项目深挖', '面试模拟', 'Offer后续', '其他']
STUDENT_IDS = [f"student_{i:03d}" for i in range(1, 51)]
TEACHER_IDS = [f"teacher_{i:02d}" for i in range(1, 11)]

def init_sqlite_database():
    """初始化SQLite数据库"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 创建表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recordings (
                id INTEGER PRIMARY KEY,
                meeting_id TEXT NOT NULL,
                start_ts DATETIME NOT NULL,
                end_ts DATETIME NOT NULL,
                student_ids TEXT,
                phase TEXT DEFAULT '其他',
                transcript TEXT,
                summary TEXT,
                play_url TEXT,
                download_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS student_stats (
                student_id TEXT PRIMARY KEY,
                record_cnt INTEGER DEFAULT 0,
                total_duration INTEGER DEFAULT 0,
                last_record_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS process_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER,
                status TEXT DEFAULT 'pending',
                error_message TEXT,
                process_time INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 清空现有数据
        cursor.execute("DELETE FROM recordings")
        cursor.execute("DELETE FROM student_stats")
        cursor.execute("DELETE FROM process_logs")
        
        conn.commit()
        conn.close()
        logger.info("SQLite数据库初始化完成")
        return True
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")
        return False

def create_demo_records():
    """创建演示会议记录"""
    records = []
    
    # 从2024年10月1日到今天，每天1-3个会议
    start_date = datetime(2024, 10, 1)
    end_date = datetime.now()
    current_date = start_date
    
    record_id = 1000001
    
    while current_date <= end_date:
        # 每天1-3个会议
        daily_meetings = random.randint(1, 3)
        
        for i in range(daily_meetings):
            # 会议时间
            meeting_start = current_date.replace(
                hour=random.randint(9, 18),
                minute=random.randint(0, 59)
            )
            meeting_end = meeting_start + timedelta(hours=random.randint(1, 3))
            
            # 参与者
            num_students = random.randint(1, 3)
            num_teachers = random.randint(1, 2)
            
            students = random.sample(STUDENT_IDS, num_students)
            teachers = random.sample(TEACHER_IDS, num_teachers)
            
            # 会议记录
            record = {
                'id': record_id,
                'meeting_id': f"meeting_{record_id}",
                'start_ts': meeting_start,
                'end_ts': meeting_end,
                'student_ids': json.dumps(students, ensure_ascii=False),
                'phase': random.choice(PHASES),
                'transcript': f"这是第{record_id}次会议的转写内容。会议讨论了{random.choice(['简历优化', '项目经验', '面试技巧', '职业规划'])}相关话题。参与者包括{', '.join(students)}和{', '.join(teachers)}。会议持续了{(meeting_end - meeting_start).seconds // 3600}小时，内容充实，互动良好。",
                'summary': f"会议主要讨论了{random.choice(['简历优化', '项目经验', '面试技巧', '职业规划'])}，参与者积极互动，收获颇丰。",
                'play_url': f"https://demo.com/play/{record_id}",
                'download_url': f"https://demo.com/download/{record_id}",
                'created_at': datetime.now() - timedelta(days=random.randint(0, 30))
            }
            
            records.append(record)
            record_id += 1
        
        current_date += timedelta(days=1)
    
    return records

def save_records(records):
    """保存记录到数据库"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        for record in records:
            # 插入记录
            cursor.execute('''
                INSERT INTO recordings
                (id, meeting_id, start_ts, end_ts, student_ids, phase, 
                 transcript, summary, play_url, download_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                record['id'], record['meeting_id'], record['start_ts'], 
                record['end_ts'], record['student_ids'], record['phase'],
                record['transcript'], record['summary'], record['play_url'], 
                record['download_url'], record['created_at']
            ))
            
            # 更新学生统计
            student_ids = json.loads(record['student_ids'])
            for student_id in student_ids:
                cursor.execute('''
                    INSERT INTO student_stats(student_id, record_cnt)
                    VALUES(?, 1) 
                    ON CONFLICT(student_id) DO UPDATE SET 
                    record_cnt = record_cnt + 1
                ''', (student_id,))
            
            # 记录处理日志
            process_time = random.randint(30, 180)  # 30-180秒
            status = random.choices(['completed', 'failed'], weights=[0.9, 0.1])[0]
            error_msg = "处理失败" if status == 'failed' else None
            
            cursor.execute('''
                INSERT INTO process_logs 
                (record_id, status, error_message, process_time)
                VALUES (?, ?, ?, ?)
            ''', (record['id'], status, error_msg, process_time))
        
        conn.commit()
        conn.close()
        logger.info(f"成功保存 {len(records)} 条记录")
        return True
        
    except Exception as e:
        logger.error(f"保存记录失败: {e}")
        return False

def simulate_processing(records):
    """模拟处理过程"""
    logger.info(f"开始模拟处理 {len(records)} 条会议记录...")
    
    total_records = len(records)
    processed = 0
    success = 0
    
    for i, record in enumerate(records):
        try:
            logger.info(f"处理记录 {i+1}/{total_records}: {record['meeting_id']}")
            
            # 模拟处理时间
            process_time = random.randint(30, 180)
            time.sleep(0.05)  # 模拟处理延迟
            
            # 模拟成功率
            if random.random() < 0.9:  # 90%成功率
                success += 1
                logger.info(f"✅ 记录 {record['meeting_id']} 处理成功")
            else:
                logger.warning(f"❌ 记录 {record['meeting_id']} 处理失败")
            
            processed += 1
            
            # 每处理20条记录输出进度
            if (i + 1) % 20 == 0:
                progress = (i + 1) / total_records * 100
                logger.info(f"📊 处理进度: {i+1}/{total_records} ({progress:.1f}%)")
        
        except Exception as e:
            logger.error(f"处理记录 {record['meeting_id']} 时出错: {e}")
    
    logger.info(f"🎉 处理完成！总计: {total_records}, 成功: {success}, 失败: {total_records - success}")
    return success

def get_statistics():
    """获取统计信息"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 总记录数
        cursor.execute("SELECT COUNT(*) FROM recordings")
        total_records = cursor.fetchone()[0]
        
        # 今日处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE DATE(created_at) = DATE('now')")
        today_records = cursor.fetchone()[0]
        
        # 本周处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now')")
        week_records = cursor.fetchone()[0]
        
        # 本月处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')")
        month_records = cursor.fetchone()[0]
        
        # 分类统计
        cursor.execute("SELECT phase, COUNT(*) FROM recordings GROUP BY phase")
        phase_stats = dict(cursor.fetchall())
        
        # 处理状态统计
        cursor.execute("SELECT status, COUNT(*) FROM process_logs GROUP BY status")
        status_stats = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            'total_records': total_records,
            'today_records': today_records,
            'week_records': week_records,
            'month_records': month_records,
            'phase_stats': phase_stats,
            'status_stats': status_stats
        }
        
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        return {}

def main():
    """主函数"""
    logger.info("🚀 开始演示会议记录处理流程...")
    
    # 创建演示数据
    logger.info("📝 创建演示数据...")
    records = create_demo_records()
    logger.info(f"✅ 创建了 {len(records)} 条演示记录")
    
    # 初始化数据库
    logger.info("🗄️ 初始化SQLite数据库...")
    if not init_sqlite_database():
        logger.error("数据库初始化失败，退出")
        return
    
    # 保存记录
    logger.info("💾 保存记录到数据库...")
    if not save_records(records):
        logger.error("保存记录失败，退出")
        return
    
    # 模拟处理过程
    logger.info("⚙️ 开始模拟处理过程...")
    success_count = simulate_processing(records)
    
    # 获取统计信息
    stats = get_statistics()
    
    logger.info("=" * 50)
    logger.info("🎉 演示处理流程完成！")
    logger.info(f"📊 统计信息:")
    logger.info(f"  - 总记录数: {stats.get('total_records', 0)}")
    logger.info(f"  - 今日处理: {stats.get('today_records', 0)}")
    logger.info(f"  - 本周处理: {stats.get('week_records', 0)}")
    logger.info(f"  - 本月处理: {stats.get('month_records', 0)}")
    logger.info(f"  - 成功处理: {success_count}")
    logger.info(f"  - 失败记录: {len(records) - success_count}")
    logger.info(f"  - 成功率: {success_count/len(records)*100:.1f}%")
    logger.info("=" * 50)
    logger.info("📈 现在可以访问 http://localhost:5000 查看可视化后台")
    logger.info(f"💾 数据文件: {DB_FILE}")

if __name__ == "__main__":
    main() 