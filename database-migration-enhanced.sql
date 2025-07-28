-- OfferCome 数据库增强迁移脚本
-- 添加用户表新字段、咨询记录表和MBTI测试结果表

USE `offercome`;

-- 1. 增强用户表
ALTER TABLE users 
ADD COLUMN mbti_type VARCHAR(4) NULL COMMENT 'MBTI人格类型',
ADD COLUMN mbti_test_date DATETIME NULL COMMENT 'MBTI测试日期',
ADD COLUMN phone VARCHAR(20) NULL COMMENT '手机号码',
ADD COLUMN wechat VARCHAR(50) NULL COMMENT '微信号',
ADD COLUMN education VARCHAR(100) NULL COMMENT '教育背景',
ADD COLUMN target_job VARCHAR(100) NULL COMMENT '目标职位',
ADD COLUMN experience_years INT NULL COMMENT '工作经验年数',
ADD COLUMN avatar_url VARCHAR(255) NULL COMMENT '头像URL',
ADD COLUMN last_login_at DATETIME NULL COMMENT '最后登录时间',
ADD COLUMN login_count INT DEFAULT 0 COMMENT '登录次数';

-- 2. 创建咨询记录表
CREATE TABLE IF NOT EXISTS consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL COMMENT '用户ID（可选）',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号码',
    email VARCHAR(100) NULL COMMENT '邮箱',
    wechat VARCHAR(50) NULL COMMENT '微信号',
    consultation_type ENUM('resume', 'interview', 'career', 'mbti', 'other') NOT NULL COMMENT '咨询类型',
    current_situation TEXT NULL COMMENT '当前情况',
    target_position VARCHAR(100) NULL COMMENT '目标职位',
    target_company VARCHAR(100) NULL COMMENT '目标公司',
    urgency_level ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '紧急程度',
    budget_range VARCHAR(50) NULL COMMENT '预算范围',
    preferred_time VARCHAR(100) NULL COMMENT '偏好时间',
    additional_notes TEXT NULL COMMENT '备注',
    status ENUM('new', 'contacted', 'qualified', 'proposal', 'closed') DEFAULT 'new' COMMENT '状态',
    assigned_consultant_id INT NULL COMMENT '分配的顾问ID',
    source VARCHAR(50) DEFAULT 'website' COMMENT '来源',
    ip_address VARCHAR(45) NULL COMMENT 'IP地址',
    user_agent TEXT NULL COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_consultant_id) REFERENCES sales_consultants(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_consultation_type (consultation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询记录表';

-- 3. 创建MBTI测试结果表
CREATE TABLE IF NOT EXISTS mbti_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL COMMENT '用户ID（可选）',
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '测试日期',
    mbti_type VARCHAR(4) NOT NULL COMMENT 'MBTI类型',
    e_score INT NOT NULL COMMENT '外向E得分',
    i_score INT NOT NULL COMMENT '内向I得分',
    s_score INT NOT NULL COMMENT '感觉S得分',
    n_score INT NOT NULL COMMENT '直觉N得分',
    t_score INT NOT NULL COMMENT '思考T得分',
    f_score INT NOT NULL COMMENT '情感F得分',
    j_score INT NOT NULL COMMENT '判断J得分',
    p_score INT NOT NULL COMMENT '感知P得分',
    career_suggestions TEXT NULL COMMENT '职业建议',
    personality_description TEXT NULL COMMENT '人格描述',
    strengths TEXT NULL COMMENT '优势分析',
    weaknesses TEXT NULL COMMENT '改进建议',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_mbti_type (mbti_type),
    INDEX idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MBTI测试结果表';

-- 4. 创建MBTI问题表
CREATE TABLE IF NOT EXISTS mbti_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT NOT NULL COMMENT '问题内容',
    dimension ENUM('EI', 'SN', 'TF', 'JP') NOT NULL COMMENT '维度',
    question_number INT NOT NULL COMMENT '问题编号',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dimension (dimension),
    INDEX idx_question_number (question_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MBTI问题表';

-- 5. 插入MBTI测试问题
INSERT INTO mbti_questions (question_text, dimension, question_number) VALUES
-- E/I 维度问题
('在社交场合，我倾向于主动与他人交谈', 'EI', 1),
('我更喜欢独处而不是参加大型聚会', 'EI', 2),
('在团队中，我经常是发言最多的人', 'EI', 3),
('我更喜欢通过思考来解决问题', 'EI', 4),
('我享受成为关注的焦点', 'EI', 5),
('我更喜欢安静的环境', 'EI', 6),
('我倾向于在行动前先思考', 'EI', 7),
('我经常是聚会中的活跃分子', 'EI', 8),

-- S/N 维度问题
('我更关注具体的事实和细节', 'SN', 9),
('我喜欢探索新的可能性和想法', 'SN', 10),
('我更喜欢处理实际的问题', 'SN', 11),
('我经常思考未来的可能性', 'SN', 12),
('我重视传统和经验', 'SN', 13),
('我喜欢创新和改变', 'SN', 14),
('我更喜欢明确和具体的指示', 'SN', 15),
('我享受抽象的概念和理论', 'SN', 16),

-- T/F 维度问题
('我做决定时更依赖逻辑分析', 'TF', 17),
('我重视和谐的人际关系', 'TF', 18),
('我倾向于客观地分析问题', 'TF', 19),
('我关心他人的感受', 'TF', 20),
('我更喜欢公平而不是同情', 'TF', 21),
('我重视个人价值观', 'TF', 22),
('我做决定时考虑效率', 'TF', 23),
('我重视团队合作', 'TF', 24),

-- J/P 维度问题
('我喜欢制定详细的计划', 'JP', 25),
('我更喜欢保持选择的开放性', 'JP', 26),
('我按时完成任务', 'JP', 27),
('我享受灵活性和自发性', 'JP', 28),
('我重视组织和结构', 'JP', 29),
('我喜欢探索和发现', 'JP', 30),
('我按计划行事', 'JP', 31),
('我适应变化', 'JP', 32);

-- 6. 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL COMMENT '用户ID',
    type ENUM('consultation', 'mbti_result', 'system', 'reminder') NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    message TEXT NOT NULL COMMENT '通知内容',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    related_id INT NULL COMMENT '相关记录ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 7. 更新现有用户数据
UPDATE users SET 
    phone = '13800138000',
    education = '本科',
    target_job = '软件工程师',
    experience_years = 3
WHERE id = 1;

UPDATE users SET 
    phone = '13900139000',
    education = '硕士',
    target_job = '产品经理',
    experience_years = 5
WHERE id = 2;

UPDATE users SET 
    phone = '13700137000',
    education = '本科',
    target_job = '前端开发',
    experience_years = 2
WHERE id = 4;

-- 8. 插入示例咨询记录
INSERT INTO consultations (name, phone, email, consultation_type, current_situation, target_position, urgency_level, status) VALUES
('张三', '13800138001', 'zhangsan@example.com', 'resume', '目前在一家小公司做开发，想跳槽到大厂', '高级软件工程师', 'high', 'new'),
('李四', '13800138002', 'lisi@example.com', 'interview', '准备面试腾讯，需要面试指导', '产品经理', 'medium', 'contacted'),
('王五', '13800138003', 'wangwu@example.com', 'career', '对职业发展方向感到迷茫', '技术专家', 'low', 'qualified');

-- 9. 插入示例MBTI结果
INSERT INTO mbti_results (user_id, mbti_type, e_score, i_score, s_score, n_score, t_score, f_score, j_score, p_score, career_suggestions, personality_description) VALUES
(1, 'INTJ', 3, 7, 4, 6, 8, 2, 7, 3, '适合技术专家、架构师、研究员等需要深度思考的职业', 'INTJ是建筑师型人格，具有战略思维和创新能力'),
(2, 'ENFP', 8, 2, 3, 7, 4, 6, 3, 7, '适合产品经理、销售、培训师等需要人际交往的职业', 'ENFP是探险家型人格，充满热情和创造力'),
(4, 'ISTP', 2, 8, 7, 3, 6, 4, 5, 5, '适合工程师、技术专家、分析师等需要精确操作的职业', 'ISTP是鉴赏家型人格，善于解决实际问题');

-- 10. 更新用户MBTI信息
UPDATE users SET 
    mbti_type = 'INTJ',
    mbti_test_date = NOW()
WHERE id = 1;

UPDATE users SET 
    mbti_type = 'ENFP',
    mbti_test_date = NOW()
WHERE id = 2;

UPDATE users SET 
    mbti_type = 'ISTP',
    mbti_test_date = NOW()
WHERE id = 4;

-- 显示表结构
SHOW TABLES;
SELECT 'Database migration completed successfully!' as status; 