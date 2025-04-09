# 河洛书苑生长笔记 - 数据新闻项目
#《河洛书苑生长笔记：百座书房画出十五分钟阅读圈》
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




# 静态网站 Nginx 部署脚本 (AWS EC2 - Amazon Linux 2023)

## 概述

本 `README.md` 文件说明如何使用 `deploy_static_site.sh` 脚本在 AWS EC2 (运行 Amazon Linux 2023) 实例上自动部署一个基于 Nginx 的静态网站。该脚本会执行以下操作：

*   更新系统包。
*   安装 Nginx Web 服务器和 Git。
*   启动并设置 Nginx 开机自启。
*   从指定的 GitHub 公开仓库克隆网站源代码。
*   创建 Nginx 配置文件，将网站内容托管在指定域名下，并允许通过服务器公网 IP 直接访问。
*   设置正确的文件和目录权限，以便 Nginx 可以访问网站文件。
*   测试 Nginx 配置并重新启动服务。

**目标网站配置:**

*   **GitHub 仓库:** `https://github.com/xinyuanblue/xinyuanblue.github.io.git`
*   **目标域名:** `heluoshuyuan.cn` (同时支持 `www.` 子域名重定向)
*   **网站根目录:** `/home/ec2-user/xinyuanblue.github.io`

## 先决条件

在运行此脚本之前，请确保你已满足以下条件：

1.  **AWS 账户:** 拥有一个有效的 AWS 账户。
2.  **EC2 实例:**
    *   已启动一个 EC2 实例。
    *   **操作系统:** Amazon Linux 2023 (脚本中的 `yum` 命令是针对此系统的)。
    *   **实例类型:** `t2.micro` 或 `t3.micro` 通常足够（可能符合免费套餐条件）。
3.  **SSH 访问:**
    *   拥有用于连接 EC2 实例的 SSH 密钥对 (`.pem` 文件)。
    *   能够通过 SSH 客户端（如 `ssh` 命令行、PuTTY 等）连接到实例。
4.  **安全组配置:**
    *   EC2 实例关联的安全组已配置入站规则，允许以下流量：
        *   **SSH (TCP 端口 22):** 来源设置为 "我的 IP" 或你信任的 IP 范围。
        *   **HTTP (TCP 端口 80):** 来源设置为 "Anywhere IPv4" (0.0.0.0/0) 和 "Anywhere IPv6" (::/0) （如果需要 IPv6）。
    *   *（推荐，为后续步骤准备）* **HTTPS (TCP 端口 443):** 来源设置为 "Anywhere IPv4" (0.0.0.0/0) 和 "Anywhere IPv6" (::/0)。
5.  **弹性 IP (强烈推荐):**
    *   为你的 EC2 实例分配并关联一个弹性 IP 地址。这将提供一个固定的公网 IP，方便配置 DNS。如果不使用，实例重启后公网 IP 可能会改变。
6.  **脚本文件:**
    *   你已经拥有 `deploy_static_site.sh` 这个脚本文件。

## 脚本配置 (可选)

脚本顶部包含一些配置变量。对于部署 `xinyuanblue.github.io` 到 `heluoshuyuan.cn`，**默认值通常不需要修改**。

```bash
# --- Configuration Variables ---
REPO_URL="https://github.com/xinyuanblue/xinyuanblue.github.io.git"
DOMAIN_NAME="heluoshuyuan.cn"
DEPLOY_USER="ec2-user"
SITE_DIR_NAME="xinyuanblue.github.io"
# ... (其他变量通常根据以上变量自动推导)
Use code with caution.
Markdown
如果你要部署不同的仓库或使用不同的域名，请务必在运行脚本前修改这些变量。

如何使用
连接到 EC2 实例:
使用你的 .pem 密钥文件和实例的公网 IP (或 DNS 名称) 通过 SSH 连接：

ssh -i /path/to/your/key.pem ec2-user@<your-instance-public-ip-or-dns>
Use code with caution.
Bash
将其中的 /path/to/your/key.pem 和 <your-instance-public-ip-or-dns> 替换为你的实际值。

将脚本上传到 EC2 实例:
你可以使用 scp 命令将脚本文件从本地复制到 EC2 实例，或者直接在 EC2 实例上创建文件并粘贴内容。

方法 A: 使用 scp (在你的本地机器上运行):

scp -i /path/to/your/key.pem deploy_static_site.sh ec2-user@<your-instance-public-ip-or-dns>:~/
Use code with caution.
Bash
方法 B: 使用 nano (在 EC2 实例上运行):

# 在 EC2 终端中运行
nano deploy_static_site.sh
# 将脚本的全部内容粘贴到 nano 编辑器中
# 按 Ctrl+X，然后按 Y，再按 Enter 保存并退出
Use code with caution.
Bash
赋予脚本执行权限:
在 EC2 实例的终端中运行：

chmod +x deploy_static_site.sh
Use code with caution.
Bash
运行部署脚本:
重要: 脚本中的许多命令需要 root 权限（例如安装软件、修改 Nginx 配置、更改权限等），因此需要使用 sudo 来运行。

sudo ./deploy_static_site.sh
Use code with caution.
Bash
脚本会开始执行，并输出各个步骤的信息。如果一切顺利，最后会显示成功消息。

脚本执行详解
该脚本按顺序执行以下主要任务：

sudo yum update -y: 更新服务器上的所有软件包。

sudo yum install nginx git -y: 安装 Nginx Web 服务器和 Git 版本控制工具。

sudo systemctl start nginx / sudo systemctl enable nginx: 启动 Nginx 服务并设置其在服务器启动时自动运行。

git clone ...: 从 GitHub 克隆指定的仓库到 /home/ec2-user/xinyuanblue.github.io/ 目录。此步骤以 ec2-user 身份执行，以确保初始文件所有权正确。

sudo bash -c "cat <<EOF > ...": 创建 Nginx 配置文件 /etc/nginx/conf.d/heluoshuyuan.cn.conf。该配置包含：

一个 server 块，监听端口 80，设为 default_server 以处理直接 IP 访问，server_name 设置为 _ 和 heluoshuyuan.cn，root 指向网站文件目录。

另一个 server 块，用于将 www.heluoshuyuan.cn 的请求 301 重定向到 heluoshuyuan.cn。

sudo chmod o+x /home/ec2-user/: 修改 ec2-user 主目录的权限，允许 "其他人" (包括 Nginx 运行用户) 进入该目录。这是 Nginx 访问其子目录下文件的关键步骤。

sudo chown -R ec2-user:ec2-user ...: 确保网站目录及其所有内容的属主和属组都是 ec2-user。

sudo nginx -t: 测试 Nginx 配置文件的语法是否正确。

sudo systemctl restart nginx: 重新启动 Nginx 服务以加载新的配置和确保所有更改生效。

验证部署
脚本成功执行后：

检查 Nginx 状态:

sudo systemctl status nginx
Use code with caution.
Bash
应该显示 "active (running)"。按 q 退出状态查看。

通过公网 IP 访问:
打开你的 Web 浏览器，在地址栏输入你的 EC2 实例的公网 IP 地址 (例如 http://<your-instance-public-ip>)。

注意: 可能需要清除浏览器缓存或使用隐身/私密浏览模式，以避免看到旧的缓存页面或重定向。

你应该能看到部署的静态网站内容。

后续步骤
脚本完成后，你的网站可以通过 IP 地址访问。为了使用域名 heluoshuyuan.cn 访问，你需要：

配置 DNS:

登录到你的域名注册商或 DNS 服务提供商的管理控制台。

为你的域名 heluoshuyuan.cn 创建或更新 A 记录，将其指向你的 EC2 实例的弹性 IP 地址。

(可选但推荐) 为 www.heluoshuyuan.cn 创建一个 A 记录 或 CNAME 记录，同样指向弹性 IP 地址或主域名 (heluoshuyuan.cn)。Nginx 配置会将 www 重定向。

DNS 更改可能需要几分钟到几小时才能全球生效（DNS 传播）。

启用 HTTPS (强烈推荐):

一旦 DNS 配置生效并且你可以通过 http://heluoshuyuan.cn 访问你的网站，建议使用 Let's Encrypt (通过 Certbot 工具) 免费为你的网站添加 SSL/TLS 加密。

在 EC2 实例上安装 Certbot 及其 Nginx 插件（安装命令可能因 Certbot 版本而异，请参考 Certbot 官网文档）：

# 示例安装命令 (可能需要根据最新 Certbot 文档调整)
sudo yum install certbot python3-certbot-nginx -y
Use code with caution.
Bash
运行 Certbot 来获取并自动配置证书：

sudo certbot --nginx -d heluoshuyuan.cn -d www.heluoshuyuan.cn
Use code with caution.
Bash
按照 Certbot 的提示操作，它会自动修改你的 Nginx 配置以启用 HTTPS 并设置自动续订。

确保你的 EC2 安全组允许 HTTPS (TCP 端口 443) 的入站流量。

故障排除
如果遇到问题（例如 403 Forbidden, 404 Not Found, 无法连接），请检查：

Nginx 服务状态: sudo systemctl status nginx

Nginx 配置语法: sudo nginx -t

Nginx 错误日志: sudo tail -n 50 /var/log/nginx/error.log (非常重要，通常会指出具体错误)

文件/目录权限: 确认 /home/ec2-user/ 有 x 权限，网站目录及其文件对 Nginx 用户可读 (r) 可执行 (x for directories)。

文件路径: 确认 Nginx 配置中的 root 指令指向的路径 (/home/ec2-user/xinyuanblue.github.io) 确实存在且包含 index.html。

安全组规则: 确保 AWS 控制台中的安全组允许端口 80 (和 443，如果配置了 HTTPS) 的入站流量。

DNS 配置: 如果是域名访问问题，请检查 DNS A 记录是否正确指向了 EC2 的弹性 IP。

更新网站内容
此脚本仅用于初始部署。如果你更新了 GitHub 仓库中的网站内容，你需要手动或通过其他自动化方式将更改拉取到服务器上：

SSH 连接 到 EC2 实例。

导航 到网站目录：

cd /home/ec2-user/xinyuanblue.github.io/
Use code with caution.
Bash
拉取最新更改:

git pull origin main # 或者你的主分支名称
Use code with caution.
Bash
对于更频繁的更新，可以考虑设置 CI/CD 流水线（例如使用 GitHub Actions + SSH 或 AWS CodeDeploy）。

安全提示: 请谨慎运行从互联网上获取的脚本。在运行前，最好先阅读并理解脚本的每一部分都做了什么。
