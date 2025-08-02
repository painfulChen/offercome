#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
会议记录处理系统
端到端流水线：腾讯会议API → Kimi ASR/LLM → MySQL存储
"""

import os
import time
import json
import requests
import pymysql
import tempfile
import subprocess
from datetime import datetime, timedelta
from urllib.parse import urlencode
from dotenv import load_dotenv
import base64
import hmac
import hashlib

# 加载环境变量
load_dotenv()

# 腾讯会议API配置
APP_ID = "233276242"
SDK_ID = "27370101959"
SECRET_ID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SECRET_KEY = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"
API_BASE = "https://api.meeting.qq.com"

# Kimi API配置
KIMI_API_KEY = "sk-reaTT6uRqEqQPZ7HMXp5gmoingV6cZ2dumU8Y4axl9DHN2Jw"
KIMI_BASE_URL = "https://api.moonshot.cn/v1"

# 数据库配置
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'meeting'),
    'password': os.getenv('DB_PASS', 'VeryStrongPwd'),
    'database': os.getenv('DB_NAME', 'meeting_db'),
    'charset': 'utf8mb4'
}

def generate_signature(method, uri, body=""):
    """生成腾讯会议API签名"""
    ts = str(int(time.time()))
    nonce = str(int(time.time() * 1000))
    
    # 按ASCII升序排列所有参与签名的header
    hl_items = [
        ("SdkId", SDK_ID),
        ("X-TC-Key", SECRET_ID),
        ("X-TC-Nonce", nonce),
        ("X-TC-Timestamp", ts)
    ]
    hl = "&".join(f"{k}={v}" for k, v in hl_items)
    
    sts = f"{method}\n{hl}\n{uri}\n{body}"
    signature = base64.b64encode(
        hmac.new(SECRET_KEY.encode(), sts.encode(), hashlib.sha256).digest()
    ).decode()
    
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SECRET_ID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": signature,
        "Content-Type": "application/json"
    }

def list_meeting_records(start_time, end_time, page=1, page_size=50):
    """获取会议录制列表"""
    try:
        params = {
            "end_time": end_time,
            "page": page,
            "page_size": page_size,
            "start_time": start_time
        }
        uri = "/v1/corp/records?" + urlencode(sorted(params.items()))
        
        headers = generate_signature("GET", uri)
        response = requests.get(API_BASE + uri, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ 获取会议记录失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ 获取会议记录异常: {e}")
        return None

def get_record_download_url(record_id):
    """获取录制文件下载地址"""
    try:
        params = {"meeting_record_id": record_id}
        uri = "/v1/corp/addresses?" + urlencode(sorted(params.items()))
        
        headers = generate_signature("GET", uri)
        response = requests.get(API_BASE + uri, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ 获取下载地址失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ 获取下载地址异常: {e}")
        return None

def download_and_extract_audio(download_url, record_id):
    """下载并提取音频"""
    try:
        # 下载文件
        temp_dir = tempfile.mkdtemp()
        mp4_path = os.path.join(temp_dir, f"{record_id}.mp4")
        wav_path = os.path.join(temp_dir, f"{record_id}.wav")
        
        # 使用aria2c下载
        subprocess.run([
            "aria2c", "-x", "8", "-o", f"{record_id}.mp4",
            download_url, "-d", temp_dir
        ], check=True)
        
        # 使用ffmpeg提取音频
        subprocess.run([
            "ffmpeg", "-i", mp4_path, "-vn", "-ar", "16000", 
            "-ac", "1", wav_path
        ], check=True)
        
        return wav_path
    except Exception as e:
        print(f"❌ 音频处理异常: {e}")
        return None

def kimi_asr_transcribe(audio_path):
    """使用Kimi进行语音转写"""
    try:
        # 读取音频文件
        with open(audio_path, 'rb') as f:
            audio_data = f.read()
        
        # 调用Kimi ASR API
        headers = {
            "Authorization": f"Bearer {KIMI_API_KEY}",
            "Content-Type": "audio/wav"
        }
        
        response = requests.post(
            f"{KIMI_BASE_URL}/audio/transcriptions",
            headers=headers,
            files={"file": audio_data},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("text", "")
        else:
            print(f"❌ Kimi ASR失败: {response.status_code} - {response.text}")
            return ""
    except Exception as e:
        print(f"❌ Kimi ASR异常: {e}")
        return ""

def kimi_summarize_and_classify(transcript):
    """使用Kimi进行摘要和分类"""
    try:
        prompt = f"""
请对以下会议记录进行摘要和分类：

会议内容：
{transcript}

请提供：
1. 150字以内的摘要
2. 会议类型分类（简历优化/项目深挖/面试模拟/Offer后续/其他）

请以JSON格式返回：
{{
    "summary": "摘要内容",
    "phase": "分类结果"
}}
"""
        
        headers = {
            "Authorization": f"Bearer {KIMI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "moonshot-v1-8k",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        response = requests.post(
            f"{KIMI_BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # 解析JSON响应
            try:
                parsed = json.loads(content)
                return parsed.get("summary", ""), parsed.get("phase", "其他")
            except:
                # 如果JSON解析失败，返回默认值
                return content[:150], "其他"
        else:
            print(f"❌ Kimi LLM失败: {response.status_code} - {response.text}")
            return "", "其他"
    except Exception as e:
        print(f"❌ Kimi LLM异常: {e}")
        return "", "其他"

def save_to_database(record_data):
    """保存到数据库"""
    try:
        conn = pymysql.connect(**DB_CONFIG, autocommit=True)
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO recordings (
                id, meeting_id, start_ts, end_ts, student_ids, 
                phase, transcript, summary, play_url, download_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                transcript = VALUES(transcript),
                summary = VALUES(summary),
                phase = VALUES(phase)
            """
            
            cursor.execute(sql, (
                record_data["id"],
                record_data["meeting_id"],
                record_data["start_ts"],
                record_data["end_ts"],
                json.dumps(record_data["student_ids"], ensure_ascii=False),
                record_data["phase"],
                record_data["transcript"],
                record_data["summary"],
                record_data["play_url"],
                record_data["download_url"]
            ))
            
            # 更新学生统计
            for student_id in record_data["student_ids"]:
                cursor.execute("""
                    INSERT INTO student_stats(student_id, record_cnt) 
                    VALUES(%s, 1) 
                    ON DUPLICATE KEY UPDATE record_cnt=record_cnt+1
                """, (student_id,))
        
        conn.close()
        print(f"✅ 记录 {record_data['id']} 已保存到数据库")
        return True
    except Exception as e:
        print(f"❌ 数据库保存异常: {e}")
        return False

def process_record(record_info):
    """处理单条会议记录"""
    record_id = record_info["meeting_record_id"]
    print(f"🔍 处理会议记录: {record_id}")
    
    # 获取下载地址
    download_info = get_record_download_url(record_id)
    if not download_info:
        print(f"❌ 无法获取记录 {record_id} 的下载地址")
        return False
    
    download_url = download_info["record_file_list"][0]["download_url"]
    play_url = download_info["record_file_list"][0]["play_url"]
    
    # 下载并提取音频
    audio_path = download_and_extract_audio(download_url, record_id)
    if not audio_path:
        print(f"❌ 无法处理记录 {record_id} 的音频")
        return False
    
    # 语音转写
    transcript = kimi_asr_transcribe(audio_path)
    if not transcript:
        print(f"❌ 无法转写记录 {record_id} 的音频")
        return False
    
    # 摘要和分类
    summary, phase = kimi_summarize_and_classify(transcript)
    
    # 准备数据
    record_data = {
        "id": record_id,
        "meeting_id": record_info["meeting_id"],
        "start_ts": datetime.fromtimestamp(record_info["start_time"]),
        "end_ts": datetime.fromtimestamp(record_info["end_time"]),
        "student_ids": [p["userid"] for p in record_info.get("attendees", [])],
        "phase": phase,
        "transcript": transcript,
        "summary": summary,
        "play_url": play_url,
        "download_url": download_url
    }
    
    # 保存到数据库
    return save_to_database(record_data)

def run_batch_processing(start_time, end_time):
    """批量处理会议记录"""
    print(f"🚀 开始批量处理: {datetime.fromtimestamp(start_time)} - {datetime.fromtimestamp(end_time)}")
    
    page = 1
    total_processed = 0
    
    while True:
        print(f"📄 处理第 {page} 页...")
        
        records_data = list_meeting_records(start_time, end_time, page, 50)
        if not records_data:
            print("❌ 无法获取会议记录列表")
            break
        
        records = records_data.get("records", [])
        if not records:
            print("📭 没有更多记录")
            break
        
        for record in records:
            if process_record(record):
                total_processed += 1
        
        # 检查是否还有更多页
        total_pages = records_data.get("total_pages", 1)
        if page >= total_pages:
            break
        page += 1
    
    print(f"✅ 批量处理完成，共处理 {total_processed} 条记录")

def run_incremental_processing():
    """增量处理（处理昨天的记录）"""
    yesterday = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    today = yesterday + timedelta(days=1)
    
    start_time = int(yesterday.timestamp())
    end_time = int(today.timestamp())
    
    print(f"📅 增量处理: {yesterday.date()}")
    run_batch_processing(start_time, end_time)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 2:
        # 指定时间范围
        start_time = int(sys.argv[1])
        end_time = int(sys.argv[2])
        run_batch_processing(start_time, end_time)
    else:
        # 增量处理
        run_incremental_processing() 