#!/bin/bash

# 腾讯会议记录处理流水线部署脚本

set -e

echo "🚀 开始部署腾讯会议记录处理流水线..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Python环境
check_python() {
    log_info "检查Python环境..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python3未安装，请先安装Python3"
        exit 1
    fi
    
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    log_success "Python版本: $python_version"
}

# 安装系统依赖
install_system_deps() {
    log_info "安装系统依赖..."
    
    # 检测操作系统
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            sudo apt-get update
            sudo apt-get install -y python3-pip python3-venv ffmpeg aria2
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install -y python3-pip ffmpeg aria2
        else
            log_warning "无法自动安装系统依赖，请手动安装: ffmpeg, aria2"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ffmpeg aria2
        else
            log_warning "请安装Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            log_warning "然后运行: brew install ffmpeg aria2"
        fi
    fi
}

# 创建虚拟环境
setup_venv() {
    log_info "创建Python虚拟环境..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        log_success "虚拟环境创建完成"
    else
        log_info "虚拟环境已存在"
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 升级pip
    pip install --upgrade pip
}

# 安装Python依赖
install_python_deps() {
    log_info "安装Python依赖..."
    
    source venv/bin/activate
    pip install -r requirements.txt
    
    log_success "Python依赖安装完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 检查数据库连接
    source venv/bin/activate
    python3 -c "
import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        database=os.getenv('DB_NAME')
    )
    print('✅ 数据库连接成功')
    conn.close()
except Exception as e:
    print(f'❌ 数据库连接失败: {e}')
    exit(1)
"
    
    # 执行SQL初始化脚本
    source venv/bin/activate
    python3 -c "
import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        database=os.getenv('DB_NAME')
    )
    
    with open('sql/init.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    with conn.cursor() as cursor:
        for statement in sql_script.split(';'):
            if statement.strip():
                cursor.execute(statement)
    
    conn.commit()
    conn.close()
    print('✅ 数据库初始化完成')
except Exception as e:
    print(f'❌ 数据库初始化失败: {e}')
    exit(1)
"
}

# 配置定时任务
setup_cron() {
    log_info "配置定时任务..."
    
    # 创建cron脚本
    cat > /tmp/meeting_cron.sh << 'EOF'
#!/bin/bash
cd /path/to/meeting_pipeline
source venv/bin/activate
python3 cron_incremental.py >> logs/cron.log 2>&1
EOF
    
    chmod +x /tmp/meeting_cron.sh
    
    # 添加到crontab（每天凌晨3点执行）
    (crontab -l 2>/dev/null; echo "0 3 * * * /tmp/meeting_cron.sh") | crontab -
    
    log_success "定时任务配置完成（每天凌晨3点执行）"
}

# 测试API连接
test_api_connection() {
    log_info "测试腾讯会议API连接..."
    
    source venv/bin/activate
    python3 -c "
import requests
from dotenv import load_dotenv
import os

load_dotenv()

try:
    # 测试获取token
    url = 'https://api.meeting.qq.com/v1/oauth/token'
    payload = {
        'secret_id': os.getenv('TQM_SECRET_ID'),
        'secret_key': os.getenv('TQM_SECRET_KEY')
    }
    
    response = requests.post(url, json=payload, timeout=10)
    response.raise_for_status()
    
    token_data = response.json()
    print('✅ 腾讯会议API连接成功')
    print(f'Token有效期: {token_data.get(\"expires_in\", 0)}秒')
    
except Exception as e:
    print(f'❌ 腾讯会议API连接失败: {e}')
    exit(1)
"
}

# 创建日志目录
create_logs_dir() {
    log_info "创建日志目录..."
    mkdir -p logs
    log_success "日志目录创建完成"
}

# 主函数
main() {
    log_info "开始部署腾讯会议记录处理流水线..."
    
    check_python
    install_system_deps
    setup_venv
    install_python_deps
    create_logs_dir
    test_api_connection
    init_database
    setup_cron
    
    log_success "部署完成！"
    log_info "使用说明："
    log_info "1. 手动测试: python3 record_worker.py <start_timestamp> <end_timestamp>"
    log_info "2. 查看日志: tail -f logs/record_worker.log"
    log_info "3. 定时任务: 每天凌晨3点自动执行"
    log_info "4. 监控状态: tail -f logs/cron_incremental.log"
}

# 执行主函数
main 