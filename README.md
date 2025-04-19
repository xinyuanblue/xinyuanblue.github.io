# 河洛书苑生长笔记：百座书房画出十五分钟阅读圈 📖🏙️

**Luoyang Heluo Book Garden Growth Notes: How 100+ Urban Study Rooms Painted a 15-Minute Reading Circle**

**(本项目仍在持续推进中，非终稿 / This project is under active development, not the final version)**

[![Status](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/xinyuanblue/xinyuanblue.github.io)

---

**[➡️ 查看项目 (View Live Demo)](#)**

## 📍 项目概述 (Project Overview)

本项目是一个**数据新闻作品**，旨在通过交互式数据可视化和叙事分析，深入解读中国河南省洛阳市 **"河洛书苑"** 城市书房项目。我们追溯了这些书房从零星几点到遍布全城超200座的**生长历程**，探索了其**空间布局**的智慧，分析了**运营数据**与**市民反馈**，并解码了支撑这一文化惠民工程快速发展的**"洛阳模式"**。项目最终目标是揭示洛阳如何成功构建起便捷的 **"15分钟文化阅读圈"**，并以此推动全民阅读和学习型社会建设。

This data journalism project interactively explores the "Heluo Book Garden" urban study room initiative in Luoyang, Henan, China. By leveraging data visualization and narrative analysis, it documents the development trajectory, spatial distribution, operational status, cost structure, citizen feedback, and socio-cultural impact of over 200 study rooms. The project delves into how Luoyang successfully established a convenient "15-minute reading circle," fostering city-wide reading habits and contributing to a learning-oriented society.

## ✨ 主要特色 (Key Features)

* **数据驱动叙事 (Data-Driven Narrative):** 结合多源数据，讲述洛阳城市书房的"生长故事"，从萌芽到枝繁叶茂。
* **交互式地图可视化 (Interactive Map Visualizations):**
  * **15分钟阅读圈:** 基于步行时间的等时圈地图 (`isochrone_map.html`)，探索服务覆盖范围。
  * **人口热力图:** 人口密度与书房位置叠加 (`population_map.html`)，分析布局合理性。
* **多维图表分析 (Multi-dimensional Chart Analysis):**
  * 利用 **ECharts, Chart.js, Plotly** 生成多种交互图表。
  * 涵盖书房**面积分布**(矩形树图)、**区域资源对比**(气泡图、柱状图)、**人均拥有量**、**客流时段与日期特征**、**图书借阅偏好**(饼图)、**成本构成**(饼图)、**市民反馈热度**(热力图)与**分类统计**(环形图、条形图)、**全国城市书房对比**等。
* **动态时间轴 (Dynamic Timeline):** 图文并茂地回溯项目关键发展节点，结合故事模态框深入了解背景。
* **特色书房展示 (Showcase):** 通过卡片和模态窗口，介绍不同类型的代表性书房（如历史文脉型、空间改造共建型、社区嵌入型）。


## 🛠️ 技术栈 (Tech Stack)

* **前端 (Frontend):** HTML5, CSS3, JavaScript (ES6+)
* **数据可视化 (Data Visualization):**
  * [ECharts.js](https://echarts.apache.org/)
  * [Chart.js](https://www.chartjs.org/)
  * [Plotly.js](https://plotly.com/javascript/)
* **地图 (Mapping):**
  * 高德地图 JavaScript API (用于底图、部分地理编码或服务)
  * Mapbox GL JS (可能用于等时圈或热力图渲染)
* **图标 (Icons):** Font Awesome 5 Free
* **其他 (Others):** Web Speech API

## 📁 项目结构 (Project Structure)

```
.
├── index.html            # 主页面 (Main page)
├── isochrone_map.html    # 15分钟阅读圈地图页面 (Isochrone map page)
├── population_map.html   # 人口热力图页面 (Population heatmap page)
├── style.css             # 主要样式文件 (Main stylesheet)
├── script.js             # 主要 JavaScript 文件 (Main JavaScript file)
├── static/
│   ├── css/              # 其他 CSS 文件 (Other CSS files)
│   │   ├── comparison-styles.css
│   │   └── timeline-.css
│   ├── js/               # 其他 JS 文件 (Other JS files)
│   │   ├── accessibility.js
│   │   ├── comparison-animation.js
│   │   ├── district-bubble-chart.js
│   │   ├── echarts.min.js
│   │   ├── timeline-.js
│   │   └── translations.js
│   ├── data/             # 数据文件 (Data files - likely JSON)
│   │   └── *.json
│   ├── vendor/           # 第三方库 (Third-party libraries)
│   │   ├── chartjs/
│   │   ├── fontawesome/
│   │   └── plotly/
│   ├── picture/          # 图片资源 (Image assets)
│   │   └── *.jpg, *.png, .webp
│   └── favicon.ico       # 网站图标 (Favicons)
└── README.md             # 本文件 (This file)
```

## 📊 数据来源 (Data Sources)

本项目数据来源于官方发布、公开平台及第三方服务，主要包括：

1. **洛阳市图书馆 & 河洛书苑官方:** 书房基础信息 (位置、面积、藏书量等)，运营样本数据。
2. **洛阳网"百姓呼声"平台:** 市民反馈文本及元数据 (2017-2025)。
3. **洛阳市政府采购网:** 相关项目招投标及合同公告 (2017-2025)。
4. **人口与地理数据:** LandScan™ Global 2023, 第七次全国人口普查, 高德地图/Mapbox API。
5. **全国对比数据:** 全国城市书房合作共享机制官网 (截至2023年底)。
6. **新闻报道与政策文件:** 官方媒体报道及相关政策法规。

*更详细的数据说明请参见网页底部的 **"数据来源与分析方法"** 部分。*

## 🚀 如何查看 (Getting Started)

这是一个静态网站项目。你可以：

1. **访问在线版本:**  https://heluoshuyuan.cn/  ； https://xinyuanblue.github.io/
2. **本地查看:**
   * 克隆或下载本仓库代码。
   * python -m http.server 8000
   * *注意: 部分地图功能可能需要网络连接才能正常加载。（注意替换地图api）*

## 🙏 致谢 (Acknowledgments)

* **指导老师 (Advisor):** 万鹏
* **网页制作与数据分析 (Web Dev & Data Analysis):** 李心愿
* **数据支持 (Data Support):** 洛阳市图书馆, 洛阳市文化广电和旅游局, 及其他公开数据平台。

## 📝 声明 (Disclaimer)

本项目主要用于教育目的（平顶山学院新闻与传播学院毕业设计）。部分数据基于公开信息整理、估算或进行了必要的调整。代码和公开数据集计划在项目完成后于GitHub 共享。

This project is primarily for educational purposes (graduation design). Some data is based on publicly available information and may involve estimations or necessary adjustments. Code and public datasets are planned to be shared on the author's GitHub upon completion.

---

*如有任何问题或建议，欢迎联系 邮箱： 211064078@e.pdsu.edu.cn*
