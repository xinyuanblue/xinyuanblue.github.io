document.addEventListener('DOMContentLoaded', function() {

    // --- Accessibility Features ---
    initializeAccessibilityFeatures();

    // --- Language Switching ---
    initializeLanguageSwitch();

    // --- Map Fullscreen ---
    // Note: The button itself is in the HTML. This just provides the function if needed elsewhere.
    // The inline onclick/href might be sufficient.
    initializeMapFullscreenLogic();

    // --- Chart Initializations ---
    initializeBookstoreTreemap();
    initializeDistrictDistributionChart();
    initializePopulationCharts();
    initializeVisitorBorrowingCharts();
    initializeCostCharts();
    initializeFeedbackCharts(); // Includes Plotly heatmap, ECharts trend, Plotly monthly heatmap, Chart.js detail
    initializeNationalDistributionChart();

    // --- Modal Logic (Library Showcase) ---
    initializeLibraryModal();

}); // End DOMContentLoaded

// ==================================
// Accessibility Functions
// ==================================
function initializeAccessibilityFeatures() {
    // High contrast toggle
    const contrastToggle = document.getElementById('contrast-toggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('high-contrast');
            const isHighContrast = document.documentElement.classList.contains('high-contrast');
            this.setAttribute('aria-pressed', isHighContrast);
            saveAccessibilitySettings();
        });
    }

    // Font size toggle
    const fontSizeToggle = document.getElementById('font-size-toggle');
    if (fontSizeToggle) {
        fontSizeToggle.addEventListener('click', function() {
            const currentSize = document.documentElement.getAttribute('data-font-size');
            let newSize;
            if (!currentSize) newSize = 'large';
            else if (currentSize === 'large') newSize = 'x-large';
            else newSize = ''; // Cycle back to default

            if (newSize) {
                document.documentElement.setAttribute('data-font-size', newSize);
            } else {
                document.documentElement.removeAttribute('data-font-size');
            }
            this.setAttribute('aria-pressed', !!newSize);
            saveAccessibilitySettings();
        });
    }

    // Line height toggle
    const lineHeightToggle = document.getElementById('line-height-toggle');
    if (lineHeightToggle) {
        lineHeightToggle.addEventListener('click', function() {
            const isIncreased = document.documentElement.getAttribute('data-line-height') === 'increased';
            if (isIncreased) {
                 document.documentElement.removeAttribute('data-line-height');
            } else {
                 document.documentElement.setAttribute('data-line-height', 'increased');
            }
            this.setAttribute('aria-pressed', !isIncreased);
            saveAccessibilitySettings();
        });
    }

   
    

    // Save accessibility settings
    function saveAccessibilitySettings() {
        try {
            const settings = {
                highContrast: document.documentElement.classList.contains('high-contrast'),
                fontSize: document.documentElement.getAttribute('data-font-size') || '',
                lineHeight: document.documentElement.getAttribute('data-line-height') || ''
            };
            localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
        } catch (e) {
            console.error("无法保存无障碍设置到LocalStorage:", e);
        }
    }

    // Load accessibility settings
    function loadAccessibilitySettings() {
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);

                if (settings.highContrast && contrastToggle) {
                    document.documentElement.classList.add('high-contrast');
                    contrastToggle.setAttribute('aria-pressed', 'true');
                }
                if (settings.fontSize && fontSizeToggle) {
                    document.documentElement.setAttribute('data-font-size', settings.fontSize);
                    fontSizeToggle.setAttribute('aria-pressed', 'true');
                }
                if (settings.lineHeight && lineHeightToggle) {
                    document.documentElement.setAttribute('data-line-height', settings.lineHeight);
                    lineHeightToggle.setAttribute('aria-pressed', 'true');
                }
            }
        } catch (e) {
             console.error("无法从LocalStorage加载无障碍设置:", e);
        }
    }

    // Initial load
    loadAccessibilitySettings();
}

// ==================================
// Language Switching Functions
// ==================================
function initializeLanguageSwitch() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'zh';
    document.documentElement.lang = savedLang;
    const languageBtns = document.querySelectorAll('.language-switch button');

    function updateButtonStates(activeLang) {
        languageBtns.forEach(btn => {
            if (btn.dataset.lang === activeLang) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (document.documentElement.lang === lang) return; // Avoid re-applying same language

            document.documentElement.lang = lang;
            try {
                localStorage.setItem('selectedLanguage', lang);
            } catch (e) {
                console.error("无法保存语言设置到LocalStorage:", e);
            }
            updateButtonStates(lang);

            // Trigger translation (assuming translatePage exists from translations.js)
            if (typeof translatePage === 'function') {
                 // Delay slightly to ensure DOM updates from class changes are potentially processed
                setTimeout(() => translatePage(lang), 50);
            } else {
                console.error('translatePage function not found. Make sure translations.js is loaded correctly.');
            }
             // Dispatch a custom event for other components if needed
             document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
        });
    });

    // Initial state update and translation
    updateButtonStates(savedLang);
    if (typeof translatePage === 'function') {
        translatePage(savedLang); // Apply initial translation
    } else {
         console.error('translatePage function not found for initial load.');
    }
}

// ==================================
// Map Fullscreen Functions (Optional, if needed beyond inline button)
// ==================================
function initializeMapFullscreenLogic() {
    // Function to toggle fullscreen for a given element ID
    window.toggleFullScreen = function(elementId) { // Make it global if called from inline HTML
        const element = document.getElementById(elementId);
        if (!element) {
            console.error("Element with ID '" + elementId + "' not found for fullscreen.");
            return;
        }

        if (!document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement) {
            // Enter fullscreen
            if (element.requestFullscreen) { element.requestFullscreen(); }
            else if (element.msRequestFullscreen) { element.msRequestFullscreen(); }
            else if (element.mozRequestFullScreen) { element.mozRequestFullScreen(); }
            else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT); }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) { document.exitFullscreen(); }
            else if (document.msExitFullscreen) { document.msExitFullscreen(); }
            else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
            else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        }
    }

    // Function to update the fullscreen button icon (if you have one)
    function updateFullscreenButtonIcon() {
        const buttonIcon = document.querySelector('.fullscreen-button i'); // Adjust selector if needed
        if (buttonIcon) {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                buttonIcon.className = 'fas fa-compress'; // Change to compress icon
            } else {
                buttonIcon.className = 'fas fa-expand'; // Change back to expand icon
            }
        }
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonIcon);
}

// ==================================
// Chart Initialization Functions
// ==================================

// --- ECharts: Bookstore Treemap ---
function initializeBookstoreTreemap() {
    const container = document.getElementById('bookstoreTreemap');
    if (!container || typeof echarts === 'undefined') return;

    const bookstoreTreemap = echarts.init(container, null, { renderer: 'canvas' });
    let currentCategory = null; // Track drill-down state
    let backButton = null; // Reference to the back button

    // Create back button dynamically
    function createBackButton() {
        if (!backButton) {
            backButton = document.createElement('button');
            backButton.textContent = '返回书房类型总览';
            backButton.style.cssText = 'position: absolute; top: 15px; right: 20px; z-index: 100; padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;'; // Initially hidden
            container.parentNode.appendChild(backButton); // Append to container's parent

            backButton.addEventListener('click', function() {
                if (currentCategory !== null) {
                    // Fetch original data again or use stored data
                    fetchAndDrawTreemap(true); // Pass true to reset view
                    this.style.display = 'none';
                    currentCategory = null;
                }
            });
        }
    }

     // Function to fetch data and draw/update the treemap
     function fetchAndDrawTreemap(resetView = false) {
        fetch('static/js/面积.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // Process data (grouping, calculating totals)
                const groupedData = { '小型书房': [], '中型书房': [], '大型书房': [], '特大型书房': [] };
                const totalAreas = {};

                data.forEach(item => {
                     const type = item.书房类型;
                     if (groupedData.hasOwnProperty(type)) {
                         groupedData[type].push(item);
                     } else {
                         console.warn("Unknown bookstore type:", type);
                     }
                });

                Object.keys(groupedData).forEach(type => {
                    totalAreas[type] = groupedData[type].reduce((sum, item) => sum + (item.面积 || 0), 0);
                });

                // Prepare data structure for ECharts
                const initialTreemapData = [
                    { name: `小型书房 (${groupedData['小型书房'].length}座)`, value: totalAreas['小型书房'], itemStyle: { color: '#FF9F40' }, id: '小型书房' },
                    { name: `中型书房 (${groupedData['中型书房'].length}座)`, value: totalAreas['中型书房'], itemStyle: { color: '#36A2EB' }, id: '中型书房' },
                    { name: `大型书房 (${groupedData['大型书房'].length}座)`, value: totalAreas['大型书房'], itemStyle: { color: '#4BC0C0' }, id: '大型书房' },
                    { name: `特大型书房 (${groupedData['特大型书房'].length}座)`, value: totalAreas['特大型书房'], itemStyle: { color: '#9966FF' }, id: '特大型书房' }
                ];

                const completeDataSet = {};
                Object.keys(groupedData).forEach(type => {
                    completeDataSet[type] = {
                        name: initialTreemapData.find(d => d.id === type)?.name || type,
                        value: totalAreas[type],
                        itemStyle: initialTreemapData.find(d => d.id === type)?.itemStyle || {},
                        children: groupedData[type].map(item => ({
                            name: item.名称,
                            value: item.面积 || 0,
                            district: item.辖区 || 'N/A',
                            itemStyle: { color: initialTreemapData.find(d => d.id === type)?.itemStyle?.color || '#ccc' }
                        }))
                    };
                });

                // Determine which data to show based on current view
                const displayData = resetView || currentCategory === null
                    ? initialTreemapData
                    : (completeDataSet[currentCategory] ? [completeDataSet[currentCategory]] : initialTreemapData);


                const option = getTreemapOption(displayData);
                bookstoreTreemap.setOption(option, true); // Use true to clear previous state

                // Add click listener only if not already added
                if (!bookstoreTreemap._handlers || !bookstoreTreemap._handlers.click) {
                     bookstoreTreemap.on('click', function(params) {
                        if (currentCategory === null && params.data.id && completeDataSet[params.data.id]) {
                            currentCategory = params.data.id;
                            fetchAndDrawTreemap(false); // Redraw with detailed view
                            if(backButton) backButton.style.display = 'block';
                        }
                     });
                }

            })
            .catch(error => {
                console.error('加载面积数据失败:', error);
                container.innerHTML = '<div style="text-align:center;color:red;padding:20px;">加载数据失败，请刷新重试</div>';
            });
    }

    // Define the option configuration function
    function getTreemapOption(dataToShow) {
         return {
             tooltip: {
                 formatter: function(params) {
                     const data = params.data;
                     if (!data) return '';
                     if (data.name.includes('座')) { // Category level
                         return `${data.name}<br/>总面积: ${data.value?.toFixed(1) ?? 'N/A'}㎡`;
                     } else { // Detail level
                         return `${data.name || '未知书房'}<br/>面积: ${data.value?.toFixed(1) ?? 'N/A'}㎡<br/>辖区: ${data.district || '未知'}`;
                     }
                 }
             },
             series: [{
                 type: 'treemap',
                 data: dataToShow,
                 roam: false,
                 width: '100%', height: '100%',
                 left: 0, top: 0, right: 0, bottom: 0,
                 itemStyle: { borderWidth: 1, gapWidth: 1, borderColor: '#fff' },
                 label: {
                    show: true,
                    formatter: function(params) {
                        // Show name for categories or for individual items when zoomed
                         if (params.data.name.includes('座')) return params.data.name;
                         if (currentCategory !== null && params.data.value > 0) return params.data.name; // Show name in detail view if value > 0
                        return '';
                    },
                    fontSize: 14,
                    overflow: 'break',
                    color: '#fff', // White text for better contrast on colored blocks
                    textShadowBlur: 2,
                    textShadowColor: 'rgba(0, 0, 0, 0.5)'
                 },
                 upperLabel: { // Show category label prominently when not drilled down
                     show: currentCategory === null,
                     height: 30,
                     formatter: '{b}',
                     color: '#fff',
                     fontSize: 16,
                     textShadowBlur: 3,
                     textShadowColor: 'rgba(0, 0, 0, 0.7)'
                 },
                 breadcrumb: { show: false }, // Disable default breadcrumb
                 nodeClick: currentCategory !== null ? false : 'link', // Disable click in detail view
                 emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 0, shadowColor: 'rgba(0,0,0,0.3)' } },
                 layoutAnimation: true, animationDurationUpdate: 500
             }]
         };
    }

    createBackButton(); // Ensure button exists
    fetchAndDrawTreemap(true); // Initial draw

    window.addEventListener('resize', function() { bookstoreTreemap.resize(); });
}

// --- ECharts: District Distribution Chart ---
function initializeDistrictDistributionChart() {
    const container = document.getElementById('districtChart');
    if (!container || typeof echarts === 'undefined') return;

    const districtChart = echarts.init(container);

    fetch('static/js/行政区面积数量.json')
        .then(response => response.json())
        .then(data => {
            const districts = data.map(item => item.辖区);
            const bookroomCounts = data.map(item => item.bookroom_count || 0);
            const totalAreas = data.map(item => item.total_area || 0);
            const avgAreas = totalAreas.map((area, index) => bookroomCounts[index] > 0 ? (area / bookroomCounts[index]).toFixed(1) : '0.0');

            const sortedIndices = [...Array(districts.length).keys()].sort((a, b) => bookroomCounts[b] - bookroomCounts[a]);
            const sortedDistricts = sortedIndices.map(i => districts[i]);
            const sortedCounts = sortedIndices.map(i => bookroomCounts[i]);
            const sortedAreas = sortedIndices.map(i => totalAreas[i]);
            const sortedAvgAreas = sortedIndices.map(i => avgAreas[i]);

            const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
                    formatter: params => {
                        const districtName = params[0].name;
                        const index = sortedDistricts.indexOf(districtName);
                         if (index === -1) return ''; // Should not happen
                        return `${districtName}<br/>
                               书房数量: ${sortedCounts[index]}座<br/>
                               总面积: ${sortedAreas[index]?.toLocaleString() ?? 0} ㎡<br/>
                               平均面积: ${sortedAvgAreas[index]} ㎡/座`;
                    }
                 },
                legend: { data: ['书房数量（座）', '总面积(㎡)'], top: 'top' }, // Corrected legend name
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
                yAxis: { type: 'category', data: sortedDistricts, axisLabel: { interval: 0, rotate: 0 } },
                series: [
                    {
                        name: '书房数量（座）', type: 'bar', stack: '总量', // Stacking might not be desired here, consider removing stack
                        color: '#36A2EB',
                        label: { show: true, position: 'insideRight', formatter: '{c}座', color: '#fff', fontWeight: 'bold', textShadowBlur: 2, textShadowColor: 'rgba(0,0,0,0.5)' },
                        data: sortedCounts
                    },
                    {
                        name: '总面积(㎡)', type: 'bar', // Not stacked unless intended
                        color: '#FF9F40',
                        data: sortedAreas, // Show actual area on this axis if not stacking, or use a secondary axis
                        label: {
                             show: true, position: 'right',
                             formatter: params => `${params.value.toLocaleString()} ㎡`,
                             color: '#555', fontSize: 11
                        }
                    }
                ]
            };
            // If you want area on a secondary axis:
             // yAxis: [ { type: 'category', ... }, { type: 'value', name: '总面积 (㎡)', position: 'right', ... } ],
             // series[1].yAxisIndex = 1; // Assign the area series to the second y-axis

            districtChart.setOption(option);
            window.addEventListener('resize', function() { districtChart.resize(); });
        })
        .catch(error => {
             console.error('加载行政区数据失败:', error);
             container.innerHTML = '<div style="text-align:center;color:red;padding:20px;">加载数据失败，请刷新重试</div>';
        });
}

// --- ECharts: Population Charts ---
function initializePopulationCharts() {
    const popChartContainer = document.getElementById('populationChart');
    const perCapitaContainer = document.getElementById('perCapitaChart');
    if (!popChartContainer || !perCapitaContainer || typeof echarts === 'undefined') return;

    const populationChart = echarts.init(popChartContainer);
    const perCapitaChart = echarts.init(perCapitaContainer);

    Promise.all([
        fetch('static/js/行政区面积数量.json').then(res => res.ok ? res.json() : Promise.reject(`行政区面积数量.json: ${res.statusText}`)),
        fetch('static/js/人口面积.json').then(res => res.ok ? res.json() : Promise.reject(`人口面积.json: ${res.statusText}`))
    ])
    .then(([bookroomData, populationAreaData]) => {
        const combinedData = bookroomData.map(item => {
            let areaName = item.辖区 === "瀍河区" ? "瀍河回族区" : item.辖区; // Handle name difference
            const popData = populationAreaData[areaName];
             if (!popData) {
                 console.warn(`未找到 ${item.辖区} 的人口/面积数据`);
                 return { ...item, 人口: 0, 行政区面积: 0, bookroom_count: item.bookroom_count || 0, total_area: item.total_area || 0 };
             }
            return {
                 ...item,
                 人口: popData.常住人口 || 0,
                 行政区面积: popData.面积 || 0,
                 bookroom_count: item.bookroom_count || 0,
                 total_area: item.total_area || 0
             };
        }).filter(item => item.人口 > 0); // Filter out entries without population data

        // --- Population vs Bookroom Count Chart ---
        combinedData.sort((a, b) => b.人口 - a.人口); // Sort by population desc
        const populationOption = {
             tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
                 formatter: params => {
                     const data = combinedData.find(d => d.辖区 === params[0].name);
                     if (!data) return '';
                     return `${data.辖区}<br/>
                            人口: ${(data.人口 / 10000).toFixed(2)} 万人<br/>
                            书房数量: ${data.bookroom_count} 座<br/>
                            书房总面积: ${data.total_area.toLocaleString()} ㎡`;
                 }
            },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            legend: { data: ['人口', '书房数量'], bottom: '0' },
            xAxis: { type: 'category', data: combinedData.map(item => item.辖区), axisLabel: { rotate: 45, interval: 0 } },
            yAxis: [
                 { type: 'value', name: '人口（万人）', position: 'left', axisLine: { show: true, lineStyle: { color: '#5470C6' } }, axisLabel: { formatter: value => (value / 10000).toFixed(1) } },
                 { type: 'value', name: '书房数量（座）', position: 'right', min: 0, axisLine: { show: true, lineStyle: { color: '#91CC75' } }, splitLine:{ show: false } } // Hide split line for clarity
            ],
            series: [
                 { name: '人口', type: 'bar', barWidth: '40%', itemStyle: { color: '#5470C6' }, data: combinedData.map(item => item.人口) },
                 { name: '书房数量', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#91CC75' }, lineStyle: { width: 3 }, data: combinedData.map(item => item.bookroom_count) }
            ]
        };
        populationChart.setOption(populationOption);

        // --- Per Capita Resource Chart ---
        const perCapitaData = combinedData.map(item => {
            const popInTenThousands = item.人口 / 10000;
            const perTenThousandCount = popInTenThousands > 0 ? (item.bookroom_count / popInTenThousands) : 0;
            const perCapitaArea = popInTenThousands > 0 ? (item.total_area / popInTenThousands) : 0; // Area per 10k people
            return { name: item.辖区, perTenThousandCount, perCapitaArea };
        });
        perCapitaData.sort((a, b) => b.perCapitaArea - a.perCapitaArea); // Sort by per capita area desc

        const perCapitaOption = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
                 formatter: params => {
                     // Find original data based on name
                     const name = params[0].name;
                     const dataItem = perCapitaData.find(d => d.name === name);
                     if (!dataItem) return '';
                     return `${name}<br/>
                            每万人书房数: ${dataItem.perTenThousandCount.toFixed(2)} 座<br/>
                            每万人书房面积: ${dataItem.perCapitaArea.toFixed(2)} ㎡`;
                 }
            },
            legend: { data: ['每万人书房数', '每万人书房面积'], bottom: '0' },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'category', data: perCapitaData.map(item => item.name), axisLabel: { rotate: 45, interval: 0 } },
            yAxis: [
                 { type: 'value', name: '每万人书房数（座）', position: 'left', min: 0, axisLine: { show: true, lineStyle: { color: '#FC8452' } } },
                 { type: 'value', name: '每万人书房面积（㎡）', position: 'right', min: 0, axisLine: { show: true, lineStyle: { color: '#9A60B4' } }, splitLine:{ show: false } }
            ],
            series: [
                 { name: '每万人书房数', type: 'bar', barWidth: '40%', itemStyle: { color: '#FC8452' }, data: perCapitaData.map(item => item.perTenThousandCount) },
                 { name: '每万人书房面积', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#9A60B4' }, lineStyle: { width: 3 }, data: perCapitaData.map(item => item.perCapitaArea) }
            ]
        };
        perCapitaChart.setOption(perCapitaOption);

        // Resize listeners
        window.addEventListener('resize', function() {
            populationChart.resize();
            perCapitaChart.resize();
        });
    })
    .catch(error => {
        console.error('加载人口/书房数据失败:', error);
        if(popChartContainer) popChartContainer.innerHTML = '<div style="text-align:center;color:red;padding:20px;">图表数据加载失败</div>';
        if(perCapitaContainer) perCapitaContainer.innerHTML = '<div style="text-align:center;color:red;padding:20px;">图表数据加载失败</div>';
    });
}


// --- ECharts: Visitor/Borrowing Charts ---
function initializeVisitorBorrowingCharts() {
    const hourlyContainer = document.getElementById('hourlyChart');
    const dailyContainer = document.getElementById('dailyChart');
    const subjectContainer = document.getElementById('subjectChart');
    if (!hourlyContainer || !dailyContainer || !subjectContainer || typeof echarts === 'undefined') return;

    const hourlyChart = echarts.init(hourlyContainer);
    const dailyChart = echarts.init(dailyContainer);
    const subjectChart = echarts.init(subjectContainer);

    // --- Provided Data ---
    const hourlyTrendData = [ { "hour": 0, "average_visitors": 38 }, { "hour": 1, "average_visitors": 0 }, { "hour": 2, "average_visitors": 0 }, { "hour": 3, "average_visitors": 0 }, { "hour": 4, "average_visitors": 6 }, { "hour": 5, "average_visitors": 3 }, { "hour": 6, "average_visitors": 17 }, { "hour": 7, "average_visitors": 65 }, { "hour": 8, "average_visitors": 1409 }, { "hour": 9, "average_visitors": 1764 }, { "hour": 10, "average_visitors": 1662 }, { "hour": 11, "average_visitors": 1723 }, { "hour": 12, "average_visitors": 1478 }, { "hour": 13, "average_visitors": 1574 }, { "hour": 14, "average_visitors": 2083 }, { "hour": 15, "average_visitors": 1994 }, { "hour": 16, "average_visitors": 1946 }, { "hour": 17, "average_visitors": 1984 }, { "hour": 18, "average_visitors": 1787 }, { "hour": 19, "average_visitors": 1238 }, { "hour": 20, "average_visitors": 670 }, { "hour": 21, "average_visitors": 77 }, { "hour": 22, "average_visitors": 18 }, { "hour": 23, "average_visitors": 30 } ];
    const timeSeriesData = [ {date: '2025-03-13', visitors: 20989, dateType: "workday"}, {date: '2025-03-14', visitors: 21235, dateType: "workday"}, {date: '2025-03-15', visitors: 37727, dateType: "weekend"}, {date: '2025-03-16', visitors: 24645, dateType: "weekend"}, {date: '2025-03-17', visitors: 17373, dateType: "workday"}, {date: '2025-03-18', visitors: 16698, dateType: "workday"}, {date: '2025-03-19', visitors: 17561, dateType: "workday"}, {date: '2025-03-20', visitors: 17336, dateType: "workday"}, {date: '2025-03-21', visitors: 19477, dateType: "workday"}, {date: '2025-03-22', visitors: 38476, dateType: "weekend"}, {date: '2025-03-23', visitors: 24073, dateType: "weekend"}, {date: '2025-03-24', visitors: 16677, dateType: "workday"}, {date: '2025-03-25', visitors: 17549, dateType: "workday"}, {date: '2025-03-26', visitors: 16878, dateType: "workday"}, {date: '2025-03-27', visitors: 15368, dateType: "workday"}, {date: '2025-03-28', visitors: 17994, dateType: "workday"}, {date: '2025-03-29', visitors: 35560, dateType: "weekend"}, {date: '2025-03-30', visitors: 22333, dateType: "weekend"}, {date: '2025-03-31', visitors: 15628, dateType: "workday"}, {date: '2025-04-01', visitors: 16180, dateType: "workday"}, {date: '2025-04-02', visitors: 15581, dateType: "workday"}, {date: '2025-04-03', visitors: 16356, dateType: "workday"}, {date: '2025-04-04', visitors: 30890, dateType: "holiday"} ];
    const subjectData = [ { "name": "文学", "borrowing_count": 10442367, "percentage": 61.13 }, { "name": "艺术", "borrowing_count": 1234651, "percentage": 7.23 }, { "name": "历史、地理", "borrowing_count": 996970, "percentage": 5.84 }, { "name": "文化、科学、教育、体育", "borrowing_count": 949105, "percentage": 5.56 }, { "name": "政治、法律", "borrowing_count": 876543, "percentage": 5.13 }, { "name": "经济", "borrowing_count": 745678, "percentage": 4.36 }, { "name": "语言、文字", "borrowing_count": 681075, "percentage": 3.99 }, { "name": "哲学、宗教", "borrowing_count": 615892, "percentage": 3.61 }, { "name": "医药、卫生", "borrowing_count": 543210, "percentage": 3.18 }, { "name": "农业科学", "borrowing_count": 432109, "percentage": 2.53 }, { "name": "工业技术", "borrowing_count": 321098, "percentage": 1.88 }, { "name": "数理科学和化学", "borrowing_count": 210987, "percentage": 1.24 }, { "name": "自然科学总论", "borrowing_count": 176543, "percentage": 1.03 }, { "name": "天文学、地球科学", "borrowing_count": 154321, "percentage": 0.90 }, { "name": "生物科学", "borrowing_count": 132109, "percentage": 0.77 }, { "name": "马克思主义、列宁主义、毛泽东思想", "borrowing_count": 98765, "percentage": 0.58 }, { "name": "综合性图书", "borrowing_count": 76543, "percentage": 0.45 }, { "name": "交通运输", "borrowing_count": 65432, "percentage": 0.38 }, { "name": "航空、航天", "borrowing_count": 54321, "percentage": 0.32 }, { "name": "环境科学、安全科学", "borrowing_count": 43210, "percentage": 0.25 }, { "name": "军事", "borrowing_count": 32109, "percentage": 0.19 } ];
    // --- Hourly Chart Config ---
    const hourlyOption = {
        tooltip: { trigger: 'axis', formatter: params => `${params[0].axisValue}:00 - ${params[0].axisValue}:59<br/>平均客流量: ${params[0].value?.toLocaleString() ?? 0} 人次` },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: hourlyTrendData.map(item => item.hour), name: '小时', axisLabel: { formatter: '{value}:00' } },
        yAxis: { type: 'value', name: '平均客流量（人次）' },
        series: [{ name: '平均客流量', type: 'line', smooth: true, data: hourlyTrendData.map(item => item.average_visitors), itemStyle: { color: '#4CAF50' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(76, 175, 80, 0.6)' }, { offset: 1, color: 'rgba(76, 175, 80, 0.1)' }] } } }]
    };
    hourlyChart.setOption(hourlyOption);

    // --- Daily Chart Config ---
    const dateTypeColors = { "workday": "#2196F3", "weekend": "#FF9800", "holiday": "#E91E63" };
    const dailyOption = {
        tooltip: { trigger: 'axis', formatter: params => {
            const item = timeSeriesData.find(i => i.date === params[0].name);
            let dateTypeText = '';
            if (item) {
                 if (item.dateType === "weekend") dateTypeText = '<br/><span style="color:#FF9800">周末</span>';
                 else if (item.dateType === "holiday") dateTypeText = '<br/><span style="color:#E91E63">节假日</span>';
            }
            return `日期: ${params[0].name}<br/>客流量: ${params[0].value?.toLocaleString() ?? 0} 人次${dateTypeText}`;
         }},
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', data: timeSeriesData.map(item => item.date), name: '日期', axisLabel: { rotate: 45, interval: 'auto' } }, // Use auto interval
        yAxis: { type: 'value', name: '客流量（人次）' },
        series: [{ name: '客流量', type: 'bar', data: timeSeriesData.map(item => ({ value: item.visitors, itemStyle: { color: dateTypeColors[item.dateType] || '#cccccc' } })), emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }],
        legend: { data: [ {name: '工作日', itemStyle: {color: dateTypeColors.workday}}, {name: '周末', itemStyle: {color: dateTypeColors.weekend}}, {name: '节假日', itemStyle: {color: dateTypeColors.holiday}} ], bottom: 0, itemWidth: 15, itemHeight: 10, textStyle: { fontSize: 12 } }
    };
    dailyChart.setOption(dailyOption);

    // --- Subject Chart Config ---
    const topSubjects = subjectData.slice(0, 10);
    const otherSubjects = subjectData.slice(10);
    let otherPercentage = otherSubjects.reduce((sum, item) => sum + (item.percentage || 0), 0);
    let otherCount = otherSubjects.reduce((sum, item) => sum + (item.borrowing_count || 0), 0);
    const pieData = topSubjects.map(item => ({ name: item.name, value: item.percentage || 0, borrowing_count: item.borrowing_count || 0 }));
    if (otherPercentage > 0) { pieData.push({ name: '其他', value: Number(otherPercentage.toFixed(2)), borrowing_count: otherCount }); }

    const subjectOption = {
         tooltip: { trigger: 'item', formatter: params => `${params.seriesName}<br/>${params.name}: ${params.data.borrowing_count?.toLocaleString() ?? 0} 本<br/>占比: ${params.value?.toFixed(2) ?? 0}%` },
         
         series: [{ name: '借阅分类', type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'], // Adjusted center
             avoidLabelOverlap: false,
             label: { show: true, formatter: '{b}\n{d}%', position: 'outside', // Show percentage
                fontSize: 11, // Smaller font size
             },
             emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold', formatter: '{b}\n{d}%' } }, // Adjusted emphasis
             labelLine: { show: true, length: 8, length2: 10 }, // Shorter lines
             data: pieData }]
    };
    subjectChart.setOption(subjectOption);

    // Resize listeners
    window.addEventListener('resize', function() {
        hourlyChart.resize();
        dailyChart.resize();
        subjectChart.resize();
    });
}

// --- ECharts: Cost Charts ---
function initializeCostCharts() {
    const costStructureContainer = document.getElementById('costStructurePieChart');
    const midSizeContainer = document.getElementById('midSizeLibraryCostChart');
    const costTrendContainer = document.getElementById('costTrendEChart');
    if (typeof echarts === 'undefined') return;

    // Cost Structure Pie
    if (costStructureContainer) {
        const costChart = echarts.init(costStructureContainer);
        const costOption = {
            tooltip: { trigger: 'item', formatter: params => `${params.name}: ${params.value}% (${[1027, 1223, 2617, 1191][params.dataIndex]}万元)`, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: 8, padding: [10, 15], textStyle: { fontSize: 14, color: '#fff' } },
            legend: { show: true, orient: 'horizontal', top: 'bottom', itemWidth: 14, itemHeight: 14, data: ['房体建设成本', '基础设施', '智慧系统', '图书资源'] },
            series: [{ name: '成本构成', type: 'pie', radius: ['40%', '75%'], center: ['50%', '45%'], avoidLabelOverlap: true,
                data: [ {value: 16.9, name: '房体建设成本'}, {value: 20.2, name: '基础设施'}, {value: 43.2, name: '智慧系统'}, {value: 19.7, name: '图书资源'} ],
                label: { show: true, position: 'outside', formatter: '{b}\n{d}%', fontSize: 11 },
                labelLine: { show: true, length: 5, length2: 8 },
                emphasis: { scale: true, scaleSize: 10, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
                itemStyle: { borderWidth: 2, borderColor: '#fff', borderRadius: 5,
                    color: params => ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)'][params.dataIndex]
                }
            }]
        };
        costChart.setOption(costOption);
        window.addEventListener('resize', function() { costChart.resize(); });
        setTimeout(function() { costChart.resize(); }, 100); // Ensure render
    }

    // Mid-size Cost Pie
    if (midSizeContainer) {
        const midSizeCostChart = echarts.init(midSizeContainer);
        const categories = ['房体建设成本', '基础设施/装修/配套', '智慧系统', '图书资源 (初始)', '其他费用'];
        const avgPercentages = [32.5, 26.5, 27.5, 12.5, 1]; // Adjusted 'Other' slightly lower if total is 100
        const minAmounts = [40, 35, 35, 15, 5];
        const maxAmounts = [75, 65, 60, 30, 15]; // Corrected max amounts based on text
        const midSizeOption = {
             tooltip: { trigger: 'item', formatter: params => `${params.name}<br>占比: ${params.value}%<br>金额区间: ${minAmounts[params.dataIndex]}-${maxAmounts[params.dataIndex]}万元`, backgroundColor: 'rgba(50, 50, 50, 0.9)', borderRadius: 4, padding: [8, 12], textStyle: { color: '#fff', fontSize: 14 } },
             legend: { orient: 'vertical', left: 'left', top: 'center', itemGap: 10 },
             series: [{ name: '成本构成', type: 'pie', radius: ['45%', '70%'], center: ['60%', '50%'], avoidLabelOverlap: true,
                 itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                 label: { show: true, position: 'outside', formatter: '{b}\n{d}%', color: '#333', fontSize: 12, fontWeight: 'normal' },
                 labelLine: { show: true, length: 15, length2: 10, smooth: true },
                 data: avgPercentages.map((value, index) => ({ value: value, name: categories[index] })),
                 emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }, label: { show: true, fontSize: 14, fontWeight: 'bold' } }
            }]
        };
        midSizeCostChart.setOption(midSizeOption);
        window.addEventListener('resize', function() { midSizeCostChart.resize(); });
        setTimeout(function() { midSizeCostChart.resize(); }, 100);
    }

    // Cost Trend Line
    if (costTrendContainer) {
        const costTrendChart = echarts.init(costTrendContainer);
        const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2024']; // 2023 data missing
        const totalAmounts = [198.13, 8823.60, 6601.05, 3614.06, 499.12, 208.20, 120.00];
        const costTrendOption = {
            color: ['#4a7bff'],
            grid: { top: '12%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(50, 50, 50, 0.9)', borderRadius: 4, padding: [8, 12], formatter: params => `<div style="font-size:14px;color:#fff;font-weight:bold;margin-bottom:8px">${params[0].name}年</div><div style="font-size:13px;color:#fff">合同总金额：${params[0].value?.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0} 万元</div>`, axisPointer: { type: 'line', lineStyle: { color: '#4a7bff', type: 'dashed', width: 1 } } },
            xAxis: { type: 'category', data: years, axisTick: { alignWithLabel: true }, axisLine: { lineStyle: { color: '#999' } }, axisLabel: { color: '#333', fontSize: 12, formatter: '{value}年' } },
            yAxis: { type: 'value', name: '合同总金额（万元）', nameTextStyle: { color: '#666', padding: [0, 0, 0, 40] }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#ddd' } }, axisLabel: { color: '#666', formatter: value => { if (value >= 10000) return (value / 10000).toFixed(1) + '万'; return value.toLocaleString(); } } },
            series: [{ name: '年度合同总金额', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8, data: totalAmounts, z: 3,
                lineStyle: { width: 3, color: '#4a7bff', cap: 'round' }, itemStyle: { color: '#4a7bff', borderWidth: 2, borderColor: '#ffffff' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(74, 123, 255, 0.3)' }, { offset: 0.8, color: 'rgba(74, 123, 255, 0.05)' }]) },
                emphasis: { itemStyle: { borderWidth: 3, borderColor: '#ffffff' } },
                markLine: { silent: true, lineStyle: { color: '#999', type: 'dashed', width: 1 }, data: [{ type: 'average', name: '平均值', label: { position: 'middle', formatter: '平均: {c}', color: '#666', fontSize: 10 } }] },
                label: { show: false } // Labels were potentially cluttered, hiding by default
            }]
        };
        costTrendChart.setOption(costTrendOption);
        window.addEventListener('resize', function() { costTrendChart.resize(); });
        setTimeout(function() { costTrendChart.resize(); }, 100);
    }
}

// --- Feedback Charts (Plotly Heatmaps + ECharts Trend + Chart.js Detail) ---
function initializeFeedbackCharts() {
    // Plotly Heatmap: Department vs Category
    function createDeptCategoryHeatmap() {
        const container = document.getElementById('heatmap_container');
        if (!container || typeof Plotly === 'undefined') {
             console.error("Plotly heatmap container or Plotly library not found.");
             return;
        }
        const level1Categories = ['设施环境问题', '运营服务问题'];
        const departments = ['涧西区', '洛龙区', '瀍河区', '老城区', '西工区', '伊滨区', '孟津区', '文化广电和旅游局', '偃师区', '伊川县'];
        const zValues = [ [138, 161, 66, 40, 52, 23, 18, 6, 15, 10], [176, 132, 54, 45, 63, 32, 35, 78, 17, 21] ];
        const customColorScale = [ [0, 'rgb(255, 255, 220)'], [0.2, 'rgb(217, 240, 211)'], [0.4, 'rgb(173, 221, 208)'], [0.6, 'rgb(120, 198, 224)'], [0.8, 'rgb(49, 133, 189)'], [1, 'rgb(8, 29, 88)'] ];
        var data = [{ z: zValues, x: departments, y: level1Categories, type: 'heatmap', colorscale: customColorScale, showscale: true, hoverongaps: false, hoverlabel: { bgcolor: 'white', font: { size: 14 } }, hovertemplate: '<b>%{y}</b><br>%{x}: %{z}条<extra></extra>', colorbar: { title: '反馈量（条）', titleside: 'right' } }];
        var layout = { title: null, margin: { l: 120, r: 80, b: 100, t: 10, pad: 4 }, xaxis: { title: '', tickangle: -45, tickfont: { size: 12 } }, yaxis: { title: '', tickfont: { size: 12 } }, annotations: [] };
        const maxValue = Math.max(...zValues.flat());
        const midValue = maxValue * 0.6; // Adjust threshold for text color

        for (let i = 0; i < level1Categories.length; i++) {
            for (let j = 0; j < departments.length; j++) {
                const value = zValues[i][j];
                 if (value > 0) { // Only annotate non-zero values
                 }
            }
        }
        var config = { responsive: true, displayModeBar: false };
        Plotly.newPlot(container, data, layout, config);
        window.addEventListener('resize', function() { Plotly.relayout(container, { width: container.offsetWidth }); });
    }
    if (typeof Plotly !== 'undefined') { createDeptCategoryHeatmap(); } else { console.warn('Plotly not ready for dept heatmap.'); }

    // ECharts Trend Chart
    const trendChartDom = document.getElementById('feedbackMonthlyTrendChart');
    if (trendChartDom && typeof echarts !== 'undefined') {
        const feedbackChart = echarts.init(trendChartDom);
        const feedbackTrendData = { 'all': { years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 21], [19, 6, 21, 12, 15, 26, 23, 21, 19, 10, 13, 9], [13, 4, 7, 11, 18, 22, 28, 27, 5, 6, 12, 10], [20, 13, 10, 11, 14, 22, 38, 16, 15, 14, 17, 14], [24, 23, 15, 29, 18, 49, 71, 27, 20, 6, 16, 22], [17, 19, 14, 10, 19, 18, 39, 25, 11, 23, 9, 15], [22, 21, 18, 17, 18, 28, 36, 30, 17, 16, 11, 19], [19, 15, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '咨询': { years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10], [6, 6, 9, 3, 5, 9, 4, 9, 4, 2, 2, 4], [6, 2, 5, 6, 12, 10, 4, 7, 2, 5, 4, 5], [4, 3, 5, 5, 4, 4, 5, 13, 4, 4, 6, 4], [14, 11, 3, 14, 5, 12, 10, 2, 4, 4, 9, 14], [8, 11, 0, 3, 5, 3, 11, 6, 6, 9, 3, 5], [5, 5, 3, 1, 2, 10, 6, 6, 5, 3, 4, 2], [5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '建议': { years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 9], [7, 0, 5, 3, 7, 4, 12, 9, 8, 5, 7, 4], [4, 1, 2, 4, 3, 6, 8, 6, 0, 0, 4, 3], [5, 4, 3, 1, 0, 9, 12, 1, 1, 3, 1, 5], [7, 2, 8, 8, 6, 17, 18, 10, 6, 0, 3, 1], [1, 1, 5, 1, 2, 3, 11, 5, 0, 3, 1, 5], [8, 4, 5, 2, 3, 3, 7, 4, 2, 6, 1, 3], [4, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '投诉': { years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], [6, 0, 7, 6, 3, 13, 7, 3, 7, 3, 4, 1], [3, 1, 0, 1, 3, 6, 16, 14, 3, 1, 4, 2], [11, 6, 2, 5, 10, 9, 21, 2, 10, 7, 10, 5], [3, 10, 4, 7, 7, 20, 43, 15, 10, 2, 4, 7], [8, 7, 9, 6, 12, 12, 17, 14, 5, 11, 5, 5], [9, 12, 10, 14, 13, 15, 23, 20, 10, 7, 6, 14], [10, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] } };
        let currentScale = '月度'; // Default scale

        // --- Button Container ---
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'text-align: center; margin-bottom: 12px; display: flex; justify-content: center; gap: 10px;';
        trendChartDom.parentNode.insertBefore(buttonContainer, trendChartDom);
        const timeScales = ['月度', '季度', '年度'];
        timeScales.forEach(scale => {
            const button = document.createElement('button');
            button.textContent = scale + '趋势';
            button.dataset.scale = scale; // Store scale in data attribute
            button.style.cssText = 'padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; background-color: #f0f0f0; border: 1px solid #ddd;';
            if (scale === currentScale) {
                button.style.backgroundColor = '#1890ff'; button.style.color = 'white'; button.style.borderColor = '#1890ff';
            }
            button.addEventListener('click', () => {
                if (scale !== currentScale) {
                    currentScale = scale;
                    updateScaleButtons();
                    updateTrendChart();
                }
            });
            buttonContainer.appendChild(button);
        });

        function updateScaleButtons() {
            buttonContainer.querySelectorAll('button').forEach(btn => {
                 const isActive = btn.dataset.scale === currentScale;
                 btn.style.backgroundColor = isActive ? '#1890ff' : '#f0f0f0';
                 btn.style.color = isActive ? 'white' : 'black';
                 btn.style.borderColor = isActive ? '#1890ff' : '#ddd';
            });
        }

        // --- Data Processing Functions ---
        function flattenMonthlyData(dataObj) { const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; const allMonths = feedbackTrendData['all'].months; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); for (let j = 0; j < allMonths.length; j++) { if (year === 2025 && j >= 3) break; const monthLabel = `${year}-${(j + 1).toString().padStart(2, '0')}`; xAxisLabels.push(monthLabel); let value = 0; if (yearIndexInData !== -1 && dataObj.values[yearIndexInData]?.[j] !== undefined) { value = dataObj.values[yearIndexInData][j]; } seriesData.push(value); } } return { data: seriesData, labels: xAxisLabels }; }
        function flattenQuarterlyData(dataObj) { const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); for (let q = 0; q < 4; q++) { const startMonth = q * 3; const endMonth = startMonth + 2; if (year === 2025 && q > 0) break; let quarterTotal = 0; let hasDataInQuarter = false; if (yearIndexInData !== -1) { for (let m = startMonth; m <= endMonth; m++) { if (year === 2025 && m >= 3) break; if (dataObj.values[yearIndexInData]?.[m] !== undefined) { quarterTotal += dataObj.values[yearIndexInData][m]; hasDataInQuarter = true; } } } if (hasDataInQuarter || (year < 2025) || (year === 2025 && q === 0)) { xAxisLabels.push(`${year}-Q${q+1}`); seriesData.push(quarterTotal); } } } return { data: seriesData, labels: xAxisLabels }; }
        function flattenYearlyData(dataObj) { const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); let yearTotal = 0; let hasDataInYear = false; if (yearIndexInData !== -1) { const monthsToSum = (year === 2025) ? 3 : 12; for (let m = 0; m < monthsToSum; m++) { if (dataObj.values[yearIndexInData]?.[m] !== undefined) { yearTotal += dataObj.values[yearIndexInData][m]; hasDataInYear = true; } } } if (hasDataInYear) { xAxisLabels.push(`${year}`); seriesData.push(yearTotal); } } return { data: seriesData, labels: xAxisLabels }; }

        // --- Update Chart Function ---
        function updateTrendChart() {
            let allProcessed, consultationProcessed, suggestionProcessed, complaintProcessed, axisLabelFormatter;
            if (currentScale === '月度') { allProcessed = flattenMonthlyData(feedbackTrendData['all']); consultationProcessed = flattenMonthlyData(feedbackTrendData['咨询']); suggestionProcessed = flattenMonthlyData(feedbackTrendData['建议']); complaintProcessed = flattenMonthlyData(feedbackTrendData['投诉']); axisLabelFormatter = value => { const parts = value.split('-'); return parts[1] === '01' ? parts[0] : (['04', '07', '10'].includes(parts[1]) ? `Q${Math.ceil(parseInt(parts[1])/3)}` : ''); }; }
            else if (currentScale === '季度') { allProcessed = flattenQuarterlyData(feedbackTrendData['all']); consultationProcessed = flattenQuarterlyData(feedbackTrendData['咨询']); suggestionProcessed = flattenQuarterlyData(feedbackTrendData['建议']); complaintProcessed = flattenQuarterlyData(feedbackTrendData['投诉']); axisLabelFormatter = value => value; }
            else { allProcessed = flattenYearlyData(feedbackTrendData['all']); consultationProcessed = flattenYearlyData(feedbackTrendData['咨询']); suggestionProcessed = flattenYearlyData(feedbackTrendData['建议']); complaintProcessed = flattenYearlyData(feedbackTrendData['投诉']); axisLabelFormatter = value => value; }

            const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: { data: ['咨询', '建议', '投诉', '总量'], selected: { '咨询': true, '建议': true, '投诉': true, '总量': false }, top: 'bottom', inactiveColor: '#ccc' },
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: { type: 'category', boundaryGap: false, data: allProcessed.labels, axisLabel: { rotate: currentScale === '月度' ? 30 : 0, interval: 'auto', formatter: axisLabelFormatter }, axisTick: { alignWithLabel: true } },
                yAxis: { type: 'value', name: '反馈数量（条）', min: 0, axisLabel: { formatter: '{value}' } },
                dataZoom: [ { type: 'inside', start: 0, end: 100 }, { start: 0, end: 100, height: 25, bottom: '5%', handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', handleSize: '80%', handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 } } ],
                series: [ { name: '咨询', type: 'line', smooth: true, data: consultationProcessed.data, itemStyle: { color: '#5470C6' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } }, { name: '建议', type: 'line', smooth: true, data: suggestionProcessed.data, itemStyle: { color: '#91CC75' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } }, { name: '投诉', type: 'line', smooth: true, data: complaintProcessed.data, itemStyle: { color: '#EE6666' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } }, { name: '总量', type: 'line', smooth: true, data: allProcessed.data, itemStyle: { color: '#fac858' }, lineStyle: { width: 3, type: 'dashed' }, emphasis: { focus: 'series' } } ]
            };
            feedbackChart.setOption(option, true);
        }

        feedbackChart.on('legendselectchanged', function (params) { const isTotalSelected = params.selected['总量']; const clickedName = params.name; let newSelectedState = { ...params.selected }; if (clickedName === '总量') { if (isTotalSelected) { newSelectedState['咨询'] = false; newSelectedState['建议'] = false; newSelectedState['投诉'] = false; } else { newSelectedState['咨询'] = true; newSelectedState['建议'] = true; newSelectedState['投诉'] = true; } } else { const anyIndividualSelected = newSelectedState['咨询'] || newSelectedState['建议'] || newSelectedState['投诉']; if (anyIndividualSelected) { newSelectedState['总量'] = false; } } feedbackChart.setOption({ legend: { selected: newSelectedState } }); });
        window.addEventListener('resize', function () { feedbackChart.resize(); });
        updateTrendChart(); // Initial draw
        setTimeout(function() { feedbackChart.resize(); }, 200); // Ensure rendering
    } else { console.error("ECharts trend chart container or ECharts library not found."); }


   // Plotly Monthly Heatmap Function (Inside initializeFeedbackCharts)


    // Chart.js Detail Charts
    const level1Ctx = document.getElementById('level1FeedbackChart')?.getContext('2d');
    const level2Ctx = document.getElementById('level2FeedbackChart')?.getContext('2d');
    if (level1Ctx && level2Ctx && typeof Chart !== 'undefined') {
        // Level 1 Doughnut
        const level1Data = { labels: ['运营服务问题', '设施环境问题', '其他问题'], datasets: [{ label: '反馈数量', data: [789, 594, 56], backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(201, 203, 207, 0.7)'], borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(201, 203, 207, 1)'], borderWidth: 1 }] };
        new Chart(level1Ctx, { type: 'doughnut', data: level1Data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels:{ padding: 15 } }, tooltip: { callbacks: { label: ctx => { let l = ctx.label || ''; let v = ctx.raw || 0; let t = ctx.chart.getDatasetMeta(0).total || 1; let p = ((v / t) * 100).toFixed(1) + '%'; return `${l}: ${v}条 (${p})`; } } } }, cutout: '60%' } });

        // Level 2 Bar
        const categoryColors = { '运营服务': 'rgba(255, 159, 64, 0.7)', '设施环境': 'rgba(54, 162, 235, 0.7)' };
        const problemCategories = { '开放时间调整': '运营服务', '人员服务问题': '运营服务', '空间规划与选址': '设施环境', '噪音控制问题': '设施环境', '空调通风系统': '设施环境', '卫生设施问题': '设施环境', '物理设施损坏': '设施环境', '座位资源不足': '设施环境', '照明系统问题': '设施环境', '饮水设施问题': '设施环境' };
        const originalLabels = ['开放时间调整', '人员服务问题', '空间规划与选址', '噪音控制问题', '空调通风系统', '卫生设施问题', '物理设施损坏', '座位资源不足', '照明系统问题', '饮水设施问题'].reverse();
        const originalData = [409, 304, 300, 86, 75, 67, 49, 47, 26, 18].reverse();
        const backgroundColors = originalLabels.map(l => problemCategories[l] ? categoryColors[problemCategories[l]] : 'rgba(201, 203, 207, 0.7)');
        const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));
        const level2Data = { labels: originalLabels, datasets: [{ label: '反馈数量', data: originalData, backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 1 }] };
        new Chart(level2Ctx, { type: 'bar', data: level2Data, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${problemCategories[ctx.label] || '其他'}类: ${ctx.raw}条` } } }, scales: { x: { beginAtZero: true, title: { display: true, text: '反馈数量（条）' } }, y: { ticks: { font: { size: 11 } } } } } });
    } else { console.error("Chart.js canvas or Chart.js library not found for detail charts."); }
}


// --- ECharts: National Distribution Chart ---
function initializeNationalDistributionChart() {
    const container = document.getElementById('nationalDistributionChart');
    if (!container || typeof echarts === 'undefined') return;

    const nationalChart = echarts.init(container);
    const nationalDataRaw = [ { name: '浙江', value: 531, cities: [ {name: '温州', value: 172}, {name: '台州', value: 102}, {name: '绍兴', value: 75}, {name: '衢州', value: 42}, {name: '湖州', value: 35}, {name: '嘉兴', value: 31}, {name: '舟山', value: 21}, {name: '宁波', value: 18}, {name: '丽水', value: 14}, {name: '杭州', value: 12}, {name: '金华', value: 9} ]}, { name: '河南', value: 353, cities: [ {name: '洛阳', value: 204}, {name: '郑州', value: 89}, {name: '驻马店', value: 27}, {name: '开封', value: 22}, {name: '南阳', value: 8}, {name: '焦作', value: 3} ]}, { name: '广东', value: 233, cities: [ {name: '佛山', value: 188}, {name: '韶关', value: 35}, {name: '深圳', value: 10} ]}, { name: '山东', value: 232, cities: [ {name: '济南', value: 53}, {name: '淄博', value: 45}, {name: '威海', value: 44}, {name: '济宁', value: 37}, {name: '日照', value: 25}, {name: '临沂', value: 14}, {name: '菏泽', value: 14} ]}, { name: '江苏', value: 170, cities: [ {name: '苏州', value: 64}, {name: '扬州', value: 51}, {name: '常州', value: 41}, {name: '连云港', value: 9}, {name: '常熟', value: 5} ]}, { name: '安徽', value: 169, cities: [ {name: '合肥', value: 99}, {name: '芜湖', value: 46}, {name: '铜陵', value: 16}, {name: '淮北', value: 5}, {name: '滁州', value: 3} ]}, { name: '上海', value: 120, cities: [{name: '上海', value: 120}]}, { name: '湖北', value: 68, cities: [ {name: '武汉', value: 52}, {name: '孝感', value: 8}, {name: '黄冈', value: 6}, {name: '宜昌', value: 2} ]}, { name: '江西', value: 59, cities: [ {name: '南昌', value: 37}, {name: '九江', value: 20}, {name: '萍乡', value: 2} ]}, { name: '内蒙古', value: 58, cities: [{name: '呼和浩特', value: 58}]}, { name: '北京', value: 57, cities: [{name: '北京', value: 57}]}, { name: '河北', value: 38, cities: [ {name: '沧州', value: 19}, {name: '唐山', value: 13}, {name: '廊坊', value: 6} ]}, { name: '天津', value: 28, cities: [{name: '天津', value: 28}]}, { name: '重庆', value: 27, cities: [{name: '重庆', value: 27}]}, { name: '山西', value: 26, cities: [{name: '太原', value: 18}, {name: '晋中', value: 8}]} ];
    nationalDataRaw.sort((a, b) => b.value - a.value);
    const nationalData = nationalDataRaw.slice(0, 15); // Top 15 provinces

    function createProvinceOption() {
        return {
            title: { text: '全国城市书房分布 (Top 15省份)', left: 'center', top: 10, subtext: '点击省份条形图可查看省内城市分布', subtextStyle: { color: '#666', fontSize: 12 } },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c} 家' },
            grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
            xAxis: { type: 'value', boundaryGap: [0, 0.01], name: '数量 (家)', nameLocation: 'middle', nameGap: 25 },
            yAxis: { type: 'category', data: nationalData.map(item => item.name).reverse(), axisLabel: { interval: 0 } }, // Reversed for horizontal bar
            series: [{ name: '城市书房数量', type: 'bar', data: nationalData.map(item => item.value).reverse(), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#83bff6' }, { offset: 0.5, color: '#188df0' }, { offset: 1, color: '#188df0' }]) }, emphasis: { itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2378f7' }, { offset: 0.7, color: '#2378f7' }, { offset: 1, color: '#83bff6' }]) } } }]
        };
    }

    function createCityOption(province) {
        const cityData = nationalDataRaw.find(item => item.name === province)?.cities?.sort((a,b) => b.value - a.value) || [];
        return {
            title: { text: `${province}省城市书房分布`, left: 'center', top: 10 },
            tooltip: { trigger: 'item', formatter: '{b}: {c} 家 ({d}%)' },
            legend: { orient: 'vertical', right: 10, top: 'center', type: 'scroll', data: cityData.map(c => c.name)}, // Ensure legend data matches series data names
            series: [{
                name: '城市分布', type: 'pie', radius: ['40%', '70%'], center: ['50%', '55%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: true, formatter: '{b}\n{c}家 ({d}%)' },
                emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
                data: cityData // Data should be {name: ..., value: ...} format
            }]
        };
    }

    nationalChart.setOption(createProvinceOption());

    // Back button logic
    let backButton = null;
    function manageBackButton(show = false) {
        if (!backButton) {
            backButton = document.createElement('button');
            backButton.textContent = '返回省份分布';
            backButton.className = 'back-to-province';
            backButton.style.cssText = 'position: absolute; left: 20px; top: 15px; z-index: 100; padding: 8px 15px; background-color: #188df0; color: white; border: none; border-radius: 4px; cursor: pointer;';
            backButton.addEventListener('click', function() {
                nationalChart.setOption(createProvinceOption(), true); // Use true to merge options smoothly
                manageBackButton(false); // Hide button
            });
             // Append to parent of chart container for correct absolute positioning
             container.parentNode.style.position = 'relative'; // Ensure parent has relative positioning
             container.parentNode.appendChild(backButton);
        }
        backButton.style.display = show ? 'block' : 'none';
    }

    nationalChart.on('click', function(params) {
        if (params.componentType === 'series' && params.seriesType === 'bar') { // Check if it's a bar click (province level)
            const provinceName = params.name;
            const provinceData = nationalDataRaw.find(item => item.name === provinceName);
            if (provinceData?.cities?.length > 0) {
                nationalChart.setOption(createCityOption(provinceName), true); // Use true to merge
                manageBackButton(true); // Show back button
            }
        }
    });

    window.addEventListener('resize', function() { nationalChart.resize(); });
    setTimeout(function() { nationalChart.resize(); }, 200); // Ensure render
}


// ==================================
// Modal Logic Functions
// ==================================
function initializeLibraryModal() {
    const modal = document.getElementById('libraryModal');
    const closeButton = modal?.querySelector('.close-button');
    const libraryCards = document.querySelectorAll('.showcase-item.library-card');

    if (!modal || !closeButton || libraryCards.length === 0) {
        console.warn("Modal elements not found or no library cards present. Modal functionality disabled.");
        return;
    }

    const libraryDetails = {
        'shangyang': { name: "上阳宫城市书房", image: "static/picture/shangyang-library.jpg", features: "坐落于上阳宫文化园内，建筑风格与园区唐风遗韵巧妙融合，提供沉浸式历史文化阅读体验。（注：该书房目前正在进行搬迁升级，具体开放信息请关注官方公告）", stats: { "类型": "历史文脉型 / 景区融合", "原面积": "约 200 ㎡", "原座席": "约 60 个", "原藏书量": "约 7,000 册", "特色": "唐风古韵，环境典雅，文旅结合", "当前状态": "<strong style='color:orange;'>搬迁升级中</strong>" }, description: "作为历史文脉型书房的代表，原上阳宫城市书房不仅是一个阅读空间，更是体验唐代宫廷文化、感受古都魅力的窗口。它将阅读服务与历史文化景区有机结合，吸引了大量市民和游客。目前，该书房正在进行搬迁升级，期待未来以崭新的面貌重新服务读者，具体信息请以官方发布为准。" },
        'yirenfang': { name: "宜人坊城市书房 (洛龙区最大)", image: "static/picture/yiren-library.jpg", features: "由4S店改造升级，保留现代工业风设计，通过绿植与落地窗营造开放而静谧的阅读氛围。荣获河南省新型公共文化空间典型案例。", stats: { "类型": "空间改造共建型", "面积": "超 1000 ㎡", "座席": "150 余个", "藏书量": "配备 2 万余册", "开放时间": "自2019年开放 8:30-21:30" }, description: "宜人坊城市书房是洛阳探索“空间改造+社会参与”模式的杰出范例。它将闲置的大型商业空间巧妙转型为公共文化地标，不仅极大地拓展了阅读服务覆盖面，更以其独特的设计感、丰富的藏书和完善的便民设施（如水吧、儿童区），成为备受市民喜爱的“文化客厅”和社交空间。其成功经验为盘活城市存量资产、实现文化功能植入提供了宝贵借鉴。" },
        'community_park': { name: "伊川县西山植物园城市书房", image: "static/picture/yichuan-library.jpg", features: "嵌入风景优美的西山植物园中，环境宜人，将阅读与自然休闲完美结合，服务周边社区居民及公园游客。", stats: { "类型": "社区嵌入型 / 公园型", "面积": "105 ㎡", "座席": "42", "藏书量": "约 5,000-6,000 册 (标准配置)", "特色": "环境优美，亲近自然，服务社区及游客" }, description: "此类“小而美”的书房是“河洛书苑”网络的重要组成部分，它们如同散落在社区公园里的“文化珍珠”，将阅读的便利送到了市民的日常生活中。西山植物园书房充分利用了公园的优美环境，为市民和游客提供了一个可以在鸟语花香中休憩、阅读的宁静角落，体现了公共文化服务的人性化关怀和与城市绿色空间的融合。" }
    };

     // Cache modal elements for performance
     const modalName = document.getElementById('modal-library-name');
     const modalImage = document.getElementById('modal-library-image');
     const modalFeatures = document.getElementById('modal-library-features');
     const modalDescription = document.getElementById('modal-library-description');
     const modalStatsList = document.getElementById('modal-library-stats');

    libraryCards.forEach(card => {
        card.addEventListener('click', function() {
            const libraryId = this.getAttribute('data-library-id');
            const details = libraryDetails[libraryId];

            if (details && modalName && modalImage && modalFeatures && modalDescription && modalStatsList) {
                modalName.textContent = details.name;
                modalImage.src = details.image;
                modalImage.alt = details.name + " 图片";
                modalFeatures.textContent = details.features;
                modalDescription.textContent = details.description;

                // Populate stats
                modalStatsList.innerHTML = ''; // Clear previous stats
                if (details.stats) {
                    for (const key in details.stats) {
                        const li = document.createElement('li');
                        // Use textContent for safety, but innerHTML for the specific 'strong' tag case
                        li.innerHTML = `<i class="fas fa-check-circle" style="color:#28a745; margin-right: 8px; font-size: 0.9em;"></i><strong>${key}:</strong> ${details.stats[key]}`;
                         modalStatsList.appendChild(li);
                    }
                }

                // Show modal with animation
                modal.style.display = 'flex';
                // Force reflow before adding class
                void modal.offsetWidth;
                modal.classList.add('show');
            } else {
                console.error("Details not found for library ID:", libraryId, " or modal elements missing.");
            }
        });
    });

    function closeModal() {
        modal.classList.remove('show');
        // Wait for fade out animation before hiding completely
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Match the animation duration in CSS
    }

    closeButton.addEventListener('click', closeModal);

    // Close modal if clicking outside the content area
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });
}
