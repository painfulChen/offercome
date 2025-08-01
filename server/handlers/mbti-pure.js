// 纯计算的MBTI处理器，不依赖数据库
exports.calculateMBTIHandler = async ({ body }) => {
  console.log('🔄 开始计算MBTI结果（纯计算版本）...');
  
  try {
    // 验证输入数据
    const { answers } = JSON.parse(body);
    
    // 数据校验 - 支持两种格式
    let processedAnswers = [];
    
    if (Array.isArray(answers)) {
      if (answers.length !== 32) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案格式错误，需要32个问题的答案',
            error: 'INVALID_ANSWERS_FORMAT'
          })
        };
      }
      
      // 如果是简单数组格式 [0,1,0,1,...]
      if (typeof answers[0] === 'number') {
        processedAnswers = answers.map((option, index) => ({
          questionId: index + 1,
          selectedOption: option
        }));
      } else {
        // 如果是对象数组格式 [{questionId: 1, selectedOption: 0}, ...]
        processedAnswers = answers;
      }
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: '答案格式错误，answers必须是数组',
          error: 'INVALID_ANSWERS_FORMAT'
        })
      };
    }
    
    // 验证答案格式
    for (let i = 0; i < processedAnswers.length; i++) {
      const answer = processedAnswers[i];
      if (!answer.hasOwnProperty('questionId') || !answer.hasOwnProperty('selectedOption')) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案格式错误，每个答案需要包含questionId和selectedOption',
            error: 'INVALID_ANSWER_STRUCTURE'
          })
        };
      }
      
      if (answer.selectedOption !== 0 && answer.selectedOption !== 1) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '答案选项错误，只能选择0或1',
            error: 'INVALID_OPTION_VALUE'
          })
        };
      }
    }
    
    // 简化的MBTI计算逻辑
    let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // 根据答案计算得分
    for (const answer of processedAnswers) {
      const { questionId, selectedOption } = answer;
      
      if (questionId <= 8) {
        if (selectedOption === 0) scores.E++; else scores.I++;
      } else if (questionId <= 16) {
        if (selectedOption === 0) scores.S++; else scores.N++;
      } else if (questionId <= 24) {
        if (selectedOption === 0) scores.T++; else scores.F++;
      } else {
        if (selectedOption === 0) scores.J++; else scores.P++;
      }
    }
    
    // 确定MBTI类型
    const mbtiType = (scores.E > scores.I ? 'E' : 'I') +
                     (scores.S > scores.N ? 'S' : 'N') +
                     (scores.T > scores.F ? 'T' : 'F') +
                     (scores.J > scores.P ? 'J' : 'P');
    
    console.log('🎯 计算出的MBTI类型:', mbtiType);
    console.log('📊 各维度得分:', scores);
    
    // MBTI类型描述映射
    const MBTI_DESCRIPTIONS = {
      'INTJ': {
        type: 'INTJ建筑师型人格',
        description: '富有想象力和战略性的思考者，一切都要经过深思熟虑。INTJ型人格是MBTI中最稀有的类型之一，他们拥有独特的洞察力和创新能力。他们往往被误解为"冷漠"或"不近人情"，但实际上，他们的内心世界极其丰富，只是表达方式与众不同。',
        careerAdvice: {
          suitable: [
            {
              industry: '互联网',
              positions: ['产品经理', '技术架构师', '数据分析师'],
              reason: 'INTJ的逻辑思维和战略眼光在互联网产品设计和系统架构中发挥重要作用。他们能够看到别人看不到的系统性问题和机会。'
            },
            {
              industry: '金融',
              positions: ['投资分析师', '风险管理师', '量化交易员'],
              reason: 'INTJ的分析能力和风险意识在金融领域具有天然优势。他们能够识别市场中的隐藏模式和风险。'
            },
            {
              industry: '咨询',
              positions: ['战略顾问', '管理咨询师', '商业分析师'],
              reason: 'INTJ的战略思维和系统性分析能力在咨询领域极具价值。他们能够为客户提供深度洞察和解决方案。'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['电话销售', '客户经理', '市场推广'],
              reason: 'INTJ内向且不善于情感表达，不适合需要频繁人际交往的销售工作。他们更擅长深度分析和策略制定。'
            },
            {
              industry: '服务',
              positions: ['客服代表', '前台接待', '导游'],
              reason: 'INTJ不适合需要持续人际互动和情感支持的服务岗位。他们更适合需要深度思考和策略规划的工作。'
            }
          ]
        },
        strengths: [
          '战略思维：能够从宏观角度分析问题，制定长期规划，看到别人看不到的系统性机会',
          '逻辑分析：强大的逻辑推理能力，善于解决复杂问题，能够识别隐藏的模式和规律',
          '创新思维：独特的视角和创新能力，能够提出新颖的解决方案，突破传统思维局限',
          '独立性：喜欢独立工作，能够自主完成任务，不依赖外部激励',
          '专注力：对感兴趣的事物有极强的专注力和持久力，能够深入钻研复杂问题',
          '洞察力：能够快速识别问题的本质，看到表象背后的深层原因',
          '执行力：一旦确定目标，能够坚定不移地执行，不受外界干扰'
        ],
        improvements: [
          '提升人际交往能力，学会更好地与他人沟通合作，理解不同观点',
          '培养耐心，在团队合作中给予他人更多理解和支持，学会倾听',
          '增强情感表达，学会在适当时候展现自己的关心和热情',
          '学会妥协，在保持核心原则的同时，适当调整策略以适应团队需求',
          '提升沟通技巧，学会用他人能理解的方式表达复杂想法',
          '培养同理心，更好地理解他人的情感需求和动机'
        ]
      },
      'INTP': {
        type: 'INTP逻辑学家型人格',
        description: '富有创造力和好奇心，喜欢探索新理论。INTP型人格是真正的思想家，他们追求知识和真理，善于发现事物背后的规律。他们往往被误解为"不切实际"或"脱离现实"，但实际上，他们的理论思维能够解决现实中最复杂的问题。',
        careerAdvice: {
          suitable: [
            {
              industry: '互联网',
              positions: ['软件工程师', '算法工程师', '数据科学家'],
              reason: 'INTP的逻辑思维和创新能力在技术研发中发挥重要作用。他们能够设计出优雅而高效的解决方案。'
            },
            {
              industry: '科研',
              positions: ['研究员', '科学家', '技术专家'],
              reason: 'INTP的好奇心和探索精神在科研领域具有天然优势。他们能够发现新的理论和方法。'
            },
            {
              industry: '教育',
              positions: ['大学教授', '研究员', '技术培训师'],
              reason: 'INTP的深度思考能力在高等教育中极具价值。他们能够帮助学生理解复杂概念。'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['销售代表', '客户经理', '市场推广'],
              reason: 'INTP内向且不善于情感表达，不适合需要频繁人际交往的工作。他们更擅长深度思考和技术创新。'
            },
            {
              industry: '管理',
              positions: ['项目经理', '团队领导', '行政主管'],
              reason: 'INTP不适合需要大量人际协调和日常管理的工作。他们更适合专注于技术深度和创新。'
            }
          ]
        },
        strengths: [
          '逻辑思维：强大的逻辑推理能力，善于分析复杂问题，能够发现隐藏的逻辑关系',
          '创新能力：独特的视角和创新能力，能够提出新颖的解决方案，突破传统思维局限',
          '学习能力：对新知识有极强的学习能力和好奇心，能够快速掌握新技能',
          '专注力：对感兴趣的事物有极强的专注力和持久力，能够深入钻研复杂问题',
          '客观性：能够客观分析问题，不受情感因素影响，做出理性决策',
          '理论思维：善于构建理论框架，能够从抽象层面理解复杂系统',
          '问题解决：能够识别问题的根本原因，设计出系统性的解决方案'
        ],
        improvements: [
          '提升人际交往能力，学会更好地与他人沟通合作，理解不同观点',
          '培养时间管理能力，提高工作效率和执行力，平衡理论与实践',
          '增强情感表达，学会在适当时候展现自己的关心和热情',
          '学会团队合作，在保持独立思考的同时，学会倾听和妥协',
          '提升沟通技巧，学会用他人能理解的方式表达复杂想法',
          '培养实践能力，将理论知识与实际应用相结合'
        ]
      },
      'ENTJ': {
        type: 'ENTJ指挥官型人格',
        description: '大胆、富有想象力的强有力领导者。ENTJ型人格是天生的领导者，他们拥有强大的决策能力和执行力，善于制定战略并推动实施。他们往往被误解为"过于强势"或"不近人情"，但实际上，他们的领导风格能够激发团队的最大潜能。',
        careerAdvice: {
          suitable: [
            {
              industry: '互联网',
              positions: ['产品总监', '技术总监', '运营总监'],
              reason: 'ENTJ的领导能力和战略眼光在互联网企业高层管理中发挥重要作用。他们能够推动团队实现 ambitious 目标。'
            },
            {
              industry: '金融',
              positions: ['投资总监', '基金经理', '银行高管'],
              reason: 'ENTJ的决策能力和风险控制意识在金融领域具有天然优势。他们能够在复杂市场中做出明智决策。'
            },
            {
              industry: '咨询',
              positions: ['管理顾问', '战略总监', '商业咨询师'],
              reason: 'ENTJ的战略思维和执行力在咨询领域极具价值。他们能够为客户提供可执行的解决方案。'
            }
          ],
          unsuitable: [
            {
              industry: '服务',
              positions: ['客服代表', '前台接待', '导游'],
              reason: 'ENTJ更适合领导和管理，不适合需要持续人际互动的服务岗位。他们更适合制定策略和推动执行。'
            },
            {
              industry: '创意',
              positions: ['设计师', '艺术家', '文案策划'],
              reason: 'ENTJ更擅长战略规划和执行，不适合需要大量创意发散的工作。他们更适合将创意转化为可执行的计划。'
            }
          ]
        },
        strengths: [
          '领导能力：天生的领导者，能够激励团队，推动目标实现',
          '决策能力：强大的决策能力，能够在复杂情况下做出明智选择',
          '执行力：一旦确定目标，能够坚定不移地执行，克服各种障碍',
          '战略思维：能够从宏观角度分析问题，制定长期战略规划',
          '沟通能力：善于表达自己的想法，能够说服他人接受自己的观点',
          '组织能力：善于组织和协调资源，确保项目顺利推进',
          '抗压能力：在高压环境下仍能保持冷静，做出理性决策'
        ],
        improvements: [
          '提升同理心，学会更好地理解他人的情感需求和动机',
          '培养耐心，在团队合作中给予他人更多理解和支持',
          '学会倾听，在保持领导力的同时，学会接受不同意见',
          '增强灵活性，在坚持原则的同时，学会适当调整策略',
          '提升情感表达，学会在适当时候展现自己的关心和热情',
          '培养包容性，学会接纳不同的工作风格和思维方式'
        ]
      },
      'ENTP': {
        type: 'ENTP辩论家型人格',
        description: '机智、好奇，喜欢挑战常规。ENTP型人格是创新的推动者，他们善于发现新的可能性，喜欢挑战传统观念。',
        careerAdvice: {
          suitable: [
            {
              industry: '互联网',
              positions: ['产品经理', '创新总监', '市场总监'],
              reason: 'ENTP的创新思维和冒险精神在互联网产品创新中发挥重要作用'
            },
            {
              industry: '咨询',
              positions: ['创新咨询师', '战略咨询师', '商业顾问'],
              reason: 'ENTP的创新能力和分析能力在咨询行业非常受欢迎'
            }
          ],
          unsuitable: [
            {
              industry: '制造',
              positions: ['生产线工人', '质量检测员', '仓库管理员'],
              reason: 'ENTP更喜欢创新和变化，不适合需要重复性工作的岗位'
            }
          ]
        },
        strengths: [
          '创新能力：强大的创新能力，善于发现新的可能性',
          '适应能力：优秀的适应能力，能够快速适应新环境',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '分析能力：强大的分析能力，善于发现问题的本质',
          '冒险精神：敢于尝试新事物，不惧怕失败'
        ],
        improvements: [
          '提升专注力，学会在重要项目上保持持续的关注',
          '培养耐心，在团队合作中给予他人更多理解和支持',
          '增强执行力，将创新想法转化为实际成果'
        ]
      },
      'INFJ': {
        type: 'INFJ提倡者型人格',
        description: '富有洞察力和理想主义，关注他人发展。INFJ型人格是真正的理想主义者，他们拥有深刻的洞察力和强烈的同理心。',
        careerAdvice: {
          suitable: [
            {
              industry: '教育',
              positions: ['教师', '培训师', '教育顾问'],
              reason: 'INFJ的同理心和洞察力在教育领域发挥重要作用'
            },
            {
              industry: '医疗',
              positions: ['医生', '护士', '心理咨询师'],
              reason: 'INFJ的关怀能力和洞察力在医疗领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['电话销售', '客户经理', '市场推广'],
              reason: 'INFJ内向且敏感，不适合需要频繁人际交往的销售工作'
            }
          ]
        },
        strengths: [
          '洞察力：深刻的洞察力，能够理解他人的内心世界',
          '同理心：强烈的同理心，能够理解他人的感受和需求',
          '理想主义：强烈的理想主义，追求有意义的事业',
          '创造力：丰富的创造力，能够提出独特的解决方案',
          '责任感：强烈的责任感，对工作认真负责'
        ],
        improvements: [
          '提升自信心，学会更好地表达自己的想法和观点',
          '培养现实感，在理想和现实之间找到平衡',
          '增强抗压能力，学会在压力下保持冷静'
        ]
      },
      'INFP': {
        type: 'INFP调停者型人格',
        description: '诗意的、善良的利他主义者。INFP型人格是真正的理想主义者，他们拥有丰富的内心世界和强烈的价值观。',
        careerAdvice: {
          suitable: [
            {
              industry: '教育',
              positions: ['教师', '培训师', '教育顾问'],
              reason: 'INFP的同理心和价值观在教育领域发挥重要作用'
            },
            {
              industry: '媒体',
              positions: ['编辑', '作家', '内容创作者'],
              reason: 'INFP的创造力和表达能力在媒体行业具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['电话销售', '客户经理', '市场推广'],
              reason: 'INFP内向且敏感，不适合需要频繁人际交往的销售工作'
            }
          ]
        },
        strengths: [
          '创造力：丰富的创造力，能够提出独特的解决方案',
          '同理心：强烈的同理心，能够理解他人的感受和需求',
          '价值观：强烈的价值观，追求有意义的事业',
          '适应性：良好的适应性，能够适应不同的环境',
          '忠诚度：强烈的忠诚度，对工作和人际关系认真负责'
        ],
        improvements: [
          '提升自信心，学会更好地表达自己的想法和观点',
          '培养现实感，在理想和现实之间找到平衡',
          '增强抗压能力，学会在压力下保持冷静'
        ]
      },
      'ENFJ': {
        type: 'ENFJ主人公型人格',
        description: '富有魅力的领导者，善于激励他人。ENFJ型人格是天生的领导者，他们拥有强大的沟通能力和激励能力。',
        careerAdvice: {
          suitable: [
            {
              industry: '教育',
              positions: ['教师', '培训师', '教育总监'],
              reason: 'ENFJ的领导能力和激励能力在教育领域发挥重要作用'
            },
            {
              industry: '人力资源',
              positions: ['HR经理', '招聘专员', '培训专员'],
              reason: 'ENFJ的人际交往能力和激励能力在HR领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '技术',
              positions: ['程序员', '测试工程师', '运维工程师'],
              reason: 'ENFJ更适合人际交往，不适合需要专注技术细节的工作'
            }
          ]
        },
        strengths: [
          '领导能力：天生的领导者，善于激励和指导团队',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '激励能力：强大的激励能力，能够激发他人的潜能',
          '同理心：强烈的同理心，能够理解他人的感受和需求',
          '组织能力：优秀的组织能力，能够有效管理团队和项目'
        ],
        improvements: [
          '提升技术能力，在管理工作中掌握必要的技术知识',
          '培养客观性，在决策中保持客观和理性',
          '增强抗压能力，学会在压力下保持冷静'
        ]
      },
      'ENFP': {
        type: 'ENFP探险家型人格',
        description: '热情洋溢的创意家，总是能找到理由微笑。ENFP型人格是真正的创意家，他们拥有丰富的想象力和感染力。',
        careerAdvice: {
          suitable: [
            {
              industry: '媒体',
              positions: ['记者', '编辑', '内容创作者'],
              reason: 'ENFP的创意能力和表达能力在媒体领域发挥重要作用'
            },
            {
              industry: '销售',
              positions: ['销售代表', '客户经理', '市场推广'],
              reason: 'ENFP的热情和沟通能力在销售领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '技术',
              positions: ['程序员', '测试工程师', '运维工程师'],
              reason: 'ENFP更喜欢创意和人际交往，不适合需要专注技术细节的工作'
            }
          ]
        },
        strengths: [
          '创造力：丰富的创造力，能够提出独特的解决方案',
          '热情：强烈的热情，能够感染和激励他人',
          '适应能力：优秀的适应能力，能够快速适应新环境',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '乐观主义：强烈的乐观主义，总是能看到积极的一面'
        ],
        improvements: [
          '提升专注力，学会在重要项目上保持持续的关注',
          '培养耐心，在团队合作中给予他人更多理解和支持',
          '增强执行力，将创意想法转化为实际成果'
        ]
      },
      'ISTJ': {
        type: 'ISTJ物流师型人格',
        description: '可靠、务实，注重细节和规则。ISTJ型人格是真正的实干家，他们拥有强大的执行力和责任感。',
        careerAdvice: {
          suitable: [
            {
              industry: '金融',
              positions: ['会计师', '审计师', '风险控制'],
              reason: 'ISTJ的严谨性和责任感在金融领域发挥重要作用'
            },
            {
              industry: '制造',
              positions: ['质量工程师', '生产经理', '供应链管理'],
              reason: 'ISTJ的执行力和组织能力在制造领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '创意',
              positions: ['设计师', '艺术家', '创意总监'],
              reason: 'ISTJ更喜欢规则和秩序，不适合需要自由创意的岗位'
            }
          ]
        },
        strengths: [
          '执行力：强大的执行力，能够将计划转化为实际行动',
          '责任感：强烈的责任感，对工作认真负责',
          '组织能力：优秀的组织能力，能够有效管理项目和团队',
          '严谨性：强烈的严谨性，注重细节和规则',
          '可靠性：强烈的可靠性，值得信赖'
        ],
        improvements: [
          '提升创新能力，学会在规则中寻找创新的可能性',
          '培养灵活性，在计划执行中保持一定的弹性',
          '增强沟通能力，学会更好地与他人沟通合作'
        ]
      },
      'ISFJ': {
        type: 'ISFJ守卫者型人格',
        description: '细心、忠诚，乐于助人。ISFJ型人格是真正的守护者，他们拥有强烈的责任感和同理心。',
        careerAdvice: {
          suitable: [
            {
              industry: '医疗',
              positions: ['护士', '医生', '药剂师'],
              reason: 'ISFJ的关怀能力和责任感在医疗领域发挥重要作用'
            },
            {
              industry: '教育',
              positions: ['教师', '辅导员', '教育顾问'],
              reason: 'ISFJ的耐心和责任感在教育领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['销售代表', '客户经理', '市场推广'],
              reason: 'ISFJ内向且不善于情感表达，不适合需要频繁人际交往的销售工作'
            }
          ]
        },
        strengths: [
          '责任感：强烈的责任感，对工作认真负责',
          '细心：强烈的细心，注重细节和品质',
          '同理心：强烈的同理心，能够理解他人的感受和需求',
          '忠诚度：强烈的忠诚度，对工作和人际关系认真负责',
          '服务意识：强烈的服务意识，乐于帮助他人'
        ],
        improvements: [
          '提升自信心，学会更好地表达自己的想法和观点',
          '培养创新能力，学会在稳定中寻找创新的可能性',
          '增强抗压能力，学会在压力下保持冷静'
        ]
      },
      'ESTJ': {
        type: 'ESTJ总经理型人格',
        description: '组织能力强，注重效率和规则。ESTJ型人格是天生的管理者，他们拥有强大的组织能力和执行力。',
        careerAdvice: {
          suitable: [
            {
              industry: '制造',
              positions: ['生产经理', '质量经理', '运营总监'],
              reason: 'ESTJ的组织能力和执行力在制造领域发挥重要作用'
            },
            {
              industry: '金融',
              positions: ['财务经理', '审计师', '风险控制'],
              reason: 'ESTJ的严谨性和组织能力在金融领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '创意',
              positions: ['设计师', '艺术家', '创意总监'],
              reason: 'ESTJ更喜欢规则和秩序，不适合需要自由创意的岗位'
            }
          ]
        },
        strengths: [
          '组织能力：优秀的组织能力，能够有效管理团队和项目',
          '执行力：强大的执行力，能够将计划转化为实际行动',
          '领导能力：天生的领导者，善于激励和指导团队',
          '责任感：强烈的责任感，对工作认真负责',
          '效率意识：强烈的效率意识，注重结果和成果'
        ],
        improvements: [
          '提升创新能力，学会在规则中寻找创新的可能性',
          '培养灵活性，在计划执行中保持一定的弹性',
          '增强同理心，学会更好地理解他人的感受和需求'
        ]
      },
      'ESFJ': {
        type: 'ESFJ执政官型人格',
        description: '热情、合群，乐于服务他人。ESFJ型人格是天生的服务者，他们拥有强大的沟通能力和服务意识。',
        careerAdvice: {
          suitable: [
            {
              industry: '服务',
              positions: ['客服经理', '酒店经理', '餐厅经理'],
              reason: 'ESFJ的服务意识和沟通能力在服务领域发挥重要作用'
            },
            {
              industry: '人力资源',
              positions: ['HR经理', '招聘专员', '培训专员'],
              reason: 'ESFJ的人际交往能力和服务意识在HR领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '技术',
              positions: ['程序员', '测试工程师', '运维工程师'],
              reason: 'ESFJ更适合人际交往，不适合需要专注技术细节的工作'
            }
          ]
        },
        strengths: [
          '服务意识：强烈的服务意识，乐于帮助他人',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '组织能力：优秀的组织能力，能够有效管理团队和项目',
          '同理心：强烈的同理心，能够理解他人的感受和需求',
          '责任感：强烈的责任感，对工作认真负责'
        ],
        improvements: [
          '提升技术能力，在管理工作中掌握必要的技术知识',
          '培养创新能力，学会在稳定中寻找创新的可能性',
          '增强抗压能力，学会在压力下保持冷静'
        ]
      },
      'ISTP': {
        type: 'ISTP鉴赏家型人格',
        description: '大胆而实际的实验家，擅长使用各种工具。ISTP型人格是真正的实践者，他们拥有强大的动手能力和解决问题的能力。',
        careerAdvice: {
          suitable: [
            {
              industry: '技术',
              positions: ['软件工程师', '系统工程师', '网络工程师'],
              reason: 'ISTP的动手能力和解决问题的能力在技术领域发挥重要作用'
            },
            {
              industry: '制造',
              positions: ['机械工程师', '电气工程师', '质量工程师'],
              reason: 'ISTP的实践能力和技术能力在制造领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['电话销售', '客户经理', '市场推广'],
              reason: 'ISTP内向且不善于情感表达，不适合需要频繁人际交往的销售工作'
            }
          ]
        },
        strengths: [
          '动手能力：强大的动手能力，善于解决实际问题',
          '逻辑思维：强大的逻辑思维，善于分析复杂问题',
          '适应能力：优秀的适应能力，能够快速适应新环境',
          '独立性：喜欢独立工作，能够自主完成任务',
          '实践能力：强大的实践能力，能够将理论转化为实际成果'
        ],
        improvements: [
          '提升沟通能力，学会更好地与他人沟通合作',
          '培养团队合作能力，学会在团队中发挥自己的优势',
          '增强表达能力，学会更好地表达自己的想法和观点'
        ]
      },
      'ISFP': {
        type: 'ISFP探险家型人格',
        description: '灵活、好奇，喜欢探索新体验。ISFP型人格是真正的艺术家，他们拥有丰富的感受力和创造力。',
        careerAdvice: {
          suitable: [
            {
              industry: '创意',
              positions: ['设计师', '艺术家', '摄影师'],
              reason: 'ISFP的创造力和审美能力在创意领域发挥重要作用'
            },
            {
              industry: '服务',
              positions: ['美容师', '按摩师', '瑜伽教练'],
              reason: 'ISFP的耐心和服务意识在服务领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '销售',
              positions: ['销售代表', '客户经理', '市场推广'],
              reason: 'ISFP内向且敏感，不适合需要频繁人际交往的销售工作'
            }
          ]
        },
        strengths: [
          '创造力：丰富的创造力，能够提出独特的解决方案',
          '审美能力：强烈的审美能力，能够创造美好的事物',
          '耐心：强烈的耐心，能够专注于细节工作',
          '适应性：良好的适应性，能够适应不同的环境',
          '同理心：强烈的同理心，能够理解他人的感受和需求'
        ],
        improvements: [
          '提升自信心，学会更好地表达自己的想法和观点',
          '培养团队合作能力，学会在团队中发挥自己的优势',
          '增强表达能力，学会更好地表达自己的想法和观点'
        ]
      },
      'ESTP': {
        type: 'ESTP企业家型人格',
        description: '充满活力，善于应对挑战。ESTP型人格是真正的行动者，他们拥有强大的适应能力和解决问题的能力。',
        careerAdvice: {
          suitable: [
            {
              industry: '销售',
              positions: ['销售经理', '客户经理', '市场总监'],
              reason: 'ESTP的行动力和适应能力在销售领域发挥重要作用'
            },
            {
              industry: '服务',
              positions: ['酒店经理', '餐厅经理', '活动策划'],
              reason: 'ESTP的沟通能力和适应能力在服务领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '科研',
              positions: ['研究员', '科学家', '学术工作者'],
              reason: 'ESTP更喜欢行动和实践，不适合需要长期专注的科研工作'
            }
          ]
        },
        strengths: [
          '行动力：强大的行动力，能够快速采取行动',
          '适应能力：优秀的适应能力，能够快速适应新环境',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '解决问题能力：强大的解决问题能力，能够应对各种挑战',
          '冒险精神：敢于尝试新事物，不惧怕失败'
        ],
        improvements: [
          '提升专注力，学会在重要项目上保持持续的关注',
          '培养耐心，在团队合作中给予他人更多理解和支持',
          '增强计划能力，在行动前制定合理的计划'
        ]
      },
      'ESFP': {
        type: 'ESFP表演者型人格',
        description: '热情、友好，喜欢成为关注焦点。ESFP型人格是真正的表演者，他们拥有强大的感染力和表达能力。',
        careerAdvice: {
          suitable: [
            {
              industry: '媒体',
              positions: ['主持人', '演员', '歌手'],
              reason: 'ESFP的表演能力和感染力在媒体领域发挥重要作用'
            },
            {
              industry: '销售',
              positions: ['销售代表', '客户经理', '市场推广'],
              reason: 'ESFP的热情和沟通能力在销售领域具有天然优势'
            }
          ],
          unsuitable: [
            {
              industry: '技术',
              positions: ['程序员', '测试工程师', '运维工程师'],
              reason: 'ESFP更喜欢人际交往，不适合需要专注技术细节的工作'
            }
          ]
        },
        strengths: [
          '表演能力：强大的表演能力，能够吸引和感染他人',
          '沟通能力：优秀的沟通能力，能够有效传达自己的想法',
          '热情：强烈的热情，能够感染和激励他人',
          '适应能力：优秀的适应能力，能够快速适应新环境',
          '服务意识：强烈的服务意识，乐于帮助他人'
        ],
        improvements: [
          '提升专注力，学会在重要项目上保持持续的关注',
          '培养耐心，在团队合作中给予他人更多理解和支持',
          '增强执行力，将表演能力转化为实际成果'
        ]
      }
    };
    
    const mbtiInfo = MBTI_DESCRIPTIONS[mbtiType];
    
    const response = {
      success: true,
      data: { 
        mbtiType,
        scores,
        type: mbtiType,
        description: mbtiInfo.description,
        careerAdvice: mbtiInfo.careerAdvice,
        strengths: mbtiInfo.strengths,
        improvements: mbtiInfo.improvements
      },
      message: 'MBTI计算成功'
    };
    
    console.log('📤 返回响应:', JSON.stringify(response));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('❌ MBTI计算失败:', error);
    const errorResponse = {
      success: false,
      message: 'MBTI计算失败',
      error: error.message
    };
    
    console.log('📤 返回错误响应:', JSON.stringify(errorResponse));
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse)
    };
  }
}; 