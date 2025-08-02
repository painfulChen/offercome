#!/usr/bin/env python3
# coding: utf-8
"""
腾讯会议 • 企业自建应用（JWT）签名 Demo
使用同步的密钥对 - SecretId和SecretKey必须来自同一对
"""

import time, random, hmac, hashlib, base64, requests
from urllib.parse import urlencode

APP_ID = "233276242"        # 企业 ID
SDK_ID = "27370101959"      # 应用 ID
SID    = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"        # 当前 SecretId
SKEY   = "udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3"       # 当前 SecretKey

def make_headers(method: str, uri: str) -> dict:
    ts     = str(int(time.time()))
    nonce  = str(random.randint(100000, 999999))
    
    # 参与签名的只有三项 X-TC-*
    hl_sig = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    sts    = f"{method}\n{hl_sig}\n{uri}\n"   # 四行，末尾保留 \n
    
    sign = base64.b64encode(
              hmac.new(SKEY.encode(), sts.encode(), hashlib.sha256).digest()
           ).decode()

    return {
        "AppId": APP_ID,           # 只放头，不进签名
        "SdkId": SDK_ID,           # 必放头，不进签名
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sign,
        "Content-Type": "application/json"
    }

def test_records_api():
    """测试会议录制列表API"""
    print("=== 测试会议录制列表API ===")
    
    # ---------- 业务调用 ----------
    params = dict(end_time=1738272000, page=1, page_size=10, start_time=1735689600)
    uri    = "/v1/corp/records?" + urlencode(sorted(params.items()))
    
    print(f"请求URI: {uri}")
    print(f"企业ID: {APP_ID}")
    print(f"应用ID: {SDK_ID}")
    print(f"SecretId: {SID}")
    print(f"SecretKey: {SKEY[:10]}...")
    
    headers = make_headers("GET", uri)
    print(f"请求头: {headers}")
    
    resp = requests.get("https://api.meeting.qq.com" + uri,
                        headers=headers, timeout=10)
    
    print(f"状态码: {resp.status_code}")
    print(f"响应体: {resp.text}")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ 成功！总记录数: {data.get('total_count', 0)}")
    elif resp.status_code == 190303:
        print("❌ SID与AppId不匹配 - 混用了旧/别的应用的SID")
    elif resp.status_code == 200003:
        print("❌ SID匹配但Signature用错Key - 需要重新同步同一对密钥")
    elif resp.status_code in [401, 403]:
        print("❌ 接口权限未勾选或Timestamp超5分钟")
    else:
        print(f"❌ 请求失败: {resp.status_code}")

def test_meetings_api():
    """测试会议列表API"""
    print("\n=== 测试会议列表API ===")
    
    params = dict(end_time=1738272000, page=1, page_size=10, start_time=1735689600)
    uri    = "/v1/corp/meetings?" + urlencode(sorted(params.items()))
    
    print(f"请求URI: {uri}")
    
    headers = make_headers("GET", uri)
    resp = requests.get("https://api.meeting.qq.com" + uri,
                        headers=headers, timeout=10)
    
    print(f"状态码: {resp.status_code}")
    print(f"响应体: {resp.text}")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ 成功！总会议数: {data.get('total_count', 0)}")
    else:
        print(f"❌ 请求失败: {resp.status_code}")

if __name__ == "__main__":
    print("腾讯会议API测试 - 同步密钥对版本")
    print("=" * 50)
    
    test_records_api()
    test_meetings_api() 