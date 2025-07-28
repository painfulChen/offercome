// OfferCome 主页面增强功能 - 简约轻奢版本
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 OfferCome 页面加载完成');
    
    // 初始化页面功能
    initPage();
    
    // 初始化统计数据动画
    initStatsAnimation();
    
    // 初始化模态框
    initModals();
    
    // 初始化表单处理
    initForms();
    
    // 初始化服务卡片
    initServiceCards();
    
    // 初始化案例展示
    initCases();
});

// 页面初始化
function initPage() {
    console.log('✨ 初始化页面功能');
    
    // 平滑滚动
    initSmoothScroll();
    
    // 导航栏效果
    initNavbarEffects();
        
        // 检查用户登录状态
    checkAuthStatus();
}

// 平滑滚动
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航栏效果
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// 服务卡片动画
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// 统计数据动画
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                animateNumber(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// 数字动画
function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// 模态框初始化
function initModals() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // 登录按钮点击
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showLoginForm();
            loginModal.classList.add('show');
        });
    }
    
    // 注册按钮点击
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            showRegisterForm();
            loginModal.classList.add('show');
        });
    }
    
    // 模态框背景点击关闭
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
            }
        });
    }
    
    // 表单切换
    function showLoginForm() {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        const header = document.querySelector('.modal-header h2');
        const subtitle = document.querySelector('.modal-header p');
        if (header) header.textContent = '用户登录';
        if (subtitle) subtitle.textContent = '请输入您的账号信息';
    }
    
    function showRegisterForm() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        const header = document.querySelector('.modal-header h2');
        const subtitle = document.querySelector('.modal-header p');
        if (header) header.textContent = '用户注册';
        if (subtitle) subtitle.textContent = '请填写您的注册信息';
    }
}

// 表单处理
function initForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
                // 模拟登录成功
                showNotification('登录成功！', 'success');
                document.getElementById('loginModal').classList.remove('show');
                updateUserInterface(true, { username: email.split('@')[0] });
            } catch (error) {
                showNotification('登录失败，请稍后再试', 'error');
                console.error('登录错误:', error);
            }
        });
    }
    
    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            phone: document.getElementById('registerPhone').value,
            education: document.getElementById('registerEducation').value,
                targetJob: document.getElementById('registerTargetJob').value,
                experience: document.getElementById('registerExperience').value
        };
        
        try {
                // 模拟注册成功
                showNotification('注册成功！', 'success');
                document.getElementById('loginModal').classList.remove('show');
                updateUserInterface(true, formData);
        } catch (error) {
                showNotification('注册失败，请稍后再试', 'error');
                console.error('注册错误:', error);
            }
        });
    }
}

// 检查用户登录状态
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    updateUserInterface(!!user, user);
}

// 更新用户界面
function updateUserInterface(isLoggedIn, user = null) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn && user) {
        // 用户已登录
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userName) userName.textContent = user.username || user.email;
        }
        
        // 保存用户信息
        localStorage.setItem('user', JSON.stringify(user));
        
        // 登出按钮事件
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('user');
                showNotification('已成功登出', 'success');
                updateUserInterface(false);
            });
        }
    } else {
        // 用户未登录
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
        localStorage.removeItem('user');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
    notification.className = `notification ${type}`;
        notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            notification.style.background = '#D4AF37';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'info':
        default:
            notification.style.background = '#17a2b8';
            break;
    }
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        }, 100);
        
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
        }, 5000);

    // 手动关闭
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// 咨询按钮处理
document.addEventListener('DOMContentLoaded', function() {
    const consultBtn = document.getElementById('consultBtn');
    
    if (consultBtn) {
        consultBtn.addEventListener('click', function() {
            // 检查用户是否已登录
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            
            if (user) {
                // 已登录，跳转到咨询页面或显示咨询表单
                showNotification('正在为您连接专业顾问...', 'info');
                // 这里可以添加跳转到咨询页面的逻辑
            } else {
                // 未登录，显示登录模态框
                showNotification('请先登录后再进行咨询', 'info');
                document.getElementById('loginModal').classList.add('show');
                // 显示登录表单
                const loginForm = document.getElementById('loginForm');
                const registerForm = document.getElementById('registerForm');
                if (loginForm && registerForm) {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                }
            }
        });
    }
    
    // 服务卡片按钮处理
    const serviceButtons = document.querySelectorAll('.service-card .btn');
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const serviceName = this.closest('.service-card').querySelector('h3').textContent;
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            
            if (user) {
                showNotification(`正在为您安排${serviceName}服务...`, 'info');
            } else {
                showNotification(`请先登录后再使用${serviceName}服务`, 'info');
                document.getElementById('loginModal').classList.add('show');
                // 显示登录表单
                const loginForm = document.getElementById('loginForm');
                const registerForm = document.getElementById('registerForm');
                if (loginForm && registerForm) {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                }
            }
        });
    });
});

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    console.log('🎉 页面完全加载完成');
    
    // 更新用户界面状态
    checkAuthStatus();
    
    // 添加页面加载动画
    document.body.classList.add('loaded');
});

// 添加页面加载动画样式
const style = document.createElement('style');
style.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    /* 添加一些微妙的动画效果 */
    .hero-section {
        animation: fadeInUp 1s ease-out;
    }
    
    .service-card {
        transition: all 0.3s ease;
    }
    
    .service-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 30px rgba(212, 175, 55, 0.15);
    }
    
    .btn {
        transition: all 0.3s ease;
    }
    
    .btn:hover {
        transform: translateY(-2px);
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 案例展示功能
function initCases() {
    console.log('📊 初始化案例展示功能');
    
    // 加载精选案例
    loadFeaturedCases();
    
    // 初始化案例统计动画
    initCaseStatsAnimation();
}

// 加载精选案例
async function loadFeaturedCases() {
    try {
        const response = await fetch('/api/cases/featured');
        const data = await response.json();
        
        if (data.success) {
            displayCases(data.data);
        } else {
            console.error('加载案例失败:', data.message);
            showNotification('加载案例失败，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('加载案例出错:', error);
        showNotification('网络错误，请检查网络连接', 'error');
    }
}

// 显示案例
function displayCases(cases) {
    const casesGrid = document.getElementById('casesGrid');
    if (!casesGrid) return;
    
    casesGrid.innerHTML = '';
    
    cases.forEach(caseData => {
        const caseCard = createCaseCard(caseData);
        casesGrid.appendChild(caseCard);
    });
}

// 创建案例卡片
function createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = 'case-card';
    
    const salary = caseData.jobHuntingProcess.finalOffer.salary;
    const salaryText = `${(salary.base / 10000).toFixed(1)}万/年`;
    
    const duration = caseData.jobHuntingProcess.duration;
    const salaryIncrease = caseData.statistics.salaryIncrease;
    
    card.innerHTML = `
        <div class="case-header">
            <div class="case-student">
                <img src="${caseData.avatar}" alt="${caseData.name}" class="case-avatar" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'">
                <div class="case-info">
                    <h3>${caseData.name}</h3>
                    <p>${caseData.education.school} · ${caseData.education.major}</p>
                </div>
            </div>
            <div class="case-company">
                <i class="fas fa-building"></i>
                <span>${caseData.jobHuntingProcess.finalOffer.company}</span>
            </div>
            <div class="case-position">${caseData.jobHuntingProcess.finalOffer.position}</div>
            <div class="case-salary">${salaryText}</div>
        </div>
        <div class="case-body">
            <div class="case-stats">
                <div class="case-stat">
                    <div class="case-stat-number">${salaryIncrease}%</div>
                    <div class="case-stat-label">薪资涨幅</div>
                </div>
                <div class="case-stat">
                    <div class="case-stat-number">${duration}天</div>
                    <div class="case-stat-label">求职周期</div>
                </div>
            </div>
            <div class="case-story">${caseData.showcase.story.substring(0, 120)}...</div>
            <div class="case-tags">
                ${caseData.showcase.tags.map(tag => `<span class="case-tag">${tag}</span>`).join('')}
            </div>
            <div class="case-actions">
                <div class="case-views">
                    <i class="fas fa-eye"></i>
                    <span>${caseData.views} 次浏览</span>
                </div>
                <button class="btn btn-outline btn-small" onclick="viewCaseDetail('${caseData._id}')">查看详情</button>
            </div>
        </div>
    `;
    
    return card;
}

// 查看案例详情
function viewCaseDetail(caseId) {
    showNotification('正在加载案例详情...', 'info');
    // 这里可以打开模态框显示详细案例信息
    console.log('查看案例详情:', caseId);
}

// 加载更多案例
function loadMoreCases() {
    showNotification('正在加载更多案例...', 'info');
    // 这里可以实现分页加载更多案例
    console.log('加载更多案例');
}

// 初始化案例统计动画
function initCaseStatsAnimation() {
    const caseStatNumbers = document.querySelectorAll('.cases-stats .stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    caseStatNumbers.forEach(number => {
        observer.observe(number);
    });
} 