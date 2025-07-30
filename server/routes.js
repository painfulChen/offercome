// server/routes.js
module.exports = [
  // 健康检查
  { path: '/health', method: 'GET', handler: 'healthHandler' },
  
  // MBTI相关
  { path: '/mbti/questions', method: 'GET', handler: 'getMBTIQuestionsHandler' },
  { path: '/mbti/calculate', method: 'POST', handler: 'calculateMBTIHandler' },
  { path: '/mbti/career-advice', method: 'GET', handler: 'getMBTICareerAdviceHandler' },
  { path: '/mbti/career-categories', method: 'GET', handler: 'getMBTICareerCategoriesHandler' },
  { path: '/mbti/career-advice/:mbtiType', method: 'GET', handler: 'getMBTICareerAdviceByTypeHandler' },
  { path: '/mbti/career-advice/:mbtiType/recommendations', method: 'GET', handler: 'getMBTIRecommendationsHandler' },
  
  // AI相关
  { path: '/ai/chat', method: 'POST', handler: 'aiChatHandler' },
  { path: '/ai/rag', method: 'POST', handler: 'aiRagHandler' },
  
  // 用户认证
  { path: '/auth/login', method: 'POST', handler: 'loginHandler' },
  { path: '/auth/register', method: 'POST', handler: 'registerHandler' },
  { path: '/auth/logout', method: 'POST', handler: 'logoutHandler' },
  
  // 用户管理
  { path: '/user/profile', method: 'GET', handler: 'getUserProfileHandler' },
  { path: '/user/profile', method: 'PUT', handler: 'updateUserProfileHandler' },
  
  // 案例管理
  { path: '/cases', method: 'GET', handler: 'getCasesHandler' },
  { path: '/cases/:id', method: 'GET', handler: 'getCaseByIdHandler' },
  { path: '/cases', method: 'POST', handler: 'createCaseHandler' },
  
  // 案例分类
  { path: '/categories', method: 'GET', handler: 'getCategoriesHandler' },
  
  // 聊天记录
  { path: '/chat/history', method: 'GET', handler: 'getChatHistoryHandler' },
  { path: '/chat/clear', method: 'POST', handler: 'clearChatHistoryHandler' },
  
  // 手机认证
  { path: '/phone/send-code', method: 'POST', handler: 'sendPhoneCodeHandler' },
  { path: '/phone/verify', method: 'POST', handler: 'verifyPhoneCodeHandler' },
  
  // RAG管理
  { path: '/rag/upload', method: 'POST', handler: 'uploadRagDocumentHandler' },
  { path: '/rag/documents', method: 'GET', handler: 'getRagDocumentsHandler' },
  { path: '/rag/documents/:id', method: 'DELETE', handler: 'deleteRagDocumentHandler' }
]; 