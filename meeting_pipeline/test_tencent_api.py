#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API测试脚本
尝试不同的接口地址和参数，获取真实的会议数据
"""

import requests
import json
import time
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

SECRET_ID = os.getenv("TQM_SECRET_ID")
SECRET_KEY = os.getenv("TQM_SECRET_KEY")
ENTERPRISE_ID = os.getenv("ENTERPRISE_ID")
APP_ID = os.getenv("APP_ID")

def test_different_endpoints():
    """测试不同的API端点"""
    
    # 测试不同的token获取端点
    token_endpoints = [
        "https://api.meeting.qq.com/v1/oauth/token",
        "https://api.meeting.qq.com/oauth/token",
        "https://meeting.tencent.com/api/oauth/token",
        "https://api.meeting.qq.com/v1/auth/token"
    ]
    
    for endpoint in token_endpoints:
        print(f"\n测试端点: {endpoint}")
        try:
            payload = {
                "secret_id": SECRET_ID,
                "secret_key": SECRET_KEY
            }
            
            response = requests.post(endpoint, json=payload, timeout=10)
            print(f"状态码: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    print("✅ 找到正确的token端点!")
                    return endpoint, data["access_token"]
                    
        except Exception as e:
            print(f"错误: {e}")
    
    return None, None

def test_meeting_list(token):
    """测试获取会议列表"""
    if not token:
        print("❌ 没有有效的token")
        return
    
    # 测试不同的会议列表端点
    list_endpoints = [
        "https://api.meeting.qq.com/v1/records",
        "https://api.meeting.qq.com/v1/meetings",
        "https://api.meeting.qq.com/records",
        "https://meeting.tencent.com/api/records"
    ]
    
    # 计算时间范围（最近7天）
    end_time = int(time.time())
    start_time = end_time - (7 * 24 * 3600)
    
    for endpoint in list_endpoints:
        print(f"\n测试会议列表端点: {endpoint}")
        try:
            params = {
                "start_time": start_time,
                "end_time": end_time,
                "page": 1,
                "page_size": 10
            }
            
            headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.get(endpoint, params=params, headers=headers, timeout=30)
            print(f"状态码: {response.status_code}")
            print(f"响应: {response.text[:300]}")
            
            if response.status_code == 200:
                data = response.json()
                if "records" in data or "meetings" in data:
                    print("✅ 找到正确的会议列表端点!")
                    return endpoint, data
                    
        except Exception as e:
            print(f"错误: {e}")
    
    return None, None

def test_transcript_api(token, record_id):
    """测试转写API"""
    if not token or not record_id:
        print("❌ 缺少token或record_id")
        return
    
    # 测试不同的转写端点
    transcript_endpoints = [
        f"https://api.meeting.qq.com/v1/transcripts?meeting_record_id={record_id}",
        f"https://api.meeting.qq.com/v1/records/{record_id}/transcript",
        f"https://api.meeting.qq.com/transcripts?meeting_record_id={record_id}",
        f"https://meeting.tencent.com/api/transcripts?meeting_record_id={record_id}"
    ]
    
    for endpoint in transcript_endpoints:
        print(f"\n测试转写端点: {endpoint}")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.get(endpoint, headers=headers, timeout=30)
            print(f"状态码: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            
            if response.status_code == 200:
                data = response.json()
                if "transcript" in data:
                    print("✅ 找到正确的转写端点!")
                    return endpoint, data
                    
        except Exception as e:
            print(f"错误: {e}")
    
    return None, None

def main():
    print("🚀 开始测试腾讯会议API...")
    print(f"Secret ID: {SECRET_ID}")
    print(f"Enterprise ID: {ENTERPRISE_ID}")
    print(f"App ID: {APP_ID}")
    
    # 测试token获取
    token_endpoint, token = test_different_endpoints()
    
    if not token:
        print("\n❌ 无法获取有效的token，请检查API密钥配置")
        return
    
    print(f"\n✅ 成功获取token: {token[:20]}...")
    
    # 测试会议列表
    list_endpoint, meetings_data = test_meeting_list(token)
    
    if not meetings_data:
        print("\n❌ 无法获取会议列表")
        return
    
    print(f"\n✅ 成功获取会议数据")
    records = meetings_data.get("records", meetings_data.get("meetings", []))
    print(f"找到 {len(records)} 条会议记录")
    
    if records:
        # 测试第一条记录的转写
        first_record = records[0]
        record_id = first_record.get("meeting_record_id", first_record.get("id"))
        
        print(f"\n测试第一条记录的转写: {record_id}")
        transcript_endpoint, transcript_data = test_transcript_api(token, record_id)
        
        if transcript_data:
            print("✅ 成功获取转写数据")
            print(f"转写内容: {transcript_data.get('transcript', '')[:100]}...")
        else:
            print("❌ 无法获取转写数据")
    
    print("\n📋 测试总结:")
    print(f"Token端点: {token_endpoint}")
    print(f"会议列表端点: {list_endpoint}")
    if 'transcript_endpoint' in locals():
        print(f"转写端点: {transcript_endpoint}")

if __name__ == "__main__":
    main() 