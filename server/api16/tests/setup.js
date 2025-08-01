// Jest测试设置文件
console.log('Jest测试环境已启动');

// 设置测试超时时间
jest.setTimeout(10000);

// 模拟环境变量
process.env.NODE_ENV = 'test';
process.env.TCB_ENV = 'test-env'; 