#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查应用调试模式问题
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

print("=== 检查应用调试模式问题 ===")
print("如果后台开启了'应用测试'的调试模式，但当前调用者不在手机号白名单中，")
print("也会直接返回200003错误。")
print("\n请检查：")
print("1. 腾讯会议企业后台 → 开放平台 → 应用管理 → 应用ID: 27370101959")
print("2. 左侧'应用测试' → 是否开启了调试模式？")
print("3. 如果开启了，请关闭调试模式或者把自己的手机号加入白名单")
print("4. 等待1分钟后再次测试")

# 查询最近 24 小时，确保URL排序正确
end = int(time.time())
start = end - 3600*24
params = dict(end_time=end, start_time=start, page=1, page_size=1)
uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))

print(f"\n请求URI: {uri}")
print(f"时间范围: {start} ~ {end}")

headers, sts, ts, nc, sign = sig_get("GET", uri)

print(f"\n=== 签名详情 ===")
print(f"string_to_sign: {repr(sts)}")
print(f"时间戳: {ts}")
print(f"随机数: {nc}")
print(f"签名结果: {sign}")

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
    print("❌ 鉴权失败 - 可能是以下原因之一：")
    print("1. 密钥对不匹配")
    print("2. 应用调试模式限制")
    print("3. 接口权限未开启")
    print("4. 企业配置问题")
elif r.status_code in [401, 403]:
    print("❌ 权限问题 - 检查接口权限配置")
else:
    print(f"❌ 未知错误: {r.status_code}")

print(f"\n=== 建议的排查步骤 ===")
print("1. 检查应用调试模式是否开启")
print("2. 检查接口权限是否已开启（云录制管理、会议管理）")
print("3. 重置密钥对确保SecretId和SecretKey匹配")
print("4. 如果问题持续，请提供request_id给腾讯会议客服") 