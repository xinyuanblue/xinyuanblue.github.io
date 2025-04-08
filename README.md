# 河洛书苑生长笔记 - 数据新闻项目
# Heluo Bookstore Growth Notes - Data Journalism Project

## 项目概述 (Project Overview)

本项目是一个数据新闻作品，旨在通过数据可视化和叙事分析，全面记录和呈现中国河南省洛阳市"河洛书苑"城市书房项目的发展历程、空间布局、运营状况、成本构成、市民反馈及其社会文化影响。项目以"书香洛阳"和"15分钟阅读圈"为背景，深入探讨了洛阳在推进全民阅读和构建现代公共文化服务体系方面的实践与探索。

This is a data journalism project documenting the development, spatial distribution, operational status, cost structure, public feedback, and socio-cultural impact of Luoyang City's "Heluo Bookstore" (河洛书苑) project in Henan Province, China. Against the backdrop of "Scholarly Luoyang" and the "15-Minute Reading Circle" initiative, this project delves into Luoyang's practices in promoting city-wide reading and building a modern public cultural service system.

## 主要特色 (Key Features)

* **数据驱动叙事:** 结合多种数据源，讲述洛阳城市书房从无到有、从少到多的"生长故事"。
* **交互式可视化:**
  * **空间分布地图:** 包括基于步行时间的"15分钟阅读圈"等时圈地图和结合人口密度的热力图。
  * **多维图表分析:** 使用 ECharts, Chart.js, Plotly 等库制作折线图、柱状图、饼图/环形图、热力图、矩形树图等，展示面积分布、区域对比、人均资源、客流趋势、借阅偏好、成本构成、反馈统计等。
  * **特色书房展示:** 通过交互式模态窗口展示不同类型书房（如历史文脉型、空间改造共建型、社区嵌入型）的详细信息。
* **无障碍设计:** 提供高对比度模式、字体大小调整、行高调整和屏幕朗读（基于 Web Speech API）功能，提升信息可访问性。
* **多语言支持:** 支持中文和英文界面切换。

## 数据故事线 (Data Story Outline)

1. **开篇 (Introduction):** 以关键统计数据（年接待规模、书房总数、累计借阅量、日均人次）引入，概述项目主旨和内容结构。
2. **空间分布 (Spatial Distribution):** 通过交互式地图展示"15分钟阅读圈"的覆盖情况及人口热力图，分析书房布局的合理性与服务盲点。
3. **规模结构 (Scale & Structure):** 利用矩形树图、条形图等分析书房的面积分布、区域分布及其与人口/面积的关系，解读布局策略。
4. **发展历程 (Timeline):** 以时间轴形式呈现"河洛书苑"从启动到成熟的关键政策、建设节点和里程碑事件。
5. **运营洞察 (Operational Insights):** 通过图表展示书房的日/时段客流模式、图书借阅分类偏好，揭示市民使用习惯。
6. **成本解构 (Cost Analysis):** 分析公开采购合同数据，探讨建设成本构成（资金流向）、典型中型书房成本估算、成本变化趋势，并重点介绍洛阳"多元共建共享"模式如何破解资金难题。
7. **市民之声 (Public Feedback):** 深入分析市民反馈数据，包括问题类型、反馈强度、时间趋势、区域差异，并结合管理办法探讨政府的应对与服务优化机制。
8. **特色掠影 (Showcase):** 通过图片和模态窗口展示不同类型书房的特色与价值。
9. **全国视野 (National Context):** 将洛阳置于全国城市书房发展背景下，展示其地位和特点。
10. **总结展望 (Conclusion):** 总结"洛阳模式"的成功要素、实践价值及其对国家全民阅读、学习型社会建设战略的贡献和启示。

## 技术栈 (Technology Stack)

* **后端 (Backend):** Python, Flask (用于提供HTML页面、处理地图路由和静态文件)
* **前端 (Frontend):** HTML5, CSS3, JavaScript (ES6+)
* **数据可视化 (Visualization):**
  * ECharts.js
  * Chart.js
  * Plotly.js
* **地图 (Mapping):** Leaflet.js 或 Mapbox GL JS (通过Flask路由提供服务)
* **数据处理 (Data Processing):** Python (Pandas, NumPy - 可能在后台脚本中使用), JSON
* **其他库 (Others):** Font Awesome (图标), Web Speech API (朗读功能)

## 数据来源 (Data Sources)

本项目综合使用了以下多源数据：

1. **洛阳市图书馆 & 河洛书苑官方数据/系统:** 书房基础信息 (位置, 面积, 藏书量等), 短期访客与借阅样本数据。
2. **洛阳网"百姓呼声"平台:** 市民反馈文本及元数据 (2017-2025)。
3. **洛阳市政府采购网:** 相关项目招投标及合同公告 (2017-2025)。
4. **人口与地理数据:** LandScan™ Global 2023, 第七次全国人口普查, 高德地图/Mapbox API。
5. **全国对比数据:** 全国城市书房合作共享机制官网 (截至2023年底)。
6. **新闻报道与政策文件:** 洛阳日报、河南省政府网等官方发布及《洛阳市"河洛书苑"城市书房建设管理办法》等。

*详细说明见网页底部的"数据来源与分析方法"部分。*
`

## 致谢 (Credits)

* **指导老师:** 万鹏
* **网页制作与数据分析:** 李心愿
* **数据提供:** 洛阳市图书馆, 洛阳市文化广电和旅游局, 及其他公开数据平台。

## 声明 (Disclaimer)

本项目仅用于教育目的（毕业设计）。部分数据基于公开信息整理、估算或进行了必要的调整。完整代码及所使用的公开数据集计划在项目完成后于 [github.com/xinyuanblue](https://github.com/xinyuanblue) 开源共享。


```



## 技术栈

- 后端：Flask
- 前端：HTML, CSS, JavaScript
- 地图：高德地图、mapbox API
- 数据可视化：ECharts, Plotly

## 注意事项

- 本项目使用了高德地图\mapbox API，确保您的网络环境能够访问该 API
- 静态网站版本已经将动态的Flask路由替换为直接的文件链接

# 河洛书苑静态网站

## 项目简介

本项目是"河洛书苑生长笔记"数据新闻项目的静态网站版本，记录了河南省洛阳市"河洛书苑"城市书房项目的发展历程、空间分布和社会影响。网站完全由静态HTML文件构成，无需服务器端支持，可直接部署在任何静态网站托管服务上。

## 网站结构

静态网站包含以下页面和资源：

- `index.html` - 项目主页，包含项目综述、数据分析和图表展示
- `isochrone_map.html` - 阅读圈等时线地图，展示各书房的15分钟阅读圈覆盖情况
- `population_map.html` - 人口分布与书房位置关系地图
- `static/` - 静态资源目录
  - `css/` - 样式文件
  - `js/` - JavaScript脚本文件
  - `data/` - 数据文件（JSON格式）
  - `vendor/` - 第三方库文件
  - `picture/` - 图片资源

## 浏览方式

由于项目采用纯静态文件构建，可通过以下方式访问：

### 本地浏览

1. 直接用浏览器打开`index.html`文件
2. 使用任何静态文件服务器，如Python的http.server:
   ```
   cd build
   python -m http.server 8000
   ```
   然后访问 http://localhost:8000

### 在线部署

网站可部署到任何静态网站托管服务，如：
- GitHub Pages
- Netlify
- Vercel
- 阿里云/腾讯云对象存储

只需上传`build`目录中的所有文件到对应服务即可。

## 技术说明

此静态版本通过以下技术实现：
- 纯HTML/CSS/JavaScript构建
- 使用原生JavaScript处理交互和数据可视化
- 地图可视化使用高德地图API和Mapbox GL JS
- 数据以JSON文件形式存储在`static/data/`目录

## 注意事项

- 部分地图功能需要互联网连接以加载地图API
- 建议使用现代浏览器访问（Chrome、Firefox、Edge、Safari等最新版本）
- 网站支持响应式设计，可在桌面和移动设备上浏览 
