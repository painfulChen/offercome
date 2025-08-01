#!/usr/bin/env node

/**
 * 最终MBTI测试脚本
 * 直接测试修复后的API
 */

const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testMBTIFinal() {
  console.log('🧪 最终MBTI测试...\n');
  
  try {
    // 测试1: 健康检查
    console.log('📋 测试1: 健康检查');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    console.log('');
    
    // 测试2: MBTI计算（简化数据）
    console.log('📋 测试2: MBTI计算');
    const calculateResponse = await axios.post(`${API_BASE_URL}/mbti/calculate`, {
      answers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ MBTI计算成功:', calculateResponse.data);
    
    if (calculateResponse.data.success) {
      console.log('🎯 MBTI类型:', calculateResponse.data.data.mbtiType);
      console.log('📊 得分:', calculateResponse.data.data.scores);
      console.log('📝 描述:', calculateResponse.data.data.description);
    }
    
    // 测试3: 移动端页面访问
    console.log('\n📋 测试3: 移动端页面访问');
    const mobileResponse = await axios.get('https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/mbti-mobile-optimized.html');
    console.log('✅ 移动端页面访问成功，状态码:', mobileResponse.status);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 状态码:', error.response.status);
      console.error('📋 响应数据:', error.response.data);
    }
  }
}

testMBTIFinal();
