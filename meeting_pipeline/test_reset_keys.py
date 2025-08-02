#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用最新重置密钥测试腾讯会议API
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新重置的密钥配置
APP_ID = "27370101959"
SECRET_ID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SECRET_KEY = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"
API_HOST = "https://api.meeting.qq.com"

def generate_signature(method, uri, body=""):
    """生成腾讯会议API签名"""
    timestamp = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    header_string = f"X-TC-Key={SECRET_ID}&X-TC-Nonce={nonce}&X-TC-Timestamp={timestamp}"
    string_to_sign = f"{method}\n{header_string}\n{uri}\n{body}\n"
    
    signature = base64.b64encode(
        hmac.new(SECRET_KEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    return {
        "Content-Type": "application/json",
        "AppId": APP_ID,
        "X-TC-Key": SECRET_ID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": timestamp,
        "X-TC-Signature": signature
    }

def test_api():
    """测试API连接"""
    print("🔑 使用最新重置密钥测试腾讯会议API...")
    print(f"AppID: {APP_ID}")
    print(f"SecretID: {SECRET_ID[:10]}...")
    print(f"SecretKey: {SECRET_KEY[:10]}...")
    print("-" * 50)
    
    # 测试时间范围：最近24小时
    start_time = int(time.time()) - 86400
    end_time = int(time.time())
    
    uri = f"/v1/corp/records?page_size=1&page=1&start_time={start_time}&end_time={end_time}"
    
    try:
        headers = generate_signature("GET", uri)
        print(f"请求头: {json.dumps(headers, indent=2)}")
        
        url = f"{API_HOST}{uri}"
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
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
    success = test_api()
    
    if not success:
        print("\n⚠️ API连接失败，可能的原因:")
        print("1. 密钥已过期或权限不足")
        print("2. 企业后台未开启API权限")
        print("3. 需要联系O3确认API配置")
        print("\n请向O3确认以下信息:")
        print("- 腾讯会议企业后台 → 开放平台 → 应用管理 → 应用ID: 27370101959 → 接口权限")
        print("- 是否已勾选'云录制管理'权限？")
        print("- 是否已保存权限配置？")
    else:
        print("\n✅ 可以开始获取真实的会议数据了！") 