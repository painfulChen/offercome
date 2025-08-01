const mongoose = require('mongoose');

// 连接数据库
async function connectDB() {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/offercome';
        await mongoose.connect(mongoURI);
        console.log('✅ 数据库连接成功');
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        process.exit(1);
    }
}

// MBTI问题模式
const mbtiQuestionSchema = new mongoose.Schema({
    questionId: {
        type: Number,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    dimension: {
        type: String,
        enum: ['E-I', 'S-N', 'T-F', 'J-P'],
        required: true
    },
    options: [{
        text: {
            type: String,
            required: true
        },
        score: {
            type: Map,
            of: Number,
            required: true
        }
    }],
    category: {
        type: String,
        enum: ['社交偏好', '信息处理', '决策方式', '生活方式'],
        required: true
    }
});

const MBTIQuestion = mongoose.model('MBTIQuestion', mbtiQuestionSchema);

// MBTI测试问题数据
const mbtiQuestions = [
    // E-I 维度问题 (外向-内向)
    {
        questionId: 1,
        text: "在社交场合中，您更倾向于：",
        dimension: "E-I",
        category: "社交偏好",
        options: [
            {
                text: "主动与他人交谈，认识新朋友",
                score: { E: 1, I: 0 }
            },
            {
                text: "观察周围环境，等待合适的交流机会",
                score: { E: 0, I: 1 }
            }
        ]
    },
    {
        questionId: 2,
        text: "当您需要充电时，您会选择：",
        dimension: "E-I",
        category: "社交偏好",
        options: [
            {
                text: "和朋友一起出去活动",
                score: { E: 1, I: 0 }
            },
            {
                text: "独自待在家里或安静的地方",
                score: { E: 0, I: 1 }
            }
        ]
    },
    {
        questionId: 3,
        text: "在团队工作中，您更愿意：",
        dimension: "E-I",
        category: "社交偏好",
        options: [
            {
                text: "积极参与讨论，分享想法",
                score: { E: 1, I: 0 }
            },
            {
                text: "先思考后发言，确保想法成熟",
                score: { E: 0, I: 1 }
            }
        ]
    },
    {
        questionId: 4,
        text: "面对新环境时，您会：",
        dimension: "E-I",
        category: "社交偏好",
        options: [
            {
                text: "快速适应并开始探索",
                score: { E: 1, I: 0 }
            },
            {
                text: "先观察了解，再逐步参与",
                score: { E: 0, I: 1 }
            }
        ]
    },
    {
        questionId: 5,
        text: "您更喜欢的工作方式是：",
        dimension: "E-I",
        category: "社交偏好",
        options: [
            {
                text: "与他人合作，共同完成任务",
                score: { E: 1, I: 0 }
            },
            {
                text: "独立工作，专注自己的任务",
                score: { E: 0, I: 1 }
            }
        ]
    },

    // S-N 维度问题 (感觉-直觉)
    {
        questionId: 6,
        text: "在处理问题时，您更依赖：",
        dimension: "S-N",
        category: "信息处理",
        options: [
            {
                text: "具体的经验和事实",
                score: { S: 1, N: 0 }
            },
            {
                text: "直觉和可能性",
                score: { S: 0, N: 1 }
            }
        ]
    },
    {
        questionId: 7,
        text: "您更关注：",
        dimension: "S-N",
        category: "信息处理",
        options: [
            {
                text: "当前的实际情况",
                score: { S: 1, N: 0 }
            },
            {
                text: "未来的发展潜力",
                score: { S: 0, N: 1 }
            }
        ]
    },
    {
        questionId: 8,
        text: "在学习新技能时，您偏好：",
        dimension: "S-N",
        category: "信息处理",
        options: [
            {
                text: "按步骤学习，注重细节",
                score: { S: 1, N: 0 }
            },
            {
                text: "理解整体概念，把握要点",
                score: { S: 0, N: 1 }
            }
        ]
    },
    {
        questionId: 9,
        text: "您更喜欢的项目类型是：",
        dimension: "S-N",
        category: "信息处理",
        options: [
            {
                text: "有明确目标和具体要求的",
                score: { S: 1, N: 0 }
            },
            {
                text: "有创新空间和想象力的",
                score: { S: 0, N: 1 }
            }
        ]
    },
    {
        questionId: 10,
        text: "在解决问题时，您倾向于：",
        dimension: "S-N",
        category: "信息处理",
        options: [
            {
                text: "使用已知的有效方法",
                score: { S: 1, N: 0 }
            },
            {
                text: "尝试新的解决方案",
                score: { S: 0, N: 1 }
            }
        ]
    },

    // T-F 维度问题 (思考-情感)
    {
        questionId: 11,
        text: "在做重要决定时，您更看重：",
        dimension: "T-F",
        category: "决策方式",
        options: [
            {
                text: "逻辑分析和客观事实",
                score: { T: 1, F: 0 }
            },
            {
                text: "个人价值观和他人感受",
                score: { T: 0, F: 1 }
            }
        ]
    },
    {
        questionId: 12,
        text: "在团队冲突中，您更可能：",
        dimension: "T-F",
        category: "决策方式",
        options: [
            {
                text: "分析问题根源，寻找解决方案",
                score: { T: 1, F: 0 }
            },
            {
                text: "关注各方感受，促进和谐",
                score: { T: 0, F: 1 }
            }
        ]
    },
    {
        questionId: 13,
        text: "您更欣赏的领导风格是：",
        dimension: "T-F",
        category: "决策方式",
        options: [
            {
                text: "公平公正，注重效率",
                score: { T: 1, F: 0 }
            },
            {
                text: "关心员工，注重团队氛围",
                score: { T: 0, F: 1 }
            }
        ]
    },
    {
        questionId: 14,
        text: "在评价他人工作时，您更注重：",
        dimension: "T-F",
        category: "决策方式",
        options: [
            {
                text: "工作质量和完成情况",
                score: { T: 1, F: 0 }
            },
            {
                text: "努力程度和个人成长",
                score: { T: 0, F: 1 }
            }
        ]
    },
    {
        questionId: 15,
        text: "您更喜欢的反馈方式是：",
        dimension: "T-F",
        category: "决策方式",
        options: [
            {
                text: "直接明确，指出具体问题",
                score: { T: 1, F: 0 }
            },
            {
                text: "温和鼓励，注重建设性",
                score: { T: 0, F: 1 }
            }
        ]
    },

    // J-P 维度问题 (判断-感知)
    {
        questionId: 16,
        text: "您更喜欢的工作环境是：",
        dimension: "J-P",
        category: "生活方式",
        options: [
            {
                text: "有明确计划和截止日期",
                score: { J: 1, P: 0 }
            },
            {
                text: "灵活自由，可以随时调整",
                score: { J: 0, P: 1 }
            }
        ]
    },
    {
        questionId: 17,
        text: "面对多个任务时，您会：",
        dimension: "J-P",
        category: "生活方式",
        options: [
            {
                text: "制定详细计划，按顺序完成",
                score: { J: 1, P: 0 }
            },
            {
                text: "根据情况灵活调整，保持开放",
                score: { J: 0, P: 1 }
            }
        ]
    },
    {
        questionId: 18,
        text: "您更喜欢的项目状态是：",
        dimension: "J-P",
        category: "生活方式",
        options: [
            {
                text: "有明确的开始和结束",
                score: { J: 1, P: 0 }
            },
            {
                text: "持续发展，不断改进",
                score: { J: 0, P: 1 }
            }
        ]
    },
    {
        questionId: 19,
        text: "在时间管理上，您倾向于：",
        dimension: "J-P",
        category: "生活方式",
        options: [
            {
                text: "提前安排，按时完成",
                score: { J: 1, P: 0 }
            },
            {
                text: "保持弹性，适应变化",
                score: { J: 0, P: 1 }
            }
        ]
    },
    {
        questionId: 20,
        text: "您更喜欢的创新方式是：",
        dimension: "J-P",
        category: "生活方式",
        options: [
            {
                text: "在现有框架内优化改进",
                score: { J: 1, P: 0 }
            },
            {
                text: "打破常规，探索新可能",
                score: { J: 0, P: 1 }
            }
        ]
    }
];

// 初始化问题数据
async function initMBTIQuestions() {
    try {
        console.log('🔄 开始初始化MBTI测试问题...');
        
        // 清空现有数据
        await MBTIQuestion.deleteMany({});
        console.log('✅ 已清空现有问题数据');
        
        // 插入新数据
        const result = await MBTIQuestion.insertMany(mbtiQuestions);
        console.log(`✅ 成功插入 ${result.length} 个MBTI测试问题`);
        
        // 验证数据
        const count = await MBTIQuestion.countDocuments();
        console.log(`📊 数据库中共有 ${count} 个问题`);
        
        // 按维度统计
        const dimensionStats = await MBTIQuestion.aggregate([
            {
                $group: {
                    _id: '$dimension',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('📈 各维度问题统计:');
        dimensionStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} 个问题`);
        });
        
        console.log('🎉 MBTI测试问题初始化完成！');
        
    } catch (error) {
        console.error('❌ 初始化MBTI问题失败:', error);
    }
}

// 主函数
async function main() {
    await connectDB();
    await initMBTIQuestions();
    await mongoose.connection.close();
    console.log('✅ 数据库连接已关闭');
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { MBTIQuestion, mbtiQuestions }; 