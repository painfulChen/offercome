#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
等待录制权限开通后的测试脚本
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 确认的密钥配置
APP_ID = "27370101959"
SECRET_ID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SECRET_KEY = "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"

def generate_signature(method, uri, body=""):
    """生成腾讯会议API签名"""
    timestamp = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    header_string = f"X-TC-Key={SECRET_ID}&X-TC-Nonce={nonce}&X-TC-Timestamp={timestamp}"
    string_to_sign = f"{method}\n{header_string}\n{uri}\n{body}\n"
    
    signature = base64.b64encode(
        hmac.new(SECRET_KEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    return {
        "Content-Type": "application/json",
        "AppId": APP_ID,
        "X-TC-Key": SECRET_ID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": timestamp,
        "X-TC-Signature": signature
    }

def test_recording_permission():
    """测试录制权限是否已开通"""
    print("🔍 测试录制权限是否已开通...")
    print(f"AppID: {APP_ID}")
    print(f"SecretID: {SECRET_ID[:10]}...")
    print(f"当前时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    # 测试时间范围：最近7天
    end_time = int(time.time())
    start_time = end_time - (7 * 24 * 3600)
    
    uri = f"/v1/corp/records?page_size=1&page=1&start_time={start_time}&end_time={end_time}"
    
    try:
        headers = generate_signature("GET", uri)
        print(f"请求头: {json.dumps(headers, indent=2)}")
        
        url = f"https://api.meeting.qq.com{uri}"
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 录制权限已开通！")
            print(f"总记录数: {data.get('total_count', 0)}")
            if data.get('records'):
                print(f"找到 {len(data['records'])} 条录制记录")
            return True
        elif response.status_code == 401 or response.status_code == 403:
            print("⚠️ 签名通过但权限不足 - 权限可能还在生效中")
            return False
        else:
            print(f"❌ 请求失败 - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def test_multiple_times():
    """多次测试，等待权限生效"""
    print("🔄 开始多次测试，等待权限生效...")
    print("=" * 60)
    
    for i in range(1, 6):
        print(f"\n📋 第 {i} 次测试")
        print("-" * 30)
        
        success = test_recording_permission()
        
        if success:
            print(f"\n🎉 第 {i} 次测试成功！权限已生效")
            return True
        else:
            print(f"第 {i} 次测试失败，等待 30 秒后重试...")
            if i < 5:  # 不是最后一次
                time.sleep(30)
    
    print("\n❌ 5次测试都失败，请检查:")
    print("1. 录制权限是否已正确开通")
    print("2. 是否已点击'批量开通'并等待生效")
    print("3. 是否需要超级管理员审批")
    return False

if __name__ == "__main__":
    print("🚀 录制权限测试")
    print("请确保已在后台开通录制权限:")
    print("- 管理后台 → 开放平台 → 应用管理 → ChatChat 2.0")
    print("- 权限范围 → 录制 → 勾选'管理员查看全部录制'")
    print("- 点击'批量开通'并等待生效")
    print("=" * 60)
    
    # 先测试一次
    success = test_recording_permission()
    
    if not success:
        print("\n⚠️ 首次测试失败，开始多次重试...")
        test_multiple_times()
    else:
        print("\n✅ 权限已生效，可以开始获取真实数据！") 