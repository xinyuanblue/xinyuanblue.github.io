// --- AMap Canvas Optimization (Important!) ---
const setCanvasWillReadFrequently = () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, attributes = {}) {
        if (type === '2d') {
            attributes.willReadFrequently = true;
        }
        return originalGetContext.call(this, type, attributes);
    };
};
setCanvasWillReadFrequently();

document.addEventListener('DOMContentLoaded', function() {
    // 变量声明
    var map, heatmap, libraryLayer;
    var isHeatmapVisible = true;
    var isLibraryVisible = true;
    var isBlindAreaVisible = false;
    var isBlindAreaPolygonVisible = false;
    var circles = [];
    var blindAreaMarkers = [];
    var blindAreaPolygons = [];
    var blindAreaMergedPolygons = [];
    var isOverlapStyle = false;
    var currentInfoWindow = null;
    
    // 显示加载指示器
    const loadingIndicator = document.getElementById('loading') || document.createElement('div');
    if (!document.getElementById('loading')) {
        loadingIndicator.id = 'loading';
        loadingIndicator.style.position = 'absolute';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.borderRadius = '10px';
        loadingIndicator.style.zIndex = '1000';
        loadingIndicator.textContent = '数据加载中...';
        document.body.appendChild(loadingIndicator);
    }
    loadingIndicator.style.display = 'block';
    
    // 初始化地图
    function initMap() {
        // 创建地图实例
        map = new AMap.Map('population-map', {
            resizeEnable: true,
            zoom: 12,
            center: [112.434468, 34.663041],  // 洛阳市中心坐标
            viewMode: '2D'
        });

        // 添加控制控件
        map.addControl(new AMap.ControlBar({
            position: 'rt',
            showZoomBar: true,
            showControlButton: true,
        }));

        if (!isSupportCanvas()) {
            alert('热力图仅对支持canvas的浏览器适用,您所使用的浏览器不能使用热力图功能,请换个浏览器试试~');
            loadingIndicator.style.display = 'none';
            return;
        }

        // 直接使用全局heatmapData变量（从外部JS加载）
        loadHeatMap();
        
        // 检查库数据是否已经加载
        if (window.libraryData && window.libraryData.length > 0) {
            // 如果数据已加载，直接创建书房服务范围
            createLibraryCircles();
            initBlindAreas();
            loadingIndicator.style.display = 'none';
        } else {
            // 监听libraryDataReady事件
            document.addEventListener('libraryDataReady', function() {
                // 创建书房服务范围
                createLibraryCircles();
                // 初始化盲区
                initBlindAreas();
                // 隐藏加载指示器
                loadingIndicator.style.display = 'none';
            });
        }
        
        // 绑定界面控制事件
        bindUIEvents();
    }
    
    // 判断浏览器是否支持canvas
    function isSupportCanvas() {
        var elem = document.createElement('canvas');
        elem.setAttribute('willReadFrequently', true);  // 添加willReadFrequently属性
        return !!(elem.getContext && elem.getContext('2d'));
    }
    
    // 加载热力图
    function loadHeatMap() {
        // 初始化热力图
        map.plugin(["AMap.Heatmap"], function() {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('willReadFrequently', true);
            
            heatmap = new AMap.HeatMap(map, {
                radius: 25,
                opacity: [0.1, 0.8],
                gradient: {
                    0.2: 'rgb(0,0,255)',
                    0.4: 'rgb(117,211,248)',
                    0.6: 'rgb(0,255,0)',
                    0.8: 'rgb(255,240,0)',
                    1.0: 'rgb(255,0,0)'
                },
                canvas: canvas
            });
            
            // 如果外部JS文件中的heatmapData存在，则直接使用它
            // 否则，用一个空数组
            if (typeof window.heatmapData === 'undefined') {
                console.error('热力图数据未找到，请确保heatmapData.js已正确加载');
                window.heatmapData = [];
            }
            
            // 调整数据的count值
            const processedData = window.heatmapData.map(point => ({
                ...point,
                count: point.count * 100
            }));

            // 设置数据集
            heatmap.setDataSet({
                data: processedData,
                max: 100
            });
        });
    }
    
    // 创建信息窗体
    function createInfoWindow(library) {
        return new AMap.InfoWindow({
            isCustom: true,
            autoMove: true,
            closeWhenClickMap: true,
            content: `
                <div class="library-title">${library.name}</div>
                <div class="library-info">
                    <p>地址：${library.address}</p>
                    <p>藏书：${library.books}册</p>
                    <p>座位：${library.seats}个</p>
                    <p>开放时间：${library.opening_hours}</p>
                    <p>服务半径：800米</p>
                </div>
            `,
            offset: new AMap.Pixel(0, -30)
        });
    }
    
    // 创建书房服务范围圆形
    function createLibraryCircles() {
        // 使用window.libraryData全局变量
        if (!window.libraryData || window.libraryData.length === 0) {
            console.error('书房数据为空');
            return;
        }

        // 创建图层
        libraryLayer = new AMap.LayerGroup();
        
        // 为每个书房创建圆形范围
        window.libraryData.forEach((library, index) => {
            // 创建标记
            const marker = new AMap.Marker({
                position: library.position,
                title: library.name,
                icon: new AMap.Icon({
                    size: new AMap.Size(25, 30),
                    image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                    imageSize: new AMap.Size(25, 30)
                }),
                offset: new AMap.Pixel(-12, -30)
            });
            
            // 信息窗体
            const info = createInfoWindow(library);
            
            // 添加点击事件
            marker.on('click', function() {
                if (currentInfoWindow) {
                    currentInfoWindow.close();
                }
                info.open(map, marker.getPosition());
                currentInfoWindow = info;
            });
            
            // 创建服务圈
            const circle = new AMap.Circle({
                center: library.position,
                radius: 800, // 800米服务半径
                strokeColor: "#006699",
                strokeOpacity: 0.7,
                strokeWeight: 1,
                fillColor: "#006699",
                fillOpacity: 0.25,
                bubble: true
            });
            
            // 添加到图层和数组
            libraryLayer.add(marker);
            libraryLayer.add(circle);
            circles.push({
                marker: marker,
                circle: circle,
                library: library
            });
        });
        
        // 添加到地图
        libraryLayer.setMap(map);
    }
    
    // 初始化盲区标记
    function initBlindAreas() {
        // 根据热力图点和书房服务范围计算盲区
        
        // 筛选出高密度点（热力值大于80的点）
        const highDensityPoints = window.heatmapData.filter(point => point.count > 80);
        const blindPoints = [];
        
        // 检查每个高密度点是否在任一服务范围内
        highDensityPoints.forEach(point => {
            const isInServiceArea = circles.some(item => {
                const distance = AMap.GeometryUtil.distance(
                    [point.lng, point.lat],
                    item.circle.getCenter()
                );
                return distance <= item.circle.getRadius();
            });
            
            // 如果不在任何服务范围内，则标记为盲点
            if (!isInServiceArea) {
                blindPoints.push({
                    position: [point.lng, point.lat],
                    count: point.count
                });
            }
        });
        
        // 创建盲点标记
        blindAreaMarkers = blindPoints.map(point => {
            return new AMap.Marker({
                position: point.position,
                map: map,
                visible: false,
                icon: new AMap.Icon({
                    size: new AMap.Size(12, 12),
                    image: 'https://a.amap.com/jsapi_demos/static/images/poi-marker-red.png',
                    imageSize: new AMap.Size(12, 12)
                }),
                offset: new AMap.Pixel(-6, -6)
            });
        });
        
        // 使用DBSCAN算法进行聚类
        if (blindPoints.length > 0) {
            createBlindAreaPolygons(blindPoints);
        }
    }

    // 创建盲区多边形
    function createBlindAreaPolygons(blindPoints) {
        // 将盲点转换为适合聚类的格式
        const points = blindPoints.map(p => ({
            x: p.position[0],
            y: p.position[1]
        }));
        
        // 实现简单的DBSCAN聚类
        const eps = 0.003; // 约300米
        const minPts = 5;  // 最小点数
        const clusters = dbscan(points, eps, minPts);
        
        // 为每个聚类创建凸包多边形
        clusters.forEach(cluster => {
            if (cluster.length >= minPts) {
                // 提取聚类点的坐标
                const clusterPoints = cluster.map(idx => [points[idx].x, points[idx].y]);
                
                // 计算凸包
                const hullPoints = convexHull(clusterPoints);
                
                // 创建多边形
                if (hullPoints.length >= 3) {
                    const polygon = new AMap.Polygon({
                        path: hullPoints,
                        strokeColor: "#FF0000",
                        strokeWeight: 2,
                        strokeOpacity: 0.8,
                        fillColor: "#FF0000",
                        fillOpacity: 0.4,
                        bubble: true,
                        map: map,
                        visible: false
                    });
                    
                    // 添加点击事件
                    polygon.on('click', function(e) {
                        // 显示盲区信息
                        const info = new AMap.InfoWindow({
                            isCustom: true,
                            autoMove: true,
                            closeWhenClickMap: true,
                            content: `
                                <div class="blind-area-title">服务盲区</div>
                                <div class="blind-area-info">
                                    <p>该区域内有较高的人口密度，但缺乏书房服务覆盖。</p>
                                    <p>建议在此区域增设城市书房。</p>
                                </div>
                            `,
                            offset: new AMap.Pixel(0, -30)
                        });
                        
                        // 计算多边形中心
                        const center = polygon.getBounds().getCenter();
                        info.open(map, center);
                        currentInfoWindow = info;
                        
                        // 阻止事件冒泡
                        e.stopPropagation();
                    });
                    
                    blindAreaPolygons.push(polygon);
                }
            }
        });
    }

    // DBSCAN算法实现
    function dbscan(points, eps, minPts) {
        const clusters = [];
        const visited = new Array(points.length).fill(false);
        
        // 找出点的邻居
        function getNeighbors(pointIdx) {
            const neighbors = [];
            for (let i = 0; i < points.length; i++) {
                if (i !== pointIdx) {
                    const distance = Math.sqrt(
                        Math.pow(points[i].x - points[pointIdx].x, 2) + 
                        Math.pow(points[i].y - points[pointIdx].y, 2)
                    );
                    if (distance < eps) {
                        neighbors.push(i);
                    }
                }
            }
            return neighbors;
        }
        
        // 递归扩展聚类
        function expandCluster(pointIdx, neighbors, cluster) {
            cluster.push(pointIdx);
            
            for (let i = 0; i < neighbors.length; i++) {
                const neighborIdx = neighbors[i];
                
                if (!visited[neighborIdx]) {
                    visited[neighborIdx] = true;
                    
                    const neighborNeighbors = getNeighbors(neighborIdx);
                    if (neighborNeighbors.length >= minPts) {
                        // 合并新邻居
                        neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n) && !visited[n]));
                    }
                }
                
                // 如果邻居还不属于任何聚类，将其添加到当前聚类
                if (!cluster.includes(neighborIdx)) {
                    cluster.push(neighborIdx);
                }
            }
        }
        
        // 主DBSCAN算法
        for (let i = 0; i < points.length; i++) {
            if (visited[i]) continue;
            
            visited[i] = true;
            const neighbors = getNeighbors(i);
            
            if (neighbors.length < minPts) {
                // 将其标记为噪声
                continue;
            }
            
            // 形成新的聚类
            const cluster = [];
            clusters.push(cluster);
            expandCluster(i, neighbors, cluster);
        }
        
        return clusters;
    }

    // Graham扫描法计算凸包
    function convexHull(points) {
        if (points.length < 3) return points;
        
        // 找出y坐标最小的点（如果有多个，取x最小的）
        let start = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i][1] < points[start][1] || 
                (points[i][1] === points[start][1] && points[i][0] < points[start][0])) {
                start = i;
            }
        }
        
        // 将起始点放到第一位
        [points[0], points[start]] = [points[start], points[0]];
        
        // 按照极角排序
        const sortedPoints = [points[0]];
        const restPoints = points.slice(1).sort((a, b) => {
            const angleA = Math.atan2(a[1] - points[0][1], a[0] - points[0][0]);
            const angleB = Math.atan2(b[1] - points[0][1], b[0] - points[0][0]);
            
            if (angleA === angleB) {
                // 如果极角相同，按距离排序
                const distA = Math.pow(a[0] - points[0][0], 2) + Math.pow(a[1] - points[0][1], 2);
                const distB = Math.pow(b[0] - points[0][0], 2) + Math.pow(b[1] - points[0][1], 2);
                return distA - distB;
            }
            
            return angleA - angleB;
        });
        
        sortedPoints.push(...restPoints);
        
        // Graham扫描
        const hull = [sortedPoints[0], sortedPoints[1]];
        
        for (let i = 2; i < sortedPoints.length; i++) {
            // 移除会导致右拐的点
            while (hull.length > 1 && !isLeftTurn(hull[hull.length - 2], hull[hull.length - 1], sortedPoints[i])) {
                hull.pop();
            }
            hull.push(sortedPoints[i]);
        }
        
        return hull;
    }

    // 判断是否左转
    function isLeftTurn(p1, p2, p3) {
        return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]) > 0;
    }
    
    // 切换热力图显示/隐藏
    function toggleHeatmap() {
        if (isHeatmapVisible) {
            heatmap.hide();
        } else {
            heatmap.show();
        }
        isHeatmapVisible = !isHeatmapVisible;
    }
    
    // 切换覆盖样式
    function toggleOverlapStyle() {
        isOverlapStyle = !isOverlapStyle;
        document.getElementById('legend').style.display = isOverlapStyle ? 'block' : 'none';
        
        if (isOverlapStyle) {
            circles.forEach(circle => {
                circle.setOptions({
                    strokeColor: "#008B8B",
                    strokeOpacity: 0.4,
                    strokeWeight: 1.5,
                    fillColor: "#008B8B",
                    fillOpacity: 0.25,
                    strokeStyle: 'solid'
                });
            });
        } else {
            circles.forEach(circle => {
                circle.setOptions({
                    strokeColor: "#008B8B",
                    strokeOpacity: 0.6,
                    strokeWeight: 1.5,
                    fillColor: "#008B8B",
                    fillOpacity: 0.25,
                    strokeStyle: 'dashed'
                });
            });
        }
    }
    
    // 切换盲点显示/隐藏
    function toggleBlindArea() {
        isBlindAreaVisible = !isBlindAreaVisible;
        
        blindAreaPolygons.forEach(polygon => {
            if (isBlindAreaVisible) {
                polygon.setMap(map);
            } else {
                polygon.setMap(null);
            }
        });
    }
    
    // 切换盲区多边形显示/隐藏
    function toggleBlindAreaPolygon() {
        isBlindAreaPolygonVisible = !isBlindAreaPolygonVisible;
        
        blindAreaMergedPolygons.forEach(polygon => {
            if (isBlindAreaPolygonVisible) {
                polygon.setMap(map);
            } else {
                polygon.setMap(null);
            }
        });
    }
    
    // 按钮事件处理
    function bindUIEvents() {
        document.getElementById('toggle-heatmap').addEventListener('click', function() {
            this.classList.toggle('active');
            toggleHeatmap();
        });
        
        document.getElementById('show-heatmap').addEventListener('click', function() {
            heatmap.show();
            isHeatmapVisible = true;
            document.getElementById('toggle-heatmap').classList.add('active');
        });
        
        document.getElementById('hide-heatmap').addEventListener('click', function() {
            heatmap.hide();
            isHeatmapVisible = false;
            document.getElementById('toggle-heatmap').classList.remove('active');
        });
        
        document.getElementById('toggle-libraries').addEventListener('click', function() {
            this.classList.toggle('active');
            isLibraryVisible = !isLibraryVisible;
            
            circles.forEach(circle => {
                if (isLibraryVisible) {
                    circle.show();
                } else {
                    circle.hide();
                }
            });
            
            document.getElementById('legend').style.display = isLibraryVisible && isOverlapStyle ? 'block' : 'none';
        });
        
        document.getElementById('toggle-overlap-style').addEventListener('click', function() {
            this.classList.toggle('active');
            toggleOverlapStyle();
        });
        
        document.getElementById('toggle-blind-area').addEventListener('click', function() {
            this.classList.toggle('active');
            toggleBlindArea();
        });
        
        document.getElementById('toggle-blind-area-polygon').addEventListener('click', function() {
            this.classList.toggle('active');
            toggleBlindAreaPolygon();
        });
        
        document.getElementById('reset-view').addEventListener('click', function() {
            map.setCenter([112.434468, 34.663041]);
            map.setZoom(12);
        });
    }
    
    // 初始化地图
    initMap();
}); 