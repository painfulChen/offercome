const fetch = require('node-fetch');

async function testEnhancedMBTI() {
    const apiUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api16/mbti/calculate';
    
    // 测试数据
    const testCases = [
        {
            name: '计算机科学 + 985',
            data: {
                answers: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                userInfo: {
                    major: '计算机科学',
                    school: '985',
                    email: 'test@example.com'
                }
            }
        },
        {
            name: '金融学 + 211',
            data: {
                answers: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                userInfo: {
                    major: '金融学',
                    school: '211',
                    email: 'finance@example.com'
                }
            }
        },
        {
            name: '心理学 + 海外QS50',
            data: {
                answers: [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                userInfo: {
                    major: '心理学',
                    school: '海外qs50',
                    email: 'psychology@example.com'
                }
            }
        }
    ];

    console.log('🧪 开始测试增强版MBTI API...\n');

    for (const testCase of testCases) {
        console.log(`📋 测试案例: ${testCase.name}`);
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testCase.data)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ 测试成功`);
                console.log(`📊 MBTI类型: ${result.data.mbtiType}`);
                console.log(`🆔 测试ID: ${result.data.testId}`);
                console.log(`💼 适合职业数量: ${result.data.careerAdvice.suitable.length}`);
                console.log(`⚠️ 不适合职业数量: ${result.data.careerAdvice.unsuitable.length}`);
                console.log(`💪 优势分析数量: ${result.data.strengths.length}`);
                console.log(`📈 改进建议数量: ${result.data.improvements.length}`);
                
                // 显示第一个适合的职业
                if (result.data.careerAdvice.suitable.length > 0) {
                    const firstCareer = result.data.careerAdvice.suitable[0];
                    console.log(`🎯 推荐行业: ${firstCareer.industry}`);
                    console.log(`📝 推荐岗位: ${firstCareer.positions.join(', ')}`);
                }
            } else {
                console.log(`❌ 测试失败: ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ 请求失败: ${error.message}`);
        }
        
        console.log('---\n');
    }

    console.log('🎉 测试完成！');
}

testEnhancedMBTI(); 