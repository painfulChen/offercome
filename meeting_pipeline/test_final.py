#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终腾讯会议API测试
使用正确的AppID: 27360153432
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

APP_ID = "27360153432"                 # ← 改成后台的 AppID
SID    = "1BvXhtkofbUMSJJZZsVdlHhmAAmWIjY4H1"
SKEY   = "FNqHrwJsxIEC3yfQXfmYDWWWOL5YLWlTWrW5zDI6zlTFP5Lf"
API    = "https://api.meeting.qq.com"

def sig(method, uri, body=""):
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    hdr = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    s   = f"{method}\n{hdr}\n{uri}\n{body}"
    sign = base64.b64encode(hmac.new(SKEY.encode(), s.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": APP_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }

def test_final():
    """最终测试"""
    print("🚀 开始最终测试...")
    print(f"AppId: {APP_ID}")
    print(f"SecretId: {SID}")
    
    start, end = 1735689600, 1738272000            # 2025-01-01 ~ 01-31
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    print(f"请求URI: {uri}")
    print(f"时间范围: {start} ~ {end}")
    
    headers = sig("GET", uri)
    print(f"请求头: {json.dumps(headers, indent=2)}")
    
    r = requests.get(API + uri, headers=headers, timeout=10)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text}")
    
    if r.status_code == 200:
        print("✅ 测试成功!")
        data = r.json()
        if "total_count" in data:
            print(f"总记录数: {data['total_count']}")
        if "record_meetings" in data:
            records = data["record_meetings"]
            print(f"找到 {len(records)} 条录制记录")
            if records:
                print(f"第一条记录ID: {records[0].get('meeting_record_id')}")
    else:
        print("❌ 测试失败")
        print("请检查:")
        print("1. 接口权限是否已开启（云录制管理）")
        print("2. 服务器时间是否准确")
        print("3. AppID是否正确")

if __name__ == "__main__":
    test_final() 