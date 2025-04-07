import json
import os
import re
from cost_analysis import analyze_costs

def update_cost_visualization_html():
    """更新成本可视化HTML文件中的数据"""
    # 获取成本分析结果
    results = analyze_costs()
    if not results:
        print("无法获取成本分析结果，无法更新HTML")
        return False
    
    # 读取HTML模板
    html_file = 'cost_visualization.html'
    if not os.path.exists(html_file):
        print(f"HTML模板文件不存在: {html_file}")
        return False
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 提取百分比数据
        percentages = results['percentages']
        
        # 计算标准书房成本
        std_cost = results['avg_cost']  # 使用平均成本作为标准
        
        # 计算各类别成本
        category_costs = {}
        for category, percentage in percentages.items():
            if percentage > 0:
                category_costs[category] = (std_cost * percentage / 100) / 10000  # 转换为万元
        
        # 创建JavaScript数据对象
        js_data = {
            'categories': {},
            'totalCost': std_cost / 10000,  # 转换为万元
            'roomTypes': {
                'micro': std_cost * 0.7 / 10000,  # 微型书房成本约为标准的70%
                'small': std_cost * 0.9 / 10000,  # 小型书房成本约为标准的90%
                'medium': std_cost / 10000,       # 中型书房成本为标准
                'large': std_cost * 1.5 / 10000   # 大型书房成本约为标准的150%
            }
        }
        
        # 填充类别数据
        for category, percentage in percentages.items():
            if percentage > 0:
                js_data['categories'][category] = {
                    'cost': category_costs[category],
                    'percentage': percentage
                }
        
        # 将数据转换为JavaScript代码
        js_data_str = json.dumps(js_data, ensure_ascii=False, indent=4)
        
        # 替换HTML中的示例数据
        pattern = r'const costData = \{.*?\};'
        replacement = f'const costData = {js_data_str};'
        new_html = re.sub(pattern, replacement, html_content, flags=re.DOTALL)
        
        # 写入更新后的HTML
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_html)
        
        print("成功更新HTML文件中的成本数据")
        return True
    
    except Exception as e:
        print(f"更新HTML时出错: {e}")
        return False

def update_main_html():
    """更新主HTML文件中的成本数据"""
    # 获取成本分析结果
    results = analyze_costs()
    if not results:
        print("无法获取成本分析结果，无法更新主HTML")
        return False
    
    # 主HTML文件路径
    main_html_file = '../../heluo1-main/templates/index.html'
    if not os.path.exists(main_html_file):
        print(f"主HTML文件不存在: {main_html_file}")
        return False
    
    try:
        with open(main_html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 提取百分比数据
        percentages = results['percentages']
        
        # 计算标准书房成本
        std_cost = results['avg_cost']  # 使用平均成本作为标准
        std_cost_wan = std_cost / 10000  # 转换为万元
        
        # 计算各类别成本和百分比
        category_costs = {}
        for category, percentage in percentages.items():
            if percentage > 0:
                category_costs[category] = {
                    'cost': (std_cost * percentage / 100) / 10000,  # 转换为万元
                    'percentage': percentage
                }
        
        # 更新成本项目
        for category, data in category_costs.items():
            # 构建正则表达式模式，匹配特定类别的成本项
            cost_pattern = rf'<span class="cost-label">{category}</span>\s*<span class="cost-value">.*?</span>\s*<span class="cost-percent">.*?</span>'
            cost_replacement = f'<span class="cost-label">{category}</span>\n                        <span class="cost-value">{data["cost"]:.1f}万元</span>\n                        <span class="cost-percent">{data["percentage"]:.1f}%</span>'
            
            html_content = re.sub(cost_pattern, cost_replacement, html_content)
        
        # 写入更新后的HTML
        with open(main_html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print("成功更新主HTML文件中的成本数据")
        return True
    
    except Exception as e:
        print(f"更新主HTML时出错: {e}")
        return False

if __name__ == "__main__":
    # 更新成本可视化HTML
    update_cost_visualization_html()
    
    # 更新主HTML文件
    update_main_html() 