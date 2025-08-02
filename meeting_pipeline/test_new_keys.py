#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用最新密钥的腾讯会议API测试
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新的密钥配置
APP_ID = "27370101959"                 # 应用ID
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"  # Secret ID
SKEY   = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"  # Secret Key
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

def test_api():
    print("🔑 使用最新密钥测试腾讯会议API...")
    print(f"AppID: {APP_ID}")
    print(f"SecretID: {SID[:10]}...")
    print(f"SecretKey: {SKEY[:10]}...")
    print("-" * 50)
    
    # 测试时间范围：2025年1月
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    try:
        r = requests.get(API + uri, headers=sig("GET", uri), timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应: {r.text}")
        
        if r.status_code == 200:
            data = r.json()
            print("✅ API连接成功！")
            print(f"总记录数: {data.get('total_count', 0)}")
            return True
        else:
            print("❌ API连接失败")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

if __name__ == "__main__":
    test_api() 