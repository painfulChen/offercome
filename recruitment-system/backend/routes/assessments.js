const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// 创建测评验证规则
const createAssessmentSchema = Joi.object({
  type: Joi.string().valid('mbti', 'career', 'personality').required(),
  title: Joi.string().required(),
  description: Joi.string().optional()
});

// 提交答案验证规则
const submitAnswersSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.number().required(),
      answer: Joi.string().required()
    })
  ).required()
});

// 创建测评
router.post('/', authenticateToken, async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = createAssessmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { type, title, description } = value;

    // 根据类型生成问题
    let questions = [];
    if (type === 'mbti') {
      questions = [
        {
          id: 1,
          question: "在社交场合，你更倾向于：",
          options: [
            { key: "E", text: "与很多人交谈" },
            { key: "I", text: "与少数人深入交谈" }
          ]
        },
        {
          id: 2,
          question: "你更关注：",
          options: [
            { key: "S", text: "具体的事实和细节" },
            { key: "N", text: "抽象的概念和可能性" }
          ]
        },
        {
          id: 3,
          question: "做决定时，你更依赖：",
          options: [
            { key: "T", text: "逻辑和客观分析" },
            { key: "F", text: "价值观和感受" }
          ]
        },
        {
          id: 4,
          question: "你更喜欢：",
          options: [
            { key: "J", text: "计划和条理" },
            { key: "P", text: "灵活和适应" }
          ]
        }
      ];
    }

    // 创建测评
    const result = await query(
      'INSERT INTO assessments (user_id, type, title, description, questions, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [req.user.id, type, title, description, JSON.stringify(questions), 'in_progress']
    );

    const assessmentId = result.insertId;

    // 获取创建的测评
    const assessments = await query(
      'SELECT * FROM assessments WHERE id = ?',
      [assessmentId]
    );

    res.status(201).json({
      success: true,
      message: '测评创建成功',
      data: assessments[0]
    });

  } catch (error) {
    console.error('创建测评错误:', error);
    res.status(500).json({
      success: false,
      message: '创建测评失败'
    });
  }
});

// 提交测评答案
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证输入数据
    const { error, value } = submitAnswersSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { answers } = value;

    // 获取测评信息
    const assessments = await query(
      'SELECT * FROM assessments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '测评不存在'
      });
    }

    const assessment = assessments[0];

    // 分析MBTI结果
    let result = {};
    if (assessment.type === 'mbti') {
      const mbtiAnswers = answers.map(a => a.answer).join('');
      const eCount = (mbtiAnswers.match(/E/g) || []).length;
      const iCount = (mbtiAnswers.match(/I/g) || []).length;
      const sCount = (mbtiAnswers.match(/S/g) || []).length;
      const nCount = (mbtiAnswers.match(/N/g) || []).length;
      const tCount = (mbtiAnswers.match(/T/g) || []).length;
      const fCount = (mbtiAnswers.match(/F/g) || []).length;
      const jCount = (mbtiAnswers.match(/J/g) || []).length;
      const pCount = (mbtiAnswers.match(/P/g) || []).length;

      const mbtiType = [
        eCount > iCount ? 'E' : 'I',
        sCount > nCount ? 'S' : 'N',
        tCount > fCount ? 'T' : 'F',
        jCount > pCount ? 'J' : 'P'
      ].join('');

      result = {
        mbti_type: mbtiType,
        description: getMBTIDescription(mbtiType),
        career_recommendations: getCareerRecommendations(mbtiType),
        compatibility_score: 85
      };
    }

    // 更新测评结果
    await query(
      'UPDATE assessments SET answers = ?, result = ?, score = ?, status = ?, completed_at = NOW() WHERE id = ?',
      [JSON.stringify(answers), JSON.stringify(result), result.compatibility_score || 85, 'completed', id]
    );

    res.json({
      success: true,
      message: '测评完成',
      data: {
        result,
        score: result.compatibility_score || 85,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('提交测评答案错误:', error);
    res.status(500).json({
      success: false,
      message: '提交测评答案失败'
    });
  }
});

// 获取测评结果
router.get('/:id/result', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assessments = await query(
      'SELECT * FROM assessments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '测评不存在'
      });
    }

    const assessment = assessments[0];

    if (assessment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '测评尚未完成'
      });
    }

    res.json({
      success: true,
      message: '获取成功',
      data: {
        result: JSON.parse(assessment.result),
        score: assessment.score,
        completed_at: assessment.completed_at
      }
    });

  } catch (error) {
    console.error('获取测评结果错误:', error);
    res.status(500).json({
      success: false,
      message: '获取测评结果失败'
    });
  }
});

// MBTI类型描述
function getMBTIDescription(type) {
  const descriptions = {
    'INTJ': '建筑师 - 富有想象力和战略性的思考者',
    'INTP': '逻辑学家 - 具有创新性的发明家',
    'ENTJ': '指挥官 - 大胆、富有想象力的领导者',
    'ENTP': '辩论家 - 聪明好奇的思想家',
    'INFJ': '提倡者 - 安静而神秘，富有同情心',
    'INFP': '调停者 - 诗意、善良的利他主义者',
    'ENFJ': '主人公 - 富有魅力和鼓舞人心的领导者',
    'ENFP': '竞选者 - 热情、有创造力、社交能力强',
    'ISTJ': '物流师 - 实际而注重事实的可靠者',
    'ISFJ': '守卫者 - 非常专注和温暖的保护者',
    'ESTJ': '总经理 - 优秀的管理者，令人难以置信的专注',
    'ESFJ': '执政官 - 非常关心他人，社交能力强',
    'ISTP': '鉴赏家 - 大胆而实用的实验家',
    'ISFP': '探险家 - 灵活而迷人的艺术家',
    'ESTP': '企业家 - 聪明、精力充沛、非常善于感知',
    'ESFP': '表演者 - 自发的、精力充沛的娱乐者'
  };
  return descriptions[type] || '未知类型';
}

// 职业推荐
function getCareerRecommendations(type) {
  const recommendations = {
    'INTJ': ['产品经理', '数据分析师', '战略顾问'],
    'INTP': ['软件工程师', '研究员', '系统分析师'],
    'ENTJ': ['企业管理者', '项目经理', '投资顾问'],
    'ENTP': ['创业者', '销售总监', '创新顾问'],
    'INFJ': ['心理咨询师', '教师', '人力资源'],
    'INFP': ['作家', '设计师', '社工'],
    'ENFJ': ['培训师', '公关经理', '教育工作者'],
    'ENFP': ['营销经理', '记者', '活动策划'],
    'ISTJ': ['会计师', '审计师', '项目经理'],
    'ISFJ': ['护士', '行政助理', '客户服务'],
    'ESTJ': ['企业管理者', '项目经理', '销售经理'],
    'ESFJ': ['人力资源', '客户服务', '教师'],
    'ISTP': ['技术工程师', '机械师', '运动员'],
    'ISFP': ['设计师', '摄影师', '艺术家'],
    'ESTP': ['销售经理', '企业家', '运动员'],
    'ESFP': ['演员', '销售员', '活动策划']
  };
  return recommendations[type] || ['通用职业'];
}

module.exports = router; 