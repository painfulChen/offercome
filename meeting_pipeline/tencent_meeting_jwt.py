#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯会议API JWT签名工具
使用最新重置的密钥和企业ID
"""

import time
import random
import hmac
import hashlib
import base64
import requests
import json

# 最新重置的密钥配置
APP_ID = "233276242"                   # 企业ID
SDK_ID = "27370101959"                 # 应用ID (SdkId)
SECRET_ID = "juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q"
SECRET_KEY = "RjAk20VrzQKshN4IdWypShP95RdJ2hE8aYERA80cZFsc12Ie"
API_BASE = "https://api.meeting.qq.com"

def generate_signature(method, uri, body=""):
    """
    生成腾讯会议API签名
    
    Args:
        method: HTTP方法 (GET, POST等)
        uri: 请求路径 (不包含域名)
        body: 请求体 (可选)
    
    Returns:
        dict: 包含所有必要请求头的字典
    """
    # 生成时间戳和随机数
    timestamp = str(int(time.time()))
    nonce = str(random.randint(100000, 999999))
    
    # 构建签名头字符串
    header_string = f"X-TC-Key={SECRET_ID}&X-TC-Nonce={nonce}&X-TC-Timestamp={timestamp}"
    
    # 构建待签名字符串
    string_to_sign = f"{method}\n{header_string}\n{uri}\n{body}"
    
    # 生成签名
    signature = base64.b64encode(
        hmac.new(SECRET_KEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    # 返回请求头
    return {
        "Content-Type": "application/json",
        "AppId": APP_ID,  # 企业ID，不参与签名
        "SdkId": SDK_ID,  # 应用ID，不参与签名
        "X-TC-Key": SECRET_ID,
        "X-TC-Nonce": nonce,
        "X-TC-Timestamp": timestamp,
        "X-TC-Signature": signature
    }

def list_records(start_time, end_time, page=1, page_size=50):
    """
    获取会议录制列表
    
    Args:
        start_time: 开始时间戳
        end_time: 结束时间戳
        page: 页码
        page_size: 每页数量
    
    Returns:
        dict: API响应数据
    """
    uri = f"/v1/corp/records?page_size={page_size}&page={page}&start_time={start_time}&end_time={end_time}"
    
    headers = generate_signature("GET", uri)
    
    try:
        response = requests.get(
            API_BASE + uri,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ API请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def get_record_address(meeting_record_id):
    """
    获取录制文件下载地址
    
    Args:
        meeting_record_id: 录制ID
    
    Returns:
        dict: 包含下载地址的响应数据
    """
    uri = f"/v1/addresses?meeting_record_id={meeting_record_id}"
    
    headers = generate_signature("GET", uri)
    
    try:
        response = requests.get(
            API_BASE + uri,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ 获取下载地址失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_api_connection():
    """
    测试API连接
    """
    print("🔍 测试腾讯会议API连接...")
    print(f"🔑 AppID: {APP_ID} (企业ID)")
    print(f"🔑 SdkId: {SDK_ID} (应用ID)")
    print(f"🔑 SecretId: {SECRET_ID[:10]}...")
    print("-" * 50)
    
    # 测试时间范围：最近24小时
    end_time = int(time.time())
    start_time = end_time - 86400  # 24小时前
    
    result = list_records(start_time, end_time, page=1, page_size=10)
    
    if result:
        print("✅ API连接成功！")
        print(f"📈 总记录数: {result.get('total_count', 0)}")
        if 'records' in result and result['records']:
            print(f"📝 第一条记录ID: {result['records'][0].get('meeting_record_id', 'N/A')}")
        else:
            print("⚠️  当前时间范围内没有录制数据")
        return True
    else:
        print("❌ API连接失败")
        return False

if __name__ == "__main__":
    success = test_api_connection()
    
    if not success:
        print("\n⚠️ API连接失败，可能的原因:")
        print("1. 密钥已过期或权限不足")
        print("2. 企业后台未开启API权限")
        print("3. 需要联系O3确认API配置")
        print("\n请向O3确认以下信息:")
        print("- 腾讯会议企业后台 → 开放平台 → 应用管理 → 应用ID: 27370101959 → 接口权限")
        print("- 是否已勾选'云录制管理'权限？")
        print("- 是否已保存权限配置？")
    else:
        print("\n✅ 可以开始获取真实的会议数据了！") 