#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复SdkId参与签名的腾讯会议API测试
严格按照腾讯会议开放平台文档要求
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新密钥配置
APP_ID = "233276242"                    # 企业ID
SDK_ID = "27370101959"                  # 应用ID (SdkId)
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
API    = "https://api.meeting.qq.com"

def make_headers(method, uri):
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    
    # 按ASCII升序拼接：SdkId -> X-TC-Key -> X-TC-Nonce -> X-TC-Timestamp
    hl = "&".join([
        f"SdkId={SDK_ID}",
        f"X-TC-Key={SID}",
        f"X-TC-Nonce={nonce}",
        f"X-TC-Timestamp={ts}"
    ])
    
    # 四行签名串：method + header + uri + 空body(必须有\n)
    sts = f"{method}\n{hl}\n{uri}\n"   # 4行，最后有'\n'
    
    sig = base64.b64encode(
        hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
    ).decode()

    return {
        "AppId": APP_ID,                # 企业ID，不参与签名
        "SdkId": SDK_ID,                # 应用ID，参与签名
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

def test_records_api():
    """测试会议录制列表API"""
    print("=== 测试会议录制列表API ===")
    
    # 测试时间范围：2025-01-01 ~ 2025-01-31
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    headers = make_headers("GET", uri)
    
    print(f"请求URI: {uri}")
    print(f"请求头: {json.dumps(headers, indent=2, ensure_ascii=False)}")
    
    try:
        r = requests.get(API + uri, headers=headers, timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应体: {r.text}")
        
        if r.status_code == 200:
            data = r.json()
            print(f"✅ 成功！总记录数: {data.get('total_count', 0)}")
        else:
            print(f"❌ 请求失败")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_meetings_api():
    """测试会议列表API"""
    print("\n=== 测试会议列表API ===")
    
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/meetings?page_size=10&page=1&start_time={start}&end_time={end}"
    
    headers = make_headers("GET", uri)
    
    print(f"请求URI: {uri}")
    
    try:
        r = requests.get(API + uri, headers=headers, timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应体: {r.text}")
        
        if r.status_code == 200:
            data = r.json()
            print(f"✅ 成功！总会议数: {data.get('total_count', 0)}")
        else:
            print(f"❌ 请求失败")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    print("腾讯会议API测试 - 修复SdkId参与签名")
    print(f"企业ID: {APP_ID}")
    print(f"应用ID: {SDK_ID}")
    print(f"SecretId: {SID}")
    print("=" * 50)
    
    test_records_api()
    test_meetings_api() 