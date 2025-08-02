#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查腾讯会议API响应头
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import urllib.parse

# 最新密钥配置
APP_ID = "233276242"
SDK_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

def check_headers():
    """检查响应头"""
    
    # 时间窗口：最近1小时
    end   = int(time.time())
    start = end - 3600
    
    # 构建查询参数
    params = dict(end_time=end, start_time=start, page=1, page_size=1)
    uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))
    
    # 生成签名
    ts, nonce = str(end), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    sts = f"GET\n{hl}\n{uri}\n"
    sig = base64.b64encode(hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()).decode()
    
    # 构建请求头
    hdr = {
        "AppId": APP_ID,
        "SdkId": SDK_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }
    
    print("=== 请求信息 ===")
    print(f"URL: https://api.meeting.qq.com{uri}")
    print(f"Headers: {hdr}")
    print()
    
    try:
        r = requests.get("https://api.meeting.qq.com"+uri, headers=hdr, timeout=10)
        
        print("=== 响应信息 ===")
        print(f"状态码: {r.status_code}")
        print(f"响应体: {r.text}")
        print()
        
        print("=== 响应头 ===")
        for key, value in r.headers.items():
            print(f"{key}: {value}")
        print()
        
        # 检查是否有request_id
        request_id = r.headers.get("X-TC-RequestId")
        if request_id:
            print(f"✅ 找到request_id: {request_id}")
        else:
            print("❌ 未找到request_id")
            print("可能的原因:")
            print("1. 400错误不返回request_id")
            print("2. 需要先通过鉴权才能获取request_id")
            print("3. 需要联系腾讯会议客服获取调试信息")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    check_headers() 