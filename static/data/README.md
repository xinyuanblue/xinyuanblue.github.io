# 数据文件目录

此目录包含"河洛书苑生长笔记"项目使用的各种数据文件：

- `城市书房数据.json` - 洛阳市河洛书苑城市书房结构化数据，包含位置、藏书量等信息
- `boundary.geojson` - 洛阳市行政区边界数据
- `population_data.json` - 洛阳市人口分布数据

这些数据文件由以下来源提供：
1. 城市书房数据通过官方公开信息整理
2. 边界数据基于开放地理空间数据
3. 人口数据为统计数据可视化加工 

# 城市书房成本分析工具

这个工具用于分析城市书房的采购数据，生成成本构成分析图表，并更新相关HTML文件中的数据。

## 文件说明

- `cost_analysis.py`: 主要数据分析脚本，用于处理采购数据并生成图表
- `update_html.py`: 用于将分析结果更新到HTML文件中
- `cost_visualization.html`: 成本可视化展示页面
- `requirements.txt`: 依赖项列表

## 使用方法

1. 安装依赖项：

```bash
pip install -r requirements.txt
```

2. 运行数据分析脚本：

```bash
python cost_analysis.py
```

这将生成两个图表文件：
- `cost_structure.png`: 成本构成比例饼图
- `category_costs.png`: 各类别成本条形图

3. 更新HTML文件中的数据：

```bash
python update_html.py
```

这将更新以下文件中的数据：
- `cost_visualization.html`: 成本可视化页面
- `../../heluo1-main/templates/index.html`: 主页面中的成本数据

## 数据说明

分析基于采购数据文件：`C:/Users/Administrator/Desktop/数据新闻网页/数据集/采购数据/crawled_results.csv`

成本分为以下几个类别：
- 土建装修
- 设备采购
- 图书资源
- 智能系统
- 维护运营
- 其他费用

## 注意事项

- 确保数据文件路径正确
- 图表生成在当前目录下
- 更新HTML文件前请确保文件存在且有写入权限 