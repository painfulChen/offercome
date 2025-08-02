#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
终极调试脚本 - 获取request_id用于客服比对
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import urllib.parse
import textwrap

# 最新密钥对配置
APP_ID = "233276242"
SDK_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

print("=== 终极定位脚本 ===")
print("获取request_id用于客服比对")

end   = int(time.time())
start = end - 3600              # 查最近 1 小时
params = dict(end_time=end, start_time=start, page=1, page_size=1)
uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))

ts, nonce = str(end), str(random.randint(100000,999999))
hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
sts = f"GET\n{hl}\n{uri}\n"     # GET → 3 行+尾 LF
sig = base64.b64encode(hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()).decode()

hdr = {"AppId":APP_ID,"SdkId":SDK_ID,"X-TC-Key":SID,"X-TC-Nonce":nonce,
       "X-TC-Timestamp":ts,"X-TC-Signature":sig,"Content-Type":"application/json"}

print("\n---- string_to_sign ----")
print(sts)
print("Local signature:", sig, "\n")

r = requests.get("https://api.meeting.qq.com"+uri, headers=hdr, timeout=10)
print("HTTP", r.status_code, "\nBody:", r.text[:200])
request_id = r.headers.get("X-TC-RequestId")
print("request_id:", request_id)

print("\n" + "="*50)
print("📋 发给客服的模板：")
print("="*50)
print(f"""
有接口 200003，已本地复现。
request_id: {request_id}

string_to_sign:
{sts}
X-TC-Signature(客户端算): {sig}
麻烦帮看后台重算签名差异，谢谢！
""")
print("="*50)

print("\n🔍 排查建议：")
print("1. 企业微信搜索'会议开放平台'")
print("2. 发送上述模板给客服")
print("3. 客服会返回服务器重算的string_to_sign和签名")
print("4. 对比差异即可定位问题根因") 