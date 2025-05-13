# 河洛书苑生长笔记：百座书房画出十五分钟阅读圈 📖🏙️

**Luoyang Heluo Book Garden Growth Notes: How 100+ Urban Study Rooms Painted a 15-Minute Reading Circle**

[![Status](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/xinyuanblue/xinyuanblue.github.io)

---

**[➡️ 查看项目 (View Live Demo)](https://heluoshuyuan.cn/)**

## 📍 项目概述 (Project Overview)

本项目是一个**数据新闻作品**，旨在通过交互式数据可视化和叙事分析，深入解读中国河南省洛阳市 **"河洛书苑"** 城市书房项目。我们追溯了这些书房从零星几点到遍布全城超200座的**生长历程**，探索了其**空间布局**的智慧，分析了**运营数据**与**市民反馈**，并解码了支撑这一文化惠民工程快速发展的**"洛阳模式"**。项目最终目标是揭示洛阳如何成功构建起便捷的 **"15分钟文化阅读圈"**，并以此推动全民阅读和学习型社会建设。

This data journalism project interactively explores the "Heluo Book Garden" urban study room initiative in Luoyang, Henan, China. By leveraging data visualization and narrative analysis, it documents the development trajectory, spatial distribution, operational status, cost structure, citizen feedback, and socio-cultural impact of over 200 study rooms. The project delves into how Luoyang successfully established a convenient "15-minute reading circle," fostering city-wide reading habits and contributing to a learning-oriented society.

## ✨ 主要特色 (Key Features)

* **数据驱动叙事 (Data-Driven Narrative):** 结合多源数据，讲述洛阳城市书房的"生长故事"，从萌芽到枝繁叶茂。
* **交互式地图可视化 (Interactive Map Visualizations):**
  * **15分钟阅读圈:** 基于步行时间的等时圈地图 (`isochrone_map.html`, `isochrone_map_mapbox.html`)
  * **人口热力图:** 人口密度与书房位置叠加 (`population_map.html`)
  * **服务半径图:** 基于服务范围的覆盖分析 (`radius_map_amap.html`)
* **多维图表分析 (Multi-dimensional Chart Analysis):**
  * 利用 **ECharts, Chart.js, Plotly** 生成多种交互图表
  * 涵盖书房**面积分布**、**区域资源对比**、**人均拥有量**、**客流时段与日期特征**、**图书借阅偏好**、**成本构成**、**市民反馈热度**与**分类统计**、**全国城市书房对比**等
* **动态时间轴 (Dynamic Timeline):** 图文并茂地回溯项目关键发展节点
* **特色书房展示 (Showcase):** 通过卡片和模态窗口，介绍不同类型的代表性书房

## 🛠️ 技术栈 (Tech Stack)

* **前端 (Frontend):** HTML5, CSS3, JavaScript (ES6+)
* **数据可视化 (Data Visualization):**
  * [ECharts.js](https://echarts.apache.org/)
  * [Chart.js](https://www.chartjs.org/)
  * [Plotly.js](https://plotly.com/javascript/)
* **地图服务 (Mapping Services):**
  * 高德地图 天地图API (用于底图、地理编码和服务)
  * Mapbox API (用于精确等时圈渲染)
* **SEO优化 (SEO Optimization):**
  * sitemap.xml
  * robots.txt
  * BingSiteAuth.xml

## 📁 项目结构 (Project Structure)

```
.
├── index.html                    # 主页面
├── isochrone_map.html           # 15分钟阅读圈地图页面 (高德版)
├── isochrone_map_mapbox.html    # 15分钟阅读圈地图页面 (天地图版)
├── population_map.html          # 人口热力图页面
├── radius_map_amap.html         # 服务半径覆盖图
├── style.css                    # 主要样式文件
├── script.js                    # 主要JavaScript文件
├── deploy_static_site.sh        # 静态站点部署脚本
├── sitemap.xml                  # 网站地图
├── robots.txt                   # 搜索引擎爬虫规则
├── BingSiteAuth.xml            # Bing网站验证
├── flask/         # Mapbox
└── static/
    ├── css/                    # CSS样式文件
    ├── js/                     # JavaScript文件
    ├── data/                   # 数据文件 (JSON)
    ├── vendor/                 # 第三方库
    ├── picture/               # 图片资源
    ├── favicon.ico            # 网站图标
    └── favicon.png            # 网站图标 (PNG)
```

## 📊 数据来源 (Data Sources)

本项目数据来源于官方发布、公开平台及第三方服务，主要包括：

1. **洛阳市图书馆 & 河洛书苑官方:** 书房基础信息 (位置、面积、藏书量等)，运营样本数据
2. **洛阳网"百姓呼声"平台:** 市民反馈文本及元数据 (2017-2025)
3. **洛阳市政府采购网:** 相关项目招投标及合同公告 (2017-2025)
4. **人口与地理数据:** LandScan™ Global 2023, 第七次全国人口普查, 高德地图、天地图
5. **全国对比数据:** 全国城市书房合作共享机制官网 (截至2023年底)
6. **新闻报道与政策文件:** 官方媒体报道及相关政策法规

## 🚀 如何运行 (Getting Started)

1. **在线访问:** https://heluoshuyuan.cn/
**网站正在申请备案中**
**临时访问域名： https://heluoshuyuan.xyz/**
**备案期间可能暂停主域名 访问 迁移至临时域名**
**完成备案后会恢复主域名访问**
3. **本地运行:**
   ```bash
   # 克隆仓库
   git clone https://github.com/xinyuanblue/xinyuanblue.github.io.git
   

   # 使用Python的简易HTTP服务器启动项目
   # 在项目根目录下运行：
   python -m http.server 8000
   ```
   然后访问此网址

   http://localhost:8000/

##  制作团队 (Team)

* **指导老师 (Advisor):** 万鹏
* **网页制作与数据分析 (Web Dev & Data Analysis):** 李心愿
* **数据支持 (Data Support):** 洛阳市图书馆, 洛阳市文化广电和旅游局, 及其他公开数据平台
* **出品单位 (Production Unit):** 平顶山学院新闻与传播学院

## 📝 声明 (Disclaimer)

本项目主要用于教育目的（平顶山学院新闻与传播学院毕业设计）。部分数据基于公开信息整理、估算或进行了必要的调整。代码和公开数据集计划在项目完成后于GitHub共享。

This project is primarily for educational purposes (graduation design). Some data is based on publicly available information and may involve estimations or necessary adjustments. Code and public datasets are planned to be shared on the author's GitHub upon completion.


## 📄 授权协议 (License)

本作品采用 [知识共享署名-非商业性使用 4.0 国际许可协议（CC BY-NC 4.0）](https://creativecommons.org/licenses/by-nc/4.0/deed.zh) 进行许可。根据此协议，您可以：

* **共享** — 在任何媒介以任何形式复制、发行本作品
* **演绎** — 修改、转换或以本作品为基础进行创作

但您必须遵循以下条件：

* **署名** — 使用本作品时必须保留完整署名信息，包括：
  * 指导老师：万鹏
  * 网页制作：李心愿
  * 出品单位：平顶山学院新闻与传播学院
* **非商业性使用** — 您不得将本作品用于商业目的。
数据部分、可视化代码、分析方法均受此协议保护。第三方库、工具和数据源应遵循其各自的许可协议。
---

*如有任何问题或建议，欢迎联系 邮箱：211064078@e.pdsu.edu.cn*
