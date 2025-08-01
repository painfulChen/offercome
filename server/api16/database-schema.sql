-- OfferCome 数据库表结构
-- 支持留学生求职服务平台的完整功能

-- 用户表
CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
    openid VARCHAR(64) UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(64) COMMENT '微信UnionID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像URL',
    country VARCHAR(50) COMMENT '目标国家',
    university VARCHAR(100) COMMENT '目标大学',
    major VARCHAR(100) COMMENT '目标专业',
    graduation_year INT COMMENT '毕业年份',
    mbti_result JSON COMMENT 'MBTI测评结果',
    resume_score FLOAT DEFAULT 0 COMMENT '简历评分',
    interview_score FLOAT DEFAULT 0 COMMENT '面试评分',
    total_score FLOAT DEFAULT 0 COMMENT '综合评分',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) COMMENT '用户表';

-- 销售顾问表
CREATE TABLE sales_consultants (
    id VARCHAR(32) PRIMARY KEY COMMENT '顾问ID',
    wecom_userid VARCHAR(64) UNIQUE COMMENT '企业微信用户ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像URL',
    department VARCHAR(50) COMMENT '部门',
    position VARCHAR(50) COMMENT '职位',
    quota_target INT DEFAULT 0 COMMENT '业绩目标',
    quota_current INT DEFAULT 0 COMMENT '当前业绩',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_wecom_userid (wecom_userid),
    INDEX idx_status (status)
) COMMENT '销售顾问表';

-- 老师表
CREATE TABLE teachers (
    id VARCHAR(32) PRIMARY KEY COMMENT '老师ID',
    wecom_userid VARCHAR(64) UNIQUE COMMENT '企业微信用户ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像URL',
    specialty TEXT COMMENT '专业领域',
    experience_years INT DEFAULT 0 COMMENT '经验年限',
    hourly_rate DECIMAL(10,2) DEFAULT 0 COMMENT '时薪',
    rating FLOAT DEFAULT 5.0 COMMENT '评分',
    status ENUM('active', 'inactive', 'busy') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_wecom_userid (wecom_userid),
    INDEX idx_status (status)
) COMMENT '老师表';

-- 潜在客户表
CREATE TABLE leads (
    id VARCHAR(32) PRIMARY KEY COMMENT '潜在客户ID',
    user_id VARCHAR(32) COMMENT '用户ID',
    consultant_id VARCHAR(32) COMMENT '销售顾问ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    country VARCHAR(50) COMMENT '目标国家',
    university VARCHAR(100) COMMENT '目标大学',
    major VARCHAR(100) COMMENT '目标专业',
    graduation_year INT COMMENT '毕业年份',
    source ENUM('landing', 'wechat', 'referral', 'other') DEFAULT 'landing' COMMENT '来源',
    status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost') DEFAULT 'new' COMMENT '状态',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
    notes TEXT COMMENT '备注',
    next_follow_up TIMESTAMP COMMENT '下次跟进时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_status (status),
    INDEX idx_source (source)
) COMMENT '潜在客户表';

-- 测评记录表
CREATE TABLE assessments (
    id VARCHAR(32) PRIMARY KEY COMMENT '测评ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    type ENUM('mbti', 'resume', 'interview', 'career_planning') NOT NULL COMMENT '测评类型',
    title VARCHAR(100) COMMENT '测评标题',
    description TEXT COMMENT '测评描述',
    questions JSON COMMENT '测评问题',
    answers JSON COMMENT '用户答案',
    result JSON COMMENT '测评结果',
    score FLOAT DEFAULT 0 COMMENT '评分',
    feedback TEXT COMMENT '反馈建议',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '状态',
    duration INT DEFAULT 0 COMMENT '测评时长(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '测评记录表';

-- 套餐表
CREATE TABLE packages (
    id VARCHAR(32) PRIMARY KEY COMMENT '套餐ID',
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    description TEXT COMMENT '套餐描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币',
    duration_days INT DEFAULT 0 COMMENT '服务天数',
    features JSON COMMENT '套餐功能',
    target_countries JSON COMMENT '目标国家',
    target_majors JSON COMMENT '目标专业',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) COMMENT '套餐表';

-- 订单表
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    consultant_id VARCHAR(32) COMMENT '销售顾问ID',
    package_id VARCHAR(32) NOT NULL COMMENT '套餐ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '最终金额',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币',
    status ENUM('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
    payment_method ENUM('wechat', 'alipay', 'bank') COMMENT '支付方式',
    payment_time TIMESTAMP COMMENT '支付时间',
    contract_url VARCHAR(255) COMMENT '合同URL',
    contract_signed BOOLEAN DEFAULT FALSE COMMENT '合同是否已签署',
    start_date DATE COMMENT '服务开始日期',
    end_date DATE COMMENT '服务结束日期',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '订单表';

-- 任务表
CREATE TABLE tasks (
    id VARCHAR(32) PRIMARY KEY COMMENT '任务ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    teacher_id VARCHAR(32) COMMENT '老师ID',
    consultant_id VARCHAR(32) COMMENT '销售顾问ID',
    title VARCHAR(100) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    type ENUM('resume', 'interview', 'career_planning', 'application', 'other') DEFAULT 'other' COMMENT '任务类型',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
    status ENUM('pending', 'in_progress', 'review', 'completed', 'overdue') DEFAULT 'pending' COMMENT '任务状态',
    progress INT DEFAULT 0 COMMENT '进度百分比',
    due_date DATE COMMENT '截止日期',
    completed_at TIMESTAMP COMMENT '完成时间',
    estimated_hours INT DEFAULT 0 COMMENT '预估工时',
    actual_hours INT DEFAULT 0 COMMENT '实际工时',
    tags JSON COMMENT '标签',
    attachments JSON COMMENT '附件',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_type (type)
) COMMENT '任务表';

-- 课程表
CREATE TABLE courses (
    id VARCHAR(32) PRIMARY KEY COMMENT '课程ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    teacher_id VARCHAR(32) NOT NULL COMMENT '老师ID',
    title VARCHAR(100) NOT NULL COMMENT '课程标题',
    description TEXT COMMENT '课程描述',
    type ENUM('interview_prep', 'resume_review', 'career_consulting', 'mock_interview') NOT NULL COMMENT '课程类型',
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled' COMMENT '课程状态',
    start_time TIMESTAMP NOT NULL COMMENT '开始时间',
    end_time TIMESTAMP NOT NULL COMMENT '结束时间',
    duration_minutes INT DEFAULT 60 COMMENT '课程时长(分钟)',
    meeting_url VARCHAR(255) COMMENT '会议链接',
    meeting_id VARCHAR(64) COMMENT '会议ID',
    location VARCHAR(255) COMMENT '地点',
    notes TEXT COMMENT '课程笔记',
    rating FLOAT DEFAULT 0 COMMENT '课程评分',
    feedback TEXT COMMENT '课程反馈',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) COMMENT '课程表';

-- 面试记录表
CREATE TABLE interviews (
    id VARCHAR(32) PRIMARY KEY COMMENT '面试ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    teacher_id VARCHAR(32) COMMENT '老师ID',
    title VARCHAR(100) NOT NULL COMMENT '面试标题',
    type ENUM('mock', 'real', 'review') DEFAULT 'mock' COMMENT '面试类型',
    company VARCHAR(100) COMMENT '公司名称',
    position VARCHAR(100) COMMENT '职位名称',
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled' COMMENT '面试状态',
    scheduled_time TIMESTAMP COMMENT '计划时间',
    actual_time TIMESTAMP COMMENT '实际时间',
    duration_minutes INT DEFAULT 0 COMMENT '面试时长(分钟)',
    recording_url VARCHAR(255) COMMENT '录音URL',
    transcript TEXT COMMENT '文字记录',
    ai_score FLOAT DEFAULT 0 COMMENT 'AI评分',
    teacher_score FLOAT DEFAULT 0 COMMENT '老师评分',
    overall_score FLOAT DEFAULT 0 COMMENT '综合评分',
    feedback TEXT COMMENT '面试反馈',
    improvement_suggestions JSON COMMENT '改进建议',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time)
) COMMENT '面试记录表';

-- 文件表
CREATE TABLE files (
    id VARCHAR(32) PRIMARY KEY COMMENT '文件ID',
    user_id VARCHAR(32) COMMENT '用户ID',
    name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_url VARCHAR(500) COMMENT '文件URL',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    file_type ENUM('resume', 'cover_letter', 'transcript', 'certificate', 'other') DEFAULT 'other' COMMENT '文件类型',
    status ENUM('uploading', 'processing', 'completed', 'failed') DEFAULT 'uploading' COMMENT '文件状态',
    ai_analysis JSON COMMENT 'AI分析结果',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_file_type (file_type),
    INDEX idx_status (status)
) COMMENT '文件表';

-- 通知表
CREATE TABLE notifications (
    id VARCHAR(32) PRIMARY KEY COMMENT '通知ID',
    user_id VARCHAR(32) COMMENT '用户ID',
    consultant_id VARCHAR(32) COMMENT '销售顾问ID',
    teacher_id VARCHAR(32) COMMENT '老师ID',
    type ENUM('task', 'course', 'interview', 'payment', 'system') NOT NULL COMMENT '通知类型',
    title VARCHAR(100) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    level ENUM('info', 'warning', 'error', 'success') DEFAULT 'info' COMMENT '通知级别',
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread' COMMENT '通知状态',
    related_id VARCHAR(32) COMMENT '关联ID',
    related_type VARCHAR(50) COMMENT '关联类型',
    sent_at TIMESTAMP COMMENT '发送时间',
    read_at TIMESTAMP COMMENT '阅读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '通知表';

-- 推荐码表
CREATE TABLE referral_codes (
    id VARCHAR(32) PRIMARY KEY COMMENT '推荐码ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    code VARCHAR(20) UNIQUE NOT NULL COMMENT '推荐码',
    type ENUM('student', 'consultant') DEFAULT 'student' COMMENT '推荐类型',
    commission_rate DECIMAL(5,2) DEFAULT 0 COMMENT '佣金比例',
    total_referrals INT DEFAULT 0 COMMENT '总推荐数',
    total_commission DECIMAL(10,2) DEFAULT 0 COMMENT '总佣金',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    expires_at TIMESTAMP COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) COMMENT '推荐码表';

-- 推荐记录表
CREATE TABLE referral_records (
    id VARCHAR(32) PRIMARY KEY COMMENT '推荐记录ID',
    referrer_id VARCHAR(32) NOT NULL COMMENT '推荐人ID',
    referee_id VARCHAR(32) NOT NULL COMMENT '被推荐人ID',
    referral_code_id VARCHAR(32) NOT NULL COMMENT '推荐码ID',
    order_id VARCHAR(32) COMMENT '订单ID',
    commission_amount DECIMAL(10,2) DEFAULT 0 COMMENT '佣金金额',
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending' COMMENT '状态',
    paid_at TIMESTAMP COMMENT '支付时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referee_id (referee_id),
    INDEX idx_status (status)
) COMMENT '推荐记录表';

-- 系统配置表
CREATE TABLE system_configs (
    id VARCHAR(32) PRIMARY KEY COMMENT '配置ID',
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '配置类型',
    description TEXT COMMENT '配置描述',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_config_key (config_key)
) COMMENT '系统配置表';

-- 操作日志表
CREATE TABLE operation_logs (
    id VARCHAR(32) PRIMARY KEY COMMENT '日志ID',
    user_id VARCHAR(32) COMMENT '用户ID',
    consultant_id VARCHAR(32) COMMENT '销售顾问ID',
    teacher_id VARCHAR(32) COMMENT '老师ID',
    action VARCHAR(100) NOT NULL COMMENT '操作动作',
    resource_type VARCHAR(50) COMMENT '资源类型',
    resource_id VARCHAR(32) COMMENT '资源ID',
    old_data JSON COMMENT '旧数据',
    new_data JSON COMMENT '新数据',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (consultant_id) REFERENCES sales_consultants(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at)
) COMMENT '操作日志表';

-- 插入初始数据
INSERT INTO system_configs (id, config_key, config_value, config_type, description) VALUES
('1', 'site_name', 'OfferCome', 'string', '网站名称'),
('2', 'site_description', '全球精英求职辅导平台', 'string', '网站描述'),
('3', 'default_commission_rate', '0.1', 'number', '默认佣金比例'),
('4', 'max_file_size', '10485760', 'number', '最大文件大小(字节)'),
('5', 'allowed_file_types', '["pdf", "doc", "docx", "jpg", "jpeg", "png"]', 'json', '允许的文件类型'),
('6', 'ai_service_config', '{"provider": "kimi", "api_key": "", "base_url": "https://api.moonshot.cn"}', 'json', 'AI服务配置'),
('7', 'wecom_config', '{"corp_id": "", "agent_id": "", "secret": ""}', 'json', '企业微信配置'),
('8', 'payment_config', '{"wechat_pay": {"mch_id": "", "key": ""}, "alipay": {"app_id": "", "private_key": ""}}', 'json', '支付配置');

-- 插入示例套餐数据
INSERT INTO packages (id, name, description, price, original_price, duration_days, features, target_countries, target_majors, status, sort_order) VALUES
('pkg_basic', '基础求职套餐', '适合初次求职的留学生，包含简历优化和基础面试指导', 2999.00, 3999.00, 30, '["resume_optimization", "basic_interview_prep", "career_consulting"]', '["美国", "英国", "加拿大"]', '["计算机科学", "商科", "工程"]', 'active', 1),
('pkg_premium', '高级求职套餐', '适合有经验的求职者，包含全方位求职指导和模拟面试', 5999.00, 7999.00, 60, '["resume_optimization", "advanced_interview_prep", "career_consulting", "mock_interviews", "application_strategy"]', '["美国", "英国", "加拿大", "澳大利亚"]', '["计算机科学", "商科", "工程", "艺术"]', 'active', 2),
('pkg_elite', '精英求职套餐', '适合高端求职者，包含一对一导师指导和全程跟踪服务', 12999.00, 15999.00, 90, '["resume_optimization", "premium_interview_prep", "career_consulting", "mock_interviews", "application_strategy", "one_on_one_mentoring", "full_tracking"]', '["美国", "英国", "加拿大", "澳大利亚", "新加坡"]', '["计算机科学", "商科", "工程", "艺术", "医学"]', 'active', 3); 