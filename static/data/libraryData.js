/**
 * 城市书房数据
 * 从城市书房数据.json转换而来的全局变量
 */

window.libraryData = [];

// 异步加载JSON数据
fetch('/static/data/城市书房数据.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('书房数据加载失败: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        // 处理书房数据
        if (data && data.districts) {
            Object.values(data.districts).forEach(district => {
                if (district && district.libraries) {
                    district.libraries.forEach(lib => {
                        const [lng, lat] = lib.coordinates.split(',').map(Number);
                        window.libraryData.push({
                            position: [lng, lat],
                            name: lib.name,
                            address: lib.address,
                            books: lib.books,
                            seats: lib.seats,
                            opening_hours: lib.opening_hours || '9:00-17:00',
                            district: lib.district,
                            area: lib.area
                        });
                    });
                }
            });
        }
        
        console.log(`城市书房数据加载完成，共 ${window.libraryData.length} 个书房`);
        
        // 触发自定义事件通知数据加载完成
        document.dispatchEvent(new CustomEvent('libraryDataReady'));
    })
    .catch(error => {
        console.error('书房数据加载错误:', error);
    }); 