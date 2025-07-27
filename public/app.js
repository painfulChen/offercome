// 全局变量
let currentUser = null;
const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc.service.tcloudbase.com';

// DOM元素
const pages = {
    welcome: document.getElementById('welcomePage'),
    login: document.getElementById('loginPage'),
    register: document.getElementById('registerPage'),
    chat: document.getElementById('chatPage')
};

const notification = document.getElementById('notification');

// 页面切换函数
function showPage(pageName) {
    // 隐藏所有页面
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active');
    });
    
    // 显示指定页面
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// API调用函数
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API调用失败:', error);
        throw error;
    }
}

// 用户注册
async function registerUser(userData) {
    try {
        const response = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            showNotification('注册成功！', 'success');
            return response;
        } else {
            showNotification(response.error || '注册失败', 'error');
            throw new Error(response.error);
        }
    } catch (error) {
        showNotification('注册失败，请稍后重试', 'error');
        throw error;
    }
}

// 用户登录
async function loginUser(userData) {
    try {
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            currentUser = response.user;
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            showNotification('登录成功！', 'success');
            return response;
        } else {
            showNotification(response.error || '登录失败', 'error');
            throw new Error(response.error);
        }
    } catch (error) {
        showNotification('登录失败，请稍后重试', 'error');
        throw error;
    }
}

// AI聊天
async function sendChatMessage(message) {
    try {
        const response = await apiCall('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (response.success) {
            return response.data.response;
        } else {
            showNotification(response.error || '发送失败', 'error');
            throw new Error(response.error);
        }
    } catch (error) {
        showNotification('发送失败，请稍后重试', 'error');
        throw error;
    }
}

// 添加聊天消息
function addChatMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (!isUser) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot';
        messageContent.appendChild(icon);
    }
    
    const text = document.createElement('p');
    text.textContent = content;
    messageContent.appendChild(text);
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 导航按钮事件
    document.getElementById('loginBtn').addEventListener('click', () => {
        showPage('login');
    });
    
    document.getElementById('registerBtn').addEventListener('click', () => {
        showPage('register');
    });
    
    // 开始聊天按钮
    document.getElementById('startChatBtn').addEventListener('click', () => {
        showPage('chat');
    });
    
    // 了解更多按钮
    document.getElementById('learnMoreBtn').addEventListener('click', () => {
        showNotification('更多功能正在开发中...', 'info');
    });
    
    // 返回首页按钮
    document.getElementById('backToWelcome').addEventListener('click', () => {
        showPage('welcome');
    });
    
    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        try {
            await registerUser(userData);
            showPage('login');
        } catch (error) {
            console.error('注册失败:', error);
        }
    });
    
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        try {
            await loginUser(userData);
            showPage('welcome');
        } catch (error) {
            console.error('登录失败:', error);
        }
    });
    
    // 聊天表单提交
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // 添加用户消息
        addChatMessage(message, true);
        messageInput.value = '';
        
        // 显示加载状态
        const loadingMessage = '正在思考中...';
        addChatMessage(loadingMessage, false);
        
        try {
            // 发送到AI
            const response = await sendChatMessage(message);
            
            // 移除加载消息
            const messages = document.querySelectorAll('.message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.querySelector('p').textContent === loadingMessage) {
                lastMessage.remove();
            }
            
            // 添加AI回复
            addChatMessage(response, false);
        } catch (error) {
            // 移除加载消息
            const messages = document.querySelectorAll('.message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.querySelector('p').textContent === loadingMessage) {
                lastMessage.remove();
            }
            
            addChatMessage('抱歉，我现在无法回答您的问题，请稍后再试。', false);
        }
    });
    
    // 页面切换链接
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register');
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
    });
    
    // 检查本地存储的用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showNotification(`欢迎回来，${currentUser.username}！`, 'success');
    }
    
    // 测试API连接
    testApiConnection();
});

// 测试API连接
async function testApiConnection() {
    try {
        const response = await apiCall('/api/health');
        if (response.success) {
            console.log('API连接正常');
        }
    } catch (error) {
        console.error('API连接失败:', error);
        showNotification('API服务暂时不可用，请稍后重试', 'error');
    }
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter 发送消息
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const messageInput = document.getElementById('messageInput');
        if (messageInput === document.activeElement) {
            document.getElementById('chatForm').dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape 返回首页
    if (e.key === 'Escape') {
        showPage('welcome');
    }
});

// 自动调整输入框高度
document.getElementById('messageInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时，检查API状态
        testApiConnection();
    }
}); 