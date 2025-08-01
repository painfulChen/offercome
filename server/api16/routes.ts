// 集中路由表 - 声明式路由管理
export interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
  handler: string; // 对应的处理函数名
  description: string;
  auth?: boolean; // 是否需要认证
  rateLimit?: number; // 速率限制
}

export const routes: Route[] = [
  // 健康检查
  {
    path: '/health',
    method: 'GET',
    handler: 'healthHandler',
    description: '健康检查接口'
  },
  
  // MBTI相关
  {
    path: '/mbti/questions',
    method: 'GET',
    handler: 'getMBTIQuestionsHandler',
    description: '获取MBTI测试问题'
  },
  {
    path: '/mbti/calculate',
    method: 'POST',
    handler: 'calculateMBTIHandler',
    description: '计算MBTI类型',
    rateLimit: 10
  },
  
  // AI相关
  {
    path: '/ai/chat',
    method: 'POST',
    handler: 'aiChatHandler',
    description: 'AI聊天接口',
    auth: true,
    rateLimit: 20
  },
  {
    path: '/ai/rag',
    method: 'POST',
    handler: 'aiRagHandler',
    description: 'RAG知识库查询',
    auth: true,
    rateLimit: 15
  },
  
  // 用户认证
  {
    path: '/auth/login',
    method: 'POST',
    handler: 'loginHandler',
    description: '用户登录'
  },
  {
    path: '/auth/register',
    method: 'POST',
    handler: 'registerHandler',
    description: '用户注册'
  },
  {
    path: '/auth/logout',
    method: 'POST',
    handler: 'logoutHandler',
    description: '用户登出',
    auth: true
  },
  
  // 用户管理
  {
    path: '/user/profile',
    method: 'GET',
    handler: 'getUserProfileHandler',
    description: '获取用户资料',
    auth: true
  },
  {
    path: '/user/profile',
    method: 'PUT',
    handler: 'updateUserProfileHandler',
    description: '更新用户资料',
    auth: true
  },
  
  // 案例管理
  {
    path: '/cases',
    method: 'GET',
    handler: 'getCasesHandler',
    description: '获取案例列表'
  },
  {
    path: '/cases/:id',
    method: 'GET',
    handler: 'getCaseByIdHandler',
    description: '获取单个案例详情'
  },
  {
    path: '/cases',
    method: 'POST',
    handler: 'createCaseHandler',
    description: '创建新案例',
    auth: true
  },
  
  // 案例分类
  {
    path: '/categories',
    method: 'GET',
    handler: 'getCategoriesHandler',
    description: '获取案例分类'
  },
  
  // 聊天记录
  {
    path: '/chat/history',
    method: 'GET',
    handler: 'getChatHistoryHandler',
    description: '获取聊天历史',
    auth: true
  },
  {
    path: '/chat/clear',
    method: 'POST',
    handler: 'clearChatHistoryHandler',
    description: '清空聊天历史',
    auth: true
  },
  
  // 手机认证
  {
    path: '/phone/send-code',
    method: 'POST',
    handler: 'sendPhoneCodeHandler',
    description: '发送手机验证码',
    rateLimit: 5
  },
  {
    path: '/phone/verify',
    method: 'POST',
    handler: 'verifyPhoneCodeHandler',
    description: '验证手机验证码'
  },
  
  // RAG管理
  {
    path: '/rag/upload',
    method: 'POST',
    handler: 'uploadRagDocumentHandler',
    description: '上传RAG文档',
    auth: true
  },
  {
    path: '/rag/documents',
    method: 'GET',
    handler: 'getRagDocumentsHandler',
    description: '获取RAG文档列表',
    auth: true
  },
  {
    path: '/rag/documents/:id',
    method: 'DELETE',
    handler: 'deleteRagDocumentHandler',
    description: '删除RAG文档',
    auth: true
  }
];

// 路由前缀配置
export const API_PREFIX = '/api-v2';

// 获取所有可用路径
export const getAvailablePaths = () => {
  return routes.map(route => `${route.method} ${API_PREFIX}${route.path}`);
};

// 路由验证函数
export const validateRoute = (path: string, method: string): Route | null => {
  const normalizedPath = path.replace(API_PREFIX, '');
  return routes.find(route => 
    route.path === normalizedPath && 
    route.method === method.toUpperCase()
  ) || null;
};

// 导出路由表供测试使用
export default routes; 