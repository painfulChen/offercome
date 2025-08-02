#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API正确测试脚本
使用官方文档提供的端点和格式
"""

import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

SECRET_ID = os.getenv("TQM_SECRET_ID")
SECRET_KEY = os.getenv("TQM_SECRET_KEY")
API_BASE = "https://api.meeting.qq.com"

def test_token_endpoint():
    """测试获取access_token"""
    print("🔑 测试获取access_token...")
    
    url = f"{API_BASE}/v1/oauth/token"
    payload = {
        "secret_id": SECRET_ID,
        "secret_key": SECRET_KEY
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print("✅ 成功获取access_token!")
                return data["access_token"]
            else:
                print("❌ 响应中没有access_token")
                return None
        else:
            print(f"❌ 请求失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_records_list(token):
    """测试获取会议录制列表"""
    if not token:
        print("❌ 没有有效的token")
        return None
    
    print("\n📋 测试获取会议录制列表...")
    
    # 计算时间范围（最近7天）
    end_time = int(time.time())
    start_time = end_time - (7 * 24 * 3600)
    
    url = f"{API_BASE}/v1/records"
    params = {
        "page_size": 10,
        "page": 1,
        "start_time": start_time,
        "end_time": end_time
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            if "records" in data:
                records = data["records"]
                print(f"✅ 成功获取会议录制列表! 找到 {len(records)} 条记录")
                return records
            else:
                print("❌ 响应中没有records字段")
                return None
        else:
            print(f"❌ 请求失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_record_addresses(token, record_id):
    """测试获取录制文件地址"""
    if not token or not record_id:
        print("❌ 缺少token或record_id")
        return None
    
    print(f"\n📁 测试获取录制文件地址 (record_id: {record_id})...")
    
    url = f"{API_BASE}/v1/addresses"
    params = {"meeting_record_id": record_id}
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            if "record_file_list" in data:
                files = data["record_file_list"]
                print(f"✅ 成功获取录制文件地址! 找到 {len(files)} 个文件")
                return data
            else:
                print("❌ 响应中没有record_file_list字段")
                return None
        else:
            print(f"❌ 请求失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_transcript_details(token, meeting_id, record_file_id):
    """测试获取转写详情"""
    if not token or not meeting_id or not record_file_id:
        print("❌ 缺少必要参数")
        return None
    
    print(f"\n📝 测试获取转写详情 (meeting_id: {meeting_id}, file_id: {record_file_id})...")
    
    url = f"{API_BASE}/v1/records/transcripts/details"
    params = {
        "meeting_id": meeting_id,
        "record_file_id": record_file_id
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 成功获取转写详情!")
            return data
        else:
            print(f"❌ 请求失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def main():
    """主测试函数"""
    print("🚀 开始测试腾讯会议API...")
    print(f"API基础地址: {API_BASE}")
    print(f"Secret ID: {SECRET_ID}")
    
    # 1. 测试获取token
    token = test_token_endpoint()
    
    if not token:
        print("\n❌ 无法获取token，测试终止")
        return
    
    # 2. 测试获取会议录制列表
    records = test_records_list(token)
    
    if not records:
        print("\n❌ 无法获取会议录制列表，测试终止")
        return
    
    # 3. 测试获取第一个录制的文件地址
    if records:
        first_record = records[0]
        record_id = first_record.get("meeting_record_id")
        meeting_id = first_record.get("meeting_id")
        
        print(f"\n📊 第一条录制信息:")
        print(f"  Record ID: {record_id}")
        print(f"  Meeting ID: {meeting_id}")
        print(f"  开始时间: {first_record.get('start_time')}")
        print(f"  结束时间: {first_record.get('end_time')}")
        
        # 测试获取文件地址
        address_data = test_record_addresses(token, record_id)
        
        if address_data and "record_file_list" in address_data:
            files = address_data["record_file_list"]
            if files:
                first_file = files[0]
                file_id = first_file.get("record_file_id")
                
                print(f"\n📁 第一个文件信息:")
                print(f"  File ID: {file_id}")
                print(f"  播放地址: {first_file.get('play_url', 'N/A')}")
                print(f"  下载地址: {first_file.get('download_url', 'N/A')}")
                
                # 测试获取转写详情
                test_transcript_details(token, meeting_id, file_id)
    
    print("\n" + "="*60)
    print("📋 测试总结")
    print("="*60)
    print("✅ 腾讯会议API测试完成!")
    print("如果所有测试都成功，说明API配置正确")
    print("现在可以开始获取真实的会议数据了!")

if __name__ == "__main__":
    main() 