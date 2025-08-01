// 纯静态的MBTI问题处理器，不依赖数据库
exports.getMBTIQuestionsHandler = async () => {
  console.log('🔄 获取MBTI问题（静态版本）...');
  
  try {
    // 静态MBTI问题数据
    const staticQuestions = [
      {
        id: 1,
        text: "在社交场合，我倾向于主动与他人交谈",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 2,
        text: "我更喜欢独处而不是参加大型聚会",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 3,
        text: "在团队中，我经常是发言最多的人",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 4,
        text: "我更喜欢通过思考来解决问题",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 5,
        text: "我享受成为关注的焦点",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 6,
        text: "我更喜欢安静的环境",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 7,
        text: "我倾向于在行动前先思考",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 8,
        text: "我经常是聚会中的活跃分子",
        dimension: "EI",
        category: "社交偏好",
        options: [
          { text: "倾向于外向", score: { E: 1, I: 0 } },
          { text: "倾向于内向", score: { E: 0, I: 1 } }
        ]
      },
      {
        id: 9,
        text: "我更关注具体的事实和细节",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 10,
        text: "我喜欢探索新的可能性和想法",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 11,
        text: "我更喜欢处理实际的问题",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 12,
        text: "我经常思考未来的可能性",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 13,
        text: "我重视传统和经验",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 14,
        text: "我喜欢创新和改变",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 15,
        text: "我更喜欢明确和具体的指示",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 16,
        text: "我享受抽象的概念和理论",
        dimension: "SN",
        category: "信息处理",
        options: [
          { text: "倾向于感觉", score: { S: 1, N: 0 } },
          { text: "倾向于直觉", score: { S: 0, N: 1 } }
        ]
      },
      {
        id: 17,
        text: "我做决定时更依赖逻辑分析",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 18,
        text: "我重视和谐的人际关系",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 19,
        text: "我倾向于客观地分析问题",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 20,
        text: "我关心他人的感受",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 21,
        text: "我更喜欢公平和一致",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 22,
        text: "我重视个人价值观",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 23,
        text: "我倾向于批评性思维",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 24,
        text: "我重视同情和理解",
        dimension: "TF",
        category: "决策方式",
        options: [
          { text: "倾向于思考", score: { T: 1, F: 0 } },
          { text: "倾向于情感", score: { T: 0, F: 1 } }
        ]
      },
      {
        id: 25,
        text: "我喜欢有计划和条理",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 26,
        text: "我更喜欢灵活和适应性",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 27,
        text: "我按时完成任务",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 28,
        text: "我享受即兴和惊喜",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 29,
        text: "我制定详细的计划",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 30,
        text: "我保持选择开放",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 31,
        text: "我重视准时和截止日期",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      },
      {
        id: 32,
        text: "我喜欢探索和发现",
        dimension: "JP",
        category: "生活方式",
        options: [
          { text: "倾向于判断", score: { J: 1, P: 0 } },
          { text: "倾向于感知", score: { J: 0, P: 1 } }
        ]
      }
    ];
    
    console.log(`📊 返回 ${staticQuestions.length} 个静态MBTI问题`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: staticQuestions,
        message: 'MBTI问题获取成功（静态数据）'
      })
    };
  } catch (error) {
    console.error('❌ 获取MBTI问题失败:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: '获取MBTI问题失败',
        error: error.message
      })
    };
  }
}; 