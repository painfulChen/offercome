const mongoose = require('mongoose');
const StudentCase = require('../models/StudentCase');
require('dotenv').config({ path: '.env.cloudbase' });

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/offercome', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 示例学生案例数据
const studentCases = [
  {
    name: '张小明',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    gender: '男',
    education: {
      school: '清华大学',
      major: '计算机科学与技术',
      degree: '本科',
      graduationYear: 2024,
      gpa: 3.8
    },
    beforeJobHunting: {
      experience: '应届生',
      currentPosition: '无',
      currentCompany: '无',
      salary: 0,
      challenges: ['缺乏实习经验', '技术栈不够深入', '面试技巧不足'],
      goals: ['进入大厂', '获得高薪offer', '技术能力提升']
    },
    jobHuntingProcess: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-20'),
      duration: 65,
      applicationsSubmitted: 50,
      interviewsAttended: 8,
      offersReceived: 3,
      finalOffer: {
        company: '字节跳动',
        position: '后端开发工程师',
        industry: '互联网',
        location: '北京',
        salary: {
          base: 25000,
          bonus: 50000,
          total: 350000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '交通补贴'],
        startDate: new Date('2024-07-01')
      }
    },
    coachingService: {
      package: '高级版',
      duration: 8,
      sessions: 12,
      coach: {
        name: '李导师',
        title: '资深技术面试官',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '谈薪指导', '技能提升'],
      keyImprovements: ['算法能力提升', '系统设计能力', '面试技巧', '简历亮点突出']
    },
    successFactors: {
      strengths: ['学习能力强', '逻辑思维清晰', '技术基础扎实'],
      improvements: ['算法刷题', '项目经验补充', '面试技巧训练'],
      strategies: ['针对性投递', '重点准备大厂', '模拟面试训练'],
      tips: ['保持学习热情', '多参加技术交流', '建立个人品牌']
    },
    statistics: {
      salaryIncrease: 300,
      positionUpgrade: true,
      industryChange: false,
      locationChange: true
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师非常专业，帮我系统性地提升了技术能力和面试技巧，最终成功进入理想的公司！',
      coachRating: 5,
      coachComment: '学生学习态度很好，执行力强，技术基础扎实，是很有潜力的候选人。',
      highlights: ['技术能力突出', '学习能力强', '面试表现优秀'],
      challenges: ['缺乏实习经验', '项目经验不足'],
      recommendations: ['继续深入学习', '参与开源项目', '建立技术博客']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['应届生', '大厂', '技术', '高薪'],
      category: '技术',
      difficulty: '困难',
      story: '张小明是清华大学计算机专业的应届毕业生，虽然技术基础扎实，但缺乏实习经验和面试技巧。通过我们的系统辅导，他成功提升了算法能力、系统设计能力，并掌握了面试技巧，最终获得了字节跳动的offer，年薪35万。'
    },
    timeline: [
      {
        date: new Date('2024-01-15'),
        event: '开始求职',
        description: '确定求职目标，开始准备',
        milestone: true
      },
      {
        date: new Date('2024-02-01'),
        event: '简历优化完成',
        description: '突出技术项目和个人优势',
        milestone: true
      },
      {
        date: new Date('2024-02-15'),
        event: '第一次面试',
        description: '腾讯技术面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2024-03-20'),
        event: '获得字节跳动offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 1250,
    likes: 89,
    shares: 23
  },
  {
    name: '李小红',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    gender: '女',
    education: {
      school: '北京大学',
      major: '金融学',
      degree: '硕士',
      graduationYear: 2023,
      gpa: 3.9
    },
    beforeJobHunting: {
      experience: '1年以下',
      currentPosition: '金融分析师',
      currentCompany: '某证券公司',
      salary: 12000,
      challenges: ['薪资偏低', '发展空间有限', '想转行到互联网'],
      goals: ['转行到互联网', '获得更高薪资', '更好的发展机会']
    },
    jobHuntingProcess: {
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-12-15'),
      duration: 105,
      applicationsSubmitted: 80,
      interviewsAttended: 12,
      offersReceived: 4,
      finalOffer: {
        company: '阿里巴巴',
        position: '产品经理',
        industry: '互联网',
        location: '杭州',
        salary: {
          base: 28000,
          bonus: 60000,
          total: 396000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '住房补贴'],
        startDate: new Date('2024-01-15')
      }
    },
    coachingService: {
      package: '定制版',
      duration: 12,
      sessions: 15,
      coach: {
        name: '王导师',
        title: '资深产品经理',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '谈薪指导', '职业规划', '技能提升'],
      keyImprovements: ['产品思维培养', '数据分析能力', '沟通表达能力', '行业认知提升']
    },
    successFactors: {
      strengths: ['学习能力强', '逻辑思维清晰', '沟通表达好'],
      improvements: ['产品知识学习', '数据分析技能', '面试技巧训练'],
      strategies: ['针对性转行准备', '重点准备大厂', '建立产品思维'],
      tips: ['保持学习热情', '多关注产品动态', '建立行业人脉']
    },
    statistics: {
      salaryIncrease: 230,
      positionUpgrade: true,
      industryChange: true,
      locationChange: true
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师帮我系统性地学习了产品知识，提升了产品思维和面试技巧，成功实现了转行目标！',
      coachRating: 5,
      coachComment: '学生学习能力很强，产品思维提升很快，沟通表达也很优秀，是很有潜力的产品经理。',
      highlights: ['学习能力强', '产品思维好', '沟通表达优秀'],
      challenges: ['缺乏产品经验', '行业认知不足'],
      recommendations: ['继续学习产品知识', '关注行业动态', '建立产品思维']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['转行', '大厂', '产品', '高薪'],
      category: '产品',
      difficulty: '困难',
      story: '李小红是北京大学金融学硕士，原本在证券公司工作，但薪资偏低且发展空间有限。通过我们的系统辅导，她成功学习了产品知识，提升了产品思维和面试技巧，最终成功转行到阿里巴巴担任产品经理，年薪近40万。'
    },
    timeline: [
      {
        date: new Date('2023-09-01'),
        event: '开始转行准备',
        description: '确定转行目标，开始学习产品知识',
        milestone: true
      },
      {
        date: new Date('2023-10-15'),
        event: '产品知识学习完成',
        description: '系统学习产品经理相关知识',
        milestone: true
      },
      {
        date: new Date('2023-11-20'),
        event: '第一次产品面试',
        description: '腾讯产品面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2023-12-15'),
        event: '获得阿里巴巴offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 980,
    likes: 67,
    shares: 18
  },
  {
    name: '王大力',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    gender: '男',
    education: {
      school: '上海交通大学',
      major: '软件工程',
      degree: '本科',
      graduationYear: 2022,
      gpa: 3.6
    },
    beforeJobHunting: {
      experience: '1-3年',
      currentPosition: '前端开发工程师',
      currentCompany: '某创业公司',
      salary: 15000,
      challenges: ['技术栈单一', '项目经验不足', '缺乏大厂经验'],
      goals: ['进入大厂', '技术能力提升', '获得更高薪资']
    },
    jobHuntingProcess: {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-09-30'),
      duration: 120,
      applicationsSubmitted: 60,
      interviewsAttended: 10,
      offersReceived: 2,
      finalOffer: {
        company: '美团',
        position: '高级前端开发工程师',
        industry: '互联网',
        location: '北京',
        salary: {
          base: 30000,
          bonus: 80000,
          total: 440000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '交通补贴'],
        startDate: new Date('2023-10-15')
      }
    },
    coachingService: {
      package: '标准版',
      duration: 10,
      sessions: 8,
      coach: {
        name: '陈导师',
        title: '资深前端工程师',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '技能提升'],
      keyImprovements: ['技术栈扩展', '项目经验补充', '面试技巧提升']
    },
    successFactors: {
      strengths: ['技术基础扎实', '学习能力强', '项目经验丰富'],
      improvements: ['技术栈扩展', '项目经验补充', '面试技巧提升'],
      strategies: ['针对性投递', '重点准备大厂', '技术能力展示'],
      tips: ['保持技术学习', '参与开源项目', '建立技术博客']
    },
    statistics: {
      salaryIncrease: 193,
      positionUpgrade: true,
      industryChange: false,
      locationChange: true
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师帮我系统性地提升了技术能力，补充了项目经验，最终成功进入美团！',
      coachRating: 5,
      coachComment: '学生技术基础扎实，学习能力强，项目经验丰富，是很有潜力的工程师。',
      highlights: ['技术能力突出', '学习能力强', '项目经验丰富'],
      challenges: ['技术栈单一', '缺乏大厂经验'],
      recommendations: ['继续技术学习', '参与开源项目', '建立技术博客']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['技术', '大厂', '高薪', '经验提升'],
      category: '技术',
      difficulty: '中等',
      story: '王大力是上海交通大学软件工程专业毕业生，有2年前端开发经验，但技术栈单一且缺乏大厂经验。通过我们的系统辅导，他成功扩展了技术栈，补充了项目经验，最终获得了美团的offer，年薪44万。'
    },
    timeline: [
      {
        date: new Date('2023-06-01'),
        event: '开始求职准备',
        description: '确定求职目标，开始技术提升',
        milestone: true
      },
      {
        date: new Date('2023-07-15'),
        event: '技术栈扩展完成',
        description: '学习React、Vue等主流框架',
        milestone: true
      },
      {
        date: new Date('2023-08-20'),
        event: '第一次大厂面试',
        description: '美团技术面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2023-09-30'),
        event: '获得美团offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 850,
    likes: 45,
    shares: 12
  },
  {
    name: '赵小美',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    gender: '女',
    education: {
      school: '复旦大学',
      major: '市场营销',
      degree: '本科',
      graduationYear: 2023,
      gpa: 3.7
    },
    beforeJobHunting: {
      experience: '应届生',
      currentPosition: '无',
      currentCompany: '无',
      salary: 0,
      challenges: ['缺乏实习经验', '专业技能不足', '面试技巧缺乏'],
      goals: ['进入知名企业', '获得理想薪资', '专业能力提升']
    },
    jobHuntingProcess: {
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-01-15'),
      duration: 105,
      applicationsSubmitted: 40,
      interviewsAttended: 6,
      offersReceived: 2,
      finalOffer: {
        company: '宝洁',
        position: '市场专员',
        industry: '快消',
        location: '上海',
        salary: {
          base: 18000,
          bonus: 40000,
          total: 256000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '交通补贴'],
        startDate: new Date('2024-03-01')
      }
    },
    coachingService: {
      package: '标准版',
      duration: 8,
      sessions: 10,
      coach: {
        name: '刘导师',
        title: '资深市场总监',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '谈薪指导'],
      keyImprovements: ['专业技能提升', '面试技巧训练', '行业认知提升']
    },
    successFactors: {
      strengths: ['沟通表达好', '学习能力强', '逻辑思维清晰'],
      improvements: ['专业技能提升', '面试技巧训练', '行业认知提升'],
      strategies: ['针对性投递', '重点准备外企', '专业技能展示'],
      tips: ['保持学习热情', '多关注行业动态', '建立专业人脉']
    },
    statistics: {
      salaryIncrease: 256,
      positionUpgrade: true,
      industryChange: false,
      locationChange: false
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师帮我系统性地提升了专业技能和面试技巧，最终成功进入宝洁！',
      coachRating: 5,
      coachComment: '学生沟通表达很好，学习能力强，逻辑思维清晰，是很有潜力的市场人才。',
      highlights: ['沟通表达优秀', '学习能力强', '逻辑思维清晰'],
      challenges: ['缺乏实习经验', '专业技能不足'],
      recommendations: ['继续专业学习', '关注行业动态', '建立专业人脉']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['应届生', '外企', '快消', '高薪'],
      category: '商业',
      difficulty: '中等',
      story: '赵小美是复旦大学市场营销专业应届毕业生，虽然专业基础扎实，但缺乏实习经验和面试技巧。通过我们的系统辅导，她成功提升了专业技能和面试技巧，最终获得了宝洁的offer，年薪25.6万。'
    },
    timeline: [
      {
        date: new Date('2023-10-01'),
        event: '开始求职准备',
        description: '确定求职目标，开始专业提升',
        milestone: true
      },
      {
        date: new Date('2023-11-15'),
        event: '专业技能提升完成',
        description: '系统学习市场营销相关知识',
        milestone: true
      },
      {
        date: new Date('2023-12-20'),
        event: '第一次外企面试',
        description: '宝洁面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2024-01-15'),
        event: '获得宝洁offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 720,
    likes: 38,
    shares: 9
  },
  {
    name: '陈小强',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    gender: '男',
    education: {
      school: '浙江大学',
      major: '机械工程',
      degree: '本科',
      graduationYear: 2021,
      gpa: 3.5
    },
    beforeJobHunting: {
      experience: '3-5年',
      currentPosition: '机械工程师',
      currentCompany: '某制造企业',
      salary: 12000,
      challenges: ['薪资偏低', '发展空间有限', '想转行到互联网'],
      goals: ['转行到互联网', '获得更高薪资', '更好的发展机会']
    },
    jobHuntingProcess: {
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-08-30'),
      duration: 180,
      applicationsSubmitted: 100,
      interviewsAttended: 15,
      offersReceived: 3,
      finalOffer: {
        company: '腾讯',
        position: '产品运营',
        industry: '互联网',
        location: '深圳',
        salary: {
          base: 25000,
          bonus: 60000,
          total: 360000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '交通补贴'],
        startDate: new Date('2023-09-15')
      }
    },
    coachingService: {
      package: '定制版',
      duration: 16,
      sessions: 20,
      coach: {
        name: '张导师',
        title: '资深产品运营总监',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '谈薪指导', '职业规划', '技能提升'],
      keyImprovements: ['产品思维培养', '数据分析能力', '沟通表达能力', '行业认知提升']
    },
    successFactors: {
      strengths: ['学习能力强', '逻辑思维清晰', '执行力强'],
      improvements: ['产品知识学习', '数据分析技能', '面试技巧训练'],
      strategies: ['针对性转行准备', '重点准备大厂', '建立产品思维'],
      tips: ['保持学习热情', '多关注产品动态', '建立行业人脉']
    },
    statistics: {
      salaryIncrease: 200,
      positionUpgrade: true,
      industryChange: true,
      locationChange: true
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师帮我系统性地学习了产品运营知识，提升了产品思维和面试技巧，成功实现了转行目标！',
      coachRating: 5,
      coachComment: '学生学习能力很强，产品思维提升很快，执行力也很强，是很有潜力的产品运营人才。',
      highlights: ['学习能力强', '产品思维好', '执行力强'],
      challenges: ['缺乏产品经验', '行业认知不足'],
      recommendations: ['继续学习产品知识', '关注行业动态', '建立产品思维']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['转行', '大厂', '运营', '高薪'],
      category: '运营',
      difficulty: '困难',
      story: '陈小强是浙江大学机械工程专业毕业生，有4年机械工程师经验，但薪资偏低且发展空间有限。通过我们的系统辅导，他成功学习了产品运营知识，提升了产品思维和面试技巧，最终成功转行到腾讯担任产品运营，年薪36万。'
    },
    timeline: [
      {
        date: new Date('2023-03-01'),
        event: '开始转行准备',
        description: '确定转行目标，开始学习产品运营知识',
        milestone: true
      },
      {
        date: new Date('2023-05-15'),
        event: '产品知识学习完成',
        description: '系统学习产品运营相关知识',
        milestone: true
      },
      {
        date: new Date('2023-07-20'),
        event: '第一次产品面试',
        description: '腾讯产品运营面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2023-08-30'),
        event: '获得腾讯offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 1100,
    likes: 76,
    shares: 21
  },
  {
    name: '刘小芳',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    gender: '女',
    education: {
      school: '华东师范大学',
      major: '设计学',
      degree: '本科',
      graduationYear: 2022,
      gpa: 3.8
    },
    beforeJobHunting: {
      experience: '1-3年',
      currentPosition: 'UI设计师',
      currentCompany: '某设计公司',
      salary: 10000,
      challenges: ['薪资偏低', '项目经验不足', '缺乏大厂经验'],
      goals: ['进入大厂', '设计能力提升', '获得更高薪资']
    },
    jobHuntingProcess: {
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-11-30'),
      duration: 150,
      applicationsSubmitted: 70,
      interviewsAttended: 12,
      offersReceived: 2,
      finalOffer: {
        company: '网易',
        position: '高级UI设计师',
        industry: '互联网',
        location: '杭州',
        salary: {
          base: 22000,
          bonus: 50000,
          total: 314000,
          currency: 'CNY',
          period: '年'
        },
        benefits: ['五险一金', '补充医疗', '年假', '餐补', '交通补贴'],
        startDate: new Date('2023-12-15')
      }
    },
    coachingService: {
      package: '标准版',
      duration: 12,
      sessions: 10,
      coach: {
        name: '李导师',
        title: '资深UI设计师',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      services: ['简历优化', '面试准备', '模拟面试', '技能提升'],
      keyImprovements: ['设计能力提升', '项目经验补充', '面试技巧提升']
    },
    successFactors: {
      strengths: ['设计基础扎实', '学习能力强', '审美能力好'],
      improvements: ['设计能力提升', '项目经验补充', '面试技巧提升'],
      strategies: ['针对性投递', '重点准备大厂', '设计能力展示'],
      tips: ['保持设计学习', '参与设计比赛', '建立设计作品集']
    },
    statistics: {
      salaryIncrease: 214,
      positionUpgrade: true,
      industryChange: false,
      locationChange: true
    },
    feedback: {
      studentRating: 5,
      studentComment: '导师帮我系统性地提升了设计能力，补充了项目经验，最终成功进入网易！',
      coachRating: 5,
      coachComment: '学生设计基础扎实，学习能力强，审美能力好，是很有潜力的设计师。',
      highlights: ['设计能力突出', '学习能力强', '审美能力好'],
      challenges: ['项目经验不足', '缺乏大厂经验'],
      recommendations: ['继续设计学习', '参与设计比赛', '建立设计作品集']
    },
    showcase: {
      isFeatured: true,
      isPublic: true,
      tags: ['设计', '大厂', '高薪', '经验提升'],
      category: '设计',
      difficulty: '中等',
      story: '刘小芳是华东师范大学设计学专业毕业生，有2年UI设计经验，但项目经验不足且缺乏大厂经验。通过我们的系统辅导，她成功提升了设计能力，补充了项目经验，最终获得了网易的offer，年薪31.4万。'
    },
    timeline: [
      {
        date: new Date('2023-07-01'),
        event: '开始求职准备',
        description: '确定求职目标，开始设计提升',
        milestone: true
      },
      {
        date: new Date('2023-08-15'),
        event: '设计能力提升完成',
        description: '学习最新设计趋势和工具',
        milestone: true
      },
      {
        date: new Date('2023-10-20'),
        event: '第一次大厂面试',
        description: '网易设计面试，表现良好',
        milestone: true
      },
      {
        date: new Date('2023-11-30'),
        event: '获得网易offer',
        description: '成功获得理想offer',
        milestone: true
      }
    ],
    status: '已发布',
    views: 680,
    likes: 42,
    shares: 11
  }
];

// 插入数据
async function seedStudentCases() {
  try {
    console.log('开始插入学生案例数据...');
    
    // 清空现有数据
    await StudentCase.deleteMany({});
    console.log('已清空现有数据');
    
    // 插入新数据
    const result = await StudentCase.insertMany(studentCases);
    console.log(`成功插入 ${result.length} 条学生案例数据`);
    
    // 显示插入的数据
    console.log('\n插入的案例列表:');
    result.forEach((caseData, index) => {
      console.log(`${index + 1}. ${caseData.name} - ${caseData.jobHuntingProcess.finalOffer.company} - ${caseData.jobHuntingProcess.finalOffer.position}`);
    });
    
    console.log('\n数据插入完成！');
    process.exit(0);
  } catch (error) {
    console.error('插入数据失败:', error);
    process.exit(1);
  }
}

// 运行脚本
seedStudentCases(); 