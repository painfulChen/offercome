// test-simple.js
const { matchRoute } = require('./server/router');

console.log('=== 路由系统测试 ===');

// 测试路由编译
const testPath = '/mbti/career-advice/INTJ/recommendations';
const testMethod = 'GET';

console.log(`测试路径: ${testPath}`);
console.log(`测试方法: ${testMethod}`);

const result = matchRoute(testPath, testMethod);

if (result) {
  console.log('✓ 路由匹配成功');
  console.log('Handler:', result.handler);
  console.log('参数:', result.params);
} else {
  console.log('✗ 路由匹配失败');
}

// 测试所有路由
console.log('\n=== 测试所有路由 ===');
const testCases = [
  '/health',
  '/mbti/questions', 
  '/mbti/career-advice',
  '/mbti/career-advice/INTJ',
  '/mbti/career-advice/INTJ/recommendations'
];

testCases.forEach(path => {
  const res = matchRoute(path, 'GET');
  console.log(`${path} -> ${res ? '✓' : '✗'} ${res ? res.handler : 'null'}`);
}); 