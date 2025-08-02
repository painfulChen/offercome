#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
会议记录处理进度可视化后台 (SQLite版本)
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)

# SQLite数据库文件
DB_FILE = "meeting_data.db"


def get_db_connection():
    """获取数据库连接"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row  # 使结果可以通过列名访问
        return conn
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None


@app.route('/')
def index():
    """主页"""
    return render_template('dashboard.html')


@app.route('/api/stats')
def get_stats():
    """获取统计信息"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'})
    
    try:
        cursor = conn.cursor()
        
        # 总记录数
        cursor.execute("SELECT COUNT(*) FROM recordings")
        total_records = cursor.fetchone()[0]
        
        # 今日处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE DATE(created_at) = DATE('now')")
        today_records = cursor.fetchone()[0]
        
        # 本周处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now')")
        week_records = cursor.fetchone()[0]
        
        # 本月处理数
        cursor.execute("SELECT COUNT(*) FROM recordings WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')")
        month_records = cursor.fetchone()[0]
        
        # 处理状态统计
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM process_logs 
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY status
        """)
        status_stats = dict(cursor.fetchall())
        
        # 分类统计
        cursor.execute("""
            SELECT phase, COUNT(*) as count 
            FROM recordings 
            GROUP BY phase
        """)
        phase_stats = dict(cursor.fetchall())
        
        # 最近处理记录
        cursor.execute("""
            SELECT id, meeting_id, phase, created_at, summary
            FROM recordings 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        recent_records = []
        for row in cursor.fetchall():
            recent_records.append({
                'id': row['id'],
                'meeting_id': row['meeting_id'],
                'phase': row['phase'],
                'created_at': row['created_at'],
                'summary': row['summary'][:100] + '...' if row['summary'] and len(row['summary']) > 100 else row['summary']
            })
        
        # 学生参与统计
        cursor.execute("""
            SELECT student_id, record_cnt, total_duration
            FROM student_stats 
            ORDER BY record_cnt DESC 
            LIMIT 10
        """)
        student_stats = []
        for row in cursor.fetchall():
            student_stats.append({
                'student_id': row['student_id'],
                'record_cnt': row['record_cnt'],
                'total_duration': row['total_duration']
            })
        
        conn.close()
        
        return jsonify({
            'total_records': total_records,
            'today_records': today_records,
            'week_records': week_records,
            'month_records': month_records,
            'status_stats': status_stats,
            'phase_stats': phase_stats,
            'recent_records': recent_records,
            'student_stats': student_stats
        })
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)})


@app.route('/api/process_logs')
def get_process_logs():
    """获取处理日志"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'})
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT record_id, status, error_message, process_time, created_at
            FROM process_logs 
            ORDER BY created_at DESC 
            LIMIT 50
        """)
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'record_id': row['record_id'],
                'status': row['status'],
                'error_message': row['error_message'],
                'process_time': row['process_time'],
                'created_at': row['created_at']
            })
        
        conn.close()
        return jsonify({'logs': logs})
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)})


@app.route('/api/daily_progress')
def get_daily_progress():
    """获取每日处理进度"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'})
    
    try:
        cursor = conn.cursor()
        # 获取最近30天的处理数据
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM recordings 
            WHERE created_at >= datetime('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        daily_data = []
        for row in cursor.fetchall():
            daily_data.append({
                'date': row['date'],
                'count': row['count']
            })
        
        conn.close()
        return jsonify({'daily_data': daily_data})
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)})


@app.route('/api/phase_distribution')
def get_phase_distribution():
    """获取会议分类分布"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'})
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT phase, COUNT(*) as count
            FROM recordings 
            GROUP BY phase
            ORDER BY count DESC
        """)
        phase_data = []
        for row in cursor.fetchall():
            phase_data.append({
                'phase': row['phase'],
                'count': row['count']
            })
        
        conn.close()
        return jsonify({'phase_data': phase_data})
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)})


@app.route('/api/student_activity')
def get_student_activity():
    """获取学生活跃度"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'})
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT student_id, record_cnt, total_duration
            FROM student_stats 
            ORDER BY record_cnt DESC 
            LIMIT 20
        """)
        student_data = []
        for row in cursor.fetchall():
            student_data.append({
                'student_id': row['student_id'],
                'record_cnt': row['record_cnt'],
                'total_duration': row['total_duration']
            })
        
        conn.close()
        return jsonify({'student_data': student_data})
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    # 创建模板目录
    os.makedirs('templates', exist_ok=True)
    
    # 创建HTML模板
    html_template = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>会议记录处理进度</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4a5568;
            margin: 0;
            font-size: 2.5em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 0;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
        }
        .recent-records {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .record-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .record-item h4 {
            margin: 0 0 5px 0;
            color: #4a5568;
        }
        .record-item p {
            margin: 5px 0;
            color: #666;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status-completed { background: #48bb78; color: white; }
        .status-processing { background: #ed8936; color: white; }
        .status-failed { background: #f56565; color: white; }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }
        .refresh-btn:hover {
            background: #5a67d8;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 会议记录处理进度</h1>
            <p>实时监控数据获取和处理状态</p>
            <button class="refresh-btn" onclick="loadData()">🔄 刷新数据</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>总记录数</h3>
                <div class="number" id="total-records">-</div>
            </div>
            <div class="stat-card">
                <h3>今日处理</h3>
                <div class="number" id="today-records">-</div>
            </div>
            <div class="stat-card">
                <h3>本周处理</h3>
                <div class="number" id="week-records">-</div>
            </div>
            <div class="stat-card">
                <h3>本月处理</h3>
                <div class="number" id="month-records">-</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <h3>处理状态分布</h3>
                <canvas id="statusChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>会议分类统计</h3>
                <canvas id="phaseChart"></canvas>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>每日处理进度</h3>
            <canvas id="dailyChart"></canvas>
        </div>
        
        <div class="recent-records">
            <h3>最近处理记录</h3>
            <div id="recent-records-list">
                <div class="loading">加载中...</div>
            </div>
        </div>
    </div>

    <script>
        let statusChart, phaseChart, dailyChart;
        
        function loadData() {
            // 显示加载状态
            document.getElementById('recent-records-list').innerHTML = '<div class="loading">加载中...</div>';
            
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error:', data.error);
                        return;
                    }
                    
                    // 更新统计数据
                    document.getElementById('total-records').textContent = data.total_records;
                    document.getElementById('today-records').textContent = data.today_records;
                    document.getElementById('week-records').textContent = data.week_records;
                    document.getElementById('month-records').textContent = data.month_records;
                    
                    // 更新图表
                    updateStatusChart(data.status_stats);
                    updatePhaseChart(data.phase_stats);
                    updateRecentRecords(data.recent_records);
                });
            
            fetch('/api/daily_progress')
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error:', data.error);
                        return;
                    }
                    updateDailyChart(data.daily_data);
                });
        }
        
        function updateStatusChart(statusStats) {
            const ctx = document.getElementById('statusChart').getContext('2d');
            
            if (statusChart) {
                statusChart.destroy();
            }
            
            const labels = Object.keys(statusStats);
            const data = Object.values(statusStats);
            const colors = ['#48bb78', '#ed8936', '#f56565', '#a0aec0'];
            
            statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        function updatePhaseChart(phaseStats) {
            const ctx = document.getElementById('phaseChart').getContext('2d');
            
            if (phaseChart) {
                phaseChart.destroy();
            }
            
            const labels = Object.keys(phaseStats);
            const data = Object.values(phaseStats);
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
            
            phaseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '记录数量',
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        borderColor: colors.slice(0, labels.length),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function updateDailyChart(dailyData) {
            const ctx = document.getElementById('dailyChart').getContext('2d');
            
            if (dailyChart) {
                dailyChart.destroy();
            }
            
            const labels = dailyData.map(item => item.date);
            const data = dailyData.map(item => item.count);
            
            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '每日处理数量',
                        data: data,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function updateRecentRecords(records) {
            const container = document.getElementById('recent-records-list');
            container.innerHTML = '';
            
            if (records.length === 0) {
                container.innerHTML = '<div class="loading">暂无记录</div>';
                return;
            }
            
            records.forEach(record => {
                const recordDiv = document.createElement('div');
                recordDiv.className = 'record-item';
                recordDiv.innerHTML = `
                    <h4>会议ID: ${record.meeting_id}</h4>
                    <p><strong>分类:</strong> <span class="status-badge status-completed">${record.phase}</span></p>
                    <p><strong>处理时间:</strong> ${record.created_at}</p>
                    <p><strong>摘要:</strong> ${record.summary || '暂无摘要'}</p>
                `;
                container.appendChild(recordDiv);
            });
        }
        
        // 页面加载时获取数据
        loadData();
        
        // 每30秒自动刷新
        setInterval(loadData, 30000);
    </script>
</body>
</html>
    '''
    
    # 写入HTML模板
    with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print("🚀 启动可视化后台...")
    print("📊 访问地址: http://localhost:5000")
    print("📈 实时监控会议记录处理进度")
    print("💾 数据文件: meeting_data.db")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 