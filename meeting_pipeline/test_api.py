#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试腾讯会议API连接
"""

import os
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

SECRET_ID = os.getenv("TQM_SECRET_ID")
SECRET_KEY = os.getenv("TQM_SECRET_KEY")

def test_token():
    """测试获取token"""
    print("🔑 测试获取腾讯会议API Token...")
    
    url = "https://api.meeting.qq.com/v1/oauth/token"
    payload = {
        "secret_id": SECRET_ID,
        "secret_key": SECRET_KEY
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Token获取成功: {data.get('access_token', '')[:20]}...")
            return data.get('access_token')
        else:
            print(f"❌ Token获取失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_list_records(token):
    """测试获取会议记录列表"""
    print("\n📞 测试获取会议记录列表...")
    
    # 设置时间范围：最近7天
    end_time = int(datetime.now().timestamp())
    start_time = end_time - 7 * 24 * 3600
    
    url = "https://api.meeting.qq.com/v1/records"
    params = {
        'start_time': start_time,
        'end_time': end_time,
        'page': 1,
        'page_size': 10
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"请求URL: {response.url}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('records', [])
            print(f"✅ 获取到 {len(records)} 条记录")
            
            if records:
                print("📋 记录示例:")
                for i, record in enumerate(records[:3]):
                    print(f"  {i+1}. 会议ID: {record.get('meeting_id')}")
                    print(f"     记录ID: {record.get('meeting_record_id')}")
                    print(f"     开始时间: {record.get('start_time')}")
                    print(f"     结束时间: {record.get('end_time')}")
                    print(f"     参与者数: {len(record.get('attendees', []))}")
                    print()
            
            return records
        else:
            print(f"❌ 获取记录失败: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return []

def test_get_address(token, record_id):
    """测试获取记录地址"""
    print(f"\n📍 测试获取记录地址 (ID: {record_id})...")
    
    url = "https://api.meeting.qq.com/v1/addresses"
    params = {"meeting_record_id": record_id}
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 地址获取成功")
            return data
        else:
            print(f"❌ 地址获取失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def main():
    """主函数"""
    print("🚀 开始测试腾讯会议API...")
    print("=" * 50)
    
    # 测试获取token
    token = test_token()
    if not token:
        print("❌ Token获取失败，无法继续测试")
        return
    
    # 测试获取记录列表
    records = test_list_records(token)
    if not records:
        print("❌ 未获取到记录，无法继续测试")
        return
    
    # 测试获取记录地址
    if records:
        first_record = records[0]
        record_id = first_record.get('meeting_record_id')
        test_get_address(token, record_id)
    
    print("\n" + "=" * 50)
    print("✅ API测试完成")

if __name__ == "__main__":
    main() 