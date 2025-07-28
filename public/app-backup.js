// OfferCome 高端求职辅导平台 - 主应用逻辑

// API配置
const API_BASE_URL = 'http://localhost:3000/api'; // 本地开发环境
const PRODUCTION_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api';

// 当前环境判断
const isDevelopment = window.location.hostname === 'localhost';
const CURRENT_API_URL = isDevelopment ? API_BASE_URL : PRODUCTION_URL;

// 全局状态
let currentUser = null;
let chatHistory = [];

// 页面管理
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('active');
        
        // 如果是聊天页面，初始化聊天
        if (pageId === 'chatPage') {
            initializeChat();
        }
    }
}

// API调用函数
async function callAPI(endpoint, options = {}) {
    const url = `${CURRENT_API_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API调用失败');
        }
        
        return data;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 检查API健康状态
async function checkAPIHealth() {
    try {
        const result = await callAPI('/health');
        console.log('API健康检查:', result);
        return result.success;
    } catch (error) {
        console.error('API健康检查失败:', error);
        return false;
    }
}

// 发送消息到AI
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 清空输入框
    input.value = '';
    
    // 添加用户消息到聊天界面
    addMessage(message, 'user');
    
    // 显示加载状态
    addMessage('正在思考中...', 'bot', true);
    
    try {
        const response = await callAPI('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                userId: currentUser?.id || 'anonymous',
                history: chatHistory
            })
        });
        
        // 移除加载消息
        removeLoadingMessage();
        
        if (response.success) {
            addMessage(response.message, 'bot');
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: response.message });
        } else {
            addMessage('抱歉，我现在无法回答您的问题，请稍后再试。', 'bot');
        }
    } catch (error) {
        removeLoadingMessage();
        addMessage('抱歉，服务暂时不可用，请稍后再试。', 'bot');
        console.error('发送消息失败:', error);
    }
}

// 添加消息到聊天界面
function addMessage(content, type, isLoading = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (isLoading) {
        messageDiv.id = 'loading-message';
    }
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = content;
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 移除加载消息
function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 初始化聊天
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (chatInput && sendBtn) {
        // 回车发送消息
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // 点击发送按钮
        sendBtn.addEventListener('click', sendMessage);
        
        // 聚焦输入框
        chatInput.focus();
    }
}

// 开始AI咨询
function startAIConsultation() {
    showPage('chatPage');
    showNotification('正在为您连接AI顾问...', 'info');
    
    // 添加欢迎消息
    setTimeout(() => {
        addMessage('您好！我是OfferCome的AI求职助手。我可以帮助您：\n\n• 简历优化和制作\n• 面试技巧指导\n• 职业规划咨询\n• 求职策略建议\n\n请告诉我您的具体需求，我会为您提供专业的建议！', 'bot');
    }, 1000);
}

// 开始简历优化
function startResumeOptimization() {
    showPage('chatPage');
    setTimeout(() => {
        addMessage('您好！我是简历优化专家。请告诉我您的背景和求职目标，我将为您提供专业的简历优化建议。', 'bot');
    }, 500);
    showNotification('已启动简历优化服务', 'success');
}

// 开始面试辅导
function startInterviewCoaching() {
    showPage('chatPage');
    setTimeout(() => {
        addMessage('您好！我是面试辅导专家。请告诉我您要面试的职位和公司，我将为您提供针对性的面试准备建议。', 'bot');
    }, 500);
    showNotification('已启动面试辅导服务', 'success');
}

// 开始职业规划
function startCareerPlanning() {
    showPage('chatPage');
    setTimeout(() => {
        addMessage('您好！我是职业规划专家。请告诉我您的教育背景、工作经验和职业目标，我将为您制定个性化的职业发展计划。', 'bot');
    }, 500);
    showNotification('已启动职业规划服务', 'success');
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showNotification('请填写完整的登录信息', 'error');
        return;
    }
    
    try {
        const response = await callAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success) {
            currentUser = response.user;
            showNotification('登录成功！', 'success');
            showPage('welcomePage');
        } else {
            showNotification(response.error || '登录失败', 'error');
        }
    } catch (error) {
        showNotification('登录失败，请稍后再试', 'error');
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('请填写完整的注册信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    try {
        const response = await callAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        if (response.success) {
            currentUser = response.user;
            showNotification('注册成功！', 'success');
            showPage('welcomePage');
        } else {
            showNotification(response.error || '注册失败', 'error');
        }
    } catch (error) {
        showNotification('注册失败，请稍后再试', 'error');
    }
}

// 处理联系表单
async function handleContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName')?.value;
    const email = document.getElementById('contactEmail')?.value;
    const message = document.getElementById('contactMessage')?.value;
    
    if (!name || !email || !message) {
        showNotification('请填写完整的联系信息', 'error');
        return;
    }
    
    // 模拟发送成功
    showNotification('消息发送成功！我们会尽快回复您。', 'success');
    
    // 清空表单
    event.target.reset();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('OfferCome 应用初始化...');
    
    // 检查API健康状态
    checkAPIHealth().then(isHealthy => {
        if (isHealthy) {
            console.log('✅ API服务正常');
        } else {
            console.log('❌ API服务异常');
        }
    });
    
    // 绑定事件监听器
    const startConsultationBtn = document.getElementById('startConsultationBtn');
    if (startConsultationBtn) {
        startConsultationBtn.addEventListener('click', startAIConsultation);
    }
    
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showPage('loginPage');
        });
    }
    
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            showPage('registerPage');
        });
    }
    
    // 绑定表单提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // 初始化聊天页面（如果存在）
    if (document.getElementById('chatPage')) {
        initializeChat();
    }
    
    // 添加滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                // 一旦动画完成，停止观察
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有卡片元素
    document.querySelectorAll('.feature-card, .testimonial-card, .contact-item').forEach(card => {
        observer.observe(card);
    });
    
    console.log('✅ 应用初始化完成');
});

// 导出函数供HTML调用
window.showPage = showPage;
window.startAIConsultation = startAIConsultation;
window.startResumeOptimization = startResumeOptimization;
window.startInterviewCoaching = startInterviewCoaching;
window.startCareerPlanning = startCareerPlanning;
window.sendMessage = sendMessage; 