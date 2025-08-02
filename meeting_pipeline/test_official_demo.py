#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议官方文档示例格式测试
严格按照官方文档的签名格式
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 配置
APP_ID = "233276242"                    # 企业ID
SDK_ID = "27370101959"                  # 应用ID (SdkId)
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
API    = "https://api.meeting.qq.com"

def make_signature(method, uri):
    """严格按照官方文档的签名格式"""
    ts = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    # 构建签名头字符串（按ASCII升序）
    header_string = "&".join([
        f"SdkId={SDK_ID}",
        f"X-TC-Key={SID}",
        f"X-TC-Nonce={nonce}",
        f"X-TC-Timestamp={ts}"
    ])
    
    # 构建待签名字符串（四行格式）
    string_to_sign = f"{method}\n{header_string}\n{uri}\n"
    
    # 生成签名
    signature = base64.b64encode(
        hmac.new(SKEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    print("🔍 官方格式签名调试:")
    print(f"📝 方法: {method}")
    print(f"📝 URI: {uri}")
    print(f"📝 时间戳: {ts}")
    print(f"📝 随机数: {nonce}")
    print(f"📝 签名头: {header_string}")
    print(f"📝 待签名字符串:")
    print(f"   '{string_to_sign}'")
    print(f"📝 签名结果: {signature}")
    
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": signature,
        "Content-Type": "application/json"
    }

def test_simple_api():
    """测试简单的API调用"""
    print("=== 测试简单API调用 ===")
    
    # 使用简单的URI进行测试
    uri = "/v1/corp/records"
    headers = make_signature("GET", uri)
    
    print(f"\n📤 发送请求...")
    print(f"📤 URL: {API + uri}")
    
    try:
        r = requests.get(API + uri, headers=headers, timeout=10)
        print(f"📊 状态码: {r.status_code}")
        print(f"📄 响应内容: {r.text}")
        
        if r.status_code == 200:
            print("✅ API连接成功！")
        else:
            print(f"❌ API连接失败: {r.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_with_params():
    """测试带参数的API调用"""
    print("\n=== 测试带参数的API调用 ===")
    
    # 构建带查询参数的URI
    params = {
        "page_size": "10",
        "page": "1",
        "start_time": "1735689600",
        "end_time": "1738272000"
    }
    
    # 按ASCII升序排列参数
    sorted_params = sorted(params.items())
    query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
    uri = f"/v1/corp/records?{query_string}"
    
    headers = make_signature("GET", uri)
    
    print(f"\n📤 发送请求...")
    print(f"📤 URL: {API + uri}")
    
    try:
        r = requests.get(API + uri, headers=headers, timeout=10)
        print(f"📊 状态码: {r.status_code}")
        print(f"📄 响应内容: {r.text}")
        
        if r.status_code == 200:
            print("✅ API连接成功！")
            data = r.json()
            print(f"📈 总记录数: {data.get('total_count', 0)}")
        else:
            print(f"❌ API连接失败: {r.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    print("腾讯会议API官方格式测试")
    print(f"企业ID: {APP_ID}")
    print(f"应用ID: {SDK_ID}")
    print("=" * 50)
    
    test_simple_api()
    test_with_params() 