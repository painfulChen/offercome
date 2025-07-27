-- 优秀案例功能数据库初始化脚本
-- 创建时间: 2025-07-27
-- 功能: 初始化优秀案例相关的数据库表

-- 1. 创建案例分类表
CREATE TABLE IF NOT EXISTS case_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    color VARCHAR(20) DEFAULT '#667eea' COMMENT '分类颜色',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案例分类表';

-- 2. 创建优秀案例表
CREATE TABLE IF NOT EXISTS success_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '案例标题',
    subtitle VARCHAR(500) COMMENT '案例副标题',
    description TEXT COMMENT '案例详细描述',
    industry VARCHAR(100) COMMENT '所属行业',
    position VARCHAR(100) COMMENT '目标职位',
    salary_range VARCHAR(100) COMMENT '薪资范围',
    company VARCHAR(200) COMMENT '入职公司',
    location VARCHAR(100) COMMENT '工作地点',
    duration VARCHAR(100) COMMENT '求职周期',
    before_salary VARCHAR(100) COMMENT '求职前薪资',
    after_salary VARCHAR(100) COMMENT '求职后薪资',
    improvement_rate VARCHAR(50) COMMENT '薪资提升比例',
    avatar_url VARCHAR(500) COMMENT '学员头像URL',
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    images JSON COMMENT '案例图片集合',
    tags JSON COMMENT '标签集合',
    category_id INT COMMENT '分类ID',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '发布状态',
    featured BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES case_categories(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_featured (featured),
    INDEX idx_category_id (category_id),
    INDEX idx_created_at (created_at),
    INDEX idx_view_count (view_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优秀案例表';

-- 3. 创建案例统计表
CREATE TABLE IF NOT EXISTS case_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT NOT NULL COMMENT '案例ID',
    view_date DATE NOT NULL COMMENT '访问日期',
    view_count INT DEFAULT 0 COMMENT '当日访问次数',
    unique_visitors INT DEFAULT 0 COMMENT '当日独立访客数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES success_cases(id) ON DELETE CASCADE,
    UNIQUE KEY unique_case_date (case_id, view_date),
    INDEX idx_view_date (view_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案例访问统计表';

-- 4. 插入默认分类数据
INSERT INTO case_categories (name, description, icon, color, sort_order) VALUES
('技术开发', '软件开发、前端、后端、移动开发等技术岗位', 'fas fa-code', '#667eea', 1),
('产品设计', '产品经理、UI/UX设计师、交互设计等岗位', 'fas fa-palette', '#764ba2', 2),
('市场营销', '市场推广、品牌策划、数字营销等岗位', 'fas fa-bullhorn', '#f093fb', 3),
('运营管理', '运营专员、社区运营、内容运营等岗位', 'fas fa-chart-line', '#4facfe', 4),
('销售商务', '销售代表、商务拓展、客户经理等岗位', 'fas fa-handshake', '#43e97b', 5),
('金融财务', '财务分析、投资顾问、风控专员等岗位', 'fas fa-coins', '#fa709a', 6),
('教育培训', '教师、培训师、教育顾问等岗位', 'fas fa-graduation-cap', '#a8edea', 7),
('医疗健康', '医生、护士、医疗顾问等岗位', 'fas fa-heartbeat', '#ff9a9e', 8),
('其他行业', '其他行业的求职案例', 'fas fa-briefcase', '#a8caba', 9);

-- 5. 插入示例案例数据
INSERT INTO success_cases (title, subtitle, description, industry, position, salary_range, company, location, duration, before_salary, after_salary, improvement_rate, avatar_url, cover_image, tags, category_id, status, featured, view_count, like_count) VALUES
(
    '从实习生到高级前端工程师',
    '3年薪资翻倍，技术能力全面提升',
    '张同学原本是一名前端实习生，通过OfferCome的AI辅导，系统学习了React、Vue等主流框架，掌握了前端工程化、性能优化等高级技能。经过3个月的求职准备，成功入职某知名互联网公司，薪资从实习期的8K提升到25K，实现了职业生涯的重要突破。',
    '技术开发',
    '高级前端工程师',
    '25K-35K',
    '字节跳动',
    '北京',
    '3个月',
    '8K',
    '25K',
    '212%',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    '["前端开发", "React", "Vue", "薪资翻倍"]',
    1,
    'published',
    TRUE,
    1250,
    89
),
(
    '产品经理转型成功案例',
    '从运营到产品，薪资提升150%',
    '李同学原本从事运营工作，对产品设计有浓厚兴趣。通过OfferCome的AI指导，系统学习了产品设计方法论、用户研究、数据分析等核心技能。经过6个月的准备，成功转型为产品经理，薪资从12K提升到30K，实现了职业转型的成功。',
    '产品设计',
    '产品经理',
    '30K-45K',
    '腾讯',
    '深圳',
    '6个月',
    '12K',
    '30K',
    '150%',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    '["产品经理", "职业转型", "用户研究", "数据分析"]',
    2,
    'published',
    TRUE,
    980,
    67
),
(
    '市场营销总监晋升案例',
    '从专员到总监，管理能力全面提升',
    '王同学原本是市场营销专员，通过OfferCome的AI辅导，系统学习了品牌策略、数字营销、团队管理等高级技能。经过1年的准备，成功晋升为市场营销总监，薪资从15K提升到45K，实现了管理能力的全面提升。',
    '市场营销',
    '市场营销总监',
    '45K-60K',
    '阿里巴巴',
    '杭州',
    '12个月',
    '15K',
    '45K',
    '200%',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    '["市场营销", "品牌策略", "数字营销", "团队管理"]',
    3,
    'published',
    TRUE,
    1560,
    123
),
(
    '运营专家成长案例',
    '从新手到专家，数据驱动运营',
    '陈同学原本是运营新手，通过OfferCome的AI指导，系统学习了用户运营、内容运营、数据分析等核心技能。经过8个月的实践，成功成为运营专家，薪资从10K提升到28K，实现了数据驱动运营的专业化发展。',
    '运营管理',
    '运营专家',
    '28K-40K',
    '美团',
    '上海',
    '8个月',
    '10K',
    '28K',
    '180%',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    '["运营管理", "用户运营", "内容运营", "数据分析"]',
    4,
    'published',
    TRUE,
    890,
    56
),
(
    '销售总监成功案例',
    '从销售代表到总监，业绩翻倍增长',
    '刘同学原本是销售代表，通过OfferCome的AI辅导，系统学习了销售技巧、客户管理、团队建设等高级技能。经过1年的努力，成功晋升为销售总监，薪资从18K提升到50K，实现了业绩的翻倍增长。',
    '销售商务',
    '销售总监',
    '50K-70K',
    '华为',
    '深圳',
    '12个月',
    '18K',
    '50K',
    '178%',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    '["销售管理", "客户管理", "团队建设", "业绩提升"]',
    5,
    'published',
    TRUE,
    1120,
    78
);

-- 6. 插入示例统计数据
INSERT INTO case_statistics (case_id, view_date, view_count, unique_visitors) VALUES
(1, CURDATE(), 1250, 890),
(2, CURDATE(), 980, 720),
(3, CURDATE(), 1560, 1120),
(4, CURDATE(), 890, 650),
(5, CURDATE(), 1120, 820);

-- 7. 创建视图：案例统计汇总
CREATE OR REPLACE VIEW case_summary AS
SELECT 
    sc.id,
    sc.title,
    sc.subtitle,
    sc.industry,
    sc.position,
    sc.company,
    sc.location,
    sc.before_salary,
    sc.after_salary,
    sc.improvement_rate,
    sc.avatar_url,
    sc.cover_image,
    sc.tags,
    sc.status,
    sc.featured,
    sc.view_count,
    sc.like_count,
    sc.created_at,
    cc.name as category_name,
    cc.color as category_color,
    cc.icon as category_icon
FROM success_cases sc
LEFT JOIN case_categories cc ON sc.category_id = cc.id
WHERE sc.status = 'published';

-- 8. 创建索引优化查询性能
CREATE INDEX idx_cases_industry ON success_cases(industry);
CREATE INDEX idx_cases_position ON success_cases(position);
CREATE INDEX idx_cases_company ON success_cases(company);
CREATE INDEX idx_cases_featured_status ON success_cases(featured, status);
CREATE INDEX idx_cases_created_at_status ON success_cases(created_at, status);

-- 9. 添加触发器：自动更新统计
DELIMITER //
CREATE TRIGGER after_case_view_update
AFTER UPDATE ON success_cases
FOR EACH ROW
BEGIN
    IF NEW.view_count != OLD.view_count THEN
        INSERT INTO case_statistics (case_id, view_date, view_count, unique_visitors)
        VALUES (NEW.id, CURDATE(), NEW.view_count, NEW.view_count)
        ON DUPLICATE KEY UPDATE
        view_count = NEW.view_count,
        updated_at = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;

-- 10. 创建存储过程：获取热门案例
DELIMITER //
CREATE PROCEDURE GetHotCases(IN limit_count INT)
BEGIN
    SELECT 
        sc.id,
        sc.title,
        sc.subtitle,
        sc.industry,
        sc.position,
        sc.company,
        sc.before_salary,
        sc.after_salary,
        sc.improvement_rate,
        sc.avatar_url,
        sc.cover_image,
        sc.view_count,
        sc.like_count,
        cc.name as category_name,
        cc.color as category_color
    FROM success_cases sc
    LEFT JOIN case_categories cc ON sc.category_id = cc.id
    WHERE sc.status = 'published'
    ORDER BY sc.view_count DESC, sc.like_count DESC
    LIMIT limit_count;
END//
DELIMITER ;

-- 完成提示
SELECT '优秀案例数据库初始化完成！' as message;
SELECT COUNT(*) as total_categories FROM case_categories;
SELECT COUNT(*) as total_cases FROM success_cases;
SELECT COUNT(*) as total_statistics FROM case_statistics; 