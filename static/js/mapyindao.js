/**
 * 地图引导系统脚本
 * 为地图控制按钮添加悬停提示和GIF动画指引
 */

// 定义引导系统类
class MapGuideSystem {
    constructor() {
        // GIF路径配置
        this.gifPaths = {
            'toggle-click-mode': './static/picture/gif/dianjishengcheng.gif',
            'clear-all-isochrones': './static/picture/gif/qingchuanniu.gif',
            'generate-all-isochrones': './static/picture/gif/shengchengdengshiquan.gif'
        };
        
        // 按钮描述文本
        this.buttonDescriptions = {
            'toggle-click-mode': '点击地图生成等时圈：在地图上点击任意位置，生成15分钟步行可达范围',
            'clear-all-isochrones': '清除所有等时圈：一键清除所有已生成的等时圈',
            'generate-all-isochrones': '生成所有等时圈：显示所有书房的15分钟步行可达范围'
        };
        
        // 初始化引导系统
        this.init();
    }
    
    // 初始化方法
    init() {
        // 创建提示框元素
        this.createTooltipElement();
        
        // 为按钮添加事件监听器
        this.setupEventListeners();
        
        // 创建欢迎引导层
        this.createWelcomeGuide();
        
        console.log('地图引导系统已初始化');
    }
    
    // 创建提示框元素
    createTooltipElement() {
        // 检查是否已存在提示框
        let tooltip = document.getElementById('map-guide-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'map-guide-tooltip';
            tooltip.className = 'map-guide-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                z-index: 10000;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
                padding: 12px;
                max-width: 300px;
                display: none;
                transition: opacity 0.3s ease;
                pointer-events: none;
                border: 1px solid #3498db;
            `;
            
            // 创建内容容器
            const content = document.createElement('div');
            content.className = 'tooltip-content';
            
            // 创建标题
            const title = document.createElement('div');
            title.className = 'tooltip-title';
            title.style.cssText = `
                font-weight: bold;
                margin-bottom: 8px;
                color: #2c3e50;
                font-size: 14px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 5px;
            `;
            
            // 创建描述
            const description = document.createElement('div');
            description.className = 'tooltip-description';
            description.style.cssText = `
                margin-bottom: 10px;
                color: #34495e;
                font-size: 13px;
                line-height: 1.4;
            `;
            
            // 创建GIF容器
            const gifContainer = document.createElement('div');
            gifContainer.className = 'tooltip-gif';
            gifContainer.style.cssText = `
                width: 100%;
                overflow: hidden;
                border-radius: 4px;
                border: 1px solid #e0e0e0;
            `;
            
            // 创建GIF图像
            const gifImage = document.createElement('img');
            gifImage.className = 'tooltip-gif-image';
            gifImage.style.cssText = `
                width: 100%;
                display: block;
            `;
            
            // 组装DOM
            gifContainer.appendChild(gifImage);
            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(gifContainer);
            tooltip.appendChild(content);
            
            // 添加到地图容器
            document.body.appendChild(tooltip);
            
            // 保存引用
            this.tooltip = tooltip;
            this.tooltipTitle = title;
            this.tooltipDescription = description;
            this.tooltipGifImage = gifImage;
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 为每个按钮添加鼠标悬停事件
        Object.keys(this.gifPaths).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // 鼠标进入显示提示
                button.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e, buttonId);
                });
                
                // 鼠标移动更新位置
                button.addEventListener('mousemove', (e) => {
                    this.updateTooltipPosition(e);
                });
                
                // 鼠标离开隐藏提示
                button.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
                
                // 添加引导标识
                this.addGuideIndicator(button);
            }
        });
        
        // 添加引导按钮
        this.addGuideButton();
    }
    
    // 显示提示框
    showTooltip(event, buttonId) {
        // 设置提示框内容
        this.tooltipTitle.textContent = buttonId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        this.tooltipDescription.textContent = this.buttonDescriptions[buttonId];
        this.tooltipGifImage.src = this.gifPaths[buttonId];
        
        // 显示提示框
        this.tooltip.style.display = 'block';
        
        // 设置提示框位置
        this.updateTooltipPosition(event);
    }
    
    // 更新提示框位置
    updateTooltipPosition(event) {
        const margin = 15; // 与鼠标的距离
        let x = event.clientX + margin;
        let y = event.clientY + margin;
        
        // 确保提示框不超出视口
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 检查右侧边界
        if (x + tooltipRect.width > viewportWidth) {
            x = event.clientX - tooltipRect.width - margin;
        }
        
        // 检查底部边界
        if (y + tooltipRect.height > viewportHeight) {
            y = event.clientY - tooltipRect.height - margin;
        }
        
        // 应用位置
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }
    
    // 隐藏提示框
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
    
    // 添加引导指示器
    addGuideIndicator(button) {
        const indicator = document.createElement('div');
        indicator.className = 'guide-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background-color: #3498db;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 2s infinite;
        `;
        
        // 添加脉冲动画样式
        if (!document.getElementById('guide-animation-style')) {
            const style = document.createElement('style');
            style.id = 'guide-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 152, 219, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 设置按钮为相对定位以便放置指示器
        if (button.style.position !== 'relative' && 
            button.style.position !== 'absolute' && 
            button.style.position !== 'fixed') {
            button.style.position = 'relative';
        }
        
        button.appendChild(indicator);
    }
    
    // 添加引导按钮
    addGuideButton() {
        const guideButton = document.createElement('button');
        guideButton.id = 'map-guide-button';
        guideButton.innerHTML = '<i class="fas fa-question-circle"></i> 使用指南';
        guideButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 8px 12px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        
        // 检查是否有Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            // 添加Font Awesome
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
        }
        
        // 添加点击事件
        guideButton.addEventListener('click', () => {
            this.showWelcomeGuide();
        });
        
        // 添加到地图容器
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(guideButton);
        } else {
            document.body.appendChild(guideButton);
        }
    }
    
    // 创建欢迎引导层
    createWelcomeGuide() {
        // 创建引导层容器
        const welcomeGuide = document.createElement('div');
        welcomeGuide.id = 'map-welcome-guide';
        welcomeGuide.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        `;
        
        // 创建引导内容
        const guideContent = document.createElement('div');
        guideContent.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 700px;
            width: 80%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;
        
        closeButton.addEventListener('click', () => {
            welcomeGuide.style.display = 'none';
            // 存储已显示标志
            localStorage.setItem('mapGuideShown', 'true');
        });
        
        // 引导内容HTML
        guideContent.innerHTML = `
            <h2 style="color: #2c3e50; margin-top: 0; text-align: center; margin-bottom: 20px;">地图使用指南</h2>
            <p style="color: #34495e; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
                欢迎使用等时圈地图工具，这个工具可以帮助您了解各个书房的15分钟步行可达范围，并进行选址规划。
                以下是主要功能的使用方法：
            </p>
            
            <div style="display: flex; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="flex: 1; padding: 15px; border-right: 1px solid #e0e0e0;">
                    <h3 style="margin-top: 0; color: #3498db; font-size: 16px;">点击地图生成等时圈</h3>
                    <p style="font-size: 14px; color: #555;">点击地图任意位置，可以生成该位置的15分钟步行可达范围</p>
                    <img src="${this.gifPaths['toggle-click-mode']}" style="width: 100%; border-radius: 4px; border: 1px solid #eee;">
                </div>
                <div style="flex: 1; padding: 15px;">
                    <h3 style="margin-top: 0; color: #3498db; font-size: 16px;">生成所有等时圈</h3>
                    <p style="font-size: 14px; color: #555;">一键生成所有书房的15分钟步行可达范围</p>
                    <img src="${this.gifPaths['generate-all-isochrones']}" style="width: 100%; border-radius: 4px; border: 1px solid #eee;">
                </div>
            </div>
            
            <div style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #3498db; font-size: 16px;">清除所有等时圈</h3>
                <p style="font-size: 14px; color: #555;">一键清除地图上所有等时圈和标记</p>
                <img src="${this.gifPaths['clear-all-isochrones']}" style="width: 100%; max-width: 300px; display: block; margin: 0 auto; border-radius: 4px; border: 1px solid #eee;">
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px; text-align: center; font-style: italic;">
                提示：鼠标悬停在按钮上可以看到对应功能的演示动画
            </p>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="welcome-guide-close-btn" style="background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">开始使用地图</button>
            </div>
        `;
        
        // 添加关闭按钮
        guideContent.appendChild(closeButton);
        welcomeGuide.appendChild(guideContent);
        document.body.appendChild(welcomeGuide);
        
        // 添加开始按钮事件
        const startButton = guideContent.querySelector('#welcome-guide-close-btn');
        if (startButton) {
            startButton.addEventListener('click', () => {
                welcomeGuide.style.display = 'none';
                localStorage.setItem('mapGuideShown', 'true');
            });
        }
        
        // 保存引用
        this.welcomeGuide = welcomeGuide;
        
        // 始终显示欢迎引导，无论是否首次访问
        setTimeout(() => {
            this.showWelcomeGuide();
            // 可选：移除localStorage限制，确保每次都显示
            localStorage.removeItem('mapGuideShown');
        }, 1000);
    }
    
    // 显示欢迎引导
    showWelcomeGuide() {
        if (this.welcomeGuide) {
            this.welcomeGuide.style.display = 'flex';
        }
    }
}

// 页面加载完成后初始化引导系统
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保地图组件已加载
    setTimeout(() => {
        window.mapGuideSystem = new MapGuideSystem();
        
        // 添加消息监听器，用于接收来自父页面的消息
        window.addEventListener('message', function(event) {
            if (event.data === 'showMapGuide' && window.mapGuideSystem) {
                window.mapGuideSystem.showWelcomeGuide();
                // 移除localStorage限制，确保每次都能显示
                localStorage.removeItem('mapGuideShown');
            }
        });
    }, 1000);
});
