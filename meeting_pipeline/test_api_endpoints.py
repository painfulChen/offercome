#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全面的API端点测试脚本
测试腾讯会议API和Kimi API的各种可能接口地址
"""

import requests
import json
import time
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

SECRET_ID = os.getenv("TQM_SECRET_ID")
SECRET_KEY = os.getenv("TQM_SECRET_KEY")
ENTERPRISE_ID = os.getenv("ENTERPRISE_ID")
APP_ID = os.getenv("APP_ID")
KIMI_API_KEY = os.getenv("KIMI_API_KEY")

def test_tencent_meeting_apis():
    """测试腾讯会议API的各种可能端点"""
    print("🔍 测试腾讯会议API端点...")
    
    # 腾讯会议可能的token端点
    token_endpoints = [
        "https://api.meeting.qq.com/v1/oauth/token",
        "https://api.meeting.qq.com/oauth/token", 
        "https://api.meeting.qq.com/v1/auth/token",
        "https://api.meeting.qq.com/auth/token",
        "https://meeting.tencent.com/api/oauth/token",
        "https://meeting.tencent.com/api/auth/token",
        "https://api.tencentmeeting.com/v1/oauth/token",
        "https://api.tencentmeeting.com/oauth/token"
    ]
    
    # 腾讯会议可能的请求参数格式
    payload_formats = [
        {"secret_id": SECRET_ID, "secret_key": SECRET_KEY},
        {"app_id": APP_ID, "secret_id": SECRET_ID, "secret_key": SECRET_KEY},
        {"enterprise_id": ENTERPRISE_ID, "secret_id": SECRET_ID, "secret_key": SECRET_KEY},
        {"app_id": APP_ID, "enterprise_id": ENTERPRISE_ID, "secret_id": SECRET_ID, "secret_key": SECRET_KEY}
    ]
    
    working_token_endpoint = None
    working_payload = None
    access_token = None
    
    for endpoint in token_endpoints:
        print(f"\n📡 测试端点: {endpoint}")
        
        for i, payload in enumerate(payload_formats):
            try:
                print(f"  尝试参数格式 {i+1}: {list(payload.keys())}")
                
                response = requests.post(endpoint, json=payload, timeout=10)
                print(f"  状态码: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"  响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
                    
                    if "access_token" in data:
                        working_token_endpoint = endpoint
                        working_payload = payload
                        access_token = data["access_token"]
                        print(f"  ✅ 找到工作的token端点!")
                        break
                        
            except Exception as e:
                print(f"  错误: {e}")
        
        if access_token:
            break
    
    if not access_token:
        print("\n❌ 无法找到工作的腾讯会议token端点")
        return None, None, None
    
    print(f"\n✅ 腾讯会议API配置:")
    print(f"  Token端点: {working_token_endpoint}")
    print(f"  参数格式: {working_payload}")
    print(f"  Access Token: {access_token[:20]}...")
    
    return working_token_endpoint, working_payload, access_token

def test_meeting_list_apis(token):
    """测试会议列表API"""
    if not token:
        return None, None
    
    print("\n🔍 测试会议列表API端点...")
    
    # 会议列表可能的端点
    list_endpoints = [
        "https://api.meeting.qq.com/v1/records",
        "https://api.meeting.qq.com/v1/meetings", 
        "https://api.meeting.qq.com/records",
        "https://api.meeting.qq.com/meetings",
        "https://meeting.tencent.com/api/records",
        "https://meeting.tencent.com/api/meetings",
        "https://api.tencentmeeting.com/v1/records",
        "https://api.tencentmeeting.com/records"
    ]
    
    # 计算时间范围（最近7天）
    end_time = int(time.time())
    start_time = end_time - (7 * 24 * 3600)
    
    working_list_endpoint = None
    working_params = None
    
    for endpoint in list_endpoints:
        print(f"\n📡 测试会议列表端点: {endpoint}")
        
        # 尝试不同的参数格式
        param_formats = [
            {"start_time": start_time, "end_time": end_time, "page": 1, "page_size": 10},
            {"start_time": start_time, "end_time": end_time, "page": 1, "page_size": 10, "app_id": APP_ID},
            {"start_time": start_time, "end_time": end_time, "page": 1, "page_size": 10, "enterprise_id": ENTERPRISE_ID},
            {"start_time": start_time, "end_time": end_time, "page": 1, "page_size": 10, "app_id": APP_ID, "enterprise_id": ENTERPRISE_ID}
        ]
        
        for i, params in enumerate(param_formats):
            try:
                print(f"  尝试参数格式 {i+1}")
                
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(endpoint, params=params, headers=headers, timeout=30)
                print(f"  状态码: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"  响应: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}...")
                    
                    if "records" in data or "meetings" in data:
                        working_list_endpoint = endpoint
                        working_params = params
                        print(f"  ✅ 找到工作的会议列表端点!")
                        break
                        
            except Exception as e:
                print(f"  错误: {e}")
        
        if working_list_endpoint:
            break
    
    if not working_list_endpoint:
        print("\n❌ 无法找到工作的会议列表端点")
        return None, None
    
    print(f"\n✅ 会议列表API配置:")
    print(f"  端点: {working_list_endpoint}")
    print(f"  参数: {working_params}")
    
    return working_list_endpoint, working_params

def test_kimi_apis():
    """测试Kimi API的各种可能端点"""
    print("\n🔍 测试Kimi API端点...")
    
    # Kimi可能的端点
    kimi_endpoints = [
        "https://kimi.moonshot.cn/api/chat-messages",
        "https://api.moonshot.cn/v1/chat/completions",
        "https://api.moonshot.cn/chat/completions",
        "https://kimi.moonshot.cn/api/v1/chat/completions",
        "https://kimi.moonshot.cn/api/chat/completions",
        "https://api.moonshot.cn/v1/audio/transcriptions",
        "https://kimi.moonshot.cn/api/audio/transcriptions"
    ]
    
    # Kimi可能的请求格式
    kimi_payloads = [
        # Chat格式
        {
            "messages": [{"role": "user", "content": "你好，请简单回复一下测试消息。"}],
            "stream": False
        },
        # OpenAI兼容格式
        {
            "model": "moonshot-v1-8k",
            "messages": [{"role": "user", "content": "你好，请简单回复一下测试消息。"}],
            "stream": False
        },
        # 简化格式
        {
            "prompt": "你好，请简单回复一下测试消息。",
            "max_tokens": 100
        }
    ]
    
    working_kimi_endpoint = None
    working_kimi_payload = None
    
    for endpoint in kimi_endpoints:
        print(f"\n📡 测试Kimi端点: {endpoint}")
        
        for i, payload in enumerate(kimi_payloads):
            try:
                print(f"  尝试请求格式 {i+1}")
                
                headers = {
                    "Authorization": f"Bearer {KIMI_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
                print(f"  状态码: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"  响应: {json.dumps(data, indent=2, ensure_ascii=False)[:300]}...")
                    
                    # 检查是否有合理的响应
                    if "choices" in data or "content" in data or "text" in data:
                        working_kimi_endpoint = endpoint
                        working_kimi_payload = payload
                        print(f"  ✅ 找到工作的Kimi端点!")
                        break
                        
            except Exception as e:
                print(f"  错误: {e}")
        
        if working_kimi_endpoint:
            break
    
    if not working_kimi_endpoint:
        print("\n❌ 无法找到工作的Kimi API端点")
        return None, None
    
    print(f"\n✅ Kimi API配置:")
    print(f"  端点: {working_kimi_endpoint}")
    print(f"  请求格式: {list(working_kimi_payload.keys())}")
    
    return working_kimi_endpoint, working_kimi_payload

def main():
    """主测试函数"""
    print("🚀 开始全面API端点测试...")
    print(f"腾讯会议配置:")
    print(f"  Secret ID: {SECRET_ID}")
    print(f"  Enterprise ID: {ENTERPRISE_ID}")
    print(f"  App ID: {APP_ID}")
    print(f"Kimi配置:")
    print(f"  API Key: {KIMI_API_KEY[:20]}...")
    
    # 测试腾讯会议API
    token_endpoint, token_payload, token = test_tencent_meeting_apis()
    
    if token:
        # 测试会议列表API
        list_endpoint, list_params = test_meeting_list_apis(token)
    else:
        list_endpoint, list_params = None, None
    
    # 测试Kimi API
    kimi_endpoint, kimi_payload = test_kimi_apis()
    
    # 总结报告
    print("\n" + "="*60)
    print("📋 API测试总结报告")
    print("="*60)
    
    if token_endpoint and list_endpoint:
        print("✅ 腾讯会议API - 配置成功")
        print(f"  Token端点: {token_endpoint}")
        print(f"  会议列表端点: {list_endpoint}")
    else:
        print("❌ 腾讯会议API - 配置失败")
        print("  需要检查API密钥和端点地址")
    
    if kimi_endpoint:
        print("✅ Kimi API - 配置成功")
        print(f"  端点: {kimi_endpoint}")
    else:
        print("❌ Kimi API - 配置失败")
        print("  需要检查API密钥和端点地址")
    
    print("\n🔧 建议:")
    if not token_endpoint:
        print("  1. 检查腾讯会议API密钥是否正确")
        print("  2. 确认API权限和配置")
        print("  3. 查看腾讯会议API官方文档")
    
    if not kimi_endpoint:
        print("  1. 检查Kimi API密钥是否正确")
        print("  2. 确认API端点和请求格式")
        print("  3. 查看Kimi API官方文档")

if __name__ == "__main__":
    main() 