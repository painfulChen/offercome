#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API探活测试
先测试ping端点，再测试录制列表
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
    """生成签名"""
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

def ping():
    """测试ping端点 - 不依赖接口权限"""
    url = f"{HOST}/v1/ping?app_id={APPID}&secret_id={SID}"
    print("🔍 PING测试 - 验证AppId和SecretId匹配...")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("code") == 0:
                print("✅ PING成功 - AppId和SecretId匹配正确")
                return True
            else:
                print(f"❌ PING失败 - 错误码: {data.get('code')}")
                return False
        else:
            print(f"❌ PING请求失败 - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ PING请求异常: {e}")
        return False

def list_records():
    """测试录制列表 - 需要接口权限"""
    print("\n📋 录制列表测试 - 需要接口权限...")
    
    # 测试时间范围：2025年1月
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
            print("✅ 录制列表获取成功")
            print(f"总记录数: {data.get('total_count', 0)}")
            return True
        else:
            print(f"❌ 录制列表获取失败 - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 录制列表请求异常: {e}")
        return False

def test_oauth_token():
    """测试OAuth Token获取"""
    print("\n🔑 OAuth Token测试...")
    
    url = f"{HOST}/v1/oauth/token"
    data = {
        "secret_id": SID,
        "secret_key": SKEY
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            print("✅ OAuth Token获取成功")
            return True
        else:
            print(f"❌ OAuth Token获取失败")
            return False
            
    except Exception as e:
        print(f"❌ OAuth Token请求异常: {e}")
        return False

if __name__ == "__main__":
    print("🚀 腾讯会议API探活测试")
    print(f"AppID: {APPID}")
    print(f"SecretID: {SID[:10]}...")
    print(f"SecretKey: {SKEY[:10]}...")
    print("=" * 60)
    
    # 1. 测试ping端点
    ping_success = ping()
    
    # 2. 测试OAuth Token
    oauth_success = test_oauth_token()
    
    # 3. 测试录制列表
    records_success = list_records()
    
    print("\n" + "=" * 60)
    print("📊 测试结果汇总:")
    print(f"PING测试: {'✅ 成功' if ping_success else '❌ 失败'}")
    print(f"OAuth测试: {'✅ 成功' if oauth_success else '❌ 失败'}")
    print(f"录制列表: {'✅ 成功' if records_success else '❌ 失败'}")
    
    if not ping_success:
        print("\n⚠️ PING失败 - 说明AppId和SecretId不匹配")
        print("请检查:")
        print("1. AppId是否正确")
        print("2. SecretId是否正确")
        print("3. 密钥是否已被禁用")
    elif not records_success:
        print("\n⚠️ PING成功但录制列表失败 - 说明是接口权限问题")
        print("请检查:")
        print("1. 腾讯会议企业后台 → 开放平台 → 应用管理 → 接口权限")
        print("2. 是否已勾选'云录制管理'权限")
        print("3. 是否已保存权限配置")
    else:
        print("\n✅ 所有测试都成功！可以开始获取真实数据了") 