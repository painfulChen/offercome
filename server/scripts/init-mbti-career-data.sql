-- MBTI职业建议表初始化脚本
-- 创建MBTI职业建议表

CREATE TABLE IF NOT EXISTS mbti_career_advice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mbti_type VARCHAR(4) NOT NULL COMMENT 'MBTI类型',
    personality_description TEXT COMMENT '人格描述',
    core_traits JSON COMMENT '核心特质',
    recommended_careers JSON COMMENT '推荐职业',
    strengths TEXT COMMENT '优势分析',
    challenges TEXT COMMENT '挑战分析',
    development_advice TEXT COMMENT '发展建议',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mbti_type (mbti_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MBTI职业建议表';

-- 插入MBTI职业建议数据
INSERT INTO mbti_career_advice (mbti_type, personality_description, core_traits, recommended_careers, strengths, challenges, development_advice) VALUES

-- INTJ 建筑师型
('INTJ', 
'建筑师型人格 - 富有想象力和战略性的思考者，一切都要经过深思熟虑',
'["战略思维", "独立自主", "追求完美", "逻辑分析", "创新思维"]',
'[
    {
        "position": "技术架构师",
        "category": "技术开发",
        "suitability": 5,
        "reasons": ["INTJ的战略思维和系统化思考能力非常适合设计复杂的技术架构"],
        "requiredSkills": ["系统设计", "技术选型", "架构模式", "性能优化"],
        "careerPath": [
            {"level": "初级", "positions": ["初级开发工程师"]},
            {"level": "中级", "positions": ["高级开发工程师"]},
            {"level": "高级", "positions": ["技术架构师"]}
        ],
        "typicalCompanies": ["阿里巴巴", "腾讯", "字节跳动"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    },
    {
        "position": "产品战略专家",
        "category": "产品设计",
        "suitability": 4,
        "reasons": ["INTJ的深度思考能力适合制定长期产品战略"],
        "requiredSkills": ["市场分析", "竞品研究", "战略规划", "数据分析"],
        "careerPath": [
            {"level": "初级", "positions": ["产品助理"]},
            {"level": "中级", "positions": ["产品经理"]},
            {"level": "高级", "positions": ["产品战略专家"]}
        ],
        "typicalCompanies": ["美团", "滴滴", "快手"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    }
]',
'强大的战略思维和系统化思考能力，独立自主，能够深度思考复杂问题',
'可能过于完美主义，影响效率，独立性强，团队协作需要改进',
'培养团队协作能力，学会倾听他人意见，在追求完美的同时注意效率平衡'),

-- INTP 逻辑学家型
('INTP',
'逻辑学家型人格 - 富有创造力和好奇心，喜欢探索新理论',
'["逻辑推理", "创新思维", "独立分析", "好奇心强", "理论导向"]',
'[
    {
        "position": "算法工程师",
        "category": "技术开发",
        "suitability": 5,
        "reasons": ["INTP的逻辑推理和理论思维非常适合算法设计和优化"],
        "requiredSkills": ["算法设计", "数据结构", "机器学习", "数学建模"],
        "careerPath": [
            {"level": "初级", "positions": ["算法工程师"]},
            {"level": "中级", "positions": ["高级算法工程师"]},
            {"level": "高级", "positions": ["算法专家"]}
        ],
        "typicalCompanies": ["字节跳动", "腾讯", "阿里巴巴"],
        "salaryRange": {"junior": {"min": 20000, "max": 35000}, "senior": {"min": 50000, "max": 100000}}
    },
    {
        "position": "数据科学家",
        "category": "数据分析",
        "suitability": 4,
        "reasons": ["INTP的理论思维和好奇心适合数据科学和模型构建"],
        "requiredSkills": ["数据建模", "统计分析", "机器学习", "Python/R"],
        "careerPath": [
            {"level": "初级", "positions": ["数据分析师"]},
            {"level": "中级", "positions": ["数据科学家"]},
            {"level": "高级", "positions": ["首席数据科学家"]}
        ],
        "typicalCompanies": ["阿里巴巴", "美团", "滴滴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    }
]',
'逻辑推理能力强，善于创新和独立思考，理论思维深入',
'沟通表达需提升，容易钻牛角尖，执行力需要改进',
'多参与团队讨论，提升沟通能力，培养实践导向'),

-- ENTJ 指挥官型
('ENTJ',
'指挥官型人格 - 大胆，富有想象力的强有力领导者',
'["领导能力", "战略思维", "果断决策", "高效执行", "目标导向"]',
'[
    {
        "position": "技术总监",
        "category": "技术管理",
        "suitability": 5,
        "reasons": ["ENTJ的领导能力和战略思维非常适合技术团队管理"],
        "requiredSkills": ["技术管理", "团队建设", "战略规划", "项目管理"],
        "careerPath": [
            {"level": "初级", "positions": ["技术经理"]},
            {"level": "中级", "positions": ["技术总监"]},
            {"level": "高级", "positions": ["CTO"]}
        ],
        "typicalCompanies": ["阿里巴巴", "腾讯", "字节跳动"],
        "salaryRange": {"junior": {"min": 25000, "max": 40000}, "senior": {"min": 60000, "max": 120000}}
    },
    {
        "position": "商务拓展总监",
        "category": "商务拓展",
        "suitability": 4,
        "reasons": ["ENTJ的领导能力和目标导向适合商务拓展和合作谈判"],
        "requiredSkills": ["商务谈判", "市场分析", "关系维护", "战略合作"],
        "careerPath": [
            {"level": "初级", "positions": ["商务专员"]},
            {"level": "中级", "positions": ["商务经理"]},
            {"level": "高级", "positions": ["商务总监"]}
        ],
        "typicalCompanies": ["美团", "京东", "滴滴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    }
]',
'领导能力强，战略思维清晰，果断决策，高效执行，目标导向明确',
'可能过于强势，缺乏耐心，情感表达需要改进',
'培养耐心和同理心，学会倾听他人意见，提升情感表达能力'),

-- ENTP 辩论家型
('ENTP',
'辩论家型人格 - 机智、好奇，喜欢挑战常规',
'["创新能力", "逻辑思维", "善于辩论", "适应变化", "观点多元"]',
'[
    {
        "position": "产品经理",
        "category": "产品设计",
        "suitability": 5,
        "reasons": ["ENTP的创新能力和对变化的适应力非常适合产品创新"],
        "requiredSkills": ["需求分析", "创新策划", "用户研究", "项目管理"],
        "careerPath": [
            {"level": "初级", "positions": ["产品助理"]},
            {"level": "中级", "positions": ["产品经理"]},
            {"level": "高级", "positions": ["高级产品经理"]}
        ],
        "typicalCompanies": ["字节跳动", "腾讯", "阿里巴巴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    },
    {
        "position": "市场策划",
        "category": "运营营销",
        "suitability": 4,
        "reasons": ["ENTP的创意和辩论能力适合市场策划和品牌推广"],
        "requiredSkills": ["市场分析", "活动策划", "创意设计", "品牌传播"],
        "careerPath": [
            {"level": "初级", "positions": ["市场专员"]},
            {"level": "中级", "positions": ["市场经理"]},
            {"level": "高级", "positions": ["市场总监"]}
        ],
        "typicalCompanies": ["小红书", "快手", "微博"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'创新能力强，善于发现新机会，逻辑思维清晰，适应变化能力强',
'容易分心，执行力需提升，可能过于理想化',
'专注目标，提升落地能力，培养持续执行的习惯'),

-- INFJ 提倡者型
('INFJ',
'提倡者型人格 - 富有洞察力和理想主义，关注他人发展',
'["理想主义", "洞察力强", "同理心", "价值观导向", "深度思考"]',
'[
    {
        "position": "用户体验设计师",
        "category": "用户体验",
        "suitability": 5,
        "reasons": ["INFJ的洞察力和同理心非常适合理解用户需求"],
        "requiredSkills": ["用户研究", "交互设计", "视觉设计", "原型制作"],
        "careerPath": [
            {"level": "初级", "positions": ["UI设计师"]},
            {"level": "中级", "positions": ["UX设计师"]},
            {"level": "高级", "positions": ["用户体验专家"]}
        ],
        "typicalCompanies": ["腾讯", "阿里巴巴", "字节跳动"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "内容策划",
        "category": "内容创作",
        "suitability": 4,
        "reasons": ["INFJ的洞察力和价值观导向适合内容策划和品牌传播"],
        "requiredSkills": ["内容创作", "品牌传播", "用户洞察", "创意策划"],
        "careerPath": [
            {"level": "初级", "positions": ["内容专员"]},
            {"level": "中级", "positions": ["内容经理"]},
            {"level": "高级", "positions": ["内容总监"]}
        ],
        "typicalCompanies": ["小红书", "知乎", "微博"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'洞察力强，同理心丰富，价值观导向，深度思考能力强',
'过于理想化，现实落地需加强，可能过于敏感',
'平衡理想与现实，提升执行力，学会保护自己的情感边界'),

-- INFP 调停者型
('INFP',
'调停者型人格 - 诗意的，善良的利他主义者，总是热情地为正当理由而战',
'["理想主义", "创造力", "同理心", "价值观导向", "深度思考"]',
'[
    {
        "position": "内容创作者",
        "category": "内容创作",
        "suitability": 5,
        "reasons": ["INFP的创造力和理想主义非常适合内容创作和故事讲述"],
        "requiredSkills": ["内容创作", "文案写作", "创意策划", "品牌传播"],
        "careerPath": [
            {"level": "初级", "positions": ["内容专员"]},
            {"level": "中级", "positions": ["内容经理"]},
            {"level": "高级", "positions": ["内容总监"]}
        ],
        "typicalCompanies": ["抖音", "微博", "小红书"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    },
    {
        "position": "品牌策划",
        "category": "运营营销",
        "suitability": 4,
        "reasons": ["INFP的价值观导向和创造力适合品牌策划和传播"],
        "requiredSkills": ["品牌策划", "市场分析", "创意设计", "传播策略"],
        "careerPath": [
            {"level": "初级", "positions": ["品牌专员"]},
            {"level": "中级", "positions": ["品牌经理"]},
            {"level": "高级", "positions": ["品牌总监"]}
        ],
        "typicalCompanies": ["小红书", "B站", "微博"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    }
]',
'理想主义，创造力丰富，同理心强，价值观导向，深度思考',
'执行力需提升，商业敏感度需培养，可能过于理想化',
'培养执行力，提升商业敏感度，学会平衡理想与现实'),

-- ENFJ 主人公型
('ENFJ',
'主人公型人格 - 富有魅力的领导者，善于激励他人',
'["领导力", "沟通能力", "团队协作", "激励他人", "人际敏感"]',
'[
    {
        "position": "团队管理",
        "category": "项目管理",
        "suitability": 5,
        "reasons": ["ENFJ的领导力和人际敏感度非常适合团队管理和激励"],
        "requiredSkills": ["团队管理", "沟通协调", "激励技巧", "冲突解决"],
        "careerPath": [
            {"level": "初级", "positions": ["团队主管"]},
            {"level": "中级", "positions": ["团队经理"]},
            {"level": "高级", "positions": ["团队总监"]}
        ],
        "typicalCompanies": ["腾讯", "阿里巴巴", "字节跳动"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    },
    {
        "position": "培训师",
        "category": "人力资源",
        "suitability": 4,
        "reasons": ["ENFJ的激励能力和沟通技巧适合培训和人才发展"],
        "requiredSkills": ["培训开发", "课程设计", "演讲技巧", "人才评估"],
        "careerPath": [
            {"level": "初级", "positions": ["培训专员"]},
            {"level": "中级", "positions": ["培训经理"]},
            {"level": "高级", "positions": ["培训总监"]}
        ],
        "typicalCompanies": ["新东方", "猿辅导", "腾讯"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    }
]',
'沟通能力强，善于激励他人，团队协作能力强，人际敏感度高',
'过于关注他人，容易忽略自我需求，可能过于理想化',
'学会自我关怀，合理分配精力，保持现实与理想的平衡'),

-- ENFP 探险家型
('ENFP',
'探险家型人格 - 热情洋溢的创意家，总是能找到理由微笑',
'["热情活力", "创意丰富", "人际敏感", "适应性强", "理想主义"]',
'[
    {
        "position": "产品经理",
        "category": "产品设计",
        "suitability": 5,
        "reasons": ["ENFP的热情和创意能力非常适合产品创新和用户沟通"],
        "requiredSkills": ["用户研究", "原型设计", "数据分析", "项目管理"],
        "careerPath": [
            {"level": "初级", "positions": ["产品助理"]},
            {"level": "中级", "positions": ["产品经理"]},
            {"level": "高级", "positions": ["高级产品经理"]}
        ],
        "typicalCompanies": ["腾讯", "字节跳动", "阿里巴巴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    },
    {
        "position": "内容运营",
        "category": "运营营销",
        "suitability": 4,
        "reasons": ["ENFP的创意和人际敏感度适合内容创作和用户运营"],
        "requiredSkills": ["内容创作", "用户运营", "数据分析", "创意策划"],
        "careerPath": [
            {"level": "初级", "positions": ["运营专员"]},
            {"level": "中级", "positions": ["运营经理"]},
            {"level": "高级", "positions": ["内容运营总监"]}
        ],
        "typicalCompanies": ["小红书", "抖音", "微博"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'热情活力，创意丰富，人际敏感，适应性强，善于激发团队热情',
'可能过于理想主义，注意力分散，执行力需要提升',
'培养专注力和执行力，学会平衡理想与现实，提升项目管理能力'),

-- ISTJ 物流师型
('ISTJ',
'物流师型人格 - 可靠、务实，注重细节和规则',
'["责任心强", "注重细节", "执行力高", "守纪律", "务实"]',
'[
    {
        "position": "测试工程师",
        "category": "技术开发",
        "suitability": 5,
        "reasons": ["ISTJ的注重细节和责任心非常适合软件测试和质量保证"],
        "requiredSkills": ["软件测试", "质量管理", "自动化测试", "缺陷管理"],
        "careerPath": [
            {"level": "初级", "positions": ["测试工程师"]},
            {"level": "中级", "positions": ["高级测试工程师"]},
            {"level": "高级", "positions": ["测试专家"]}
        ],
        "typicalCompanies": ["腾讯", "阿里巴巴", "字节跳动"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "项目助理",
        "category": "项目管理",
        "suitability": 4,
        "reasons": ["ISTJ的执行力和注重细节适合项目管理和流程优化"],
        "requiredSkills": ["项目管理", "流程优化", "文档管理", "进度跟踪"],
        "careerPath": [
            {"level": "初级", "positions": ["项目助理"]},
            {"level": "中级", "positions": ["项目经理"]},
            {"level": "高级", "positions": ["项目总监"]}
        ],
        "typicalCompanies": ["美团", "京东", "滴滴"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'责任心强，执行力高，注重细节，守纪律，务实可靠',
'过于保守，创新能力需提升，可能过于死板',
'多尝试新方法，提升创新意识，学会灵活应对变化'),

-- ISFJ 守卫者型
('ISFJ',
'守卫者型人格 - 细心、忠诚，乐于助人',
'["细心", "忠诚", "乐于助人", "责任感强", "团队合作"]',
'[
    {
        "position": "行政专员",
        "category": "行政管理",
        "suitability": 5,
        "reasons": ["ISFJ的细心和乐于助人的特质非常适合行政管理工作"],
        "requiredSkills": ["行政管理", "文档处理", "协调沟通", "服务意识"],
        "careerPath": [
            {"level": "初级", "positions": ["行政专员"]},
            {"level": "中级", "positions": ["行政经理"]},
            {"level": "高级", "positions": ["行政总监"]}
        ],
        "typicalCompanies": ["腾讯", "阿里巴巴", "字节跳动"],
        "salaryRange": {"junior": {"min": 8000, "max": 15000}, "senior": {"min": 25000, "max": 50000}}
    },
    {
        "position": "客户支持",
        "category": "客户服务",
        "suitability": 4,
        "reasons": ["ISFJ的细心和乐于助人适合客户支持和问题解决"],
        "requiredSkills": ["客户沟通", "问题处理", "服务技巧", "情绪管理"],
        "careerPath": [
            {"level": "初级", "positions": ["客服专员"]},
            {"level": "中级", "positions": ["客服主管"]},
            {"level": "高级", "positions": ["客服经理"]}
        ],
        "typicalCompanies": ["京东", "美团", "滴滴"],
        "salaryRange": {"junior": {"min": 8000, "max": 15000}, "senior": {"min": 25000, "max": 50000}}
    }
]',
'细心，忠诚，乐于助人，责任感强，团队合作能力强',
'不善表达自我，容易忽略个人需求，可能过于被动',
'学会表达自我，合理分配精力，提升主动性和自信心'),

-- ESTJ 总经理型
('ESTJ',
'总经理型人格 - 组织能力强，注重效率和规则',
'["组织能力", "高效执行", "责任心强", "守纪律", "目标导向"]',
'[
    {
        "position": "运营经理",
        "category": "运营管理",
        "suitability": 5,
        "reasons": ["ESTJ的组织能力和高效执行非常适合运营管理"],
        "requiredSkills": ["运营管理", "流程优化", "团队管理", "数据分析"],
        "careerPath": [
            {"level": "初级", "positions": ["运营专员"]},
            {"level": "中级", "positions": ["运营经理"]},
            {"level": "高级", "positions": ["运营总监"]}
        ],
        "typicalCompanies": ["阿里巴巴", "腾讯", "美团"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "项目经理",
        "category": "项目管理",
        "suitability": 4,
        "reasons": ["ESTJ的注重效率和目标导向适合项目管理和执行"],
        "requiredSkills": ["项目管理", "目标管理", "团队协调", "进度控制"],
        "careerPath": [
            {"level": "初级", "positions": ["项目助理"]},
            {"level": "中级", "positions": ["项目经理"]},
            {"level": "高级", "positions": ["项目总监"]}
        ],
        "typicalCompanies": ["美团", "京东", "滴滴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    }
]',
'组织能力强，高效执行，责任心强，守纪律，目标导向明确',
'过于注重规则，灵活性需提升，可能过于死板',
'提升适应变化的能力，学会灵活应对，培养创新思维'),

-- ESFJ 执政官型
('ESFJ',
'执政官型人格 - 热情、合群，乐于服务他人',
'["热情", "合群", "乐于服务", "沟通能力强", "团队合作"]',
'[
    {
        "position": "人力资源专员",
        "category": "人力资源",
        "suitability": 5,
        "reasons": ["ESFJ的热情和乐于服务非常适合人力资源管理工作"],
        "requiredSkills": ["招聘管理", "员工关系", "培训开发", "沟通协调"],
        "careerPath": [
            {"level": "初级", "positions": ["HR专员"]},
            {"level": "中级", "positions": ["HR经理"]},
            {"level": "高级", "positions": ["HR总监"]}
        ],
        "typicalCompanies": ["腾讯", "阿里巴巴", "字节跳动"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "客户经理",
        "category": "客户服务",
        "suitability": 4,
        "reasons": ["ESFJ的乐于助人和沟通能力适合客户关系管理"],
        "requiredSkills": ["客户管理", "问题解决", "关系维护", "服务技巧"],
        "careerPath": [
            {"level": "初级", "positions": ["客户专员"]},
            {"level": "中级", "positions": ["客户经理"]},
            {"level": "高级", "positions": ["客户总监"]}
        ],
        "typicalCompanies": ["京东", "美团", "滴滴"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'热情，合群，乐于服务，沟通能力强，团队合作能力强',
'过于在意他人评价，容易忽略自我，可能过于依赖他人',
'学会自我肯定，合理分配精力，培养独立思考和决策能力'),

-- ISTP 鉴赏家型
('ISTP',
'鉴赏家型人格 - 大胆而实际的实验家，擅长使用各种工具',
'["实用主义", "技术敏锐", "冷静分析", "灵活适应", "动手能力强"]',
'[
    {
        "position": "前端开发工程师",
        "category": "技术开发",
        "suitability": 5,
        "reasons": ["ISTP的实用主义和技术敏锐度非常适合前端开发"],
        "requiredSkills": ["JavaScript", "React/Vue", "CSS", "性能优化"],
        "careerPath": [
            {"level": "初级", "positions": ["前端开发工程师"]},
            {"level": "中级", "positions": ["高级前端工程师"]},
            {"level": "高级", "positions": ["前端技术专家"]}
        ],
        "typicalCompanies": ["字节跳动", "美团", "快手"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "数据分析师",
        "category": "数据分析",
        "suitability": 4,
        "reasons": ["ISTP的冷静分析能力适合数据分析和问题解决"],
        "requiredSkills": ["SQL", "Python", "统计学", "数据可视化"],
        "careerPath": [
            {"level": "初级", "positions": ["数据分析师"]},
            {"level": "中级", "positions": ["高级数据分析师"]},
            {"level": "高级", "positions": ["数据科学家"]}
        ],
        "typicalCompanies": ["阿里巴巴", "腾讯", "滴滴"],
        "salaryRange": {"junior": {"min": 15000, "max": 25000}, "senior": {"min": 40000, "max": 80000}}
    }
]',
'实用主义，技术敏锐，冷静分析，灵活适应，动手能力强',
'可能过于独立，沟通表达需要提升，团队协作需要改进',
'提升沟通表达能力，学会团队协作，培养战略思维'),

-- ISFP 探险家型
('ISFP',
'探险家型人格 - 灵活、好奇，喜欢探索新体验',
'["灵活适应", "好奇心强", "审美能力", "感性表达", "独立自主"]',
'[
    {
        "position": "UI设计师",
        "category": "用户体验",
        "suitability": 5,
        "reasons": ["ISFP的审美和感性表达非常适合UI设计"],
        "requiredSkills": ["UI设计", "视觉表达", "用户体验", "设计工具"],
        "careerPath": [
            {"level": "初级", "positions": ["UI设计师"]},
            {"level": "中级", "positions": ["高级UI设计师"]},
            {"level": "高级", "positions": ["UI设计专家"]}
        ],
        "typicalCompanies": ["腾讯", "字节跳动", "阿里巴巴"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    },
    {
        "position": "新媒体运营",
        "category": "运营营销",
        "suitability": 4,
        "reasons": ["ISFP的灵活适应和好奇心适合新媒体运营"],
        "requiredSkills": ["内容创作", "社交媒体", "用户运营", "创意策划"],
        "careerPath": [
            {"level": "初级", "positions": ["运营专员"]},
            {"level": "中级", "positions": ["运营经理"]},
            {"level": "高级", "positions": ["运营总监"]}
        ],
        "typicalCompanies": ["小红书", "抖音", "微博"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'灵活适应，审美能力强，感性表达，独立自主，好奇心强',
'目标感需提升，抗压能力需加强，可能过于随性',
'设定明确目标，提升抗压能力，培养计划性和执行力'),

-- ESTP 企业家型
('ESTP',
'企业家型人格 - 充满活力，善于应对挑战',
'["活力充沛", "善于应变", "行动力强", "现实导向", "喜欢冒险"]',
'[
    {
        "position": "市场拓展",
        "category": "商务拓展",
        "suitability": 5,
        "reasons": ["ESTP的善于应变和行动力非常适合市场拓展"],
        "requiredSkills": ["市场拓展", "商务谈判", "关系建立", "销售技巧"],
        "careerPath": [
            {"level": "初级", "positions": ["销售专员"]},
            {"level": "中级", "positions": ["销售经理"]},
            {"level": "高级", "positions": ["销售总监"]}
        ],
        "typicalCompanies": ["美团", "京东", "滴滴"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    },
    {
        "position": "活动策划",
        "category": "运营营销",
        "suitability": 4,
        "reasons": ["ESTP的活力充沛和喜欢挑战适合活动策划"],
        "requiredSkills": ["活动策划", "创新思维", "项目管理", "创意设计"],
        "careerPath": [
            {"level": "初级", "positions": ["活动专员"]},
            {"level": "中级", "positions": ["活动经理"]},
            {"level": "高级", "positions": ["活动总监"]}
        ],
        "typicalCompanies": ["字节跳动", "快手", "微博"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    }
]',
'活力充沛，善于应变，行动力强，现实导向，喜欢挑战',
'耐心不足，计划性需提升，可能过于冲动',
'提升计划性，学会长期规划，培养耐心和细致性'),

-- ESFP 表演者型
('ESFP',
'表演者型人格 - 热情、友好，喜欢成为关注焦点',
'["热情友好", "表达力强", "适应性强", "乐观开朗", "人际敏感"]',
'[
    {
        "position": "内容创作者",
        "category": "内容创作",
        "suitability": 5,
        "reasons": ["ESFP的表达力和感染力非常适合内容创作"],
        "requiredSkills": ["内容创作", "视频制作", "直播技巧", "创意策划"],
        "careerPath": [
            {"level": "初级", "positions": ["内容专员"]},
            {"level": "中级", "positions": ["内容经理"]},
            {"level": "高级", "positions": ["内容总监"]}
        ],
        "typicalCompanies": ["抖音", "快手", "小红书"],
        "salaryRange": {"junior": {"min": 10000, "max": 18000}, "senior": {"min": 30000, "max": 60000}}
    },
    {
        "position": "公关专员",
        "category": "品牌公关",
        "suitability": 4,
        "reasons": ["ESFP的善于沟通和人际互动适合公关工作"],
        "requiredSkills": ["公关传播", "活动组织", "媒体关系", "危机处理"],
        "careerPath": [
            {"level": "初级", "positions": ["公关专员"]},
            {"level": "中级", "positions": ["公关经理"]},
            {"level": "高级", "positions": ["公关总监"]}
        ],
        "typicalCompanies": ["微博", "小红书", "抖音"],
        "salaryRange": {"junior": {"min": 12000, "max": 20000}, "senior": {"min": 35000, "max": 70000}}
    }
]',
'热情友好，表达力强，适应性强，乐观开朗，人际敏感',
'容易分心，抗压能力需提升，可能过于依赖他人评价',
'提升专注力和抗压能力，合理安排时间，培养独立判断能力'); 