// OfferCome 优化版本 - 主应用逻辑

// 加载API客户端和状态管理器
document.addEventListener('DOMContentLoaded', function() {
    // 动态加载JS文件
    loadScript('/js/api-client.js', () => {
        loadScript('/js/state-manager.js', () => {
            initializeApp();
        });
    });
});

function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

function initializeApp() {
    console.log('🚀 OfferCome 应用初始化...');
    
    // 检查API健康状态
    checkAPIHealth();
    
    // 初始化事件监听
    initializeEventListeners();
    
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化聊天功能
    initializeChat();
}

// API健康检查
async function checkAPIHealth() {
    try {
        const result = await apiClient.checkHealth();
        console.log('✅ API健康检查通过:', result);
        showNotification('系统连接正常', 'success');
    } catch (error) {
        console.error('❌ API健康检查失败:', error);
        showNotification('系统连接异常，部分功能可能不可用', 'warning');
    }
}

// 检查登录状态
function checkLoginStatus() {
    const user = stateManager.getCurrentUser();
    if (user) {
        console.log('👤 用户已登录:', user);
        updateUIForLoggedInUser(user);
    } else {
        console.log('👤 用户未登录');
        updateUIForGuestUser();
    }
}

// 更新已登录用户UI
function updateUIForLoggedInUser(user) {
    const loginSection = document.querySelector('.login-section');
    const userSection = document.querySelector('.user-section');
    
    if (loginSection) loginSection.style.display = 'none';
    if (userSection) {
        userSection.style.display = 'block';
        const userName = userSection.querySelector('.user-name');
        if (userName) userName.textContent = user.username;
    }
}

// 更新访客用户UI
function updateUIForGuestUser() {
    const loginSection = document.querySelector('.login-section');
    const userSection = document.querySelector('.user-section');
    
    if (loginSection) loginSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
}

// 初始化事件监听
function initializeEventListeners() {
    // 登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 注册表单
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 聊天输入
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 发送按钮
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // 页面切换
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
        showNotification('请填写邮箱和密码', 'error');
        return;
    }
    
    stateManager.setLoading(true);
    
    try {
        const result = await apiClient.login({ email, password });
        
        if (result.success) {
            stateManager.setUser(result.user);
            showNotification('登录成功', 'success');
            updateUIForLoggedInUser(result.user);
        } else {
            showNotification(result.error || '登录失败', 'error');
        }
    } catch (error) {
        showNotification('登录失败，请稍后再试', 'error');
    } finally {
        stateManager.setLoading(false);
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!username || !email || !password) {
        showNotification('请填写所有必填项', 'error');
        return;
    }
    
    stateManager.setLoading(true);
    
    try {
        const result = await apiClient.register({ username, email, password });
        
        if (result.success) {
            stateManager.setUser(result.user);
            showNotification('注册成功', 'success');
            updateUIForLoggedInUser(result.user);
        } else {
            showNotification(result.error || '注册失败', 'error');
        }
    } catch (error) {
        showNotification('注册失败，请稍后再试', 'error');
    } finally {
        stateManager.setLoading(false);
    }
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    addMessage(message, 'user');
    
    stateManager.setLoading(true);
    
    try {
        const response = await apiClient.chat(message);
        
        if (response.success) {
            addMessage(response.reply, 'bot');
            stateManager.addChatMessage({
                user: message,
                bot: response.reply,
                timestamp: new Date().toISOString()
            });
        } else {
            addMessage('抱歉，服务暂时不可用，请稍后再试。', 'error');
        }
    } catch (error) {
        addMessage('网络错误，请稍后再试。', 'error');
    } finally {
        stateManager.setLoading(false);
    }
}

// 添加消息到聊天界面
function addMessage(content, type) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 初始化聊天
function initializeChat() {
    const chatHistory = stateManager.getChatHistory();
    chatHistory.forEach(msg => {
        addMessage(msg.user, 'user');
        addMessage(msg.bot, 'bot');
    });
}

// 显示页面
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        stateManager.setCurrentPage(pageId);
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// 全局函数供HTML调用
window.sendMessage = sendMessage;
window.showPage = showPage;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
