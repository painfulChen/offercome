// test-router.js
const { matchRoute } = require('./server/router');

// 测试路由匹配
const testCases = [
  { path: '/health', method: 'GET', expected: 'healthHandler' },
  { path: '/mbti/questions', method: 'GET', expected: 'getMBTIQuestionsHandler' },
  { path: '/mbti/career-advice', method: 'GET', expected: 'getMBTICareerAdviceHandler' },
  { path: '/mbti/career-advice/INTJ', method: 'GET', expected: 'getMBTICareerAdviceByTypeHandler' },
  { path: '/mbti/career-advice/INTJ/recommendations', method: 'GET', expected: 'getMBTIRecommendationsHandler' },
  { path: '/mbti/career-advice/INTP/recommendations', method: 'GET', expected: 'getMBTIRecommendationsHandler' },
];

console.log('测试路由匹配:');
testCases.forEach(testCase => {
  const result = matchRoute(testCase.path, testCase.method);
  const success = result && result.handler === testCase.expected;
  console.log(`${testCase.method} ${testCase.path} -> ${success ? '✓' : '✗'} ${result ? result.handler : 'null'} (期望: ${testCase.expected})`);
  if (result && result.params) {
    console.log(`  参数:`, result.params);
  }
}); 