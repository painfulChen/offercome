#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API测试 - 使用正确的路径
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新密钥配置
APPID = "27370101959"
SID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SKEY = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
HOST = "https://api.meeting.qq.com"

def sign(method, uri, body=""):
    """生成签名 - 注意末尾要有换行符"""
    ts, nc = str(int(time.time())), str(random.randint(100000, 999999))
    line = f"X-TC-Key={SID}&X-TC-Nonce={nc}&X-TC-Timestamp={ts}"
    raw = f"{method}\n{line}\n{uri}\n{body}\n"  # 注意最后的换行符
    sig = base64.b64encode(hmac.new(SKEY.encode(), raw.encode(), hashlib.sha256).digest()).decode()
    return {
        "AppId": APPID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nc,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }

def test_corp_records():
    """测试企业录制列表 - 正确的路径"""
    print("🔍 测试企业录制列表 - 使用正确的路径")
    print(f"AppID: {APPID}")
    print(f"SecretID: {SID[:10]}...")
    print("-" * 50)
    
    # 时间窗口：2025-01-01 ~ 2025-01-31
    start, end = 1735689600, 1738272000
    uri = f"/v1/corp/records?page_size=1&page=1&start_time={start}&end_time={end}"
    
    print(f"URI: {uri}")
    print(f"时间范围: {start} - {end}")
    
    try:
        headers = sign("GET", uri)
        print(f"请求头: {json.dumps(headers, indent=2)}")
        
        response = requests.get(HOST + uri, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 企业录制列表获取成功")
            print(f"总记录数: {data.get('total_count', 0)}")
            return True
        else:
            print(f"❌ 企业录制列表获取失败 - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 企业录制列表请求异常: {e}")
        return False

def test_corp_addresses():
    """测试获取录制文件地址"""
    print("\n📁 测试获取录制文件地址...")
    
    # 假设有一个录制ID（实际应该从录制列表获取）
    record_id = "1234567890"  # 示例ID
    uri = f"/v1/corp/addresses?meeting_record_id={record_id}"
    
    try:
        headers = sign("GET", uri)
        response = requests.get(HOST + uri, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            print("✅ 录制文件地址获取成功")
            return True
        else:
            print(f"❌ 录制文件地址获取失败 - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 录制文件地址请求异常: {e}")
        return False

def test_curl_equivalent():
    """模拟curl命令的测试"""
    print("\n🔧 模拟curl命令测试...")
    
    # 时间窗口
    start, end = 1735689600, 1738272000
    
    # 生成参数
    ts = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    hdr = f"X-TC-Key={SID}&X-TC-Nonce={nonce}&X-TC-Timestamp={ts}"
    
    # 计算签名
    raw = f"GET\n{hdr}\n/v1/corp/records?page_size=1&page=1&start_time={start}&end_time={end}\n"
    sig = base64.b64encode(hmac.new(SKEY.encode(), raw.encode(), hashlib.sha256).digest()).decode()
    
    print(f"时间戳: {ts}")
    print(f"随机数: {nonce}")
    print(f"签名字符串: {raw}")
    print(f"签名结果: {sig}")
    
    # 发送请求
    url = f"{HOST}/v1/corp/records?page_size=1&page=1&start_time={start}&end_time={end}"
    headers = {
        "AppId": APPID,
        "X-TC-Key": SID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": ts,
        "X-TC-Signature": sig,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ curl模拟测试成功")
            print(f"总记录数: {data.get('total_count', 0)}")
            return True
        else:
            print(f"❌ curl模拟测试失败")
            return False
            
    except Exception as e:
        print(f"❌ curl模拟测试异常: {e}")
        return False

if __name__ == "__main__":
    print("🚀 腾讯会议API测试 - 使用正确的路径")
    print("=" * 60)
    
    # 1. 测试企业录制列表
    records_success = test_corp_records()
    
    # 2. 测试录制文件地址
    addresses_success = test_corp_addresses()
    
    # 3. 模拟curl测试
    curl_success = test_curl_equivalent()
    
    print("\n" + "=" * 60)
    print("📊 测试结果汇总:")
    print(f"企业录制列表: {'✅ 成功' if records_success else '❌ 失败'}")
    print(f"录制文件地址: {'✅ 成功' if addresses_success else '❌ 失败'}")
    print(f"curl模拟测试: {'✅ 成功' if curl_success else '❌ 失败'}")
    
    if not records_success:
        print("\n⚠️ 企业录制列表失败，可能的原因:")
        print("1. AppId与SecretId不匹配")
        print("2. 接口权限未开启（云录制管理）")
        print("3. 签名计算错误")
        print("\n请检查:")
        print("- 腾讯会议企业后台 → 开放平台 → 应用管理 → 应用ID: 27370101959 → 接口权限")
        print("- 是否已勾选'云录制管理'权限并保存")
    else:
        print("\n✅ 可以开始获取真实的会议数据了！") 