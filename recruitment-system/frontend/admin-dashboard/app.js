// API基础URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// 全局变量
let currentUser = null;
let authToken = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboard();
});

// 检查认证状态
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        document.getElementById('userInfo').textContent = currentUser.username;
    } else {
        // 如果没有登录，跳转到登录页面
        window.location.href = 'login.html';
    }
}

// 显示仪表盘
function showDashboard() {
    document.getElementById('pageTitle').textContent = '仪表盘';
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('leadsContent').style.display = 'none';
    document.getElementById('assessmentsContent').style.display = 'none';
    document.getElementById('usersContent').style.display = 'none';
    
    // 更新导航状态
    updateNavState('dashboard');
    loadDashboard();
}

// 显示线索管理
function showLeads() {
    document.getElementById('pageTitle').textContent = '获客线索管理';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('leadsContent').style.display = 'block';
    document.getElementById('assessmentsContent').style.display = 'none';
    document.getElementById('usersContent').style.display = 'none';
    
    updateNavState('leads');
    loadLeads();
}

// 显示测评管理
function showAssessments() {
    document.getElementById('pageTitle').textContent = '测评管理';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('leadsContent').style.display = 'none';
    document.getElementById('assessmentsContent').style.display = 'block';
    document.getElementById('usersContent').style.display = 'none';
    
    updateNavState('assessments');
    loadAssessments();
}

// 显示用户管理
function showUsers() {
    document.getElementById('pageTitle').textContent = '用户管理';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('leadsContent').style.display = 'none';
    document.getElementById('assessmentsContent').style.display = 'none';
    document.getElementById('usersContent').style.display = 'block';
    
    updateNavState('users');
    loadUsers();
}

// 更新导航状态
function updateNavState(activePage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 根据页面设置活动状态
    switch(activePage) {
        case 'dashboard':
            document.querySelector('.nav-link[onclick="showDashboard()"]').classList.add('active');
            break;
        case 'leads':
            document.querySelector('.nav-link[onclick="showLeads()"]').classList.add('active');
            break;
        case 'assessments':
            document.querySelector('.nav-link[onclick="showAssessments()"]').classList.add('active');
            break;
        case 'users':
            document.querySelector('.nav-link[onclick="showUsers()"]').classList.add('active');
            break;
    }
}

// 加载仪表盘数据
async function loadDashboard() {
    try {
        // 加载统计数据
        const statsResponse = await fetch(`${API_BASE_URL}/leads?limit=1`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
                document.getElementById('totalLeads').textContent = statsData.data.pagination.total;
                document.getElementById('newLeads').textContent = statsData.data.leads.filter(l => l.status === 'new').length;
                
                const converted = statsData.data.leads.filter(l => l.status === 'converted').length;
                const total = statsData.data.pagination.total;
                const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
                document.getElementById('conversionRate').textContent = conversionRate + '%';
            }
        }
        
        // 加载最近线索
        const leadsResponse = await fetch(`${API_BASE_URL}/leads?limit=5`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (leadsResponse.ok) {
            const leadsData = await leadsResponse.json();
            if (leadsData.success) {
                renderRecentLeads(leadsData.data.leads);
            }
        }
        
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showAlert('加载数据失败', 'error');
    }
}

// 渲染最近线索
function renderRecentLeads(leads) {
    const tbody = document.getElementById('recentLeadsTable');
    tbody.innerHTML = '';
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.source}</td>
            <td><span class="badge bg-${getStatusBadgeColor(lead.status)}">${getStatusText(lead.status)}</span></td>
            <td>${formatDate(lead.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewLead(${lead.id})">查看</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 加载线索列表
async function loadLeads() {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                renderLeadsTable(data.data.leads);
            }
        }
    } catch (error) {
        console.error('加载线索列表失败:', error);
        showAlert('加载线索列表失败', 'error');
    }
}

// 渲染线索表格
function renderLeadsTable(leads) {
    const tbody = document.getElementById('leadsTable');
    tbody.innerHTML = '';
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lead.id}</td>
            <td>${lead.name}</td>
            <td>${lead.phone || '-'}</td>
            <td>${lead.source}</td>
            <td><span class="badge bg-${getStatusBadgeColor(lead.status)}">${getStatusText(lead.status)}</span></td>
            <td>${formatDate(lead.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewLead(${lead.id})">查看</button>
                <button class="btn btn-sm btn-outline-warning" onclick="editLead(${lead.id})">编辑</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 加载测评列表
async function loadAssessments() {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                renderAssessmentsTable(data.data.assessments || []);
            }
        }
    } catch (error) {
        console.error('加载测评列表失败:', error);
        showAlert('加载测评列表失败', 'error');
    }
}

// 渲染测评表格
function renderAssessmentsTable(assessments) {
    const tbody = document.getElementById('assessmentsTable');
    tbody.innerHTML = '';
    
    assessments.forEach(assessment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assessment.id}</td>
            <td>${assessment.user_id}</td>
            <td>${assessment.type}</td>
            <td><span class="badge bg-${getAssessmentStatusBadgeColor(assessment.status)}">${getAssessmentStatusText(assessment.status)}</span></td>
            <td>${assessment.score || '-'}</td>
            <td>${formatDate(assessment.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewAssessment(${assessment.id})">查看</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 加载用户列表
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                renderUsersTable(data.data.users || []);
            }
        }
    } catch (error) {
        console.error('加载用户列表失败:', error);
        showAlert('加载用户列表失败', 'error');
    }
}

// 渲染用户表格
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${getRoleText(user.role_id)}</td>
            <td><span class="badge bg-${getUserStatusBadgeColor(user.status)}">${getUserStatusText(user.status)}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${user.id})">查看</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 显示创建线索模态框
function showCreateLeadModal() {
    const modal = new bootstrap.Modal(document.getElementById('createLeadModal'));
    modal.show();
}

// 提交创建线索
async function submitCreateLead() {
    const form = document.getElementById('createLeadForm');
    const formData = new FormData(form);
    
    const leadData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        wechat: formData.get('wechat'),
        source: formData.get('source'),
        requirements: formData.get('requirements')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showAlert('线索创建成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('createLeadModal')).hide();
                form.reset();
                loadLeads();
            } else {
                showAlert(data.message || '创建失败', 'error');
            }
        }
    } catch (error) {
        console.error('创建线索失败:', error);
        showAlert('创建线索失败', 'error');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 工具函数
function getStatusBadgeColor(status) {
    const colors = {
        'new': 'primary',
        'contacted': 'info',
        'qualified': 'warning',
        'converted': 'success',
        'lost': 'danger'
    };
    return colors[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        'new': '新线索',
        'contacted': '已联系',
        'qualified': '已确认',
        'converted': '已转化',
        'lost': '已流失'
    };
    return texts[status] || status;
}

function getAssessmentStatusBadgeColor(status) {
    const colors = {
        'in_progress': 'warning',
        'completed': 'success',
        'expired': 'danger'
    };
    return colors[status] || 'secondary';
}

function getAssessmentStatusText(status) {
    const texts = {
        'in_progress': '进行中',
        'completed': '已完成',
        'expired': '已过期'
    };
    return texts[status] || status;
}

function getUserStatusBadgeColor(status) {
    const colors = {
        'active': 'success',
        'inactive': 'secondary',
        'banned': 'danger'
    };
    return colors[status] || 'secondary';
}

function getUserStatusText(status) {
    const texts = {
        'active': '正常',
        'inactive': '禁用',
        'banned': '封禁'
    };
    return texts[status] || status;
}

function getRoleText(roleId) {
    const roles = {
        1: '管理员',
        2: '老师',
        3: '学生'
    };
    return roles[roleId] || '未知';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

function showAlert(message, type = 'info') {
    // 简单的提示实现
    alert(message);
}

// 占位函数
function createLead() {
    showCreateLeadModal();
}

function createAssessment() {
    showAlert('测评创建功能开发中...', 'info');
}

function exportData() {
    showAlert('数据导出功能开发中...', 'info');
}

function viewLead(id) {
    showAlert(`查看线索 ${id} 功能开发中...`, 'info');
}

function editLead(id) {
    showAlert(`编辑线索 ${id} 功能开发中...`, 'info');
}

function viewAssessment(id) {
    showAlert(`查看测评 ${id} 功能开发中...`, 'info');
}

function viewUser(id) {
    showAlert(`查看用户 ${id} 功能开发中...`, 'info');
} 