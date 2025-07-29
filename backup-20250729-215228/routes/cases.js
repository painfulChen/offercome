const express = require('express');
const router = express.Router();

// 案例数据
const casesData = {
    intern: {
        id: 'intern-001',
        type: 'intern',
        title: '张同学 - 实习经历',
        subtitle: '985高校计算机专业 | 大三学生',
        avatar: 'user-graduate',
        background: {
            education: '985高校计算机科学与技术专业',
            target: '获得大厂实习offer',
            challenges: [
                '缺乏实习经验，简历空白',
                '不知道如何准备技术面试',
                '对互联网公司招聘流程不熟悉',
                '缺乏项目经验，竞争力不足'
            ]
        },
        services: [
            {
                title: '简历优化',
                description: '突出项目经验和技能，让简历更有竞争力',
                icon: 'file-alt'
            },
            {
                title: '面试辅导',
                description: '模拟技术面试，提升表达能力和自信心',
                icon: 'comments'
            },
            {
                title: '项目指导',
                description: '参与开源项目，积累实战经验',
                icon: 'code'
            },
            {
                title: '求职规划',
                description: '制定详细的求职时间线，提高成功率',
                icon: 'calendar-alt'
            }
        ],
        resume: {
            before: {
                education: '985高校 计算机科学与技术 2021-2025',
                skills: 'Java, Python, 基础算法',
                experience: '无实习经验',
                projects: '课程作业项目'
            },
            after: {
                education: '985高校 计算机科学与技术 2021-2025',
                skills: 'Java, Python, JavaScript, Spring Boot, React, Vue.js, MySQL, Redis, MongoDB, Git, Docker, Linux',
                experience: '某互联网公司后端开发实习生',
                projects: '电商平台后端开发, 在线学习系统前端开发, 开源项目贡献'
            }
        },
        timeline: [
            {
                date: '2023年9月',
                content: '开始使用OfferCome平台，进行简历优化'
            },
            {
                date: '2023年10月',
                content: '参与开源项目，积累实战经验'
            },
            {
                date: '2023年11月',
                content: '开始投递简历，获得多家公司面试机会'
            },
            {
                date: '2023年12月',
                content: '通过技术面试，获得实习offer'
            }
        ],
        result: {
            offer: '某知名互联网公司后端开发实习offer',
            salary: '15k',
            duration: '6个月',
            benefits: '转正机会',
            stats: [
                { label: '月薪', value: '15k' },
                { label: '实习期', value: '6个月' },
                { label: '转正', value: '机会' }
            ]
        },
        testimonial: {
            content: 'OfferCome平台帮我从零基础到获得大厂实习offer，简历优化和面试辅导都非常专业。特别是开源项目指导，让我在面试中有了很多谈资。强烈推荐给所有想要进入互联网行业的同学！',
            author: '张同学',
            position: '后端开发实习生'
        }
    },
    campus: {
        id: 'campus-001',
        type: 'campus',
        title: '李同学 - 校招经历',
        subtitle: '211高校软件工程专业 | 应届毕业生',
        avatar: 'user-tie',
        background: {
            education: '211高校软件工程专业',
            target: '获得大厂校招offer',
            challenges: [
                '校招竞争激烈，缺乏差异化优势',
                '技术栈不够深入，面试容易被问倒',
                '缺乏大厂实习经验，简历竞争力不足',
                '对薪资谈判没有经验'
            ]
        },
        services: [
            {
                title: '技术深度提升',
                description: '系统学习核心技能，建立技术壁垒',
                icon: 'graduation-cap'
            },
            {
                title: '面试技巧培训',
                description: '模拟面试，提升表达能力和应变能力',
                icon: 'microphone'
            },
            {
                title: '薪资谈判指导',
                description: '了解市场行情，掌握谈判技巧',
                icon: 'handshake'
            },
            {
                title: '职业规划',
                description: '制定长期发展路径，明确职业目标',
                icon: 'route'
            }
        ],
        resume: {
            before: {
                education: '211高校 软件工程 2020-2024',
                skills: 'Java, Spring Boot, MySQL',
                experience: '无实习经验',
                projects: '课程项目'
            },
            after: {
                education: '211高校 软件工程 2020-2024',
                skills: 'Java, Spring Boot, MySQL, Redis, JavaScript, React, Vue.js, Docker, Kubernetes, Linux',
                experience: '某知名互联网公司后端开发实习生',
                projects: '分布式电商系统, 实时聊天应用, 微服务架构设计'
            }
        },
        timeline: [
            {
                date: '2023年7月',
                content: '开始使用OfferCome平台，制定求职计划'
            },
            {
                date: '2023年8月',
                content: '技术深度提升，算法刷题300+'
            },
            {
                date: '2023年9月',
                content: '参加秋招，获得多家大厂面试机会'
            },
            {
                date: '2023年10月',
                content: '通过多轮面试，获得理想offer'
            }
        ],
        result: {
            offer: '某一线互联网公司后端开发工程师offer',
            salary: '25k',
            duration: '全职',
            benefits: '16薪 + 股票期权',
            stats: [
                { label: '月薪', value: '25k' },
                { label: '年终奖', value: '16薪' },
                { label: '期权', value: '股票' }
            ]
        },
        testimonial: {
            content: 'OfferCome平台不仅帮我优化了简历，更重要的是提供了系统的技术提升方案。面试技巧培训让我在面试中更加自信，薪资谈判指导帮我争取到了更好的待遇。感谢平台的专业指导！',
            author: '李同学',
            position: '后端开发工程师'
        }
    },
    social: {
        id: 'social-001',
        type: 'social',
        title: '王同学 - 社招经历',
        subtitle: '传统行业转互联网 | 3年工作经验',
        avatar: 'user-cog',
        background: {
            education: '传统行业背景',
            target: '成功转型到互联网公司',
            challenges: [
                '传统行业背景，缺乏互联网经验',
                '技术栈落后，需要快速学习新技术',
                '年龄偏大，担心竞争力不足',
                '对互联网公司文化不适应'
            ]
        },
        services: [
            {
                title: '技术转型指导',
                description: '制定学习计划，快速掌握新技术',
                icon: 'sync'
            },
            {
                title: '行业认知培训',
                description: '了解互联网公司文化和运作模式',
                icon: 'building'
            },
            {
                title: '简历重构',
                description: '突出可迁移技能和经验',
                icon: 'edit'
            },
            {
                title: '心理辅导',
                description: '建立信心，克服转型焦虑',
                icon: 'heart'
            }
        ],
        resume: {
            before: {
                education: '传统企业系统工程师',
                skills: 'Java, 传统技术栈',
                experience: '3年传统行业经验',
                projects: '企业级系统开发'
            },
            after: {
                education: '传统企业系统工程师',
                skills: 'Java, Spring Boot, MySQL, JavaScript, Vue.js, React, Docker, Linux, 云服务',
                experience: '3年系统开发经验，5人团队管理',
                projects: '企业ERP系统重构, 微服务架构设计, 数字化转型项目'
            }
        },
        timeline: [
            {
                date: '2023年3月',
                content: '开始使用OfferCome平台，制定转型计划'
            },
            {
                date: '2023年4-6月',
                content: '系统学习新技术，完成个人项目'
            },
            {
                date: '2023年7月',
                content: '开始投递简历，获得面试机会'
            },
            {
                date: '2023年8月',
                content: '通过多轮面试，成功转型'
            }
        ],
        result: {
            offer: '互联网公司高级开发工程师offer',
            salary: '35k',
            duration: '全职',
            benefits: '薪资提升75%',
            stats: [
                { label: '月薪', value: '35k' },
                { label: '薪资提升', value: '+75%' },
                { label: '职级', value: '高级' }
            ]
        },
        testimonial: {
            content: 'OfferCome平台帮我实现了从传统行业到互联网的成功转型。技术学习计划很实用，行业认知培训让我快速适应了互联网文化。现在的工作更有挑战性，薪资也大幅提升。感谢平台的专业指导！',
            author: '王同学',
            position: '高级开发工程师'
        }
    }
};

// 获取所有案例
router.get('/', (req, res) => {
    try {
        res.json({
            success: true,
            data: Object.values(casesData),
            message: '获取案例数据成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取案例数据失败',
            error: error.message
        });
    }
});

// 获取特定案例
router.get('/:type', (req, res) => {
    try {
        const { type } = req.params;
        const caseData = casesData[type];
        
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: '案例不存在'
            });
        }

        res.json({
            success: true,
            data: caseData,
            message: '获取案例详情成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取案例详情失败',
            error: error.message
        });
    }
});

// 获取案例统计
router.get('/stats/summary', (req, res) => {
    try {
        const stats = {
            totalCases: Object.keys(casesData).length,
            successRate: '95%',
            avgSalaryIncrease: '60%',
            avgTimeToOffer: '3个月',
            categories: {
                intern: 1,
                campus: 1,
                social: 1
            }
        };

        res.json({
            success: true,
            data: stats,
            message: '获取案例统计成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取案例统计失败',
            error: error.message
        });
    }
});

module.exports = router; 