const mongoose = require('mongoose');
const MBTICareerAdvice = require('../models/MBTICareerAdvice');
// 连接数据库
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/offercome';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// MBTI职业建议数据 - 增强版
const mbtiCareerData = [
    {
        mbtiType: 'INTJ',
        personalityDescription: '建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
        coreTraits: ['战略思维', '独立自主', '追求完美', '逻辑分析', '创新思维'],
        internetCareers: [
            {
                position: '技术架构师',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    'INTJ的战略思维和系统化思考能力非常适合设计复杂的技术架构',
                    '追求完美的性格特质有助于构建高质量的技术解决方案',
                    '独立工作的偏好符合架构师需要深度思考的工作特点'
                ],
                requiredSkills: ['系统设计', '技术选型', '架构模式', '性能优化', '技术领导力'],
                careerPath: [
                    { level: '初级', positions: ['初级开发工程师', '系统分析师'] },
                    { level: '中级', positions: ['高级开发工程师', '技术专家'] },
                    { level: '高级', positions: ['技术架构师', '技术总监'] },
                    { level: '专家', positions: ['首席架构师', '技术VP'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 15000, max: 25000 },
                    senior: { min: 40000, max: 80000 }
                }
            },
            {
                position: '产品经理',
                category: '产品设计',
                suitability: 4,
                reasons: [
                    '战略思维有助于制定长期产品规划',
                    '逻辑分析能力适合产品需求分析和功能设计',
                    '追求完美的特质有助于打造高质量产品'
                ],
                requiredSkills: ['产品规划', '需求分析', '用户体验', '数据分析', '项目管理'],
                careerPath: [
                    { level: '初级', positions: ['产品助理', '产品专员'] },
                    { level: '中级', positions: ['产品经理', '高级产品经理'] },
                    { level: '高级', positions: ['产品总监', '产品VP'] }
                ],
                typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动', '美团', '网易'],
                salaryRange: {
                    junior: { min: 12000, max: 20000 },
                    senior: { min: 30000, max: 60000 }
                }
            },
            {
                position: '战略分析师',
                category: '数据分析',
                suitability: 5,
                reasons: [
                    '战略思维和逻辑分析能力非常适合战略分析工作',
                    '独立研究能力有助于深度分析市场趋势',
                    '追求完美的特质确保分析报告的准确性'
                ],
                requiredSkills: ['市场分析', '数据分析', '战略规划', '商业建模', '研究报告'],
                careerPath: [
                    { level: '初级', positions: ['商业分析师', '市场分析师'] },
                    { level: '中级', positions: ['战略分析师', '高级分析师'] },
                    { level: '高级', positions: ['战略总监', '首席战略官'] }
                ],
                typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 10000, max: 18000 },
                    senior: { min: 25000, max: 50000 }
                }
            }
        ],
        strengths: ['强大的战略思维和系统化思考能力', '独立自主，能够深度思考复杂问题', '追求完美，注重细节和质量', '逻辑分析能力强，善于解决复杂问题', '创新思维，能够提出独特的解决方案'],
        challenges: ['可能过于完美主义，影响效率', '独立性强，团队协作需要改进', '可能过于直接，影响人际关系', '需要更多耐心处理日常事务'],
        developmentAdvice: ['培养团队协作能力，学会倾听他人意见', '在追求完美的同时注意效率平衡', '提升沟通技巧，更好地表达想法', '学会委派任务，不要事必躬亲'],
        workEnvironment: { teamSize: '小团队(2-5人)', workStyle: '高度结构化', communicationStyle: '逻辑分析' }
    },
    {
        mbtiType: 'INTP',
        personalityDescription: '逻辑学家型人格 - 创新的发明家，对知识有着不可抑制的渴望',
        coreTraits: ['逻辑思维', '创新发明', '深度分析', '好奇心强', '独立思考'],
        internetCareers: [
            {
                position: '算法工程师',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    'INTP的逻辑思维和深度分析能力非常适合算法开发',
                    '创新发明特质有助于开发新的算法和解决方案',
                    '对知识的渴望推动持续学习和研究'
                ],
                requiredSkills: ['机器学习', '深度学习', '算法设计', '数学建模', '编程能力'],
                careerPath: [
                    { level: '初级', positions: ['算法工程师', '数据科学家'] },
                    { level: '中级', positions: ['高级算法工程师', '算法专家'] },
                    { level: '高级', positions: ['算法总监', 'AI技术VP'] }
                ],
                typicalCompanies: ['字节跳动', '阿里巴巴', '腾讯', '百度', '美团'],
                salaryRange: {
                    junior: { min: 20000, max: 35000 },
                    senior: { min: 50000, max: 100000 }
                }
            },
            {
                position: '数据科学家',
                category: '数据分析',
                suitability: 5,
                reasons: [
                    '逻辑思维和深度分析能力非常适合数据分析工作',
                    '好奇心强，善于发现数据中的规律和洞察',
                    '独立思考能力有助于提出创新的分析方案'
                ],
                requiredSkills: ['统计分析', '机器学习', '数据挖掘', 'Python/R', 'SQL'],
                careerPath: [
                    { level: '初级', positions: ['数据分析师', '数据工程师'] },
                    { level: '中级', positions: ['数据科学家', '高级数据分析师'] },
                    { level: '高级', positions: ['数据科学总监', '首席数据官'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 15000, max: 25000 },
                    senior: { min: 40000, max: 80000 }
                }
            },
            {
                position: '研究员',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    '深度分析能力和好奇心非常适合研究工作',
                    '独立思考能力有助于提出创新理论',
                    '对知识的渴望推动前沿技术探索'
                ],
                requiredSkills: ['研究方法', '学术写作', '实验设计', '统计分析', '领域专业知识'],
                careerPath: [
                    { level: '初级', positions: ['研究助理', '初级研究员'] },
                    { level: '中级', positions: ['研究员', '高级研究员'] },
                    { level: '高级', positions: ['首席研究员', '研究总监'] }
                ],
                typicalCompanies: ['百度', '阿里巴巴', '腾讯', '字节跳动', '美团'],
                salaryRange: {
                    junior: { min: 12000, max: 20000 },
                    senior: { min: 30000, max: 60000 }
                }
            }
        ],
        strengths: ['强大的逻辑思维和深度分析能力', '创新发明，能够提出独特的解决方案', '好奇心强，持续学习和探索', '独立思考，不受传统思维束缚', '专注力强，能够深度研究复杂问题'],
        challenges: ['可能过于理论化，忽视实际应用', '独立性强，团队协作需要改进', '可能过于追求完美，影响效率', '需要更多耐心处理日常事务'],
        developmentAdvice: ['平衡理论与实践，注重实际应用价值', '提升团队协作能力，学会分享知识', '在追求完美的同时注意效率平衡', '培养沟通技巧，更好地表达复杂想法'],
        workEnvironment: { teamSize: '独立工作', workStyle: '高度灵活', communicationStyle: '逻辑分析' }
    },
    {
        mbtiType: 'ENTJ',
        personalityDescription: '指挥官型人格 - 大胆，富有想象力的强有力领导者，总能找到或创造解决方法',
        coreTraits: ['领导能力', '战略思维', '果断决策', '高效执行', '目标导向'],
        internetCareers: [
            {
                position: '技术总监',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    'ENTJ的领导能力和战略思维非常适合技术管理',
                    '果断决策能力有助于快速做出技术决策',
                    '高效执行能力确保项目按时交付'
                ],
                requiredSkills: ['技术管理', '团队领导', '项目管理', '技术选型', '战略规划'],
                careerPath: [
                    { level: '初级', positions: ['技术经理', '开发主管'] },
                    { level: '中级', positions: ['技术总监', '技术VP'] },
                    { level: '高级', positions: ['CTO', '技术合伙人'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 25000, max: 40000 },
                    senior: { min: 60000, max: 120000 }
                }
            },
            {
                position: '产品总监',
                category: '产品设计',
                suitability: 5,
                reasons: [
                    '战略思维有助于制定长期产品战略',
                    '领导能力适合管理产品团队',
                    '目标导向确保产品目标达成'
                ],
                requiredSkills: ['产品战略', '团队管理', '市场分析', '用户体验', '商业思维'],
                careerPath: [
                    { level: '初级', positions: ['产品经理', '高级产品经理'] },
                    { level: '中级', positions: ['产品总监', '产品VP'] },
                    { level: '高级', positions: ['CPO', '产品合伙人'] }
                ],
                typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动', '美团', '网易'],
                salaryRange: {
                    junior: { min: 20000, max: 35000 },
                    senior: { min: 50000, max: 100000 }
                }
            },
            {
                position: '运营总监',
                category: '运营营销',
                suitability: 5,
                reasons: [
                    '领导能力和高效执行适合运营管理',
                    '战略思维有助于制定运营策略',
                    '目标导向确保运营目标达成'
                ],
                requiredSkills: ['运营策略', '团队管理', '数据分析', '用户增长', '商业运营'],
                careerPath: [
                    { level: '初级', positions: ['运营专员', '运营经理'] },
                    { level: '中级', positions: ['运营总监', '高级运营经理'] },
                    { level: '高级', positions: ['COO', '运营合伙人'] }
                ],
                typicalCompanies: ['字节跳动', '美团', '滴滴', '阿里巴巴', '腾讯'],
                salaryRange: {
                    junior: { min: 8000, max: 15000 },
                    senior: { min: 25000, max: 50000 }
                }
            }
        ],
        strengths: ['强大的领导能力和战略思维', '果断决策，能够快速做出重要决定', '高效执行，确保目标达成', '目标导向，专注于结果', '自信果断，能够激励团队'],
        challenges: ['可能过于直接，影响人际关系', '可能过于强势，忽视他人感受', '需要更多耐心处理细节', '需要学会倾听和包容不同意见'],
        developmentAdvice: ['提升情商，学会更好地处理人际关系', '培养倾听能力，包容不同意见', '在追求效率的同时注意团队感受', '学会委派和信任团队成员'],
        workEnvironment: { teamSize: '大团队(15人以上)', workStyle: '高度结构化', communicationStyle: '直接高效' }
    },
    {
        mbtiType: 'ENFP',
        personalityDescription: '探险家型人格 - 热情洋溢、富有创造力的自由灵魂，总是能找到理由微笑',
        coreTraits: ['创造力', '热情活力', '人际交往', '适应性强', '创新思维'],
        internetCareers: [
            {
                position: '用户体验设计师',
                category: '用户体验',
                suitability: 5,
                reasons: [
                    'ENFP的创造力和同理心非常适合用户体验设计',
                    '热情活力有助于理解用户需求和情感',
                    '适应性强能够快速迭代设计方案'
                ],
                requiredSkills: ['用户研究', '交互设计', '视觉设计', '原型制作', '用户测试'],
                careerPath: [
                    { level: '初级', positions: ['UI设计师', 'UX设计师'] },
                    { level: '中级', positions: ['高级UX设计师', '设计专家'] },
                    { level: '高级', positions: ['UX总监', '设计VP'] }
                ],
                typicalCompanies: ['腾讯', '阿里巴巴', '字节跳动', '美团', '网易'],
                salaryRange: {
                    junior: { min: 10000, max: 18000 },
                    senior: { min: 25000, max: 50000 }
                }
            },
            {
                position: '内容创作者',
                category: '内容创作',
                suitability: 5,
                reasons: [
                    '创造力和热情活力非常适合内容创作',
                    '人际交往能力有助于理解受众需求',
                    '适应性强能够创作多样化的内容'
                ],
                requiredSkills: ['内容策划', '文案写作', '视频制作', '社交媒体', '数据分析'],
                careerPath: [
                    { level: '初级', positions: ['内容专员', '文案策划'] },
                    { level: '中级', positions: ['内容经理', '高级内容策划'] },
                    { level: '高级', positions: ['内容总监', '创意总监'] }
                ],
                typicalCompanies: ['字节跳动', '腾讯', '阿里巴巴', '美团', '网易'],
                salaryRange: {
                    junior: { min: 8000, max: 15000 },
                    senior: { min: 20000, max: 40000 }
                }
            },
            {
                position: '商务拓展',
                category: '商务拓展',
                suitability: 4,
                reasons: [
                    '人际交往能力有助于建立商业关系',
                    '热情活力有助于商务谈判和合作',
                    '适应性强能够应对各种商务场景'
                ],
                requiredSkills: ['商务谈判', '合作伙伴管理', '市场分析', '商业策划', '客户关系'],
                careerPath: [
                    { level: '初级', positions: ['商务专员', 'BD专员'] },
                    { level: '中级', positions: ['商务经理', '高级BD经理'] },
                    { level: '高级', positions: ['商务总监', 'BDVP'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 8000, max: 15000 },
                    senior: { min: 20000, max: 40000 }
                }
            }
        ],
        strengths: ['强大的创造力和创新思维', '热情活力，能够激励团队', '人际交往能力强，善于沟通', '适应性强，能够快速适应变化', '同理心强，能够理解他人需求'],
        challenges: ['可能过于理想化，忽视现实约束', '注意力容易分散，需要提高专注力', '可能过于情绪化，影响决策', '需要更多结构化的工作方式'],
        developmentAdvice: ['平衡理想与现实，注重可行性', '提高专注力，学会深度工作', '控制情绪，保持理性决策', '建立结构化的工作习惯'],
        workEnvironment: { teamSize: '中等团队(6-15人)', workStyle: '高度灵活', communicationStyle: '创意发散' }
    },
    {
        mbtiType: 'ISTJ',
        personalityDescription: '检查者型人格 - 实际、注重事实的可靠个体，他们的诚实、实用主义和奉献精神使他们成为宝贵的朋友',
        coreTraits: ['可靠性', '注重细节', '组织能力', '责任感', '务实'],
        internetCareers: [
            {
                position: '测试工程师',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    'ISTJ的注重细节和可靠性非常适合测试工作',
                    '组织能力有助于系统化测试流程',
                    '责任感确保测试质量和覆盖率'
                ],
                requiredSkills: ['测试用例设计', '自动化测试', '性能测试', '质量保证', '测试工具'],
                careerPath: [
                    { level: '初级', positions: ['测试工程师', 'QA工程师'] },
                    { level: '中级', positions: ['高级测试工程师', '测试专家'] },
                    { level: '高级', positions: ['测试总监', '质量总监'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 10000, max: 18000 },
                    senior: { min: 25000, max: 45000 }
                }
            },
            {
                position: '运维工程师',
                category: '技术开发',
                suitability: 5,
                reasons: [
                    '注重细节和可靠性非常适合运维工作',
                    '组织能力有助于系统化管理',
                    '责任感确保系统稳定运行'
                ],
                requiredSkills: ['系统运维', '监控告警', '自动化部署', '故障处理', '安全防护'],
                careerPath: [
                    { level: '初级', positions: ['运维工程师', '系统管理员'] },
                    { level: '中级', positions: ['高级运维工程师', '运维专家'] },
                    { level: '高级', positions: ['运维总监', '技术运营VP'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 12000, max: 20000 },
                    senior: { min: 30000, max: 55000 }
                }
            },
            {
                position: '财务分析师',
                category: '数据分析',
                suitability: 4,
                reasons: [
                    '注重细节和可靠性适合财务分析工作',
                    '组织能力有助于财务数据管理',
                    '责任感确保财务报告的准确性'
                ],
                requiredSkills: ['财务分析', '数据处理', '财务报表', '预算管理', '财务建模'],
                careerPath: [
                    { level: '初级', positions: ['财务专员', '会计'] },
                    { level: '中级', positions: ['财务分析师', '高级财务专员'] },
                    { level: '高级', positions: ['财务总监', 'CFO'] }
                ],
                typicalCompanies: ['阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴'],
                salaryRange: {
                    junior: { min: 8000, max: 15000 },
                    senior: { min: 20000, max: 40000 }
                }
            }
        ],
        strengths: ['高度可靠，值得信赖', '注重细节，确保质量', '组织能力强，善于管理', '责任感强，尽职尽责', '务实理性，注重效率'],
        challenges: ['可能过于保守，缺乏创新', '可能过于死板，缺乏灵活性', '可能过于注重细节，忽视大局', '需要更多开放性和创新思维'],
        developmentAdvice: ['培养创新思维，接受新事物', '提高灵活性，适应变化', '平衡细节与大局', '培养开放性和包容性'],
        workEnvironment: { teamSize: '小团队(2-5人)', workStyle: '高度结构化', communicationStyle: '直接高效' }
    }
];

// 初始化数据
async function initMBTICareerData() {
    try {
        console.log('开始初始化MBTI职业建议数据...');
        
        // 清空现有数据
        await MBTICareerAdvice.deleteMany({});
        console.log('已清空现有数据');
        
        // 插入新数据
        const result = await MBTICareerAdvice.insertMany(mbtiCareerData);
        console.log(`成功插入 ${result.length} 条MBTI职业建议数据`);
        
        // 验证数据
        const count = await MBTICareerAdvice.countDocuments();
        console.log(`数据库中现有 ${count} 条MBTI职业建议数据`);
        
        console.log('MBTI职业建议数据初始化完成！');
        
    } catch (error) {
        console.error('初始化MBTI职业建议数据失败:', error);
    } finally {
        mongoose.connection.close();
    }
}

// 运行初始化
initMBTICareerData(); 