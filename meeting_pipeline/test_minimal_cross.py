#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最小化交叉验证脚本
去掉SdkId，只使用最新的SecretId/SecretKey对
"""

import time
import random
import hmac
import hashlib
import base64
import requests
from urllib.parse import urlencode

# 配置 - 使用最新重置的密钥对
APP_ID = "233276242"            # 企业 ID
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"  # 最新 SecretId
SKEY   = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"  # 最新 SecretKey
API    = "https://api.meeting.qq.com"

def make_hdr(method, uri, body=""):
    """
    最小化签名函数
    只使用X-TC-开头的字段参与签名，去掉SdkId
    """
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    sts = f"{method}\n{hl}\n{uri}\n{body}\n"      # 4 行，最后有 \n
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
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

# Query 参数按 ASCII 升序
params = dict(end_time=1738272000, page=1, page_size=10, start_time=1735689600)
uri = "/v1/corp/records?" + urlencode(sorted(params.items()))

print("🔍 腾讯会议API最小化交叉验证测试")
print(f"🔑 AppID: {APP_ID} (企业ID)")
print(f"🔑 SecretId: {SID[:10]}...")
print(f"📝 规范化URI: {uri}")
print("-" * 50)

headers = make_hdr("GET", uri)

print("\n" + "="*50)
print("📤 发送请求...")

try:
    r = requests.get(API + uri, headers=headers, timeout=10)
    print(f"📊 状态码: {r.status_code}")
    print(f"📄 响应内容: {r.text}")
    
    if r.status_code == 200:
        print("✅ API连接成功！")
        data = r.json()
        print(f"📈 总记录数: {data.get('total_count', 0)}")
    elif r.status_code == 401 or r.status_code == 403:
        print("⚠️  权限问题或时间戳过期")
    elif r.status_code == 400 and "200003" in r.text:
        print("❌ 签名验证错误 - 可能是密钥对不匹配")
    elif r.status_code == 400 and "190303" in r.text:
        print("❌ AppId/SecretId不匹配 - 需要重置密钥")
    else:
        print("❌ 其他错误")
        
except Exception as e:
    print(f"❌ 请求异常: {e}") 