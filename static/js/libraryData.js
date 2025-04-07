// 城市书房标记点数据
var libraryData = [];

// 创建一个Promise来处理数据加载
function loadLibraryData() {
    return fetch('/static/data/城市书房数据.json')
        .then(response => response.json())
        .then(data => {
            // 处理所有区的图书馆数据
            Object.values(data.districts).forEach(district => {
                district.libraries.forEach(library => {
                    const [lng, lat] = library.coordinates.split(',');
                    libraryData.push({
                        position: [parseFloat(lng), parseFloat(lat)],
                        name: library.name,
                        address: library.address,
                        books: library.books,
                        seats: library.seats,
                        opening_hours: library.opening_hours
                    });
                });
            });
            return libraryData;
        })
        .catch(error => {
            console.error('加载城市书房数据失败:', error);
            return [];
        });
} 