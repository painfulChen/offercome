#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
详细签名调试 - 确保四行格式完全正确
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

def debug_signature(method, uri):
    """详细调试签名过程"""
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

    print("🔍 详细签名调试:")
    print(f"📝 方法: {method}")
    print(f"📝 URI: {uri}")
    print(f"📝 时间戳: {ts}")
    print(f"📝 随机数: {nonce}")
    print(f"📝 签名头: {hl}")
    print(f"📝 待签名字符串 (4行):")
    print(f"   '{sts}'")
    print(f"📝 待签名字符串长度: {len(sts)}")
    print(f"📝 每行长度: {[len(line) for line in sts.split(chr(10))]}")
    print(f"📝 签名结果: {sig}")
    
    return {
        "AppId": APP_ID,                # 企业ID，不参与签名
        "SdkId": SDK_ID,                # 应用ID，参与签名
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

def test_with_debug():
    """带调试信息的测试"""
    print("=== 腾讯会议API签名调试测试 ===")
    
    # 测试时间范围：2025-01-01 ~ 2025-01-31
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=10&page=1&start_time={start}&end_time={end}"
    
    headers = debug_signature("GET", uri)
    
    print(f"\n📤 发送请求...")
    print(f"📤 完整URL: {API + uri}")
    print(f"📤 请求头: {json.dumps(headers, indent=2, ensure_ascii=False)}")
    
    try:
        r = requests.get(API + uri, headers=headers, timeout=10)
        print(f"📊 状态码: {r.status_code}")
        print(f"📄 响应内容: {r.text}")
        
        if r.status_code == 200:
            print("✅ API连接成功！")
            data = r.json()
            print(f"📈 总记录数: {data.get('total_count', 0)}")
        elif r.status_code == 400 and "200003" in r.text:
            print("❌ 签名验证错误 - 需要检查签名格式")
        else:
            print(f"❌ 其他错误: {r.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    test_with_debug() 