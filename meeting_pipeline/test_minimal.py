#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最小化腾讯会议API测试
严格按照提供的代码片段
"""

import time
import random
import hmac
import hashlib
import base64
import json
import requests

APP_ID   = "233276242"   # 企业 ID
SID      = "1BvXhtkofbUMSJJZZsVdlHhmAAmWIjY4H1"
SKEY     = "FNqHrwJsxIEC3yfQXfmYDWWWOL5YLWlTWrW5zDI6zlTFP5Lf"
API_HOST = "https://api.meeting.qq.com"

def make_sig(method: str, uri: str, body=""):
    ts    = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    hdr   = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    string_to_sign = f"{method}\n{hdr}\n{uri}\n{body}"
    sig = base64.b64encode(
            hmac.new(SKEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
          ).decode()
    return {
        "Content-Type": "application/json",
        "AppId": APP_ID,              # ← 必带，但 **不进签名**
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig
    }

def test_minimal():
    """最小化测试"""
    print("🚀 开始最小化测试...")
    print(f"AppId: {APP_ID}")
    print(f"SecretId: {SID}")
    
    start, end = 1735689600, 1738272000          # 2025-01-01 ~ 2025-01-31
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    print(f"请求URI: {uri}")
    print(f"时间范围: {start} ~ {end}")
    
    headers = make_sig("GET", uri)
    print(f"请求头: {json.dumps(headers, indent=2)}")
    
    r = requests.get(API_HOST + uri, headers=headers, timeout=10)
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.text}")
    
    if r.status_code == 200:
        print("✅ 测试成功!")
        data = r.json()
        if "total_count" in data:
            print(f"总记录数: {data['total_count']}")
    else:
        print("❌ 测试失败")

if __name__ == "__main__":
    test_minimal() 