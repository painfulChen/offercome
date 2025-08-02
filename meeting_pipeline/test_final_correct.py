#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tencent Meeting • JWT demo (上月 1 号 ~ 本月 1 号)"""

import time, random, hmac, hashlib, base64, requests, urllib.parse, datetime, pytz

APP_ID = "233276242"          # 企业 ID
SDK_ID = "27370101959"        # 应用 ID         ← 只放头，不进签名
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"   # SecretId
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"  # SecretKey

def last_month_window():
    tz   = pytz.timezone("Asia/Shanghai")
    now  = datetime.datetime.now(tz)
    this = tz.localize(datetime.datetime(now.year, now.month, 1))
    last_month = this - datetime.timedelta(days=1)
    last = tz.localize(datetime.datetime(last_month.year, last_month.month, 1))
    return int(last.timestamp()), int(this.timestamp())

def make_hdr(method, uri):
    ts, nc = str(int(time.time())), str(random.randint(100000,999999))
    hl     = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
    sts    = f"{method}\n{hl}\n{uri}"               # ← 只 3 行
    sig    = base64.b64encode(
               hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
             ).decode()
    return {
        "AppId": APP_ID,
        "SdkId": SDK_ID,           # 头里带，但不进签名
        "X-TC-Key": SID,
        "X-TC-Nonce": nc,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

def main():
    print("腾讯会议API测试 - 完全修正版")
    print("=" * 50)
    print()
    
    # 获取时间窗口
    start_ts, end_ts = last_month_window()
    print(f"时间窗口: {start_ts} ~ {end_ts}")
    print(f"对应时间: {datetime.datetime.fromtimestamp(start_ts)} ~ {datetime.datetime.fromtimestamp(end_ts)}")
    print()
    
    # 构建请求
    params = dict(end_time=end_ts, start_time=start_ts, page=1, page_size=10)
    uri    = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))
    hdr    = make_hdr("GET", uri)
    
    print("=== 请求信息 ===")
    print(f"URI: {uri}")
    print("Headers:")
    for key, value in hdr.items():
        print(f"  {key}: {value}")
    print()
    
    # 发送请求
    try:
        url = "https://api.meeting.qq.com" + uri
        print(f"发送请求: {url}")
        print()
        
        resp = requests.get(url, headers=hdr, timeout=10)
        
        print("=== 响应信息 ===")
        print(f"HTTP状态码: {resp.status_code}")
        print(f"request_id: {resp.headers.get('X-TC-RequestId', '未获取到')}")
        print(f"响应体: {resp.text}")
        print()
        
        # 结果判读
        if resp.status_code == 200:
            print("✅ 签名通过！")
            try:
                data = resp.json()
                total_count = data.get('total_count', 0)
                print(f"总记录数: {total_count}")
                
                if total_count > 0:
                    print("📋 找到会议记录，可以继续调用 /v1/corp/addresses 获取下载地址")
                else:
                    print("📭 该时间段内没有会议录制数据")
                    
            except Exception as e:
                print(f"解析响应失败: {e}")
        elif resp.status_code in [401, 403]:
            print("❌ 接口权限未开启或时钟漂移 >5 min")
        elif "190303" in resp.text:
            print("❌ SID 与 APP_ID 不匹配（复制错）")
        elif "200003" in resp.text:
            print("❌ URI/Header/行数仍有差异，需要客服对比")
            print("请将以下信息发送给腾讯会议客服:")
            print("---")
            print(f"request_id: {resp.headers.get('X-TC-RequestId', '未获取到')}")
            print("签名串:")
            ts, nc = str(int(time.time())), str(random.randint(100000,999999))
            hl = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
            sts = f"GET\n{hl}\n{uri}"
            print(sts)
            print("---")
        else:
            print(f"❌ 未知错误: {resp.status_code}")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    main() 