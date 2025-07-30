const https = require('https');

// 测试20题MBTI功能
async function test20QuestionMBTI() {
    console.log('🧪 测试20题MBTI功能...');
    
    try {
        // 测试问题获取
        console.log('\n1. 测试问题获取...');
        const questionsResponse = await makeRequest({
            url: 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2/mbti/questions',
            method: 'GET'
        });
        
        if (questionsResponse.status === 200) {
            const questionsData = JSON.parse(questionsResponse.data);
            console.log(`✅ 问题获取成功，共 ${questionsData.data.length} 题`);
            
            // 验证问题数量
            if (questionsData.data.length === 20) {
                console.log('✅ 问题数量正确 (20题)');
            } else {
                console.log(`❌ 问题数量错误，期望20题，实际${questionsData.data.length}题`);
            }
        } else {
            console.log(`❌ 问题获取失败: ${questionsResponse.status}`);
        }
        
        // 测试MBTI计算
        console.log('\n2. 测试MBTI计算...');
        const calculateResponse = await makeRequest({
            url: 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2/mbti/calculate',
            method: 'POST',
            data: JSON.stringify({
                type: 'INTJ',
                scores: { E: 2, I: 8, S: 3, N: 7, T: 9, F: 1, J: 8, P: 2 }
            })
        });
        
        if (calculateResponse.status === 200) {
            const resultData = JSON.parse(calculateResponse.data);
            console.log('✅ MBTI计算成功');
            console.log(`📊 类型: ${resultData.data.type}`);
            console.log(`📊 置信度: ${resultData.data.confidence}%`);
            console.log(`📊 职业推荐数量: ${resultData.data.recommendations.careerFocus.length}`);
            console.log(`📊 维度分析: ${Object.keys(resultData.data.dimensionAnalysis).length} 个维度`);
            
            // 验证新功能
            if (resultData.data.workStyle && resultData.data.teamRole) {
                console.log('✅ 工作风格和团队角色信息完整');
            }
            
            if (resultData.data.recommendations.workEnvironment) {
                console.log('✅ 工作环境建议完整');
            }
            
            if (resultData.data.recommendations.teamCollaboration) {
                console.log('✅ 团队合作建议完整');
            }
            
            // 显示详细结果
            console.log('\n📋 详细结果:');
            console.log(`   类型: ${resultData.data.type} - ${resultData.data.title}`);
            console.log(`   描述: ${resultData.data.description}`);
            console.log(`   工作风格: ${resultData.data.workStyle}`);
            console.log(`   团队角色: ${resultData.data.teamRole}`);
            
            console.log('\n💼 职业推荐:');
            resultData.data.recommendations.careerFocus.forEach((career, index) => {
                console.log(`   ${index + 1}. ${career.title}`);
                console.log(`      原因: ${career.reason}`);
            });
            
            console.log('\n📊 维度分析:');
            Object.entries(resultData.data.dimensionAnalysis).forEach(([key, analysis]) => {
                console.log(`   ${analysis.dimension}: ${analysis.description}`);
            });
            
        } else {
            console.log(`❌ MBTI计算失败: ${calculateResponse.status}`);
        }
        
        console.log('\n🎉 20题MBTI测试功能验证完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 发起HTTP请求
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const url = new URL(options.url);
        
        const reqOptions = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MBTI-Test/1.0'
            },
            timeout: 10000
        };
        
        if (options.data) {
            reqOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
        }
        
        const req = https.request(reqOptions, (res) => {
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
        
        if (options.data) {
            req.write(options.data);
        }
        
        req.end();
    });
}

// 运行测试
test20QuestionMBTI(); 