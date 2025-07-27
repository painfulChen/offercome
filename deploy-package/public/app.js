// API配置
const API_BASE_URL = 'http://124.222.117.47:3000';

// 全局变量
let currentSection = 'home';

// DOM元素
const elements = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuBtn: document.getElementById('menuBtn'),
    closeMenuBtn: document.getElementById('closeMenuBtn'),
    sections: document.querySelectorAll('.section'),
    menuItems: document.querySelectorAll('.menu-item'),
    actionCards: document.querySelectorAll('.action-card'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    adviceForm: document.getElementById('adviceForm'),
    adviceResult: document.getElementById('adviceResult'),
    resultContent: document.getElementById('resultContent'),
    loading: document.getElementById('loading'),
    toast: document.getElementById('toast'),
    apiStatus: document.getElementById('apiStatus'),
    aiStatus: document.getElementById('aiStatus'),
    responseTime: document.getElementById('responseTime'),
    statusJson: document.getElementById('statusJson')
};

// 初始化应用
function initApp() {
    setupEventListeners();
    setupChatInput();
    checkServiceStatus();
}

// 设置事件监听器
function setupEventListeners() {
    // 菜单按钮
    elements.menuBtn.addEventListener('click', toggleSidebar);
    elements.closeMenuBtn.addEventListener('click', toggleSidebar);
    elements.overlay.addEventListener('click', toggleSidebar);

    // 菜单项点击
    elements.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
            toggleSidebar();
        });
    });

    // 快速操作卡片
    elements.actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const section = card.getAttribute('data-section');
            switchSection(section);
        });
    });

    // 聊天发送按钮
    elements.sendBtn.addEventListener('click', sendChatMessage);

    // 招生建议表单
    elements.adviceForm.addEventListener('submit', handleAdviceSubmit);

    // 键盘事件
    document.addEventListener('keydown', handleKeydown);
}

// 设置聊天输入框
function setupChatInput() {
    elements.chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    elements.chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// 切换侧边栏
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    elements.overlay.classList.toggle('active');
}

// 切换页面
function switchSection(sectionName) {
    // 隐藏所有页面
    elements.sections.forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标页面
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
    }

    // 更新菜单项状态
    elements.menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });

    // 特殊处理
    if (sectionName === 'status') {
        checkServiceStatus();
    }
}

// 发送聊天消息
async function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // 添加用户消息
    addChatMessage(message, 'user');
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';

    // 显示加载状态
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.success) {
            addChatMessage(data.message, 'bot', data.source);
        } else {
            addChatMessage('抱歉，服务暂时不可用，请稍后重试。', 'bot', 'error');
        }
    } catch (error) {
        console.error('聊天API错误:', error);
        addChatMessage('网络错误，请检查网络连接。', 'bot', 'error');
    } finally {
        hideLoading();
    }
}

// 添加聊天消息
function addChatMessage(content, type, source = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${content}</p>`;

    if (source && source !== 'error') {
        const sourceBadge = document.createElement('small');
        sourceBadge.style.cssText = 'font-size: 10px; opacity: 0.7; margin-top: 4px; display: block;';
        sourceBadge.textContent = source === 'real-api' ? '真实API' : '模拟响应';
        messageContent.appendChild(sourceBadge);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// 处理招生建议提交
async function handleAdviceSubmit(e) {
    e.preventDefault();

    const formData = new FormData(elements.adviceForm);
    const studentInfo = Object.fromEntries(formData.entries());

    // 显示加载状态
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/admission-advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentInfo)
        });

        const data = await response.json();

        if (data.success) {
            elements.resultContent.textContent = data.message;
            elements.adviceResult.style.display = 'block';
            showToast('招生建议生成成功！', 'success');
        } else {
            showToast('生成建议失败，请稍后重试。', 'error');
        }
    } catch (error) {
        console.error('招生建议API错误:', error);
        showToast('网络错误，请检查网络连接。', 'error');
    } finally {
        hideLoading();
    }
}

// 检查服务状态
async function checkServiceStatus() {
    const startTime = Date.now();

    try {
        // 检查API健康状态
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        
        if (healthData.success) {
            elements.apiStatus.textContent = '正常运行';
            elements.apiStatus.style.color = 'var(--success-color)';
        } else {
            elements.apiStatus.textContent = '服务异常';
            elements.apiStatus.style.color = 'var(--error-color)';
        }

        // 检查AI服务状态
        const aiResponse = await fetch(`${API_BASE_URL}/api/ai/status`);
        const aiData = await aiResponse.json();
        
        if (aiData.success) {
            elements.aiStatus.textContent = '可用';
            elements.aiStatus.style.color = 'var(--success-color)';
        } else {
            elements.aiStatus.textContent = '不可用';
            elements.aiStatus.style.color = 'var(--error-color)';
        }

        // 计算响应时间
        const responseTime = Date.now() - startTime;
        elements.responseTime.textContent = `${responseTime}ms`;

        // 显示详细信息
        elements.statusJson.textContent = JSON.stringify({
            health: healthData,
            ai: aiData,
            responseTime: responseTime
        }, null, 2);

    } catch (error) {
        console.error('状态检查错误:', error);
        elements.apiStatus.textContent = '连接失败';
        elements.apiStatus.style.color = 'var(--error-color)';
        elements.aiStatus.textContent = '连接失败';
        elements.aiStatus.style.color = 'var(--error-color)';
        elements.responseTime.textContent = '--';
        elements.statusJson.textContent = JSON.stringify({ error: error.message }, null, 2);
    }
}

// 显示加载状态
function showLoading() {
    elements.loading.style.display = 'flex';
}

// 隐藏加载状态
function hideLoading() {
    elements.loading.style.display = 'none';
}

// 显示通知
function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 键盘事件处理
function handleKeydown(e) {
    // ESC键关闭侧边栏
    if (e.key === 'Escape' && elements.sidebar.classList.contains('active')) {
        toggleSidebar();
    }
}

// 工具函数：防抖
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

// 工具函数：节流
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
    };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 页面可见性变化时重新检查状态
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentSection === 'status') {
        checkServiceStatus();
    }
});

// 网络状态监听
window.addEventListener('online', () => {
    showToast('网络连接已恢复', 'success');
    if (currentSection === 'status') {
        checkServiceStatus();
    }
});

window.addEventListener('offline', () => {
    showToast('网络连接已断开', 'error');
}); 