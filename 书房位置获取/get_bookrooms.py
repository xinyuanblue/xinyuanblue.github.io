import requests
from bs4 import BeautifulSoup
import json
import time

def get_bookroom_data():
    url = "http://www.lyslib.cn/citystudy/57"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive'
    }
    
    try:
        print("开始获取数据...")
        response = requests.get(url, headers=headers)
        response.encoding = 'utf-8'
        print(f"网页响应状态码: {response.status_code}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        print("开始解析网页...")
        
        # 保存原始HTML以供检查
        with open('response.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("原始网页已保存到 response.html")
        
        # 找到所有书房信息
        bookrooms = []
        
        # 尝试不同的选择器
        content_divs = soup.find_all('div', class_='study-room-item') or \
                      soup.find_all('div', class_='bookroom-item') or \
                      soup.select('.content .item') or \
                      soup.select('.study-room-list .item')
        
        print(f"找到书房条目数: {len(content_divs)}")
        
        for div in content_divs:
            try:
                # 提取文本内容
                text = div.get_text(strip=True)
                print(f"处理条目: {text[:50]}...")  # 打印前50个字符
                
                # 提取详细信息
                name = div.find('h3').text.strip() if div.find('h3') else ''
                address = div.find('p', class_='address').text.strip() if div.find('p', class_='address') else ''
                time_info = div.find('p', class_='time').text.strip() if div.find('p', class_='time') else ''
                
                # 确定区域
                district = ''
                for d in ["西工区", "老城区", "洛龙区", "瀍河区", "孟津北区", "伊滨区", 
                         "偃师区", "孟津南区", "涧西区", "新安县", "宜阳县", "洛宁县", 
                         "伊川县", "汝阳县", "嵩县", "栾川县"]:
                    if d in address:
                        district = d
                        break
                
                if name and address:
                    bookroom = {
                        "name": name,
                        "district": district,
                        "address": address,
                        "info": time_info
                    }
                    bookrooms.append(bookroom)
                    print(f"添加书房: {name}")
            except Exception as e:
                print(f"处理书房信息时出错: {str(e)}")
        
        print(f"\n总共找到 {len(bookrooms)} 个书房")
        
        if bookrooms:
            # 保存为JSON文件
            with open('bookrooms.json', 'w', encoding='utf-8') as f:
                json.dump(bookrooms, f, ensure_ascii=False, indent=4)
            print("数据已保存到 bookrooms.json")
            
            # 生成JavaScript数据文件
            js_content = "const bookRoomData = " + json.dumps(bookrooms, ensure_ascii=False, indent=4) + ";"
            with open('bookRoomData.js', 'w', encoding='utf-8') as f:
                f.write(js_content)
            print("数据已保存到 bookRoomData.js")
        
        # 打印网页结构以供分析
        print("\n分析网页结构...")
        print("可用的类名:")
        for class_name in set([tag.get('class', [''])[0] for tag in soup.find_all(class_=True)]):
            print(f"- {class_name}")
        
    except Exception as e:
        print(f"发生错误: {str(e)}")
        
    print("\n程序执行完成")

if __name__ == "__main__":
    print("开始运行脚本...")
    time.sleep(1)
    get_bookroom_data()
    print("脚本运行结束")