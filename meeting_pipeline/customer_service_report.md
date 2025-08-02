# 腾讯会议API调试报告

## 问题描述
调用腾讯会议API时遇到签名验证错误（错误码：200003），需要官方客服协助调试签名差异。

## 测试环境
- 时间：2025-08-02 21:46:01
- 接口：`/v1/corp/records`
- 错误：API调用签名验证错误

## 请求信息

### 请求URL
```
GET https://api.meeting.qq.com/v1/corp/records?end_time=1754142361&page=1&page_size=1&start_time=1754138761
```

### 请求头
```
AppId: 233276242
SdkId: 27370101959
X-TC-Key: juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q
X-TC-Nonce: 534465
X-TC-Timestamp: 1754142361
X-TC-Signature: MjvZEipayg5I/KmpeC0X/RrVRDzpTfGihXfi4ic3KIA=
Content-Type: application/json
```

### 签名串（客户端计算）
```
GET
X-TC-Key=juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q&X-TC-Nonce=534465&X-TC-Timestamp=1754142361
/v1/corp/records?end_time=1754142361&page=1&page_size=1&start_time=1754138761
```

### 密钥信息
- AppId: 233276242
- SdkId: 27370101959
- SecretId: juh9DMb5FHRTzSxd74xqt2LeSyVhbb3q
- SecretKey: udBxVXBVEukBK98lcUNI2V7NPrFKY6rBUZn0P4pfJalOSfZ3

## 响应信息
- 状态码：400
- 错误码：200003
- 错误信息：API调用签名验证错误

## 需要客服协助
1. 请提供服务器端接收到的完整签名串
2. 请提供服务器端计算出的签名值
3. 请确认密钥配置是否正确
4. 请确认接口权限是否已开启

## 联系方式
- 企业微信搜索：会议开放平台
- 提供以上调试信息，请求协助排查签名差异 