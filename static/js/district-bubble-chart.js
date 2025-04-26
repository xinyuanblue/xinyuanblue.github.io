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
        fetch('./static/js/行政区面积数量.json').then(res => { // 确保路径相对于 HTML 文件
            if (!res.ok) throw new Error(`加载 行政区面积数量.json 失败: ${res.statusText}`);
            return res.json();
        }),
        fetch('./static/js/人口面积.json').then(res => { // 确保路径相对于 HTML 文件
            if (!res.ok) throw new Error(`加载 人口面积.json 失败: ${res.statusText}`);
            return res.json();
        })
    ])
    .then(([bookroomData, populationAreaData]) => {
        bubbleChart.hideLoading();

        // --- 数据处理逻辑 ---
        const processedData = bookroomData.map(item => {
            // 特殊处理区名以匹配人口数据
            let areaName = item.辖区 === "瀍河区" ? "瀍河回族区" : item.辖区;
            const popData = populationAreaData[areaName];

            // 检查人口数据有效性
            if (!popData || !popData.常住人口 || popData.常住人口 <= 0) {
                console.warn(`跳过 ${item.辖区}: 无有效人口数据`);
                return null; // 跳过没有有效人口数据的区域
            }

            const population = popData.常住人口;
            const bookroomCount = item.bookroom_count || 0;
            const totalArea = item.total_area || 0;
            const popInTenThousands = population / 10000;

            // 计算人均指标
            const perTenThousandCount = popInTenThousands > 0 ? (bookroomCount / popInTenThousands) : 0;
            const perCapitaArea = popInTenThousands > 0 ? (totalArea / popInTenThousands) : 0; // 注意单位是平方米每万人

            // 区分市区和县区
            const urbanDistricts = ['老城区', '西工区', '瀍河区', '涧西区', '洛龙区', '吉利区', '高新区', '伊滨区', '孟津区'];
            const category = urbanDistricts.includes(item.辖区) ? '市区' : '县区';

            // 计算气泡大小 (基于人口对数，调整范围和基数以获得更好视觉效果)
            const minPopLog = Math.log10(50000); // 设定一个参考最小人口对数值
            const maxPopLog = Math.log10(1000000); // 设定一个参考最大人口对数值 (可根据实际最大人口调整)
            const popLog = Math.log10(Math.max(population, 50000)); // 取对数，并设置下限
            const sizeRatio = Math.max(0, Math.min(1, (popLog - minPopLog) / (maxPopLog - minPopLog))); // 归一化到 0-1
            const symbolSizeValue = 10 + sizeRatio * 50; // 基数10，最大增加50，总范围10-60

            return {
                name: item.辖区, // ECharts 默认会用这个作为标签和 tooltip 的名称
                value: [
                    perCapitaArea,       // x轴: 每万人书房面积 (㎡)
                    perTenThousandCount, // y轴: 每万人书房数 (座)
                    symbolSizeValue,     // 气泡大小 (基于人口计算)
                    population,          // 原始人口 (用于 tooltip)
                    bookroomCount,       // 原始书房数 (用于 tooltip)
                    totalArea            // 原始总面积 (用于 tooltip)
                ],
                category: category // 用于区分市区/县区系列
            };
        }).filter(item => item !== null); // 过滤掉无效数据
        // --- 数据处理结束 ---

        // 定义图例类别
        const categories = [{ name: '市区' }, { name: '县区' }];
        // 定义颜色
        const colorPalette = ['#5470c6', '#91cc75']; // 蓝色代表市区，绿色代表县区

        // === 获取坐标轴范围 (用于对角线定位) ===
        // 从处理后的数据中提取 x 和 y 值
        const xValues = processedData.map(p => p.value[0]);
        const yValues = processedData.map(p => p.value[1]);

        // 找到 x 和 y 的最大最小值
        const xMinRaw = Math.min(...xValues);
        const xMaxRaw = Math.max(...xValues);
        const yMinRaw = Math.min(...yValues);
        const yMaxRaw = Math.max(...yValues);

        // 添加一些缓冲，让点不至于贴边
        const xBuffer = (xMaxRaw - xMinRaw) * 0.1 || 1; // 缓冲至少为1
        const yBuffer = (yMaxRaw - yMinRaw) * 0.1 || 0.1; // 缓冲至少为0.1

        const xMin = Math.max(0, xMinRaw - xBuffer); // 面积不为负
        const xMax = xMaxRaw + xBuffer;
        const yMin = Math.max(0, yMinRaw - yBuffer); // 数量不为负
        const yMax = yMaxRaw + yBuffer;
        // ==========================================

        // --- ECharts 配置项 ---
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (!params.data || !params.data.value || params.data.value.length < 6) {
                        return params.name || '未知区域';
                    }
                    const data = params.data.value;
                    // 格式化tooltip显示内容
                    return `<strong>${params.name}</strong> (${params.seriesName})<br/>` +
                           `总人口: <strong>${(data[3] / 10000).toFixed(2)}</strong> 万人<br/>` +
                           `书房总数: <strong>${data[4]}</strong> 座<br/>` +
                           `书房总面积: <strong>${data[5].toLocaleString()}</strong> ㎡<br/>` +
                           `<hr style="margin: 5px 0; border-color: #eee;">`+ // 分隔线
                           `每万人书房数: <strong style="color: ${params.color}">${data[1].toFixed(2)}</strong> 座<br/>` +
                           `每万人书房面积: <strong style="color: ${params.color}">${data[0].toFixed(2)}</strong> ㎡`;
                }
            },
            legend: {
                right: '10%',
                top: '5%',
                itemGap: 20,     // 增大图例项之间的间距
                itemWidth: 25,   // 增大图例标记的宽度
                itemHeight: 20,  // 增大图例标记的高度
                textStyle: {
                    fontSize: 20, // 增大图例文字的大小
                    // color: '#333' // 可选：设置文字颜色
                },
                data: categories.map(c => c.name)
            },
            grid: { // 调整网格边距给轴标签留出空间
                left: '10%',
                right: '12%',
                bottom: '15%',
                top: '12%'
            },
            xAxis: {
                name: '每万人书房面积 (㎡)',
                nameLocation: 'middle',
                nameGap: 35, // 轴名与轴线距离
                nameTextStyle: { fontWeight: 'bold', fontSize: 13 },
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed' } }, // 坐标轴网格线
                axisLabel: {
                    // --- 修改 formatter ---
                    formatter: function (value) {
                        // 保留一位小数
                        return value.toFixed(1);
                    },
                    // --- 保持其他样式 ---
                    fontSize: 11
                },
                min: xMin,
                max: xMax
            },
            yAxis: {
                 name: '每万人书房数 (座)',
                 nameLocation: 'middle',
                 nameGap: 55, // 轴名与轴线距离
                 nameTextStyle: { fontWeight: 'bold', fontSize: 13 },
                 type: 'value',
                 splitLine: { lineStyle: { type: 'dashed' } },
                 axisLabel: {
                    // --- 修改 formatter ---
                     formatter: function (value) {
                         // 保留一位小数
                         return value.toFixed(1);
                     },
                    // --- 保持其他样式 ---
                    fontSize: 11
                 },
                 min: yMin,
                 max: yMax
            },
            // --- 系列数据 ---
            series: categories.map(function (category, index) {
                // 筛选出当前类别的数据
                const seriesData = processedData.filter(item => item.category === category.name);

                // --- 为需要标注的点准备数据 ---
                const markPointsData = [];
                // 查找瀍河区数据 (注意原始名称是 '瀍河区')
                const chanquData = seriesData.find(p => p.name === '孟津区');
                if (chanquData) {
                     markPointsData.push({
                         name: '孟津标注',
                         value: '人均资源突出 →', // 标注文字
                         coord: chanquData.value.slice(0, 2), // 数据点坐标 [x, y]
                         label: { // 标注文字样式
                             position: 'right', // 文字在标记右侧
                             distance: 8, // 与标记距离
                             color: '#e67e22', fontWeight: 'bold', fontSize: 12,
                             backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: [3, 5], borderRadius: 3
                         },
                         symbol: 'pin', // 使用图钉形状
                         symbolSize: 50, // 图钉大小 (影响标签位置)
                         itemStyle: { color: '#e67e22', opacity: 0.7 } // 图钉颜色和透明度
                     });
                }
                // 查找伊川县数据
                const yichuanData = seriesData.find(p => p.name === '伊川县');
                if (yichuanData) {
                     markPointsData.push({
                         name: '伊川标注',
                         value: '← 人口多,人均资源待提升',
                         coord: yichuanData.value.slice(0, 2),
                         label: {
                             position: 'left', // 文字在标记左侧
                             distance: 8,
                             color: '#c0392b', fontWeight: 'bold', fontSize: 12,
                             backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: [3, 5], borderRadius: 3
                         },
                         symbol: 'pin',
                         symbolSize: 50,
                         itemStyle: { color: '#c0392b', opacity: 0.7 }
                     });
                }
                // --- 标注数据准备结束 ---

                return {
                    name: category.name, // 系列名称，对应图例
                    data: seriesData,    // 当前系列的数据
                    type: 'scatter',     // 图表类型为散点（气泡）图
                    symbolSize: function (val) { return val[2]; }, // 根据 value[2] 决定气泡大小
                    itemStyle: {
                        color: colorPalette[index], // 根据类别设置颜色
                        opacity: 0.75,             // 气泡透明度
                        shadowBlur: 8,             // 阴影模糊
                        shadowColor: 'rgba(0,0,0,0.2)', // 阴影颜色
                        shadowOffsetY: 3           // 阴影垂直偏移
                    },
                    label: { // 气泡上的标签（默认不显示）
                        formatter: '{b}', // 显示区县名称
                        position: 'right', // 标签默认在右侧
                        show: false,      // 默认不显示标签
                        fontSize: 10,
                        color: '#333'
                    },
                    emphasis: { // 鼠标悬停时的高亮效果
                        focus: 'series', // 高亮整个系列
                        label: { show: true }, // 显示标签
                        itemStyle: { // 高亮时的气泡样式
                            opacity: 1,
                            borderColor: 'rgba(0,0,0,0.4)',
                            borderWidth: 1.5
                        }
                    },
                    // === 在第一个 series 上添加对角线 ===
                    markLine: index === 0 ? { // 只在第一个系列上画一次线，避免重复
                        silent: true, // 线条不响应鼠标事件
                        symbol: 'none', // 线条两端不显示标记（如箭头）
                        label: { // 线条上的标签
                            position: 'end', // 标签显示在线条末端（右上角）
                            formatter: '人均资源更丰富 →', // 标签文字
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: '#e74c3c', // 标签颜色
                             padding: [0, 0, 10, 0] // 给标签一些偏移，避免压线
                        },
                        lineStyle: { // 线条样式
                            type: 'dashed', // 虚线
                            color: '#e74c3c', // 线条颜色
                            width: 1.5        // 线条宽度
                        },
                        data: [
                            [ // 定义线的起点和终点
                                { coord: [xMin, yMax], // 起点：坐标系的左下角
                                  label: { show: false } // 起点不显示标签
                                },
                                { coord: [xMax, yMin], // 终点：坐标系的右上角
                                  label: { show: true } // 终点显示标签
                                }
                            ]
                        ],
                        animation: false // 关闭标线的动画效果
                    } : null, // 其他系列不添加标线
                    // === 添加标注点 ===
                    markPoint: {
                        data: markPointsData, // 使用上面准备好的标注数据
                        symbolSize: 60, // 可以调整标注点的大小，如果用pin的话这个会影响pin的大小
                        label: {
                             show: true, // 确保标签显示
                             position: 'inside', // 文字尝试放在图标内部，如果图标够大
                             color: '#fff',
                             fontSize: 9, // 内部文字可以小一点
                             formatter: '{c}' // 显示 markPoint.data.value 的内容
                         },
                         // 如果不想显示 pin 图标，只想显示文字标签：
                         // symbol: 'none',
                         // label: {
                         //      show: true,
                         //      position: 'top', // 或者 'bottom', 'left', 'right'
                         //      distance: 10, // 与数据点的距离
                         //      color: '#ff0000', // 标签颜色
                         //      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                         //      padding: [3, 5],
                         //      borderRadius: 3,
                         //      formatter: '{c}' // 显示 value
                         // }
                    }
                    // ============================
                };
            }) // end of categories.map
        }; // end of option object

        // --- 设置图表选项 ---
        bubbleChart.setOption(option);

        // --- 监听窗口大小变化，重绘图表 ---
        window.addEventListener('resize', function() {
            bubbleChart.resize();
            // 注意：ECharts 的 markLine 和 markPoint 会自动随 resize 调整位置，
            // 无需像之前那样手动重绘标注层。
        });

    }) // end of .then
    .catch(error => { // 捕获 fetch 或处理过程中的错误
        console.error("加载或处理气泡图数据失败:", error);
        bubbleChart.hideLoading(); // 隐藏加载动画
        // 在容器内显示错误信息
        container.innerHTML = `<p style="color:red; text-align:center; padding: 20px;">图表数据加载失败: ${error.message}</p>`;
    }); // end of .catch
} // end of initializeDistrictBubbleChart function

// --- 确保在 DOM 加载完成后调用初始化函数 ---
document.addEventListener('DOMContentLoaded', function() {
    initializeDistrictBubbleChart();
});