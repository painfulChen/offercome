#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完全符合腾讯会议官方规范的API测试
严格按照《企业自建应用鉴权（JWT）》文档实现
"""

import time
import hmac
import hashlib
import base64
import random
import requests
import urllib.parse

# 配置 - 使用最新重置的密钥
APP_ID  = "233276242"      # 企业 ID
SDK_ID  = "27370101959"    # 应用 ID
SID     = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"  # 最新 SecretId
SKEY    = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"  # 最新 SecretKey

def make_headers(method, uri, body=""):
    """
    严格按照官方规范生成签名
    """
    ts = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    # 参与签名的header（按字典序）
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    
    # 待签名字符串（严格按照官方格式）
    sts = f"{method}\n{hl}\n{uri}\n{body}\n"  # 注意末尾必须有换行
    
    # HMAC-SHA256 + Base64
    sig = base64.b64encode(
        hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
    ).decode()
    
    print("🔍 签名调试信息:")
    print(f"📝 方法: {method}")
    print(f"📝 URI: {uri}")
    print(f"📝 时间戳: {ts}")
    print(f"📝 随机数: {nonce}")
    print(f"📝 签名头: {hl}")
    print(f"📝 待签名字符串:")
    print(f"   '{sts}'")
    print(f"📝 待签名字符串长度: {len(sts)}")
    print(f"📝 签名结果: {sig}")
    
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json",
    }

# 测试
uri = "/v1/corp/records?page_size=1&page=1&start_time=1735689600&end_time=1738272000"

print("🔍 腾讯会议API官方规范测试")
print(f"🔑 AppID: {APP_ID} (企业ID)")
print(f"🔑 SdkId: {SDK_ID} (应用ID)")
print(f"🔑 SecretId: {SID[:10]}...")
print("-" * 50)

headers = make_headers("GET", uri)

print("\n" + "="*50)
print("📤 发送请求...")

try:
    resp = requests.get("https://api.meeting.qq.com" + uri,
                        headers=headers, timeout=10)
    print(f"📊 状态码: {resp.status_code}")
    print(f"📄 响应内容: {resp.text}")
    
    if resp.status_code == 200:
        print("✅ API连接成功！")
        data = resp.json()
        print(f"📈 总记录数: {data.get('total_count', 0)}")
    elif resp.status_code == 401 or resp.status_code == 403:
        print("⚠️  权限问题或时间戳过期")
    elif resp.status_code == 400 and "200003" in resp.text:
        print("❌ 签名验证错误 - 需要检查签名格式")
    elif resp.status_code == 400 and "190303" in resp.text:
        print("❌ AppId/SecretId不匹配 - 需要重置密钥")
    else:
        print("❌ 其他错误")
        
except Exception as e:
    print(f"❌ 请求异常: {e}") 