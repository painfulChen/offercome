#!/bin/bash

echo "📈 API成本分析器"
echo "================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

COST_LOG_FILE="logs/cost-tracker.log"

# 分析成本数据
analyze_costs() {
    if [ ! -f "$COST_LOG_FILE" ]; then
        echo -e "${RED}❌ 成本日志文件不存在${NC}"
        return
    fi
    
    echo -e "${BLUE}📊 详细成本分析${NC}"
    echo "=================="
    
    # 按日期统计
    echo -e "${YELLOW}📅 按日期统计:${NC}"
    awk -F',' 'NR>1 {
        date=$1
        cost=$5
        calls[date]+=$4
        costs[date]+=cost
    }
    END {
        for (date in calls) {
            printf "• %s: %d次调用, ¥%.2f\n", date, calls[date], costs[date]
        }
    }' "$COST_LOG_FILE" | sort
    
    echo ""
    
    # 按API类型统计
    echo -e "${YELLOW}🔧 按API类型统计:${NC}"
    awk -F',' 'NR>1 {
        api_type=$3
        calls[api_type]+=$4
        costs[api_type]+=$5
    }
    END {
        for (api_type in calls) {
            printf "• %s: %d次调用, ¥%.2f\n", api_type, calls[api_type], costs[api_type]
        }
    }' "$COST_LOG_FILE"
    
    echo ""
    
    # 成功率统计
    echo -e "${YELLOW}✅ 成功率统计:${NC}"
    total_calls=$(awk -F',' 'NR>1 {sum+=$4} END {print sum}' "$COST_LOG_FILE")
    success_calls=$(awk -F',' 'NR>1 && $6=="SUCCESS" {sum+=$4} END {print sum}' "$COST_LOG_FILE")
    success_rate=$(echo "scale=2; $success_calls * 100 / $total_calls" | bc 2>/dev/null || echo "0")
    
    echo "• 总调用次数: $total_calls"
    echo "• 成功次数: $success_calls"
    echo "• 成功率: ${success_rate}%"
    
    echo ""
    
    # 成本预测
    echo -e "${YELLOW}🔮 成本预测:${NC}"
    total_cost=$(awk -F',' 'NR>1 {sum+=$5} END {printf "%.2f", sum}' "$COST_LOG_FILE")
    days_elapsed=$(awk -F',' 'NR>1 {dates[$1]++} END {print length(dates)}' "$COST_LOG_FILE")
    
    if [ "$days_elapsed" -gt 0 ]; then
        daily_avg=$(echo "scale=2; $total_cost / $days_elapsed" | bc)
        monthly_estimate=$(echo "scale=2; $daily_avg * 30" | bc)
        yearly_estimate=$(echo "scale=2; $daily_avg * 365" | bc)
        
        echo "• 已运行天数: $days_elapsed"
        echo "• 日均成本: ¥$daily_avg"
        echo "• 月预估成本: ¥$monthly_estimate"
        echo "• 年预估成本: ¥$yearly_estimate"
    fi
}

# 生成成本报告
generate_cost_report() {
    local report_file="logs/cost-report-$(date '+%Y%m%d').txt"
    
    echo "API成本报告 - $(date '+%Y-%m-%d %H:%M:%S')" > "$report_file"
    echo "==================================" >> "$report_file"
    echo "" >> "$report_file"
    
    # 添加成本分析到报告
    {
        echo "📊 成本统计:"
        echo "总成本: ¥$(awk -F',' 'NR>1 {sum+=$5} END {printf "%.2f", sum}' "$COST_LOG_FILE")"
        echo "总调用次数: $(awk -F',' 'NR>1 {sum+=$4} END {print sum}' "$COST_LOG_FILE")"
        echo ""
        echo "📈 按类型统计:"
        awk -F',' 'NR>1 {
            api_type=$3
            calls[api_type]+=$4
            costs[api_type]+=$5
        }
        END {
            for (api_type in calls) {
                printf "%s: %d次调用, ¥%.2f\n", api_type, calls[api_type], costs[api_type]
            }
        }' "$COST_LOG_FILE"
    } >> "$report_file"
    
    echo -e "${GREEN}✅ 成本报告已生成: $report_file${NC}"
}

# 显示实时成本监控
show_realtime_cost() {
    echo -e "${BLUE}💰 实时成本监控${NC}"
    echo "=================="
    
    if [ -f "$COST_LOG_FILE" ]; then
        # 今日成本
        today=$(date '+%Y-%m-%d')
        today_cost=$(awk -F',' -v today="$today" '$1==today {sum+=$5} END {printf "%.2f", sum}' "$COST_LOG_FILE")
        today_calls=$(awk -F',' -v today="$today" '$1==today {sum+=$4} END {print sum+0}' "$COST_LOG_FILE")
        
        echo -e "${GREEN}📅 今日统计:${NC}"
        echo "• 调用次数: $today_calls"
        echo "• 成本: ¥$today_cost"
        echo ""
        
        # 本周成本
        week_start=$(date -d "$(date +%Y-%m-%d) -$(date +%u) days" +%Y-%m-%d)
        week_cost=$(awk -F',' -v start="$week_start" '$1>=start {sum+=$5} END {printf "%.2f", sum}' "$COST_LOG_FILE")
        week_calls=$(awk -F',' -v start="$week_start" '$1>=start {sum+=$4} END {print sum+0}' "$COST_LOG_FILE")
        
        echo -e "${BLUE}📊 本周统计:${NC}"
        echo "• 调用次数: $week_calls"
        echo "• 成本: ¥$week_cost"
        echo ""
        
        # 总成本
        total_cost=$(awk -F',' 'NR>1 {sum+=$5} END {printf "%.2f", sum}' "$COST_LOG_FILE")
        total_calls=$(awk -F',' 'NR>1 {sum+=$4} END {print sum}' "$COST_LOG_FILE")
        
        echo -e "${PURPLE}💰 总成本统计:${NC}"
        echo "• 总调用次数: $total_calls"
        echo "• 总成本: ¥$total_cost"
        echo "• 平均每次调用成本: ¥$(echo "scale=4; $total_cost / $total_calls" | bc 2>/dev/null || echo "0.00")"
    else
        echo "暂无成本数据"
    fi
}

# 主菜单
show_menu() {
    echo ""
    echo -e "${BLUE}📊 成本分析菜单${NC}"
    echo "=================="
    echo "1. 显示实时成本监控"
    echo "2. 详细成本分析"
    echo "3. 生成成本报告"
    echo "4. 启动持续监控"
    echo "5. 退出"
    echo ""
    read -p "请选择功能 (1-5): " choice
    
    case $choice in
        1)
            show_realtime_cost
            ;;
        2)
            analyze_costs
            ;;
        3)
            generate_cost_report
            ;;
        4)
            echo -e "${GREEN}🚀 启动持续监控...${NC}"
            ./monitor-api-cost.sh
            ;;
        5)
            echo -e "${GREEN}👋 再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            ;;
    esac
}

# 主函数
main() {
    echo -e "${GREEN}🚀 启动成本分析器${NC}"
    
    # 检查日志文件
    if [ ! -f "$COST_LOG_FILE" ]; then
        echo -e "${YELLOW}⚠️  成本日志文件不存在，将创建新文件${NC}"
        mkdir -p logs
        echo "日期,时间,API类型,调用次数,预估成本(元),状态" > "$COST_LOG_FILE"
    fi
    
    # 显示菜单
    while true; do
        show_menu
        echo ""
        read -p "按回车键继续..."
    done
}

# 启动程序
main 