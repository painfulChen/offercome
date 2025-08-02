#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成curl命令进行调试
"""

import time
import random
import hmac
import hashlib
import base64
import urllib.parse

# 最新密钥对配置
APP_ID = "233276242"
SDK_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

def sig_get(method, uri):
    """完全正确的3行签名函数（GET/DELETE）"""
    ts = str(int(time.time()))
    nc = str(random.randint(100000, 999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
    sts = f"{method}\n{hl}\n{uri}"          # ← 无 body，只 3 行
    sign = base64.b64encode(
        hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
    ).decode()
    return ts, nc, sign

print("=== 生成curl命令进行调试 ===")

# 查询最近 24 小时，确保URL排序正确
end = int(time.time())
start = end - 3600*24
params = dict(end_time=end, start_time=start, page=1, page_size=1)
uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))

ts, nc, sign = sig_get("GET", uri)

print(f"请求URI: {uri}")
print(f"时间戳: {ts}")
print(f"随机数: {nc}")
print(f"签名结果: {sign}")

curl_cmd = f'''curl -v "https://api.meeting.qq.com{uri}" \\
 -H "AppId: {APP_ID}" \\
 -H "SdkId: {SDK_ID}" \\
 -H "X-TC-Key: {SID}" \\
 -H "X-TC-Nonce: {nc}" \\
 -H "X-TC-Timestamp: {ts}" \\
 -H "X-TC-Signature: {sign}" \\
 -H "Content-Type: application/json"'''

print(f"\n=== 请复制以下curl命令进行测试 ===")
print(curl_cmd) 