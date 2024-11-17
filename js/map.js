// 全局变量
let map;
const markers = {};

// 初始化地图
function initMap() {
    console.log('初始化地图...');
    
    // 创建地图实例，添加性能优化选项
    map = new AMap.Map('container', {
        zoom: 13,
        center: [112.426562, 34.645919],
        viewMode: '2D',
        renderOptions: {
            willReadFrequently: true
        }
    });

    // 添加控件
    map.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
    });

    // 等待地图加载完成
    map.on('complete', function() {
        console.log('地图加载完成');
        createMarkers();
    });
}

// 创建标记点
function createMarkers() {
    console.log('创建标记点...');

    // 定义标记点样式
    const markerStyle = {
        icon: new AMap.Icon({
            // 使用高德地图默认图标
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            size: new AMap.Size(25, 34),
            imageSize: new AMap.Size(25, 34)
        }),
        offset: new AMap.Pixel(-13, -34)
    };

    // 遍历所有区域
    Object.keys(DISTRICTS).forEach(district => {
        const districtData = DISTRICTS[district];
        console.log(`处理 ${district} 的数据: ${districtData.length} 个点`);

        markers[district] = [];

        districtData.forEach(room => {
            if (room.longitude && room.latitude) {
                // 创建标记点
                const marker = new AMap.Marker({
                    position: [room.longitude, room.latitude],
                    title: room.name,
                    map: map,
                    icon: markerStyle.icon,
                    offset: markerStyle.offset
                });

                // 创建信息窗口
                const infoWindow = new AMap.InfoWindow({
                    content: `
                        <div class="bookroom-info">
                            <h3>${room.name}</h3>
                            <p><i class="fas fa-map-marker-alt"></i> ${room.address}</p>
                            <p><i class="far fa-clock"></i> ${room.info}</p>
                        </div>
                    `,
                    offset: new AMap.Pixel(0, -30),
                    closeWhenClickMap: true
                });

                // 点击事件
                marker.on('click', () => {
                    infoWindow.open(map, marker.getPosition());
                });

                markers[district].push(marker);
            }
        });
    });

    // 添加标记点聚合
    map.plugin(['AMap.MarkerClusterer'], function() {
        new AMap.MarkerClusterer(map, Object.values(markers).flat(), {
            gridSize: 80,
            minClusterSize: 2
        });
    });

    console.log('标记点创建完成');
}

// 切换区域显示
function toggleDistrict(district, show) {
    if (markers[district]) {
        markers[district].forEach(marker => {
            if (show) {
                marker.show();
            } else {
                marker.hide();
            }
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保地图容器存在
    const container = document.getElementById('container');
    if (!container) {
        console.error('找不到地图容器');
        return;
    }

    // 初始化地图
    initMap();
});

// 移除 export 语句