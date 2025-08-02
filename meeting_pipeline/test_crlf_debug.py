#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查CRLF问题的调试脚本
"""

import time
import random
import hmac
import hashlib
import base64
import requests
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
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nc,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }, sts, ts, nc, sign

print("=== 检查CRLF问题 ===")

# 查询最近 24 小时，确保URL排序正确
end = int(time.time())
start = end - 3600*24
params = dict(end_time=end, start_time=start, page=1, page_size=1)
uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))

print(f"请求URI: {uri}")
print(f"时间范围: {start} ~ {end}")

headers, sts, ts, nc, sign = sig_get("GET", uri)

# 检查string_to_sign的字节内容
print(f"\n=== 签名详情 ===")
print(f"string_to_sign: {repr(sts)}")
print(f"string_to_sign字节: {sts.encode()}")
print(f"string_to_sign十六进制: {sts.encode().hex()}")

# 写入文件检查
with open("sig.txt", "w") as f:
    f.write(sts)

print(f"\n=== 文件检查 ===")
import subprocess
result = subprocess.run(["xxd", "sig.txt"], capture_output=True, text=True)
print("文件十六进制内容:")
print(result.stdout)

print(f"\n=== 请求头详情 ===")
print(f"完整请求头: {headers}")

r = requests.get("https://api.meeting.qq.com" + uri, headers=headers, timeout=8)
print(f"\n状态码: {r.status_code}")
print(f"响应体: {r.text[:300]}")

if r.status_code == 200:
    try:
        data = r.json()
        total_count = data.get('total_count', 0)
        print(f"\n✅ 鉴权成功！")
        print(f"总录制数: {total_count}")
        if total_count > 0:
            print("🎉 发现录制数据，可以继续调用其他API！")
        else:
            print("📝 时间窗口内无录制数据，但API连接正常")
    except:
        print("⚠️ 响应格式异常")
elif r.status_code == 400:
    print("❌ 鉴权失败 - 密钥对可能不匹配")
elif r.status_code in [401, 403]:
    print("❌ 权限问题 - 检查接口权限配置")
else:
    print(f"❌ 未知错误: {r.status_code}") 