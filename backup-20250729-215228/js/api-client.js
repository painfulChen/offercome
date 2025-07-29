// OfferCome API客户端
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
    this.setupInterceptors();
  }
  
  // 设置拦截器
  setupInterceptors() {
    // 请求拦截器
    this.requestInterceptor = (config) => {
      // 添加认证头
      if (this.token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${this.token}`
        };
      }
      
      // 添加时间戳防止缓存
      if (config.method === 'GET') {
        config.url += (config.url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
      }
      
      return config;
    };
    
    // 响应拦截器
    this.responseInterceptor = (response) => {
      // 处理token过期
      if (response.status === 401) {
        this.handleTokenExpired();
      }
      return response;
    };
  }
  
  // 统一请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    };
    
    // 应用请求拦截器
    const interceptedConfig = this.requestInterceptor(config);
    
    try {
      const response = await fetch(url, interceptedConfig);
      
      // 应用响应拦截器
      this.responseInterceptor(response);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  // 错误处理
  handleError(error) {
    console.error('API错误:', error);
    
    // 显示用户友好的错误消息
    let message = '网络错误，请稍后再试';
    
    if (error.message.includes('401')) {
      message = '登录已过期，请重新登录';
      this.handleTokenExpired();
    } else if (error.message.includes('403')) {
      message = '权限不足';
    } else if (error.message.includes('404')) {
      message = '请求的资源不存在';
    } else if (error.message.includes('429')) {
      message = '请求过于频繁，请稍后再试';
    } else if (error.message.includes('500')) {
      message = '服务器错误，请稍后再试';
    }
    
    this.showNotification(message, 'error');
  }
  
  // 处理token过期
  handleTokenExpired() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    
    // 跳转到登录页面
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  }
  
  // 显示通知
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
      notification.remove();
    }, 5000);
    
    // 手动关闭
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
  
  // 设置token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
  
  // 用户相关API
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }
  
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }
  
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // 即使API调用失败也要清除本地数据
    } finally {
      this.setToken(null);
      localStorage.removeItem('user');
    }
  }
  
  async getProfile() {
    return await this.request('/auth/me');
  }
  
  async updateProfile(userData) {
    return await this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
  
  // AI相关API
  async chat(message, context = {}) {
    return await this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        userId: this.getCurrentUserId()
      })
    });
  }
  
  async optimizeResume(resumeContent, targetJob = '') {
    return await this.request('/ai/resume', {
      method: 'POST',
      body: JSON.stringify({
        resumeContent,
        targetJob,
        userId: this.getCurrentUserId()
      })
    });
  }
  
  async getInterviewTips(interviewType = 'general', company = '') {
    return await this.request('/ai/interview', {
      method: 'POST',
      body: JSON.stringify({
        interviewType,
        company,
        userId: this.getCurrentUserId()
      })
    });
  }
  
  async getCareerPlanning(userBackground, careerGoals = '') {
    return await this.request('/ai/career', {
      method: 'POST',
      body: JSON.stringify({
        userBackground,
        careerGoals,
        userId: this.getCurrentUserId()
      })
    });
  }
  
  async simulateInterview(question, userAnswer = '', context = {}) {
    return await this.request('/ai/simulate', {
      method: 'POST',
      body: JSON.stringify({
        question,
        userAnswer,
        context,
        userId: this.getCurrentUserId()
      })
    });
  }
  
  // 系统相关API
  async checkHealth() {
    return await this.request('/health');
  }
  
  async testAI() {
    return await this.request('/ai/test');
  }
  
  // 工具方法
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 'anonymous';
  }
  
  isLoggedIn() {
    return !!this.token;
  }
  
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
}

// 创建全局API客户端实例
const apiClient = new ApiClient(
  window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api'
);

// 导出API客户端
window.ApiClient = ApiClient;
window.apiClient = apiClient; 