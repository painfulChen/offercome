// CloudBase函数 - 简化版本
exports.main = async (event, context) => {
  console.log('收到请求:', JSON.stringify(event));
  
  try {
    const rawPath = (event.path || '').replace(/^\/api16/, '') || '/';
    const { httpMethod: method = 'GET', body } = event;

    console.log('处理路径:', rawPath, '方法:', method);

    // 简单的路由处理
    if (rawPath === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'API服务正常运行',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (rawPath === '/mbti/questions' && method === 'GET') {
      // 返回MBTI测试问题
      const questions = [
        { id: 1, text: '在社交场合中，你更倾向于：', options: [{ text: '主动与他人交谈', score: { E: 1 } }, { text: '等待他人主动接近', score: { I: 1 } }] },
        { id: 2, text: '你更喜欢的工作环境是：', options: [{ text: '团队合作，有互动', score: { E: 1 } }, { text: '独立工作，安静专注', score: { I: 1 } }] },
        { id: 3, text: '做决定时，你更依赖：', options: [{ text: '具体的事实和数据', score: { S: 1 } }, { text: '直觉和可能性', score: { N: 1 } }] },
        { id: 4, text: '你更喜欢的学习方式是：', options: [{ text: '循序渐进，按步骤学习', score: { S: 1 } }, { text: '跳跃式思维，寻找模式', score: { N: 1 } }] },
        { id: 5, text: '处理问题时，你更注重：', options: [{ text: '逻辑分析和客观判断', score: { T: 1 } }, { text: '个人价值观和他人感受', score: { F: 1 } }] },
        { id: 6, text: '你更欣赏哪种领导风格：', options: [{ text: '公平公正，注重效率', score: { T: 1 } }, { text: '关心员工，注重和谐', score: { F: 1 } }] },
        { id: 7, text: '你更喜欢的生活方式是：', options: [{ text: '有计划，有组织', score: { J: 1 } }, { text: '灵活自由，随遇而安', score: { P: 1 } }] },
        { id: 8, text: '面对截止日期，你通常：', options: [{ text: '提前完成，避免压力', score: { J: 1 } }, { text: '在最后时刻完成', score: { P: 1 } }] },
        { id: 9, text: '你更喜欢的休闲活动是：', options: [{ text: '参加聚会和社交活动', score: { E: 1 } }, { text: '独处或与少数密友相处', score: { I: 1 } }] },
        { id: 10, text: '你更倾向于：', options: [{ text: '关注现实和细节', score: { S: 1 } }, { text: '关注未来和可能性', score: { N: 1 } }] },
        { id: 11, text: '你更重视：', options: [{ text: '诚实和直接', score: { T: 1 } }, { text: '和谐和体贴', score: { F: 1 } }] },
        { id: 12, text: '你更喜欢的工作安排是：', options: [{ text: '明确的任务和期限', score: { J: 1 } }, { text: '灵活的任务和期限', score: { P: 1 } }] },
        { id: 13, text: '你更喜欢的沟通方式是：', options: [{ text: '直接表达，开门见山', score: { E: 1 } }, { text: '委婉表达，考虑他人感受', score: { I: 1 } }] },
        { id: 14, text: '你更相信：', options: [{ text: '经验和实践', score: { S: 1 } }, { text: '直觉和灵感', score: { N: 1 } }] },
        { id: 15, text: '你更喜欢的评价方式是：', options: [{ text: '客观公正的评价', score: { T: 1 } }, { text: '鼓励和支持的评价', score: { F: 1 } }] },
        { id: 16, text: '你更喜欢的旅行方式是：', options: [{ text: '详细规划，按计划执行', score: { J: 1 } }, { text: '随性而为，享受意外', score: { P: 1 } }] },
        { id: 17, text: '你更喜欢的团队角色是：', options: [{ text: '积极参与，表达观点', score: { E: 1 } }, { text: '倾听观察，深思熟虑', score: { I: 1 } }] },
        { id: 18, text: '你更喜欢的解决问题方式是：', options: [{ text: '使用已知的方法', score: { S: 1 } }, { text: '尝试新的方法', score: { N: 1 } }] },
        { id: 19, text: '你更重视：', options: [{ text: '公平和正义', score: { T: 1 } }, { text: '同情和理解', score: { F: 1 } }] },
        { id: 20, text: '你更喜欢的工作环境是：', options: [{ text: '结构化和有序', score: { J: 1 } }, { text: '灵活和开放', score: { P: 1 } }] },
        { id: 21, text: '你更喜欢的社交方式是：', options: [{ text: '广泛的社交网络', score: { E: 1 } }, { text: '深度的友谊关系', score: { I: 1 } }] },
        { id: 22, text: '你更喜欢的思维方式是：', options: [{ text: '具体和实际', score: { S: 1 } }, { text: '抽象和概念', score: { N: 1 } }] },
        { id: 23, text: '你更喜欢的决策方式是：', options: [{ text: '基于逻辑分析', score: { T: 1 } }, { text: '基于个人价值观', score: { F: 1 } }] },
        { id: 24, text: '你更喜欢的时间管理方式是：', options: [{ text: '制定详细的计划', score: { J: 1 } }, { text: '保持灵活性', score: { P: 1 } }] },
        { id: 25, text: '你更喜欢的表达方式是：', options: [{ text: '直接和明确', score: { E: 1 } }, { text: '含蓄和委婉', score: { I: 1 } }] },
        { id: 26, text: '你更喜欢的创新方式是：', options: [{ text: '改进现有方案', score: { S: 1 } }, { text: '创造全新方案', score: { N: 1 } }] },
        { id: 27, text: '你更喜欢的冲突处理方式是：', options: [{ text: '直面问题，寻求解决方案', score: { T: 1 } }, { text: '寻求共识，维护关系', score: { F: 1 } }] },
        { id: 28, text: '你更喜欢的工作节奏是：', options: [{ text: '稳定和可预测', score: { J: 1 } }, { text: '变化和刺激', score: { P: 1 } }] },
        { id: 29, text: '你更喜欢的能量来源是：', options: [{ text: '与他人互动', score: { E: 1 } }, { text: '独处和反思', score: { I: 1 } }] },
        { id: 30, text: '你更喜欢的知识获取方式是：', options: [{ text: '通过具体经验', score: { S: 1 } }, { text: '通过理论思考', score: { N: 1 } }] },
        { id: 31, text: '你更喜欢的价值观是：', options: [{ text: '真理和客观', score: { T: 1 } }, { text: '和谐和关怀', score: { F: 1 } }] },
        { id: 32, text: '你更喜欢的生活方式是：', options: [{ text: '有序和计划', score: { J: 1 } }, { text: '自由和适应', score: { P: 1 } }] }
      ];

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: questions,
          message: '获取问题成功'
        })
      };
    }

    if (rawPath === '/mbti/calculate' && method === 'POST') {
      try {
        const { answers } = JSON.parse(body);
        console.log('收到MBTI答案:', answers);
        
        // 简单的MBTI计算
        let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        
        for (let i = 0; i < answers.length; i++) {
          const answer = answers[i];
          if (i < 8) {
            if (answer === 0) scores.E++; else scores.I++;
          } else if (i < 16) {
            if (answer === 0) scores.S++; else scores.N++;
          } else if (i < 24) {
            if (answer === 0) scores.T++; else scores.F++;
          } else {
            if (answer === 0) scores.J++; else scores.P++;
          }
        }
        
        const mbtiType = (scores.E > scores.I ? 'E' : 'I') +
                         (scores.S > scores.N ? 'S' : 'N') +
                         (scores.T > scores.F ? 'T' : 'F') +
                         (scores.J > scores.P ? 'J' : 'P');
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              mbtiType,
              scores,
              description: `你是${mbtiType}型人格，具有独特的思维方式和行为模式。`,
              careerAdvice: {
                suitable: [
                  {
                    industry: '互联网',
                    positions: ['产品经理', '技术架构师', '数据分析师'],
                    reason: '你的逻辑思维和战略眼光在互联网领域具有天然优势'
                  }
                ],
                unsuitable: [
                  {
                    industry: '销售',
                    positions: ['电话销售', '客户经理'],
                    reason: '你更适合深度思考的工作，而不是频繁的人际交往'
                  }
                ]
              },
              strengths: [
                '逻辑思维：强大的分析能力和问题解决能力',
                '创新思维：独特的视角和创新能力',
                '专注力：对感兴趣的事物有极强的专注力'
              ],
              improvements: [
                '提升人际交往能力，学会更好地与他人沟通合作',
                '培养耐心，在团队合作中给予他人更多理解和支持',
                '增强情感表达，学会在适当时候展现自己的关心'
              ]
            },
            message: 'MBTI计算成功'
          })
        };
      } catch (error) {
        console.error('MBTI计算错误:', error);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'MBTI计算失败',
            error: error.message
          })
        };
      }
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: `路径 ${rawPath} 不存在`
      })
    };
  } catch (error) {
    console.error('函数执行错误:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
}; 