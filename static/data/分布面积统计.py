import json
import os

# 获取当前文件的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# 构建 JSON 文件的完整路径
json_path = os.path.join(current_dir, '城市书房数据.json')

# 加载数据
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 初始化计数器
微型书房 = 0  # <100㎡
小型书房 = 0  # 100-150㎡
中型书房 = 0  # 150-250㎡
大型书房 = 0  # >250㎡
总数 = 0
所有面积 = []

# 遍历所有区域和书房
for district_name, district_data in data['districts'].items():
    for library in district_data['libraries']:
        面积 = library.get('area', 0)
        所有面积.append(面积)
        总数 += 1
        
        if 面积 < 100:
            微型书房 += 1
        elif 100 <= 面积 < 150:
            小型书房 += 1
        elif 150 <= 面积 < 250:
            中型书房 += 1
        else:  # 面积 >= 250
            大型书房 += 1

# 计算百分比
微型书房百分比 = round(微型书房 / 总数 * 100, 1)
小型书房百分比 = round(小型书房 / 总数 * 100, 1)
中型书房百分比 = round(中型书房 / 总数 * 100, 1)
大型书房百分比 = round(大型书房 / 总数 * 100, 1)

print(f"微型书房（100㎡以下）：{微型书房}个，占比约{微型书房百分比}%")
print(f"小型书房（100-150㎡）：{小型书房}个，占比约{小型书房百分比}%")
print(f"中型书房（150-250㎡）：{中型书房}个，占比约{中型书房百分比}%")
print(f"大型书房（250㎡以上）：{大型书房}个，占比约{大型书房百分比}%")
print(f"总计：{总数}个城市书房")
print(f"平均面积：{round(sum(所有面积)/总数, 1)}㎡")