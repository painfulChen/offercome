#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tencent Meeting • 最终修正版 - 企业ID + 3行签名"""

import time, random, hmac, hashlib, base64, requests, urllib.parse, datetime, pytz

APP_ID  = "233276242"          # ← 企业 ID
SDK_ID  = "27370101959"        # ← 应用 ID，仅放头
SID     = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY    = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"

def last_month_window():
    """获取上个月时间窗口"""
    tz = pytz.timezone("Asia/Shanghai")
    now = datetime.datetime.now(tz)
    this = tz.localize(datetime.datetime(now.year, now.month, 1))
    last = (this - datetime.timedelta(days=1)).replace(day=1)
    return int(last.timestamp()), int(this.timestamp())

def make_hdr(uri):
    """生成请求头 - 3行签名版本"""
    ts, nc = str(int(time.time())), str(random.randint(100000,999999))
    hl = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
    sts = f"GET\n{hl}\n{uri}"                 # ★ 仅 3 行，无尾 LF
    sig = base64.b64encode(
            hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
          ).decode()
    return {
        "AppId": APP_ID,           # 企业ID
        "SdkId": SDK_ID,           # 应用ID，仅放头
        "X-TC-Key": SID,
        "X-TC-Nonce": nc,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

def main():
    print("腾讯会议API测试 - 最终修正版")
    print("=" * 50)
    print()
    
    # 1. 密钥配置检查
    print("=== 密钥配置 ===")
    print(f"AppId (企业ID): {APP_ID}")
    print(f"SdkId (应用ID): {SDK_ID}")
    print(f"SecretId: {SID}")
    print(f"SecretKey: {SKEY}")
    print()
    
    # 2. 时间窗口
    start_ts, end_ts = last_month_window()
    print("=== 时间窗口 ===")
    print(f"时间戳: {start_ts} ~ {end_ts}")
    print(f"对应时间: {datetime.datetime.fromtimestamp(start_ts)} ~ {datetime.datetime.fromtimestamp(end_ts)}")
    print()
    
    # 3. 构建请求
    params = dict(end_time=end_ts, start_time=start_ts, page=1, page_size=10)
    uri = "/v1/corp/records?" + urllib.parse.urlencode(sorted(params.items()))
    hdr = make_hdr(uri)
    
    print("=== 请求信息 ===")
    print(f"URI: {uri}")
    print("Headers:")
    for key, value in hdr.items():
        print(f"  {key}: {value}")
    print()
    
    # 4. 发送请求
    try:
        url = "https://api.meeting.qq.com" + uri
        print(f"发送请求: {url}")
        print()
        
        r = requests.get(url, headers=hdr, timeout=10)
        
        print("=== 响应信息 ===")
        print(f"HTTP状态码: {r.status_code}")
        print(f"request_id: {r.headers.get('X-TC-RequestId', '未获取到')}")
        print(f"响应体: {r.text}")
        print()
        
        # 5. 结果判读
        if r.status_code == 200:
            print("✅ 签名通过！")
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
        elif r.status_code in [401, 403]:
            print("❌ 接口权限未开启或时钟漂移 >5 min")
            print("请检查:")
            print("1. 腾讯会议后台 → 开放平台 → 应用管理 → 接口权限")
            print("2. 勾选'云录制管理'权限并保存")
            print("3. 同步系统时间: sudo ntpdate ntp.aliyun.com")
        elif "190303" in r.text:
            print("❌ SID 与 APP_ID 不匹配")
            print("请检查密钥是否来自同一张卡片")
        elif "200003" in r.text:
            print("❌ 签名验证错误")
            print("请将以下信息发送给腾讯会议客服:")
            print("---")
            print(f"request_id: {r.headers.get('X-TC-RequestId', '未获取到')}")
            print("签名串:")
            ts, nc = str(int(time.time())), str(random.randint(100000,999999))
            hl = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
            sts = f"GET\n{hl}\n{uri}"
            print(sts)
            print(f"本地签名: {hdr['X-TC-Signature']}")
            print("---")
        else:
            print(f"❌ 未知错误: {r.status_code}")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    main() 