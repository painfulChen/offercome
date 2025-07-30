const https = require('https');
const http = require('http');

// 性能测试配置
const config = {
    baseUrl: 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com',
    apiPrefix: '/api-v2',
    testCount: 10,
    timeout: 5000
};

// 测试用例
const testCases = [
    {
        name: '首页加载',
        url: 'https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com/index-optimized.html',
        method: 'GET'
    },
    {
        name: 'MBTI问题获取',
        url: `${config.baseUrl}${config.apiPrefix}/mbti/questions`,
        method: 'GET'
    },
    {
        name: 'MBTI计算',
        url: `${config.baseUrl}${config.apiPrefix}/mbti/calculate`,
        method: 'POST',
        data: JSON.stringify({
            type: 'INTJ',
            scores: { E: 2, I: 6, S: 3, N: 5, T: 7, F: 1, J: 6, P: 2 }
        })
    },
    {
        name: '健康检查',
        url: `${config.baseUrl}${config.apiPrefix}/health`,
        method: 'GET'
    }
];

// 性能测试函数
async function performanceTest(testCase) {
    console.log(`\n🧪 测试: ${testCase.name}`);
    console.log(`📍 URL: ${testCase.url}`);
    
    const results = [];
    
    for (let i = 0; i < config.testCount; i++) {
        const startTime = Date.now();
        
        try {
            const result = await makeRequest(testCase);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            results.push({
                duration,
                status: result.status,
                success: result.status >= 200 && result.status < 300
            });
            
            console.log(`  ${i + 1}/${config.testCount}: ${duration}ms (${result.status})`);
            
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            results.push({
                duration,
                status: 0,
                success: false,
                error: error.message
            });
            
            console.log(`  ${i + 1}/${config.testCount}: ${duration}ms (ERROR: ${error.message})`);
        }
        
        // 短暂延迟，避免过于频繁的请求
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 计算统计数据
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    const avgDuration = successfulResults.length > 0 
        ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length 
        : 0;
    
    const minDuration = successfulResults.length > 0 
        ? Math.min(...successfulResults.map(r => r.duration)) 
        : 0;
    
    const maxDuration = successfulResults.length > 0 
        ? Math.max(...successfulResults.map(r => r.duration)) 
        : 0;
    
    const successRate = (successfulResults.length / results.length) * 100;
    
    console.log(`\n📊 测试结果:`);
    console.log(`  ✅ 成功率: ${successRate.toFixed(1)}%`);
    console.log(`  ⏱️  平均响应时间: ${avgDuration.toFixed(0)}ms`);
    console.log(`  🚀 最快响应: ${minDuration}ms`);
    console.log(`  🐌 最慢响应: ${maxDuration}ms`);
    console.log(`  ❌ 失败次数: ${failedResults.length}`);
    
    if (failedResults.length > 0) {
        console.log(`  🔍 失败详情:`);
        failedResults.forEach((result, index) => {
            console.log(`    ${index + 1}. ${result.error || `HTTP ${result.status}`}`);
        });
    }
    
    return {
        testCase: testCase.name,
        successRate,
        avgDuration,
        minDuration,
        maxDuration,
        totalTests: results.length,
        failedTests: failedResults.length
    };
}

// 发起HTTP请求
function makeRequest(testCase) {
    return new Promise((resolve, reject) => {
        const url = new URL(testCase.url);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: testCase.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'PerformanceTest/1.0'
            },
            timeout: config.timeout
        };
        
        if (testCase.data) {
            options.headers['Content-Length'] = Buffer.byteLength(testCase.data);
        }
        
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (testCase.data) {
            req.write(testCase.data);
        }
        
        req.end();
    });
}

// 主测试函数
async function runAllTests() {
    console.log('🚀 开始性能测试...');
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    console.log(`🔄 每个测试重复 ${config.testCount} 次`);
    
    const allResults = [];
    
    for (const testCase of testCases) {
        const result = await performanceTest(testCase);
        allResults.push(result);
    }
    
    // 总结报告
    console.log('\n' + '='.repeat(60));
    console.log('📈 性能测试总结报告');
    console.log('='.repeat(60));
    
    const overallSuccessRate = allResults.reduce((sum, r) => sum + r.successRate, 0) / allResults.length;
    const overallAvgDuration = allResults.reduce((sum, r) => sum + r.avgDuration, 0) / allResults.length;
    
    console.log(`\n🎯 整体表现:`);
    console.log(`  ✅ 平均成功率: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`  ⏱️  平均响应时间: ${overallAvgDuration.toFixed(0)}ms`);
    
    console.log(`\n📋 详细结果:`);
    allResults.forEach(result => {
        const status = result.successRate >= 90 ? '🟢' : result.successRate >= 70 ? '🟡' : '🔴';
        console.log(`  ${status} ${result.testCase}: ${result.avgDuration.toFixed(0)}ms (${result.successRate.toFixed(1)}%)`);
    });
    
    // 性能评级
    let performanceGrade = 'A';
    if (overallAvgDuration > 1000) performanceGrade = 'C';
    else if (overallAvgDuration > 500) performanceGrade = 'B';
    
    let reliabilityGrade = 'A';
    if (overallSuccessRate < 80) reliabilityGrade = 'C';
    else if (overallSuccessRate < 95) reliabilityGrade = 'B';
    
    console.log(`\n🏆 性能评级:`);
    console.log(`  📊 响应速度: ${performanceGrade}级 (${overallAvgDuration.toFixed(0)}ms)`);
    console.log(`  🔒 可靠性: ${reliabilityGrade}级 (${overallSuccessRate.toFixed(1)}%)`);
    
    if (performanceGrade === 'A' && reliabilityGrade === 'A') {
        console.log(`\n🎉 优秀！系统性能表现卓越，用户体验良好。`);
    } else if (performanceGrade === 'B' || reliabilityGrade === 'B') {
        console.log(`\n👍 良好！系统性能表现良好，建议进一步优化。`);
    } else {
        console.log(`\n⚠️  需要优化！建议检查系统配置和网络连接。`);
    }
}

// 运行测试
runAllTests().catch(console.error); 