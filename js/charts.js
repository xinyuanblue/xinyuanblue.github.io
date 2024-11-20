document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    const chartDom = document.getElementById('overviewChart');
    if (chartDom) {
        console.log('Chart container found');
        initOverviewChart();
    } else {
        console.log('Chart container not found');
    }
});

function initOverviewChart() {
    try {
        const chartDom = document.getElementById('overviewChart');
        const myChart = echarts.init(chartDom);
        
        const option = {
            title: {
                text: '2023年各区域城市书房使用情况',
                subtext: '数据来源：河洛书苑',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                top: '10%'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['西工区', '涧西区', '老城区', '瀍河区']
            },
            yAxis: [
                {
                    type: 'value',
                    name: '访问人次',
                    position: 'left'
                },
                {
                    type: 'value',
                    name: '借阅量',
                    position: 'right'
                }
            ],
            series: [
                {
                    name: '日均访问人次',
                    type: 'bar',
                    data: [120, 180, 150, 80]
                },
                {
                    name: '月均借阅量',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [2200, 3000, 2600, 1500]
                }
            ]
        };

        myChart.setOption(option);
        
        console.log('Chart initialized successfully');
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// 响应式处理
window.addEventListener('resize', () => {
    myChart.resize();
});