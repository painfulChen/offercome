#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API签名调试脚本
获取request_id用于官方客服调试
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import urllib.parse
import textwrap

# 最新密钥配置
APP_ID = "233276242"
SDK_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

def debug_signature():
    """调试签名过程"""
    
    # 时间窗口：最近1小时
    end   = int(time.time())
    start = end - 3600
    
    # 构建查询参数
    params = dict(end_time=end, start_time=start, page=1, page_size=1)
    uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))
    
    # 生成签名
    ts, nonce = str(end), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    sts = f"GET\n{hl}\n{uri}\n"     # GET → 3行+尾LF
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
    
    print("=== 腾讯会议API签名调试 ===")
    print(f"时间窗口: {start} ~ {end}")
    print(f"URI: {uri}")
    print()
    
    print("---- string_to_sign ----")
    print(sts)
    print("---- 本地签名 ----")
    print(f"X-TC-Signature: {sig}")
    print()
    
    # 发送请求
    try:
        r = requests.get("https://api.meeting.qq.com"+uri, headers=hdr, timeout=10)
        print("=== 响应信息 ===")
        print(f"HTTP状态码: {r.status_code}")
        print(f"响应体: {r.text[:500]}")
        print()
        
        request_id = r.headers.get("X-TC-RequestId")
        if request_id:
            print("=== 客服调试信息 ===")
            print(f"request_id: {request_id}")
            print()
            print("请将以下信息发送给腾讯会议开放平台客服:")
            print("---")
            print(f"有接口 200003，已本地复现。")
            print(f"request_id: {request_id}")
            print()
            print("string_to_sign:")
            print(sts)
            print()
            print(f"X-TC-Signature(客户端算): {sig}")
            print("麻烦帮看后台重算签名差异，谢谢！")
            print("---")
        else:
            print("⚠️ 未获取到request_id，请检查响应头")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    debug_signature() 