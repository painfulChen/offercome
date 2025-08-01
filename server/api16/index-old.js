// CloudBase函数 - 简化版本

// 数据库连接
const mongoose = require('mongoose');
const MbtiResult = require('./models/MbtiResult');
const { connectDatabase, isDatabaseConnected } = require('./config/cloudbase-db');
const memoryStorage = require('./utils/memory-storage');

// 初始化数据库连接
let dbConnected = false;
async function initDatabase() {
  try {
    dbConnected = await connectDatabase();
    if (dbConnected) {
      console.log('✅ 使用数据库存储模式');
    } else {
      console.log('⚠️  使用内存存储模式');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.log('⚠️  将使用内存存储模式');
  }
}

// 初始化
initDatabase();

// 生成测试ID
function generateTestId() {
  return 'mbti_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 基于MBTI类型和用户信息生成职业建议
function generateCareerAdvice(mbtiType, userInfo) {
  const { major, school } = userInfo || {};
  
  // 根据专业和学校类型调整建议
  const isTechMajor = /计算机|软件|信息|数据|人工智能|AI|机器学习|ML/.test(major || '');
  const isFinanceMajor = /金融|经济|会计|财务|投资|银行/.test(major || '');
  const isTopSchool = ['985', '211', '海外qs50', '海外qs100'].includes(school);
  
  const careerAdvice = {
    suitable: [],
    unsuitable: []
  };

  // 根据MBTI类型和专业生成建议
  if (mbtiType.includes('NT')) { // 分析型
    if (isTechMajor) {
      careerAdvice.suitable.push({
        industry: '互联网/科技',
        positions: ['技术架构师', '算法工程师', '系统分析师', '技术总监'],
        reason: '你的分析思维和技术背景完美匹配，在技术架构和系统设计方面有天然优势'
      });
    } else if (isFinanceMajor) {
      careerAdvice.suitable.push({
        industry: '金融/投资',
        positions: ['量化分析师', '风险分析师', '投资经理', '金融产品经理'],
        reason: '你的逻辑分析能力在金融领域极具价值，特别适合需要深度思考的岗位'
      });
    } else {
      careerAdvice.suitable.push({
        industry: '咨询/研究',
        positions: ['战略顾问', '数据分析师', '研究员', '管理咨询师'],
        reason: '你的战略思维和系统性分析能力在咨询领域发挥重要作用'
      });
    }
  } else if (mbtiType.includes('NF')) { // 理想型
    careerAdvice.suitable.push({
      industry: '教育/培训',
      positions: ['培训师', '教育顾问', '职业规划师', '心理咨询师'],
      reason: '你的同理心和理想主义在教育领域极具价值'
    });
  } else if (mbtiType.includes('SJ')) { // 传统型
    careerAdvice.suitable.push({
      industry: '传统行业',
      positions: ['项目经理', '运营经理', '质量工程师', '合规专员'],
      reason: '你的务实和责任感在需要稳定性的传统行业很受欢迎'
    });
  } else if (mbtiType.includes('SP')) { // 艺术型
    careerAdvice.suitable.push({
      industry: '创意/设计',
      positions: ['UI/UX设计师', '产品设计师', '创意总监', '用户体验专家'],
      reason: '你的灵活性和创造力在创意领域有天然优势'
    });
  }

  // 根据学校类型调整建议
  if (isTopSchool) {
    careerAdvice.suitable.push({
      industry: '头部企业',
      positions: ['管培生', '战略分析师', '投资银行分析师', '咨询顾问'],
      reason: '你的学校背景为你打开了头部企业的机会，建议优先考虑知名企业'
    });
  }

  // 不适合的职业建议
  if (mbtiType.includes('I')) {
    careerAdvice.unsuitable.push({
      industry: '销售/客服',
      positions: ['电话销售', '客服代表', '保险推销员'],
      reason: '内向特质不适合需要频繁人际互动的销售岗位'
    });
  }

  if (mbtiType.includes('P')) {
    careerAdvice.unsuitable.push({
      industry: '高度结构化工作',
      positions: ['会计', '审计', '行政助理'],
      reason: '感知型人格不适合过于死板和重复的工作'
    });
  }

  return careerAdvice;
}

// 生成优势分析
function generateStrengths(mbtiType, userInfo) {
  const strengths = [];
  
  if (mbtiType.includes('N')) {
    strengths.push('战略思维：能够看到事物的本质和未来可能性');
  }
  if (mbtiType.includes('T')) {
    strengths.push('逻辑分析：强大的问题解决和决策能力');
  }
  if (mbtiType.includes('J')) {
    strengths.push('执行力：有计划、有条理的工作方式');
  }
  if (mbtiType.includes('F')) {
    strengths.push('人际敏感：能够理解他人感受，建立良好关系');
  }
  
  // 根据专业添加特定优势
  const { major } = userInfo || {};
  if (/计算机|软件|信息/.test(major || '')) {
    strengths.push('技术背景：扎实的技术基础为职业发展提供支撑');
  }
  if (/金融|经济/.test(major || '')) {
    strengths.push('商业敏感：对市场和商业运作有深入理解');
  }
  
  return strengths;
}

// 生成改进建议
function generateImprovements(mbtiType, userInfo) {
  const improvements = [];
  
  if (mbtiType.includes('I')) {
    improvements.push('提升社交能力，学会在团队中主动表达观点');
  }
  if (mbtiType.includes('E')) {
    improvements.push('培养倾听能力，学会在表达前先理解他人');
  }
  if (mbtiType.includes('S')) {
    improvements.push('拓展创新思维，尝试新的解决方案');
  }
  if (mbtiType.includes('N')) {
    improvements.push('关注细节执行，将想法转化为具体行动');
  }
  if (mbtiType.includes('T')) {
    improvements.push('增强情感表达，学会在决策中考虑人的因素');
  }
  if (mbtiType.includes('F')) {
    improvements.push('培养客观分析能力，避免过度情绪化决策');
  }
  if (mbtiType.includes('J')) {
    improvements.push('保持灵活性，适应快速变化的环境');
  }
  if (mbtiType.includes('P')) {
    improvements.push('建立时间管理意识，提高工作效率');
  }
  
  return improvements;
}

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
        const { answers, userInfo } = JSON.parse(body);
        console.log('收到MBTI答案:', answers);
        console.log('收到用户信息:', userInfo);
        
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
        
        // 基于用户信息和MBTI类型生成精准的职业建议
        const careerAdvice = generateCareerAdvice(mbtiType, userInfo);
        const strengths = generateStrengths(mbtiType, userInfo);
        const improvements = generateImprovements(mbtiType, userInfo);
        
        // 生成测试ID用于结果保存
        const testId = generateTestId();
        
        // 保存测试结果
        const resultData = {
          testId,
          mbtiType,
          scores,
          answers,
          userInfo,
          careerAdvice,
          strengths,
          improvements,
          metadata: {
            userAgent: event.headers['User-Agent'] || 'unknown',
            ipAddress: event.headers['X-Forwarded-For'] || event.headers['X-Real-IP'] || 'unknown',
            testDuration: 0, // 可以从前端传入
            completedAt: new Date()
          }
        };

        if (dbConnected && isDatabaseConnected()) {
          // 使用数据库存储
          const newMbtiResult = new MbtiResult(resultData);
          await newMbtiResult.save();
          console.log('💾 数据库存储: 保存测试结果成功:', testId);
        } else {
          // 使用内存存储
          await memoryStorage.saveMbtiResult(resultData);
          console.log('💾 内存存储: 保存测试结果成功:', testId);
        }
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              testId,
              mbtiType,
              scores,
              description: `你是${mbtiType}型人格，具有独特的思维方式和行为模式。`,
              careerAdvice,
              strengths,
              improvements
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

    // 查询用户测试历史
    if (rawPath === '/mbti/history' && method === 'GET') {
      try {
        const email = event.queryStringParameters?.email;
        if (!email) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              message: '请提供邮箱地址'
            })
          };
        }

        let history, summaries;
        
        if (dbConnected && isDatabaseConnected()) {
          // 使用数据库查询
          history = await MbtiResult.findByEmail(email);
          summaries = history.map(result => result.getSummary());
        } else {
          // 使用内存存储查询
          history = await memoryStorage.findByEmail(email);
          summaries = history.map(result => memoryStorage.getSummary(result));
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              total: history.length,
              results: summaries
            },
            message: '获取测试历史成功'
          })
        };
      } catch (error) {
        console.error('查询测试历史错误:', error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '查询测试历史失败',
            error: error.message
          })
        };
      }
    }

    // 获取统计数据
    if (rawPath === '/mbti/stats' && method === 'GET') {
      try {
        let mbtiDistribution, majorDistribution, totalTests;
        
        if (dbConnected && isDatabaseConnected()) {
          // 使用数据库查询
          [mbtiDistribution, majorDistribution] = await Promise.all([
            MbtiResult.getMbtiDistribution(),
            MbtiResult.getMajorDistribution()
          ]);
          totalTests = await MbtiResult.countDocuments();
        } else {
          // 使用内存存储查询
          [mbtiDistribution, majorDistribution] = await Promise.all([
            memoryStorage.getMbtiDistribution(),
            memoryStorage.getMajorDistribution()
          ]);
          totalTests = await memoryStorage.countDocuments();
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              totalTests,
              mbtiDistribution,
              majorDistribution
            },
            message: '获取统计数据成功'
          })
        };
      } catch (error) {
        console.error('获取统计数据错误:', error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '获取统计数据失败',
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