// 全局变量
let currentUser = null;
const API_BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com';

// DOM元素
const pages = {
    welcome: document.getElementById('welcomePage'),
    login: document.getElementById('loginPage'),
    register: document.getElementById('registerPage'),
    chat: document.getElementById('chatPage')
};

const notification = document.getElementById('notification');
const loadingScreen = document.getElementById('loadingScreen');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 隐藏加载屏幕
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化动画
    initializeAnimations();
    
    // 检查用户登录状态
    checkUserLoginStatus();
    
    // 测试API连接
    testApiConnection();
}

// 初始化事件监听器
function initializeEventListeners() {
    // 导航按钮
    document.getElementById('loginBtn')?.addEventListener('click', () => showPage('login'));
    document.getElementById('registerBtn')?.addEventListener('click', () => showPage('register'));
    
    // 欢迎页面按钮
    document.getElementById('startConsultationBtn')?.addEventListener('click', () => showPage('chat'));
    document.getElementById('learnMoreBtn')?.addEventListener('click', () => scrollToSection('services'));
    
    // 表单提交
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('contactForm')?.addEventListener('submit', handleContact);
    
    // 聊天功能
    document.getElementById('sendBtn')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // 移动端导航
    document.getElementById('navToggle')?.addEventListener('click', toggleMobileMenu);
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 初始化动画
function initializeAnimations() {
    // 数字动画
    animateNumbers();
    
    // 滚动动画
    initializeScrollAnimations();
    
    // 浮动卡片动画
    initializeFloatingCards();
}

// 数字动画
function animateNumbers() {
    const numberElements = document.querySelectorAll('[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateNumber(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    numberElements.forEach(el => observer.observe(el));
}

function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// 滚动动画
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.service-card, .success-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

// 浮动卡片动画
function initializeFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });
}

// 页面切换函数
function showPage(pageName) {
    // 隐藏所有页面
    Object.values(pages).forEach(page => {
        if (page) {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });
    
    // 显示指定页面
    if (pages[pageName]) {
        pages[pageName].style.display = 'block';
        setTimeout(() => {
            pages[pageName].classList.add('active');
        }, 10);
    }
    
    // 特殊处理
    if (pageName === 'chat') {
        initializeChat();
    }
}

// 滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 隐藏通知
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
        showNotification('正在注册...', 'info');
        
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
        showNotification('正在登录...', 'info');
        
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

// 发送聊天消息
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addChatMessage(message, true);
    input.value = '';
    
    try {
        showNotification('正在处理您的消息...', 'info');
        
        const response = await apiCall('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (response.success) {
            addChatMessage(response.reply, false);
        } else {
            addChatMessage('抱歉，我现在无法回复您，请稍后再试。', false);
        }
    } catch (error) {
        console.error('聊天API调用失败:', error);
        addChatMessage('抱歉，网络连接出现问题，请稍后再试。', false);
    }
}

// 添加聊天消息
function addChatMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = content;
    
    messageContent.appendChild(messageText);
    
    if (isUser) {
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('请填写完整的登录信息', 'error');
        return;
    }
    
    try {
        await loginUser({ username, password });
        showPage('welcome');
    } catch (error) {
        console.error('登录失败:', error);
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!username || !email || !password || !confirmPassword) {
        showNotification('请填写完整的注册信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('请同意服务条款和隐私政策', 'error');
        return;
    }
    
    try {
        await registerUser({ username, email, password });
        showPage('login');
    } catch (error) {
        console.error('注册失败:', error);
    }
}

// 处理联系表单
async function handleContact(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showNotification('请填写完整的联系信息', 'error');
        return;
    }
    
    showNotification('消息发送成功！我们会尽快回复您。', 'success');
    e.target.reset();
}

// 初始化聊天
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.focus();
    }
}

// 检查用户登录状态
function checkUserLoginStatus() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
        try {
            currentUser = JSON.parse(user);
            showNotification(`欢迎回来，${currentUser.username}！`, 'success');
        } catch (error) {
            console.error('解析用户信息失败:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
}

// 测试API连接
async function testApiConnection() {
    try {
        const response = await apiCall('/api/health');
        console.log('API连接正常:', response);
    } catch (error) {
        console.error('API连接失败:', error);
        showNotification('API服务暂时不可用，请稍后再试', 'error');
    }
}

// 移动端菜单切换
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.getElementById('navToggle');
    
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 导出函数供HTML使用
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.sendChatMessage = sendChatMessage; 