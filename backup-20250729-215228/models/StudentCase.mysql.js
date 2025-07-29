const db = require('../config/database-cloud');

// 获取精选案例
async function getFeaturedCases(limit = 6) {
  const sql = `SELECT id, title, category, industry, salary_increase, duration, difficulty, created_at
               FROM student_cases
               WHERE is_featured = 1 AND status = '已发布'
               ORDER BY created_at DESC
               LIMIT ?`;
  return await db.query(sql, [limit]);
}

// 获取案例列表，支持分页和筛选
async function getCases({ page = 1, limit = 10, category, industry }) {
  let sql = `SELECT id, title, category, industry, salary_increase, duration, difficulty, created_at
              FROM student_cases WHERE status = '已发布'`;
  const params = [];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (industry) {
    sql += ' AND industry = ?';
    params.push(industry);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  const cases = await db.query(sql, params);
  // 获取总数
  let countSql = 'SELECT COUNT(*) as total FROM student_cases WHERE status = "已发布"';
  const countParams = [];
  if (category) {
    countSql += ' AND category = ?';
    countParams.push(category);
  }
  if (industry) {
    countSql += ' AND industry = ?';
    countParams.push(industry);
  }
  const totalRow = await db.query(countSql, countParams);
  const total = totalRow[0]?.total || 0;
  return {
    cases,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };
}

module.exports = {
  getFeaturedCases,
  getCases
}; 