#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试会议列表API
"""

import time
import random
import hmac
import hashlib
import base64
import requests
from urllib.parse import urlencode

# 最新密钥对
APP_ID = "233276242"
SDK_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

def hdr(uri):
    ts, nc = str(int(time.time())), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
    sts = f"GET\n{hl}\n{uri}\n"          # 4 行，末尾保留 \n
    sig = base64.b64encode(hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nc,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

print("=== 测试会议列表API ===")
print(f"企业ID: {APP_ID}")
print(f"应用ID: {SDK_ID}")
print(f"SecretId: {SID}")
print(f"SecretKey: {SKEY[:10]}...")

# 查询最近 24 小时的会议
end = int(time.time())
start = end - 24*3600
uri = "/v1/corp/meetings?" + urlencode(
    sorted(dict(end_time=end, start_time=start, page=1, page_size=1).items())
)

print(f"\n请求URI: {uri}")
print(f"时间范围: {start} ~ {end}")

r = requests.get("https://api.meeting.qq.com" + uri, headers=hdr(uri), timeout=10)
print(f"\n状态码: {r.status_code}")
print(f"响应体: {r.text}")

if r.status_code == 200:
    try:
        data = r.json()
        total_count = data.get('total_count', 0)
        print(f"\n✅ 鉴权成功！")
        print(f"总会议数: {total_count}")
        if total_count > 0:
            print("🎉 发现会议数据！")
            meetings = data.get('meetings', [])
            if meetings:
                meeting = meetings[0]
                print(f"会议ID: {meeting.get('meeting_id')}")
                print(f"会议主题: {meeting.get('subject')}")
                print(f"是否有录制: {meeting.get('has_recording', False)}")
        else:
            print("📝 时间窗口内无会议数据，但API连接正常")
    except:
        print("⚠️ 响应格式异常")
elif r.status_code == 400:
    print("❌ 鉴权失败 - 密钥对可能不匹配")
elif r.status_code in [401, 403]:
    print("❌ 权限问题 - 检查接口权限配置")
else:
    print(f"❌ 未知错误: {r.status_code}") 