-- 会议记录数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS meeting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meeting_db;

-- 会议录制记录表
CREATE TABLE IF NOT EXISTS recordings (
    id BIGINT PRIMARY KEY COMMENT '会议录制ID',
    meeting_id VARCHAR(64) NOT NULL COMMENT '会议ID',
    start_ts DATETIME NOT NULL COMMENT '开始时间',
    end_ts DATETIME NOT NULL COMMENT '结束时间',
    student_ids JSON COMMENT '学生ID列表',
    phase ENUM('简历优化','项目深挖','面试模拟','Offer后续','其他') DEFAULT '其他' COMMENT '会议阶段',
    transcript LONGTEXT COMMENT '转写内容',
    summary TEXT COMMENT '摘要',
    play_url TEXT COMMENT '播放地址',
    download_url TEXT COMMENT '下载地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_start_ts (start_ts),
    INDEX idx_phase (phase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议录制记录表';

-- 学生统计表
CREATE TABLE IF NOT EXISTS student_stats (
    student_id VARCHAR(64) PRIMARY KEY COMMENT '学生ID',
    record_cnt INT DEFAULT 0 COMMENT '录制次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_record_cnt (record_cnt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生统计表';

-- 处理日志表
CREATE TABLE IF NOT EXISTS processing_logs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    record_id BIGINT NOT NULL COMMENT '记录ID',
    status ENUM('success','failed','processing') NOT NULL COMMENT '处理状态',
    error_message TEXT COMMENT '错误信息',
    processing_time INT COMMENT '处理耗时(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_record_id (record_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='处理日志表';

-- 插入示例数据（可选）
INSERT IGNORE INTO recordings (id, meeting_id, start_ts, end_ts, student_ids, phase, transcript, summary, play_url, download_url) VALUES
(1001, 'meeting_001', '2025-01-15 10:00:00', '2025-01-15 11:00:00', '["student_001", "student_002"]', '面试模拟', '这是一次面试模拟会议，讨论了候选人的技术背景...', '面试模拟会议，主要讨论了技术栈和项目经验', 'https://example.com/play/1001', 'https://example.com/download/1001'),
(1002, 'meeting_002', '2025-01-16 14:00:00', '2025-01-16 15:30:00', '["student_003"]', '简历优化', '简历优化会议，帮助候选人完善简历内容...', '简历优化指导，重点改进了项目描述部分', 'https://example.com/play/1002', 'https://example.com/download/1002');

INSERT IGNORE INTO student_stats (student_id, record_cnt) VALUES
('student_001', 1),
('student_002', 1),
('student_003', 1);

-- 显示表结构
SHOW TABLES;
DESCRIBE recordings;
DESCRIBE student_stats;
DESCRIBE processing_logs; 