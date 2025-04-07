import csv
import json
import re
import os
import matplotlib.pyplot as plt
import numpy as np

# 定义数据文件路径
data_file = 'C:/Users/Administrator/Desktop/数据新闻网页/数据集/采购数据/crawled_results.csv'

# 定义成本类别
cost_categories = {
    '土建装修': ['建设', '装修', '施工', '工程', '改造'],
    '设备采购': ['设备', '家具', '空调', '照明', '货架', '书架'],
    '图书资源': ['图书', '书籍', '阅读', '文献'],
    '智能系统': ['智能', '系统', '软件', '信息化', '数字化', '网络'],
    '维护运营': ['维保', '维护', '运营', '管理', '服务'],
    '其他费用': []  # 默认类别
}

def extract_amount(text):
    """从文本中提取金额"""
    if not text:
        return 0
    
    # 移除逗号
    text = text.replace(',', '')
    
    # 尝试提取数字
    match = re.search(r'(\d+(?:\.\d+)?)', text)
    if match:
        return float(match.group(1))
    return 0

def categorize_project(title, content):
    """根据项目标题和内容分类项目"""
    title = title.lower() if title else ""
    content = content.lower() if content else ""
    
    for category, keywords in cost_categories.items():
        for keyword in keywords:
            if keyword in title or keyword in content:
                return category
    
    return '其他费用'  # 默认类别

def analyze_costs():
    """分析采购数据中的成本构成"""
    if not os.path.exists(data_file):
        print(f"数据文件不存在: {data_file}")
        return None
    
    category_costs = {category: 0 for category in cost_categories.keys()}
    total_projects = 0
    total_cost = 0
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)  # 跳过表头
            
            for row in reader:
                if len(row) < 6:  # 确保行有足够的列
                    continue
                
                title = row[0]
                content = row[1]
                structured_data = row[5]
                
                # 尝试解析JSON数据
                try:
                    data = json.loads(structured_data)
                    key_value_pairs = data.get('key_value_pairs', {})
                    
                    # 提取合同金额
                    amount_text = key_value_pairs.get('1、合同金额', '')
                    amount = extract_amount(amount_text)
                    
                    if amount > 0:
                        category = categorize_project(title, content)
                        category_costs[category] += amount
                        total_cost += amount
                        total_projects += 1
                except (json.JSONDecodeError, TypeError):
                    continue
        
        # 计算百分比
        if total_cost > 0:
            percentages = {category: (cost / total_cost) * 100 for category, cost in category_costs.items()}
        else:
            percentages = {category: 0 for category in cost_categories.keys()}
        
        # 计算平均成本
        avg_cost = total_cost / total_projects if total_projects > 0 else 0
        
        return {
            'category_costs': category_costs,
            'percentages': percentages,
            'total_cost': total_cost,
            'total_projects': total_projects,
            'avg_cost': avg_cost
        }
    
    except Exception as e:
        print(f"分析数据时出错: {e}")
        return None

def generate_charts(results):
    """生成成本分析图表"""
    if not results:
        return
    
    # 饼图 - 成本构成
    plt.figure(figsize=(10, 6))
    labels = []
    sizes = []
    
    for category, percentage in results['percentages'].items():
        if percentage > 0:
            labels.append(f"{category} ({percentage:.1f}%)")
            sizes.append(percentage)
    
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
    plt.axis('equal')
    plt.title('城市书房建设成本构成')
    plt.savefig('cost_structure.png', dpi=300, bbox_inches='tight')
    
    # 条形图 - 各类别成本
    plt.figure(figsize=(12, 6))
    categories = []
    costs = []
    
    for category, cost in results['category_costs'].items():
        if cost > 0:
            categories.append(category)
            costs.append(cost / 10000)  # 转换为万元
    
    plt.bar(categories, costs)
    plt.ylabel('成本 (万元)')
    plt.title('城市书房各类别成本')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('category_costs.png', dpi=300, bbox_inches='tight')
    
    # 输出结果
    print("\n===== 城市书房成本分析结果 =====")
    print(f"总项目数: {results['total_projects']}")
    print(f"总成本: {results['total_cost']/10000:.2f}万元")
    print(f"平均成本: {results['avg_cost']/10000:.2f}万元")
    print("\n成本构成:")
    
    for category, percentage in results['percentages'].items():
        cost = results['category_costs'][category]
        if cost > 0:
            print(f"{category}: {cost/10000:.2f}万元 ({percentage:.1f}%)")

def update_html_data(results):
    """生成更新HTML的数据"""
    if not results:
        return
    
    # 提取百分比数据
    percentages = results['percentages']
    
    # 计算标准书房成本
    std_cost = results['avg_cost']  # 使用平均成本作为标准
    
    # 计算各类别成本
    category_costs = {}
    for category, percentage in percentages.items():
        if percentage > 0:
            category_costs[category] = (std_cost * percentage / 100) / 10000  # 转换为万元
    
    print("\n===== HTML更新数据 =====")
    print("成本构成百分比:")
    for category, percentage in percentages.items():
        if percentage > 0:
            print(f"{category}: {percentage:.1f}%")
    
    print("\n标准书房成本明细:")
    for category, cost in category_costs.items():
        if cost > 0:
            print(f"{category}: {cost:.2f}万元")
    
    print(f"\n标准书房总成本: {std_cost/10000:.2f}万元")

if __name__ == "__main__":
    results = analyze_costs()
    if results:
        generate_charts(results)
        update_html_data(results)
    else:
        print("无法分析数据。") 