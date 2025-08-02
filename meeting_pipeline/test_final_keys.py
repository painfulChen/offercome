#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用最新重置的腾讯会议API密钥测试
AppId使用企业ID: 233276242
SdkId使用应用ID: 27370101959
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新重置的密钥配置
APP_ID = "233276242"                   # 企业ID
SDK_ID = "27370101959"                 # 应用ID (SdkId)
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"
API    = "https://api.meeting.qq.com"

def sig(method, uri, body=""):
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    hdr = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    s   = f"{method}\n{hdr}\n{uri}\n{body}"
    sign = base64.b64encode(hmac.new(SKEY.encode(), s.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,               # 新增：应用ID
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }

# 测试时间范围：2025-01-01 ~ 2025-01-31
start, end = 1735689600, 1738272000
uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"

print("🔍 测试腾讯会议API连接...")
print(f"📅 时间范围: 2025-01-01 ~ 2025-01-31")
print(f"🔑 AppID: {APP_ID} (企业ID)")
print(f"🔑 SdkId: {SDK_ID} (应用ID)")
print(f"🔑 SecretId: {SID[:10]}...")
print(f"🌐 请求URL: {API}{uri}")
print("-" * 50)

try:
    r = requests.get(API + uri, headers=sig("GET", uri), timeout=10)
    print(f"📊 状态码: {r.status_code}")
    print(f"📄 响应内容: {r.text}")
    
    if r.status_code == 200:
        data = r.json()
        print("✅ API连接成功！")
        print(f"📈 总记录数: {data.get('total_count', 0)}")
        if 'records' in data and data['records']:
            print(f"📝 第一条记录ID: {data['records'][0].get('meeting_record_id', 'N/A')}")
        else:
            print("⚠️  当前时间范围内没有录制数据")
    else:
        print("❌ API连接失败")
        
except Exception as e:
    print(f"❌ 请求异常: {e}") 