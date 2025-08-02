#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API签名详细验证
包含时间同步、完整请求信息打印
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import urllib.parse
import subprocess
import sys

# 最新密钥配置
APP_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
API    = "https://api.meeting.qq.com"

def sync_time():
    """同步系统时间"""
    print("=== 时间同步检查 ===")
    try:
        # 尝试同步时间
        result = subprocess.run(['sudo', 'ntpdate', 'ntp.aliyun.com'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ 时间同步成功")
            print(result.stdout)
        else:
            print("⚠️ 时间同步失败，请手动检查系统时间")
            print(result.stderr)
    except Exception as e:
        print(f"⚠️ 时间同步异常: {e}")
        print("请手动检查系统时间设置")
    
    # 显示当前时间
    current_time = time.time()
    print(f"当前时间戳: {current_time}")
    print(f"当前时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_time))}")
    print()

def verify_signature():
    """验证签名"""
    print("=== 签名验证 ===")
    
    # 时间窗口：最近1小时
    end   = int(time.time())
    start = end - 3600
    
    # 构建查询参数（确保排序）
    params = {
        'end_time': end,
        'start_time': start, 
        'page': 1,
        'page_size': 1
    }
    
    # 按字母顺序排序参数
    sorted_params = sorted(params.items())
    uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted_params)
    
    print(f"原始参数: {params}")
    print(f"排序后参数: {sorted_params}")
    print(f"完整URI: {uri}")
    print()
    
    # 生成签名
    ts, nonce = str(end), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    
    # GET请求使用3行签名
    sts = f"GET\n{hl}\n{uri}\n"
    
    print("=== 签名串详情 ===")
    print("方法: GET")
    print("Header行: " + hl)
    print("URI行: " + uri)
    print("结束符: \\n")
    print()
    
    print("=== 完整签名串 ===")
    print(repr(sts))  # 显示原始字符，包括换行符
    print()
    
    # 计算签名
    sig = base64.b64encode(hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()).decode()
    
    print("=== 签名结果 ===")
    print(f"本地签名: {sig}")
    print()
    
    # 构建请求头
    hdr = {
        "AppId": APP_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }
    
    print("=== 请求头 ===")
    for key, value in hdr.items():
        print(f"{key}: {value}")
    print()
    
    # 发送请求
    try:
        print("=== 发送请求 ===")
        url = API + uri
        print(f"完整URL: {url}")
        print()
        
        r = requests.get(url, headers=hdr, timeout=10)
        
        print("=== 响应信息 ===")
        print(f"状态码: {r.status_code}")
        print(f"响应体: {r.text}")
        print()
        
        print("=== 响应头 ===")
        for key, value in r.headers.items():
            print(f"{key}: {value}")
        print()
        
        if r.status_code == 200:
            print("✅ 请求成功！")
        else:
            print("❌ 请求失败")
            print("请将以下信息发送给腾讯会议客服:")
            print("---")
            print(f"错误码: {r.status_code}")
            print(f"错误信息: {r.text}")
            print(f"request_id: {r.headers.get('X-TC-RequestId', '未获取到')}")
            print()
            print("签名串:")
            print(sts)
            print()
            print(f"本地签名: {sig}")
            print("---")
            
    except Exception as e:
        print(f"请求异常: {e}")

def main():
    """主函数"""
    print("腾讯会议API签名详细验证")
    print("=" * 50)
    print()
    
    # 1. 时间同步
    sync_time()
    
    # 2. 签名验证
    verify_signature()

if __name__ == "__main__":
    main() 