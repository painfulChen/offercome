// OfferCome 状态管理器
class StateManager {
  constructor() {
    this.state = {
      user: null,
      chatHistory: [],
      isLoading: false,
      notifications: [],
      currentPage: 'home',
      theme: 'light'
    };
    this.listeners = [];
    this.init();
  }
  
  // 初始化
  init() {
    // 从localStorage恢复状态
    this.loadFromStorage();
    
    // 监听存储变化
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        this.setState({ user: JSON.parse(e.newValue || 'null') });
      }
    });
  }
  
  // 设置状态
  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // 保存到localStorage
    this.saveToStorage();
    
    // 通知监听器
    this.notifyListeners(oldState, this.state);
  }
  
  // 订阅状态变化
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // 通知监听器
  notifyListeners(oldState, newState) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (error) {
        console.error('状态监听器错误:', error);
      }
    });
  }
  
  // 用户状态管理
  setUser(user) {
    this.setState({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }
  
  // 聊天历史管理
  addChatMessage(message) {
    const chatHistory = [...this.state.chatHistory, {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }];
    this.setState({ chatHistory });
  }
  
  clearChatHistory() {
    this.setState({ chatHistory: [] });
  }
  
  // 加载状态管理
  setLoading(isLoading) {
    this.setState({ isLoading });
  }
  
  // 通知管理
  addNotification(message, type = 'info', duration = 5000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    const notifications = [...this.state.notifications, notification];
    this.setState({ notifications });
    
    // 自动移除通知
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, duration);
    
    return notification.id;
  }
  
  removeNotification(id) {
    const notifications = this.state.notifications.filter(n => n.id !== id);
    this.setState({ notifications });
  }
  
  // 页面状态管理
  setCurrentPage(page) {
    this.setState({ currentPage: page });
    // 更新URL（如果支持）
    if (window.history && window.history.pushState) {
      window.history.pushState({ page }, '', `/${page}`);
    }
  }
  
  // 主题管理
  setTheme(theme) {
    this.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  // 从localStorage加载状态
  loadFromStorage() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const theme = localStorage.getItem('theme') || 'light';
      
      this.setState({ user, theme });
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      console.error('加载状态失败:', error);
    }
  }
  
  // 保存到localStorage
  saveToStorage() {
    try {
      if (this.state.user) {
        localStorage.setItem('user', JSON.stringify(this.state.user));
      }
      if (this.state.theme) {
        localStorage.setItem('theme', this.state.theme);
      }
    } catch (error) {
      console.error('保存状态失败:', error);
    }
  }
  
  // 获取状态
  getState() {
    return { ...this.state };
  }
  
  // 检查用户是否登录
  isLoggedIn() {
    return !!this.state.user;
  }
  
  // 获取当前用户
  getCurrentUser() {
    return this.state.user;
  }
  
  // 获取聊天历史
  getChatHistory() {
    return [...this.state.chatHistory];
  }
  
  // 获取通知
  getNotifications() {
    return [...this.state.notifications];
  }
  
  // 重置状态
  reset() {
    this.setState({
      user: null,
      chatHistory: [],
      isLoading: false,
      notifications: [],
      currentPage: 'home'
    });
    localStorage.clear();
  }
}

// 创建全局状态管理器实例
const stateManager = new StateManager();

// 导出状态管理器
window.StateManager = StateManager;
window.stateManager = stateManager; 