#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API测试 - 使用上个月时间窗口
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import urllib.parse
import datetime
import pytz

# 最新密钥配置
APP_ID = "27370101959"
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY   = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
API    = "https://api.meeting.qq.com"

def get_monthly_window():
    """获取上个月的时间窗口"""
    # 以北京时间计算
    tz = pytz.timezone("Asia/Shanghai")
    now = datetime.datetime.now(tz)
    
    # 本月 1 号 0 点
    this_month_start = tz.localize(
        datetime.datetime(now.year, now.month, 1, 0, 0, 0))
    
    # 上月 1 号 0 点
    #   先找到上月的年份、月份
    last_year  = now.year if now.month > 1 else now.year - 1
    last_month = now.month - 1 if now.month > 1 else 12
    last_month_start = tz.localize(
        datetime.datetime(last_year, last_month, 1, 0, 0, 0))
    
    # 转成秒级时间戳
    start_ts = int(last_month_start.timestamp())
    end_ts   = int(this_month_start.timestamp())
    
    print("=== 时间窗口信息 ===")
    print("窗口:", last_month_start, "~", this_month_start)
    print("start_time =", start_ts)
    print("end_time   =", end_ts)
    print()
    
    return start_ts, end_ts

def sig(method, uri, body=""):
    """生成签名"""
    ts, nonce = str(int(time.time())), str(random.randint(100000,999999))
    hdr = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    s   = f"{method}\n{hdr}\n{uri}\n{body}"
    sign = base64.b64encode(hmac.new(SKEY.encode(), s.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": APP_ID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }

def test_monthly_records():
    """测试上个月的会议记录"""
    print("腾讯会议API测试 - 上个月时间窗口")
    print("=" * 50)
    print()
    
    # 获取时间窗口
    start_ts, end_ts = get_monthly_window()
    
    # 构建查询参数
    params = dict(end_time=end_ts,
                  start_time=start_ts,
                  page=1, page_size=10)
    uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))
    
    print("=== 请求信息 ===")
    print(f"URI: {uri}")
    print(f"参数: {params}")
    print()
    
    # 发送请求
    try:
        url = API + uri
        headers = sig("GET", uri)
        
        print("=== 请求头 ===")
        for key, value in headers.items():
            print(f"{key}: {value}")
        print()
        
        print("=== 发送请求 ===")
        print(f"URL: {url}")
        print()
        
        r = requests.get(url, headers=headers, timeout=10)
        
        print("=== 响应信息 ===")
        print(f"状态码: {r.status_code}")
        print(f"响应体: {r.text}")
        print()
        
        if r.status_code == 200:
            print("✅ 请求成功！")
            try:
                data = r.json()
                total_count = data.get('total_count', 0)
                print(f"总记录数: {total_count}")
                
                if total_count > 0:
                    print("📋 找到会议记录，可以继续调用 /v1/corp/addresses 获取下载地址")
                else:
                    print("📭 该时间段内没有会议录制数据")
                    
            except Exception as e:
                print(f"解析响应失败: {e}")
        else:
            print("❌ 请求失败")
            print("请将以下信息发送给腾讯会议客服:")
            print("---")
            print(f"错误码: {r.status_code}")
            print(f"错误信息: {r.text}")
            print(f"request_id: {r.headers.get('X-TC-RequestId', '未获取到')}")
            print("---")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    test_monthly_records() 