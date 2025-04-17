// static/js/district-bubble-chart.js

function initializeDistrictBubbleChart() {
    const container = document.getElementById('districtResourceBubbleChart');
    // --- 安全检查：确保容器存在 ---
    if (!container) {
        console.error("错误：找不到 ID 为 'districtResourceBubbleChart' 的图表容器。");
        return;
    }
    // --- 安全检查：确保 ECharts 库已加载 ---
    if (typeof echarts === 'undefined') {
        console.error("错误：ECharts 库未加载。气泡图无法创建。");
        container.innerHTML = '<p style="color:red; text-align:center;">错误：图表库加载失败</p>';
        return;
    }

    const bubbleChart = echarts.init(container);
    bubbleChart.showLoading({ text: '正在加载数据...' });

    Promise.all([
        fetch('static/js/行政区面积数量.json') // 确保路径相对于 HTML 文件是正确的
          .then(res => {
              if (!res.ok) throw new Error(`无法加载 行政区面积数量.json: ${res.statusText}`);
              return res.json();
          }),
        fetch('static/js/人口面积.json') // 确保路径相对于 HTML 文件是正确的
          .then(res => {
              if (!res.ok) throw new Error(`无法加载 人口面积.json: ${res.statusText}`);
              return res.json();
          })
    ])
    .then(([bookroomData, populationAreaData]) => {
        bubbleChart.hideLoading();
        // --- 清除可能存在的占位符 ---
        const placeholder = document.getElementById('chart-placeholder'); // 如果有的话
        if(placeholder) placeholder.style.display = 'none';

        const processedData = bookroomData.map(item => {
            let areaName = item.辖区 === "瀍河区" ? "瀍河回族区" : item.辖区;
            const popData = populationAreaData[areaName];
            if (!popData || !popData.常住人口 || popData.常住人口 <= 0) {
                console.warn(`跳过 ${item.辖区}: 无有效人口数据`);
                return null;
            }
            const population = popData.常住人口;
            const bookroomCount = item.bookroom_count || 0;
            const totalArea = item.total_area || 0;
            const popInTenThousands = population / 10000;

            const perTenThousandCount = popInTenThousands > 0 ? (bookroomCount / popInTenThousands) : 0;
            const perCapitaArea = popInTenThousands > 0 ? (totalArea / popInTenThousands) : 0;

            // --- !!! 更新市区列表，加入孟津区 !!! ---
            const urbanDistricts = ['老城区', '西工区', '瀍河区', '涧西区', '洛龙区', '吉利区', '高新区', '伊滨区', '孟津区']; // <-- 已加入孟津区
            const category = urbanDistricts.includes(item.辖区) ? '市区' : '县区';

            const symbolSizeValue = Math.max(8, Math.pow(population / 500, 0.6));

            return {
                name: item.辖区,
                value: [perCapitaArea, perTenThousandCount, symbolSizeValue, population, bookroomCount, totalArea],
                category: category
            };
        }).filter(item => item !== null);

        const categories = [{ name: '市区' }, { name: '县区' }];
        const colorPalette = ['#5470c6', '#91cc75']; // 市区蓝色，县区绿色

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    // --- 确保 params.data 和 params.data.value 存在 ---
                    if (!params.data || !params.data.value || params.data.value.length < 6) {
                        return params.name || '未知区域'; // 返回基础信息或空
                    }
                    const data = params.data.value;
                    return `${params.name} (${params.seriesName})<br/>` +
                           `总人口: ${(data[3] / 10000).toFixed(2)} 万人<br/>` +
                           `书房总数: ${data[4]} 座<br/>` +
                           `书房总面积: ${data[5].toLocaleString()} ㎡<br/>` +
                           `每万人书房数: ${data[1].toFixed(2)} 座<br/>` +
                           `每万人书房面积: ${data[0].toFixed(2)} ㎡`;
                }
            },
            legend: {
                right: '10%', top: '3%', data: categories.map(c => c.name)
            },
            grid: { left: '8%', right: '8%', bottom: '12%', top: '12%' },
            xAxis: {
                name: '每万人书房面积 (㎡)', nameLocation: 'middle', nameGap: 35, nameTextStyle: {fontWeight: 'bold'},
                type: 'value', splitLine: { lineStyle: { type: 'dashed' } },
                axisLabel: { formatter: '{value}' }
            },
            yAxis: {
                 name: '每万人书房数 (座)', nameLocation: 'middle', nameGap: 50, nameTextStyle: {fontWeight: 'bold'},
                 type: 'value', splitLine: { lineStyle: { type: 'dashed' } },
                 axisLabel: { formatter: '{value}' }
            },
            series: categories.map(function (category, index) {
                return {
                    name: category.name,
                    data: processedData.filter(item => item.category === category.name),
                    type: 'scatter',
                    symbolSize: function (val) {
                         // --- 访问 value 数组的第三个元素 (索引为 2) ---
                        return val[2];
                    },
                    itemStyle: {
                        color: colorPalette[index], opacity: 0.75,
                        shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)', shadowOffsetY: 3
                    },
                    label: {
                        formatter: '{b}', position: 'top', show: false,
                        fontSize: 10, color: '#333'
                    },
                     emphasis: {
                         focus: 'series', label: { show: true },
                         itemStyle: { opacity: 1, borderColor: 'rgba(0,0,0,0.4)', borderWidth: 1.5 }
                     }
                };
            })
        };

        bubbleChart.setOption(option);
        window.addEventListener('resize', function() { bubbleChart.resize(); });
    })
    .catch(error => {
        console.error("加载或处理气泡图数据失败:", error);
        bubbleChart.hideLoading();
        const placeholder = document.getElementById('chart-placeholder');
         if(placeholder) {
             placeholder.textContent = `错误：${error.message || '无法加载数据'}`;
             placeholder.style.color = 'red';
             placeholder.style.display = 'block'; //确保错误信息可见
         }
        container.innerHTML = '<p style="color:red; text-align:center;">图表数据加载失败</p>'; // 在容器内也显示错误
    });
}

// --- 在 DOM 加载完成后自动调用初始化函数 ---
// 注意：如果这个 JS 文件是在主 script.js 之前或之后加载，
// 并且主 script.js 中也有 DOMContentLoaded 监听器，
// 需要确保调用逻辑不会冲突或重复。
// 通常建议将所有初始化调用放在一个地方（比如主 script.js 的 DOMContentLoaded 中）。
// 但为了独立测试，这里保留了这个监听器。
document.addEventListener('DOMContentLoaded', function() {
    initializeDistrictBubbleChart();
});