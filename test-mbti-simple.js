#!/usr/bin/env node

/**
 * 简化的MBTI测试脚本
 * 用于隔离数据库问题
 */

const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testMBTISimple() {
  console.log('🧪 简化MBTI测试...\n');
  
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
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 状态码:', error.response.status);
      console.error('📋 响应数据:', error.response.data);
    }
  }
}

testMBTISimple(); 