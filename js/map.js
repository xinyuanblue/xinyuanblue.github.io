// 书房位置数据
const bookRoomData = [
    {
        name: "河洛书苑-西工区分馆",
        position: [112.394245, 34.663439],
        address: "洛阳市西工区王城大道与建业路交叉口"
    },
    // 添加更多书房位置数据...
];

// 初始化地图
function initMap() {
    // 创建地图实例
    const map = new BMap.Map("baiduMap");
    
    // 设置地图中心点为洛阳市
    const centerPoint = new BMap.Point(112.454556, 34.619682);
    map.centerAndZoom(centerPoint, 13);
    
    // 添加地图控件
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.enableScrollWheelZoom();

    // 添加书房标记点
    addBookRoomMarkers(map);
}

// 添加书房标记点
function addBookRoomMarkers(map) {
    bookRoomData.forEach(room => {
        const point = new BMap.Point(room.position[0], room.position[1]);
        const marker = new BMap.Marker(point);
        map.addOverlay(marker);

        // 创建信息窗口
        const infoWindow = new BMap.InfoWindow(`
            <div class="map-info-window">
                <h4>${room.name}</h4>
                <p>${room.address}</p>
            </div>
        `);

        // 点击标记显示信息窗口
        marker.addEventListener('click', function() {
            map.openInfoWindow(infoWindow, point);
        });
    });
}

// 页面加载完成后初始化地图
window.onload = function() {
    initMap();
};
