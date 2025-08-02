#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试AppId和SecretId匹配关系
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 测试不同的AppId配置
TEST_CONFIGS = [
    {
        "name": "当前配置",
        "app_id": "27370101959",
        "secret_id": "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q",
        "secret_key": "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
    },
    {
        "name": "企业ID配置",
        "app_id": "233276242",
        "secret_id": "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q", 
        "secret_key": "TrqYTjZxQ9GacQ4PeJ4wwV8GJ17A1yAJsOG2cirJ69CZJrYK"
    }
]

def generate_signature(app_id, secret_id, secret_key, method, uri, body=""):
    """生成签名"""
    timestamp = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    header_string = f"X-TC-Key={secret_id}&X-TC-Nonce={nonce}&X-TC-Timestamp={timestamp}"
    string_to_sign = f"{method}\n{header_string}\n{uri}\n{body}\n"
    
    signature = base64.b64encode(
        hmac.new(secret_key.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    return {
        "Content-Type": "application/json",
        "AppId": app_id,
        "X-TC-Key": secret_id,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": timestamp,
        "X-TC-Signature": signature
    }

def test_config(config):
    """测试特定配置"""
    print(f"\n🔍 测试配置: {config['name']}")
    print(f"AppID: {config['app_id']}")
    print(f"SecretID: {config['secret_id'][:10]}...")
    print("-" * 50)
    
    # 测试时间范围：最近7天
    end_time = int(time.time())
    start_time = end_time - (7 * 24 * 3600)
    
    uri = f"/v1/corp/records?page_size=1&page=1&start_time={start_time}&end_time={end_time}"
    
    try:
        headers = generate_signature(
            config['app_id'], 
            config['secret_id'], 
            config['secret_key'], 
            "GET", 
            uri
        )
        
        url = f"https://api.meeting.qq.com{uri}"
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 配置正确！")
            print(f"总记录数: {data.get('total_count', 0)}")
            return True
        elif response.status_code == 401 or response.status_code == 403:
            print("⚠️ 签名通过但权限不足")
            return False
        else:
            print(f"❌ 配置错误")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

if __name__ == "__main__":
    print("🚀 AppId和SecretId匹配测试")
    print("=" * 60)
    
    success = False
    
    for config in TEST_CONFIGS:
        if test_config(config):
            print(f"\n🎉 找到正确配置: {config['name']}")
            success = True
            break
    
    if not success:
        print("\n❌ 所有配置都失败")
        print("可能的原因:")
        print("1. AppId和SecretId不匹配")
        print("2. 需要超级管理员审批")
        print("3. 权限虽然开通但还未生效")
        print("\n建议:")
        print("- 检查腾讯会议企业后台 → 审批中心")
        print("- 确认AppId和SecretId是否属于同一个应用")
        print("- 等待权限生效（可能需要几分钟）") 