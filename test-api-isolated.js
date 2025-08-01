#!/usr/bin/env node

/**
 * 完全独立的API测试
 */

const axios = require('axios');

const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com/api-v2';

async function testIsolated() {
  console.log('🧪 独立API测试...\n');
  
  try {
    // 测试1: 健康检查
    console.log('📋 测试1: 健康检查');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    console.log('');
    
    // 测试2: 获取MBTI问题
    console.log('📋 测试2: 获取MBTI问题');
    const questionsResponse = await axios.get(`${API_BASE_URL}/mbti/questions`);
    console.log('✅ 问题获取成功，问题数量:', questionsResponse.data.data?.length || 0);
    console.log('');
    
    // 测试3: MBTI计算（使用curl命令）
    console.log('📋 测试3: MBTI计算（curl）');
    const { exec } = require('child_process');
    const curlCommand = `curl -s -X POST "${API_BASE_URL}/mbti/calculate" -H 'Content-Type: application/json' -d '{"answers":[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]}'`;
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ curl执行失败:', error);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        console.log('📊 curl响应:', result);
        
        if (result.success) {
          console.log('✅ MBTI计算成功!');
          console.log('🎯 MBTI类型:', result.data?.mbtiType);
        } else {
          console.log('❌ MBTI计算失败:', result.message);
          console.log('🔍 错误详情:', result.error);
        }
      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError);
        console.log('📋 原始响应:', stdout);
      }
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 状态码:', error.response.status);
      console.error('📋 响应数据:', error.response.data);
    }
  }
}

testIsolated(); 