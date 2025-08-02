#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试两种AppId配置：企业ID vs 应用ID
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 密钥配置
ENTERPRISE_ID = "233276242"           # 企业ID
APP_ID = "27370101959"                # 应用ID
SID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
API = "https://api.meeting.qq.com"

def sig(method, uri, body="", app_id=None):
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    hdr = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    s   = f"{method}\n{hdr}\n{uri}\n{body}"
    sign = base64.b64encode(hmac.new(SKEY.encode(), s.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": app_id,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }

def test_with_app_id():
    """使用应用ID测试"""
    print("🔑 测试1: 使用应用ID (27370101959)")
    print("-" * 50)
    
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    try:
        r = requests.get(API + uri, headers=sig("GET", uri, app_id=APP_ID), timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应: {r.text}")
        return r.status_code == 200
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def test_with_enterprise_id():
    """使用企业ID测试"""
    print("\n🔑 测试2: 使用企业ID (233276242)")
    print("-" * 50)
    
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    try:
        r = requests.get(API + uri, headers=sig("GET", uri, app_id=ENTERPRISE_ID), timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应: {r.text}")
        return r.status_code == 200
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def test_oauth_token():
    """测试OAuth Token获取"""
    print("\n🔑 测试3: 获取OAuth Token")
    print("-" * 50)
    
    try:
        data = {
            "secret_id": SID,
            "secret_key": SKEY
        }
        r = requests.post("https://api.meeting.qq.com/v1/oauth/token", 
                         json=data, timeout=10)
        print(f"状态码: {r.status_code}")
        print(f"响应: {r.text}")
        return r.status_code == 200
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

if __name__ == "__main__":
    print("🚀 开始腾讯会议API密钥测试...")
    print(f"SecretID: {SID}")
    print(f"SecretKey: {SKEY[:10]}...")
    print("=" * 60)
    
    # 测试1: 应用ID
    success1 = test_with_app_id()
    
    # 测试2: 企业ID
    success2 = test_with_enterprise_id()
    
    # 测试3: OAuth Token
    success3 = test_oauth_token()
    
    print("\n" + "=" * 60)
    print("📊 测试结果汇总:")
    print(f"应用ID测试: {'✅ 成功' if success1 else '❌ 失败'}")
    print(f"企业ID测试: {'✅ 成功' if success2 else '❌ 失败'}")
    print(f"OAuth测试: {'✅ 成功' if success3 else '❌ 失败'}")
    
    if not (success1 or success2 or success3):
        print("\n⚠️ 所有测试都失败了，可能的原因:")
        print("1. 密钥已过期或权限不足")
        print("2. 企业后台未开启API权限")
        print("3. 需要联系O3确认API配置") 