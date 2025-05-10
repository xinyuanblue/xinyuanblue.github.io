document.addEventListener('DOMContentLoaded', function() {

    // --- Language Switching ---
    initializeLanguageSwitch();

    // --- Map Fullscreen ---
    // Note: The button itself is in the HTML. This just provides the function if needed elsewhere.
    // The inline onclick/href might be sufficient.
    initializeMapFullscreenLogic();

    // --- Chart Initializations ---
    initializeBookstoreTreemap();
    initializeDistrictDistributionChart(); // Assuming this exists or will be added
    initializePopulationCharts(); // Assuming this exists or will be added
    initializeVisitorBorrowingCharts();
    initializeCostCharts(); // Assuming this exists or will be added
    initializeFeedbackCharts(); // Includes Plotly heatmap, ECharts trend, Plotly monthly heatmap, Chart.js detail
    initializeNationalDistributionChart();

    // --- Modal Logic (Library Showcase) ---
    initializeLibraryModal();

}); // End DOMContentLoaded


// ==================================
// Language Switching Functions
// ==================================
function initializeLanguageSwitch() {
    // Attempt to retrieve the saved language, default to 'zh' (Chinese) if not found
    const savedLang = localStorage.getItem('selectedLanguage') || 'zh';
    // Set the document's language attribute
    document.documentElement.lang = savedLang;
    // Find all language switching buttons
    const languageBtns = document.querySelectorAll('.language-switch button');

    // Function to update the visual state (active/inactive) of language buttons
    function updateButtonStates(activeLang) {
        languageBtns.forEach(btn => {
            if (btn.dataset.lang === activeLang) {
                btn.classList.add('active'); // Mark the active button
                btn.setAttribute('aria-pressed', 'true'); // Set ARIA state for accessibility
            } else {
                btn.classList.remove('active'); // Unmark inactive buttons
                btn.setAttribute('aria-pressed', 'false'); // Set ARIA state
            }
        });
    }

    // Add click event listeners to each language button
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang; // Get the language code from the button's data attribute
            // If the clicked language is already active, do nothing
            if (document.documentElement.lang === lang) return;

            // Update the document's language
            document.documentElement.lang = lang;
            // Try to save the selected language to local storage
            try {
                localStorage.setItem('selectedLanguage', lang);
            } catch (e) {
                console.error("无法保存语言设置到LocalStorage:", e); // Log error if saving fails
            }
            // Update the visual state of the buttons
            updateButtonStates(lang);

            // Trigger the translation function (assumed to be defined in translations.js)
            if (typeof translatePage === 'function') {
                // Use a small delay to allow potential DOM updates from class changes
                setTimeout(() => translatePage(lang), 50);
            } else {
                // Log an error if the translation function isn't found
                console.error('translatePage function not found. Make sure translations.js is loaded correctly.');
            }
            // Dispatch a custom event that other parts of the page might listen to
            document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
        });
    });

    // Set the initial state of the buttons based on the loaded language
    updateButtonStates(savedLang);
    // Apply the initial translation when the page loads
    if (typeof translatePage === 'function') {
        translatePage(savedLang);
    } else {
        console.error('translatePage function not found for initial load.');
    }
}

// ==================================
// Map Fullscreen Functions (Optional, if needed beyond inline button)
// ==================================
function initializeMapFullscreenLogic() {
    // Function to toggle fullscreen for an element by its ID
    // Make it global (window.toggleFullScreen) if called directly from inline HTML (onclick)
    window.toggleFullScreen = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error("Element with ID '" + elementId + "' not found for fullscreen.");
            return;
        }

        // Check if currently in fullscreen mode (considering vendor prefixes)
        if (!document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement) {
            // --- Enter fullscreen ---
            if (element.requestFullscreen) { element.requestFullscreen(); } // Standard
            else if (element.msRequestFullscreen) { element.msRequestFullscreen(); } // IE/Edge
            else if (element.mozRequestFullScreen) { element.mozRequestFullScreen(); } // Firefox
            else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT); } // Chrome/Safari/Opera
        } else {
            // --- Exit fullscreen ---
            if (document.exitFullscreen) { document.exitFullscreen(); } // Standard
            else if (document.msExitFullscreen) { document.msExitFullscreen(); } // IE/Edge
            else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); } // Firefox
            else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); } // Chrome/Safari/Opera
        }
    }

    // Function to update the icon on a fullscreen button (if one exists with the specified structure)
    function updateFullscreenButtonIcon() {
        // Adjust the selector if your button/icon structure is different
        const buttonIcon = document.querySelector('.fullscreen-button i');
        if (buttonIcon) {
            // Check if currently in fullscreen mode
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                // Change icon to 'compress' (exit fullscreen symbol)
                buttonIcon.className = 'fas fa-compress';
            } else {
                // Change icon back to 'expand' (enter fullscreen symbol)
                buttonIcon.className = 'fas fa-expand';
            }
        }
    }

    // Listen for changes in fullscreen state across different browsers
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
    // Exit if the container doesn't exist or ECharts library isn't loaded
    if (!container || typeof echarts === 'undefined') return;

    const bookstoreTreemap = echarts.init(container, null, { renderer: 'canvas' });
    let currentCategory = null; // Stores the currently drilled-down category (null for top level)
    let backButton = null; // Reference to the dynamically created back button

    // Function to create the 'Back' button if it doesn't exist
    function createBackButton() {
        if (!backButton) {
            backButton = document.createElement('button');
            backButton.textContent = '返回书房类型总览'; // Button text
         // 修改位置为右下角
         backButton.style.cssText = 'position: absolute; top: 100px; right: 0; z-index: 1000; padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px 0 0 0; cursor: pointer; display: none;'; // Initially hidden
         container.parentNode.appendChild(backButton);
            // Add click listener to the back button
            backButton.addEventListener('click', function() {
                // Only act if we are in a drilled-down state
                if (currentCategory !== null) {
                    fetchAndDrawTreemap(true); // Redraw the treemap resetting to the top level
                    this.style.display = 'none'; // Hide the back button
                    currentCategory = null; // Reset the drill-down state
                }
            });
        }
    }

    // Function to fetch data and draw/update the treemap chart
    function fetchAndDrawTreemap(resetView = false) {
        fetch('static/js/面积.json') // Fetch the area data
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // Process fetched data: group by type and calculate total areas
                const groupedData = { '小型书房': [], '中型书房': [], '大型书房': [], '特大型书房': [] };
                const totalAreas = {};

                data.forEach(item => {
                    const type = item.书房类型;
                    if (groupedData.hasOwnProperty(type)) {
                        groupedData[type].push(item); // Add item to its category array
                    } else {
                        console.warn("Unknown bookstore type:", type); // Log unexpected types
                    }
                });

                // Calculate total area for each category
                Object.keys(groupedData).forEach(type => {
                    totalAreas[type] = groupedData[type].reduce((sum, item) => sum + (item.面积 || 0), 0);
                });

                // Prepare the data structure for the top-level ECharts treemap view
                const initialTreemapData = [
                    { name: `小型书房 (${groupedData['小型书房'].length}座)`, value: totalAreas['小型书房'], itemStyle: { color: '#FF9F40' }, id: '小型书房' },
                    { name: `中型书房 (${groupedData['中型书房'].length}座)`, value: totalAreas['中型书房'], itemStyle: { color: '#36A2EB' }, id: '中型书房' },
                    { name: `大型书房 (${groupedData['大型书房'].length}座)`, value: totalAreas['大型书房'], itemStyle: { color: '#4BC0C0' }, id: '大型书房' },
                    { name: `特大型书房 (${groupedData['特大型书房'].length}座)`, value: totalAreas['特大型书房'], itemStyle: { color: '#9966FF' }, id: '特大型书房' }
                ];

                // Prepare the data structure for the detailed (drill-down) view
                const completeDataSet = {};
                Object.keys(groupedData).forEach(type => {
                    completeDataSet[type] = {
                        name: initialTreemapData.find(d => d.id === type)?.name || type, // Get category name
                        value: totalAreas[type], // Total area for the category
                        itemStyle: initialTreemapData.find(d => d.id === type)?.itemStyle || {}, // Category color
                        children: groupedData[type].map(item => ({ // Individual bookstores as children
                            name: item.名称,
                            value: item.面积 || 0,
                            district: item.辖区 || 'N/A',
                            itemStyle: { color: initialTreemapData.find(d => d.id === type)?.itemStyle?.color || '#ccc' } // Use category color
                        }))
                    };
                });

                // Determine which data to display based on the current view state
                const displayData = resetView || currentCategory === null
                    ? initialTreemapData // Show top-level view if resetting or at top level
                    : (completeDataSet[currentCategory] ? [completeDataSet[currentCategory]] : initialTreemapData); // Show detailed view for the selected category

                // Get the ECharts option configuration
                const option = getTreemapOption(displayData);
                // Set the option, clearing the previous state
                bookstoreTreemap.setOption(option, true);

                // Add the click listener for drill-down, only if it hasn't been added before
                if (!bookstoreTreemap._handlers || !bookstoreTreemap._handlers.click) {
                    bookstoreTreemap.on('click', function(params) {
                        // Check if clicking on a top-level category block
                        if (currentCategory === null && params.data.id && completeDataSet[params.data.id]) {
                            currentCategory = params.data.id; // Set the current category for drill-down
                            fetchAndDrawTreemap(false); // Redraw the chart with the detailed view
                            if (backButton) backButton.style.display = 'block'; // Show the back button
                        }
                    });
                }

            })
            .catch(error => {
                console.error('加载面积数据失败:', error);
                container.innerHTML = '<div style="text-align:center;color:red;padding:20px;">加载数据失败，请刷新重试</div>'; // Display error in the container
            });
    }

    // Function to generate the ECharts option object for the treemap
    function getTreemapOption(dataToShow) {
        return {
            tooltip: {
                // Custom tooltip formatter
                formatter: function(params) {
                    const data = params.data;
                    if (!data) return '';
                    if (data.name.includes('座')) { // Tooltip for category level
                        return `${data.name}<br/>总面积: ${data.value?.toFixed(1) ?? 'N/A'}㎡`;
                    } else { // Tooltip for detail level (individual bookstore)
                        return `${data.name || '未知书房'}<br/>面积: ${data.value?.toFixed(1) ?? 'N/A'}㎡<br/>辖区: ${data.district || '未知'}`;
                    }
                }
            },
            series: [{
                type: 'treemap',
                data: dataToShow, // The data to display (top level or detailed)
                roam: false, // Disable zooming/panning
                // Layout settings
                width: '100%', height: '100%',
                left: 0, top: 0, right: 0, bottom: 0,
                // Style for each block
                itemStyle: { borderWidth: 1, gapWidth: 1, borderColor: '#fff' },
                // Label configuration inside the blocks
                label: {
                    show: true,
                    formatter: function(params) {
                        // Show category name or individual name when drilled down
                        if (params.data.name.includes('座')) return params.data.name;
                        if (currentCategory !== null && params.data.value > 0) return params.data.name;
                        return ''; // Hide labels for small items in top view
                    },
                    fontSize: 14,
                    overflow: 'break', // Allow text wrapping
                    color: '#fff', // White text for contrast
                    textShadowBlur: 2,
                    textShadowColor: 'rgba(0, 0, 0, 0.5)' // Text shadow for readability
                },
                // Label configuration for the top level (appears above blocks when not drilled down)
                upperLabel: {
                    show: currentCategory === null, // Only show when at the top level
                    height: 30,
                    formatter: '{b}', // Display block name (category name)
                    color: '#fff',
                    fontSize: 16,
                    textShadowBlur: 3,
                    textShadowColor: 'rgba(0, 0, 0, 0.7)'
                },
                breadcrumb: { show: false }, // Disable the default ECharts breadcrumb trail
                nodeClick: currentCategory !== null ? false : 'link', // Disable clicking when drilled down
                emphasis: { // Style on hover
                    itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 0, shadowColor: 'rgba(0,0,0,0.3)' }
                },
                layoutAnimation: true, // Enable layout animation
                animationDurationUpdate: 500 // Animation speed
            }]
        };
    }

    // Ensure the back button is created
    createBackButton();
    // Perform the initial fetch and draw of the treemap (top-level view)
    fetchAndDrawTreemap(true);

    // Add resize listener for responsiveness
    window.addEventListener('resize', function() { bookstoreTreemap.resize(); });
}


// --- ECharts: District Distribution Chart ---
// (Placeholder: Assuming this function exists elsewhere or will be added based on previous context)
function initializeDistrictDistributionChart() {
    // ... implementation from previous context ...
    const container = document.getElementById('districtChart');
    if (!container || typeof echarts === 'undefined') return;
    // ... rest of the function ...
}

// --- ECharts: Population Charts ---
// (Placeholder: Assuming this function exists elsewhere or will be added based on previous context)
function initializePopulationCharts() {
    // ... implementation from previous context ...
    const popChartContainer = document.getElementById('populationChart');
    const perCapitaContainer = document.getElementById('perCapitaChart');
    if (!popChartContainer || !perCapitaContainer || typeof echarts === 'undefined') return;
    // ... rest of the function ...
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

    // --- Provided Data (Inline for simplicity in this example) ---
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
                 // No special text needed for workday
            }
            return `日期: ${params[0].name}<br/>客流量: ${params[0].value?.toLocaleString() ?? 0} 人次${dateTypeText}`;
         }},
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', data: timeSeriesData.map(item => item.date), name: '日期', axisLabel: { rotate: 45, interval: 'auto' } },
        yAxis: { type: 'value', name: '客流量（人次）' },
        series: [{
            name: '客流量',
            type: 'bar',
            data: timeSeriesData.map(item => ({
                value: item.visitors,
                itemStyle: { color: dateTypeColors[item.dateType] || '#cccccc' } // Default color if type unknown
            })),
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }],
        // Custom legend to show date types
        legend: {
            data: [
                {name: '工作日', itemStyle: {color: dateTypeColors.workday}},
                {name: '周末', itemStyle: {color: dateTypeColors.weekend}},
                {name: '节假日', itemStyle: {color: dateTypeColors.holiday}}
            ],
            bottom: 0, itemWidth: 15, itemHeight: 10, textStyle: { fontSize: 12 }
        }
    };
    dailyChart.setOption(dailyOption);

    // --- Subject Chart Config (Borrowing Preferences) ---
    // Process subject data for pie chart
    const topSubjects = subjectData.slice(0, 10); // Show top 10 categories individually
    const otherSubjects = subjectData.slice(10);
    let otherPercentage = otherSubjects.reduce((sum, item) => sum + (item.percentage || 0), 0);
    let otherCount = otherSubjects.reduce((sum, item) => sum + (item.borrowing_count || 0), 0);
    // Prepare data for ECharts pie series
    const pieData = topSubjects.map(item => ({
        name: item.name,
        value: item.percentage || 0,
        borrowing_count: item.borrowing_count || 0 // Store count for tooltip
    }));
    // Add an 'Other' category if there are remaining subjects
    if (otherPercentage > 0) {
        pieData.push({
            name: '其他',
            value: Number(otherPercentage.toFixed(2)), // Format percentage
            borrowing_count: otherCount
        });
    }

    const subjectOption = {
        tooltip: {
            trigger: 'item',
            // Custom tooltip formatter
            formatter: params => `${params.seriesName}<br/>${params.name}: ${params.data.borrowing_count?.toLocaleString() ?? 0} 本<br/>占比: ${params.value?.toFixed(2) ?? 0}%`
        },
        // No legend needed if labels are shown on the pie
        // legend: { orient: 'vertical', left: 'left', data: pieData.map(item => item.name) },
        series: [{
            name: '借阅分类',
            type: 'pie',
            radius: ['40%', '70%'], // Make it a doughnut chart
            center: ['50%', '50%'], // Center the chart
            avoidLabelOverlap: false,
            label: { // Configure labels outside the pie
                show: true,
                formatter: '{b}\n{d}%', // Show name and percentage
                position: 'outside',
                fontSize: 11, // Slightly smaller font size
            },
            emphasis: { // Style on hover
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: '{b}\n{d}%' // Show details prominently on hover
                }
            },
            labelLine: { // Configure the lines connecting labels to slices
                show: true,
                length: 8, // Length of the first segment
                length2: 10 // Length of the second segment
            },
            data: pieData // Assign the processed data
        }]
    };
    subjectChart.setOption(subjectOption);

    // Add resize listeners for all charts in this group
    window.addEventListener('resize', function() {
        hourlyChart.resize();
        dailyChart.resize();
        subjectChart.resize();
    });
}

// --- ECharts: Cost Charts ---
// (Placeholder: Assuming this function exists elsewhere or will be added based on previous context)
function initializeCostCharts() {
    // ... implementation from previous context ...
    const midSizeContainer = document.getElementById('midSizeLibraryCostChart');
    // ... Note: The other cost charts ('costStructurePieChart', 'costTrendEChart')
    //     were commented out in the provided script.js, assuming they are not
    //     needed or initialized elsewhere. If they are needed, ensure their
    //     containers exist and uncomment/implement their initialization here.
    if (midSizeContainer && typeof echarts !== 'undefined') {
       // ... rest of the mid-size chart implementation ...
    }
    // ... initialize other cost charts if needed ...
}

// --- Feedback Charts (Combined initialization) ---
function initializeFeedbackCharts() {
    // Check for Plotly library before initializing Plotly charts
    if (typeof Plotly === 'undefined') {
        console.error("Plotly library not found. Feedback heatmaps will not be initialized.");
    } else {
        // Plotly Heatmap: Department vs Category
        createDeptCategoryHeatmap();
        // Plotly Monthly Heatmap (Initialization likely happens inline in HTML or via separate call)
        // If createMonthlyHeatmap is defined globally or imported, call it here:
        // if (typeof createMonthlyHeatmap === 'function') {
        //     const initialType = document.getElementById('feedback-type-selector')?.value || 'all';
        //     createMonthlyHeatmap(initialType);
        // }
    }

    // Check for ECharts library before initializing ECharts charts
    if (typeof echarts === 'undefined') {
        console.error("ECharts library not found. Feedback trend chart will not be initialized.");
    } else {
        // ECharts Trend Chart
        createFeedbackTrendChart();
    }

    // Check for Chart.js library before initializing Chart.js charts
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not found. Feedback detail charts will not be initialized.");
    } else {
        // Chart.js Detail Charts (Level 1 Doughnut, Level 2 Bar)
        createFeedbackDetailCharts();
    }

    // --- Plotly Heatmap: Department vs Category ---
    function createDeptCategoryHeatmap() {
        const container = document.getElementById('heatmap_container');
        // Exit if container not found
        if (!container) {
            console.error("Plotly heatmap container (#heatmap_container) not found.");
            return;
        }
        // Define data for the heatmap
        const level1Categories = ['设施环境问题', '运营服务问题'];
        const departments = ['涧西区', '洛龙区', '瀍河区', '老城区', '西工区', '伊滨区', '孟津区', '文化广电和旅游局', '偃师区', '伊川县'];
        const zValues = [ [138, 161, 66, 40, 52, 23, 18, 6, 15, 10], [176, 132, 54, 45, 63, 32, 35, 78, 17, 21] ]; // Feedback counts
        // Define a custom color scale (example: light yellow to dark blue)
        const customColorScale = [ [0, 'rgb(255, 255, 220)'], [0.2, 'rgb(217, 240, 211)'], [0.4, 'rgb(173, 221, 208)'], [0.6, 'rgb(120, 198, 224)'], [0.8, 'rgb(49, 133, 189)'], [1, 'rgb(8, 29, 88)'] ];

        var data = [{
            z: zValues,
            x: departments,
            y: level1Categories,
            type: 'heatmap',
            colorscale: customColorScale,
            showscale: true, // Show the color bar legend
            hoverongaps: false, // Don't show tooltips for empty cells
            hoverlabel: { bgcolor: 'white', font: { size: 14 } }, // Tooltip style
            hovertemplate: '<b>%{y}</b><br>%{x}: %{z}条<extra></extra>', // Tooltip content format
            colorbar: { title: '反馈量（条）', titleside: 'right' } // Color bar title
        }];

        var layout = {
            title: null, // No main title needed
            margin: { l: 120, r: 80, b: 100, t: 10, pad: 4 }, // Adjust margins
            xaxis: { title: '', tickangle: -45, tickfont: { size: 12 } }, // X-axis labels (departments)
            yaxis: { title: '', tickfont: { size: 12 } }, // Y-axis labels (categories)
            annotations: [] // Placeholder for potential text annotations on cells
        };

        // (Optional: Add text annotations inside cells - removed for clarity as per previous version)

        var config = { responsive: true, displayModeBar: false }; // Make responsive, hide mode bar
        Plotly.newPlot(container, data, layout, config); // Draw the chart
        // Add resize listener
        window.addEventListener('resize', function() { Plotly.relayout(container, { width: container.offsetWidth }); });
    }

    // --- ECharts Trend Chart ---
    function createFeedbackTrendChart() {
        const trendChartDom = document.getElementById('feedbackMonthlyTrendChart');
        // Exit if container not found
        if (!trendChartDom) {
            console.error("ECharts trend chart container (#feedbackMonthlyTrendChart) not found.");
            return;
        }
        const feedbackChart = echarts.init(trendChartDom);
        // Data for different feedback types (assuming this structure exists)
        const feedbackTrendData = { 'all': { years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 21], [19, 6, 21, 12, 15, 26, 23, 21, 19, 10, 13, 9], [13, 4, 7, 11, 18, 22, 28, 27, 5, 6, 12, 10], [20, 13, 10, 11, 14, 22, 38, 16, 15, 14, 17, 14], [24, 23, 15, 29, 18, 49, 71, 27, 20, 6, 16, 22], [17, 19, 14, 10, 19, 18, 39, 25, 11, 23, 9, 15], [22, 21, 18, 17, 18, 28, 36, 30, 17, 16, 11, 19], [19, 15, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '咨询': { years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10], [6, 6, 9, 3, 5, 9, 4, 9, 4, 2, 2, 4], [6, 2, 5, 6, 12, 10, 4, 7, 2, 5, 4, 5], [4, 3, 5, 5, 4, 4, 5, 13, 4, 4, 6, 4], [14, 11, 3, 14, 5, 12, 10, 2, 4, 4, 9, 14], [8, 11, 0, 3, 5, 3, 11, 6, 6, 9, 3, 5], [5, 5, 3, 1, 2, 10, 6, 6, 5, 3, 4, 2], [5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '建议': { years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 9], [7, 0, 5, 3, 7, 4, 12, 9, 8, 5, 7, 4], [4, 1, 2, 4, 3, 6, 8, 6, 0, 0, 4, 3], [5, 4, 3, 1, 0, 9, 12, 1, 1, 3, 1, 5], [7, 2, 8, 8, 6, 17, 18, 10, 6, 0, 3, 1], [1, 1, 5, 1, 2, 3, 11, 5, 0, 3, 1, 5], [8, 4, 5, 2, 3, 3, 7, 4, 2, 6, 1, 3], [4, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] }, '投诉': { years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], values: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], [6, 0, 7, 6, 3, 13, 7, 3, 7, 3, 4, 1], [3, 1, 0, 1, 3, 6, 16, 14, 3, 1, 4, 2], [11, 6, 2, 5, 10, 9, 21, 2, 10, 7, 10, 5], [3, 10, 4, 7, 7, 20, 43, 15, 10, 2, 4, 7], [8, 7, 9, 6, 12, 12, 17, 14, 5, 11, 5, 5], [9, 12, 10, 14, 13, 15, 23, 20, 10, 7, 6, 14], [10, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0] ] } };
        let currentScale = '月度'; // Default time scale

        // Create buttons for changing time scale dynamically
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'text-align: center; margin-bottom: 12px; display: flex; justify-content: center; gap: 10px;';
        // Insert buttons before the chart container
        trendChartDom.parentNode.insertBefore(buttonContainer, trendChartDom);

        const timeScales = ['月度', '季度', '年度'];
        timeScales.forEach(scale => {
            const button = document.createElement('button');
            button.textContent = scale + '趋势';
            button.dataset.scale = scale; // Store scale in data attribute
            // Basic button styling
            button.style.cssText = 'padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; background-color: #f0f0f0; border: 1px solid #ddd;';
            // Highlight the default button
            if (scale === currentScale) {
                button.style.backgroundColor = '#1890ff'; button.style.color = 'white'; button.style.borderColor = '#1890ff';
            }
            // Add click listener to change scale and update chart
            button.addEventListener('click', () => {
                if (scale !== currentScale) {
                    currentScale = scale;
                    updateScaleButtons(); // Update button appearance
                    updateTrendChart(); // Redraw chart with new scale
                }
            });
            buttonContainer.appendChild(button);
        });

        // Function to update the active state appearance of scale buttons
        function updateScaleButtons() {
            buttonContainer.querySelectorAll('button').forEach(btn => {
                 const isActive = btn.dataset.scale === currentScale;
                 btn.style.backgroundColor = isActive ? '#1890ff' : '#f0f0f0';
                 btn.style.color = isActive ? 'white' : 'black';
                 btn.style.borderColor = isActive ? '#1890ff' : '#ddd';
            });
        }

        // --- Data Processing Functions (Flatten data for different scales) ---
        function flattenMonthlyData(dataObj) { /* ... implementation from previous context ... */ const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; const allMonths = feedbackTrendData['all'].months; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); for (let j = 0; j < allMonths.length; j++) { if (year === 2025 && j >= 3) break; const monthLabel = `${year}-${(j + 1).toString().padStart(2, '0')}`; xAxisLabels.push(monthLabel); let value = 0; if (yearIndexInData !== -1 && dataObj.values[yearIndexInData]?.[j] !== undefined) { value = dataObj.values[yearIndexInData][j]; } seriesData.push(value); } } return { data: seriesData, labels: xAxisLabels }; }
        function flattenQuarterlyData(dataObj) { /* ... implementation from previous context ... */ const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); for (let q = 0; q < 4; q++) { const startMonth = q * 3; const endMonth = startMonth + 2; if (year === 2025 && q > 0) break; let quarterTotal = 0; let hasDataInQuarter = false; if (yearIndexInData !== -1) { for (let m = startMonth; m <= endMonth; m++) { if (year === 2025 && m >= 3) break; if (dataObj.values[yearIndexInData]?.[m] !== undefined) { quarterTotal += dataObj.values[yearIndexInData][m]; hasDataInQuarter = true; } } } if (hasDataInQuarter || (year < 2025) || (year === 2025 && q === 0)) { xAxisLabels.push(`${year}-Q${q+1}`); seriesData.push(quarterTotal); } } } return { data: seriesData, labels: xAxisLabels }; }
        function flattenYearlyData(dataObj) { /* ... implementation from previous context ... */ const seriesData = []; const xAxisLabels = []; const allYears = feedbackTrendData['all'].years; for (let i = 0; i < allYears.length; i++) { const year = allYears[i]; const yearIndexInData = dataObj.years.indexOf(year); let yearTotal = 0; let hasDataInYear = false; if (yearIndexInData !== -1) { const monthsToSum = (year === 2025) ? 3 : 12; for (let m = 0; m < monthsToSum; m++) { if (dataObj.values[yearIndexInData]?.[m] !== undefined) { yearTotal += dataObj.values[yearIndexInData][m]; hasDataInYear = true; } } } if (hasDataInYear) { xAxisLabels.push(`${year}`); seriesData.push(yearTotal); } } return { data: seriesData, labels: xAxisLabels }; }

        // --- Function to Update and Redraw the Trend Chart ---
        function updateTrendChart() {
            let allProcessed, consultationProcessed, suggestionProcessed, complaintProcessed, axisLabelFormatter;

            // Process data based on the currently selected scale
            if (currentScale === '月度') {
                allProcessed = flattenMonthlyData(feedbackTrendData['all']);
                consultationProcessed = flattenMonthlyData(feedbackTrendData['咨询']);
                suggestionProcessed = flattenMonthlyData(feedbackTrendData['建议']);
                complaintProcessed = flattenMonthlyData(feedbackTrendData['投诉']);
                // Custom formatter for monthly axis labels (show year at start, quarters)
                axisLabelFormatter = value => { const parts = value.split('-'); return parts[1] === '01' ? parts[0] : (['04', '07', '10'].includes(parts[1]) ? `Q${Math.ceil(parseInt(parts[1])/3)}` : ''); };
            } else if (currentScale === '季度') {
                allProcessed = flattenQuarterlyData(feedbackTrendData['all']);
                consultationProcessed = flattenQuarterlyData(feedbackTrendData['咨询']);
                suggestionProcessed = flattenQuarterlyData(feedbackTrendData['建议']);
                complaintProcessed = flattenQuarterlyData(feedbackTrendData['投诉']);
                axisLabelFormatter = value => value; // Show 'YYYY-QX'
            } else { // 年度
                allProcessed = flattenYearlyData(feedbackTrendData['all']);
                consultationProcessed = flattenYearlyData(feedbackTrendData['咨询']);
                suggestionProcessed = flattenYearlyData(feedbackTrendData['建议']);
                complaintProcessed = flattenYearlyData(feedbackTrendData['投诉']);
                axisLabelFormatter = value => value; // Show 'YYYY'
            }

            // ECharts option configuration
            const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: {
                    data: ['咨询', '建议', '投诉', '总量'],
                    selected: { '咨询': true, '建议': true, '投诉': true, '总量': false }, // Default selection state
                    top: 'bottom',
                    inactiveColor: '#ccc' // Color for deselected legends
                },
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    boundaryGap: false, // Line chart starts from y-axis
                    data: allProcessed.labels, // Labels from processed data
                    axisLabel: {
                        rotate: currentScale === '月度' ? 30 : 0, // Rotate monthly labels
                        interval: 'auto', // Auto interval for labels
                        formatter: axisLabelFormatter // Apply custom label format
                    },
                    axisTick: { alignWithLabel: true }
                },
                yAxis: { type: 'value', name: '反馈数量（条）', min: 0, axisLabel: { formatter: '{value}' } },
                // Data zoom for scrolling/zooming through data
                dataZoom: [
                    { type: 'inside', start: 0, end: 100 }, // Inside scroll/zoom
                    { start: 0, end: 100, height: 25, bottom: '5%', handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', handleSize: '80%', handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 } } // Scrollbar style
                ],
                series: [ // Define the data series (lines)
                    { name: '咨询', type: 'line', smooth: true, data: consultationProcessed.data, itemStyle: { color: '#5470C6' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } },
                    { name: '建议', type: 'line', smooth: true, data: suggestionProcessed.data, itemStyle: { color: '#91CC75' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } },
                    { name: '投诉', type: 'line', smooth: true, data: complaintProcessed.data, itemStyle: { color: '#EE6666' }, lineStyle: { width: 2 }, emphasis: { focus: 'series' } },
                    { name: '总量', type: 'line', smooth: true, data: allProcessed.data, itemStyle: { color: '#fac858' }, lineStyle: { width: 3, type: 'dashed' }, emphasis: { focus: 'series' } } // Dashed line for total
                ]
            };
            // Apply the options to the chart, replacing previous options
            feedbackChart.setOption(option, true);
        }

        // Handle legend selection changes (e.g., clicking '总量' toggles individuals)
        feedbackChart.on('legendselectchanged', function (params) {
            const isTotalSelected = params.selected['总量'];
            const clickedName = params.name;
            let newSelectedState = { ...params.selected }; // Copy current state

            if (clickedName === '总量') {
                // If '总量' is selected, deselect individuals; otherwise select them
                newSelectedState['咨询'] = !isTotalSelected;
                newSelectedState['建议'] = !isTotalSelected;
                newSelectedState['投诉'] = !isTotalSelected;
            } else {
                // If any individual type is selected, deselect '总量'
                const anyIndividualSelected = newSelectedState['咨询'] || newSelectedState['建议'] || newSelectedState['投诉'];
                if (anyIndividualSelected) {
                    newSelectedState['总量'] = false;
                }
            }
            // Apply the new legend selection state
            feedbackChart.setOption({ legend: { selected: newSelectedState } });
        });

        // Add resize listener
        window.addEventListener('resize', function () { feedbackChart.resize(); });
        // Initial chart draw
        updateTrendChart();
        // Ensure rendering after potential layout shifts
        setTimeout(function() { feedbackChart.resize(); }, 200);
    } // End ECharts Trend Chart

    // --- Chart.js Detail Charts ---
    function createFeedbackDetailCharts() {
        const level1Ctx = document.getElementById('level1FeedbackChart')?.getContext('2d');
        const level2Ctx = document.getElementById('level2FeedbackChart')?.getContext('2d');
        // Exit if canvas contexts not found
        if (!level1Ctx || !level2Ctx) {
            console.error("Chart.js canvas elements (#level1FeedbackChart or #level2FeedbackChart) not found.");
            return;
        }

        // Level 1 Doughnut Chart (Main Feedback Categories)
        const level1Data = {
            labels: ['运营服务问题', '设施环境问题', '其他问题'],
            datasets: [{
                label: '反馈数量',
                data: [789, 594, 56], // Counts for each category
                backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(201, 203, 207, 0.7)'],
                borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(201, 203, 207, 1)'],
                borderWidth: 1
            }]
        };
        new Chart(level1Ctx, {
            type: 'doughnut',
            data: level1Data,
            options: {
                responsive: true, maintainAspectRatio: false, // Allow resizing
                plugins: {
                    legend: { position: 'bottom', labels:{ padding: 15 } }, // Legend at the bottom
                    tooltip: { // Custom tooltip content
                        callbacks: {
                            label: ctx => {
                                let l = ctx.label || '';
                                let v = ctx.raw || 0;
                                let t = ctx.chart.getDatasetMeta(0).total || 1; // Get total for percentage calculation
                                let p = ((v / t) * 100).toFixed(1) + '%'; // Calculate percentage
                                return `${l}: ${v}条 (${p})`; // Format tooltip string
                            }
                        }
                    }
                },
                cutout: '60%' // Size of the center hole
            }
        });

        // Level 2 Bar Chart (Top 10 Specific Feedback Issues)
        const categoryColors = { '运营服务': 'rgba(255, 159, 64, 0.7)', '设施环境': 'rgba(54, 162, 235, 0.7)' };
        // Map specific problems to broader categories for coloring
        const problemCategories = { '开放时间调整': '运营服务', '人员服务问题': '运营服务', '空间规划与选址': '设施环境', '噪音控制问题': '设施环境', '空调通风系统': '设施环境', '卫生设施问题': '设施环境', '物理设施损坏': '设施环境', '座位资源不足': '设施环境', '照明系统问题': '设施环境', '饮水设施问题': '设施环境' };
        // Data for the top 10 issues (reversed for horizontal bar display)
        const originalLabels = ['开放时间调整', '人员服务问题', '空间规划与选址', '噪音控制问题', '空调通风系统', '卫生设施问题', '物理设施损坏', '座位资源不足', '照明系统问题', '饮水设施问题'].reverse();
        const originalData = [409, 304, 300, 86, 75, 67, 49, 47, 26, 18].reverse();
        // Determine bar colors based on the broader category
        const backgroundColors = originalLabels.map(l => problemCategories[l] ? categoryColors[problemCategories[l]] : 'rgba(201, 203, 207, 0.7)');
        const borderColors = backgroundColors.map(c => c.replace('0.7', '1')); // Make border fully opaque

        const level2Data = {
            labels: originalLabels,
            datasets: [{
                label: '反馈数量',
                data: originalData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        };
        new Chart(level2Ctx, {
            type: 'bar',
            data: level2Data,
            options: {
                indexAxis: 'y', // Make it a horizontal bar chart
                responsive: true, maintainAspectRatio: false, // Allow resizing
                plugins: {
                    legend: { display: false }, // Hide legend (colors indicate category)
                    tooltip: { // Custom tooltip
                        callbacks: {
                            label: ctx => `${problemCategories[ctx.label] || '其他'}类: ${ctx.raw}条`
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: '反馈数量（条）' } }, // X-axis config
                    y: { ticks: { font: { size: 11 } } } // Y-axis config (smaller font for labels)
                }
            }
        });
    } // End Chart.js Detail Charts

} // End initializeFeedbackCharts


// --- ECharts: National Distribution Chart ---
function initializeNationalDistributionChart() {
    const container = document.getElementById('nationalDistributionChart');
    if (!container || typeof echarts === 'undefined') return;

    const nationalChart = echarts.init(container);
    // Data for national distribution (Provinces and their top cities)
    const nationalDataRaw = [ { name: '浙江', value: 531, cities: [ {name: '温州', value: 172}, {name: '台州', value: 102}, {name: '绍兴', value: 75}, {name: '衢州', value: 42}, {name: '湖州', value: 35}, {name: '嘉兴', value: 31}, {name: '舟山', value: 21}, {name: '宁波', value: 18}, {name: '丽水', value: 14}, {name: '杭州', value: 12}, {name: '金华', value: 9} ]}, { name: '河南', value: 353, cities: [ {name: '洛阳', value: 204}, {name: '郑州', value: 89}, {name: '驻马店', value: 27}, {name: '开封', value: 22}, {name: '南阳', value: 8}, {name: '焦作', value: 3} ]}, { name: '广东', value: 233, cities: [ {name: '佛山', value: 188}, {name: '韶关', value: 35}, {name: '深圳', value: 10} ]}, { name: '山东', value: 232, cities: [ {name: '济南', value: 53}, {name: '淄博', value: 45}, {name: '威海', value: 44}, {name: '济宁', value: 37}, {name: '日照', value: 25}, {name: '临沂', value: 14}, {name: '菏泽', value: 14} ]}, { name: '江苏', value: 170, cities: [ {name: '苏州', value: 64}, {name: '扬州', value: 51}, {name: '常州', value: 41}, {name: '连云港', value: 9}, {name: '常熟', value: 5} ]}, { name: '安徽', value: 169, cities: [ {name: '合肥', value: 99}, {name: '芜湖', value: 46}, {name: '铜陵', value: 16}, {name: '淮北', value: 5}, {name: '滁州', value: 3} ]}, { name: '上海', value: 120, cities: [{name: '上海', value: 120}]}, { name: '湖北', value: 68, cities: [ {name: '武汉', value: 52}, {name: '孝感', value: 8}, {name: '黄冈', value: 6}, {name: '宜昌', value: 2} ]}, { name: '江西', value: 59, cities: [ {name: '南昌', value: 37}, {name: '九江', value: 20}, {name: '萍乡', value: 2} ]}, { name: '内蒙古', value: 58, cities: [{name: '呼和浩特', value: 58}]}, { name: '北京', value: 57, cities: [{name: '北京', value: 57}]}, { name: '河北', value: 38, cities: [ {name: '沧州', value: 19}, {name: '唐山', value: 13}, {name: '廊坊', value: 6} ]}, { name: '天津', value: 28, cities: [{name: '天津', value: 28}]}, { name: '重庆', value: 27, cities: [{name: '重庆', value: 27}]}, { name: '山西', value: 26, cities: [{name: '太原', value: 18}, {name: '晋中', value: 8}]} ];
    // Sort provinces by total count descending
    nationalDataRaw.sort((a, b) => b.value - a.value);
    // Take only the top 15 provinces for the initial view
    const nationalData = nationalDataRaw.slice(0, 15);

    // Function to create the ECharts option for the Province-level bar chart
    function createProvinceOption() {
        return {
            title: { text: '全国城市书房分布 (Top 15省份)', left: 'center', top: 10, subtext: '点击省份条形图可查看省内城市分布', subtextStyle: { color: '#666', fontSize: 12 } },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c} 家' }, // Tooltip for bars
            grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true }, // Adjust grid layout
            xAxis: { type: 'value', boundaryGap: [0, 0.01], name: '数量 (家)', nameLocation: 'middle', nameGap: 25 }, // Value axis (horizontal)
            yAxis: { type: 'category', data: nationalData.map(item => item.name).reverse(), axisLabel: { interval: 0 } }, // Category axis (vertical), reversed for top-down display
            series: [{
                name: '城市书房数量',
                type: 'bar',
                data: nationalData.map(item => item.value).reverse(), // Bar data, reversed
                // Bar styling with gradient
                itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#83bff6' }, { offset: 0.5, color: '#188df0' }, { offset: 1, color: '#188df0' }]) },
                emphasis: { // Style on hover
                    itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2378f7' }, { offset: 0.7, color: '#2378f7' }, { offset: 1, color: '#83bff6' }]) }
                }
            }]
        };
    }

    // Function to create the ECharts option for the City-level pie chart (drill-down)
    function createCityOption(province) {
        // Find the city data for the selected province, sort by value descending
        const cityData = nationalDataRaw.find(item => item.name === province)?.cities?.sort((a,b) => b.value - a.value) || [];
        // Prepare data in {name: ..., value: ...} format for pie chart
        const pieChartData = cityData.map(c => ({ name: c.name, value: c.value }));

        return {
            title: { text: `${province}省城市书房分布`, left: 'center', top: 10 }, // Title showing the province name
            tooltip: { trigger: 'item', formatter: '{b}: {c} 家 ({d}%)' }, // Tooltip for pie slices
            // Legend configuration (vertical, scrollable if too many cities)
            legend: { orient: 'vertical', right: 10, top: 'center', type: 'scroll', data: pieChartData.map(c => c.name)},
            series: [{
                name: '城市分布',
                type: 'pie',
                radius: ['40%', '70%'], // Doughnut chart
                center: ['50%', '55%'], // Center the pie chart
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, // Slice styling
                label: { show: true, formatter: '{b}\n{c}家 ({d}%)' }, // Label format
                emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } }, // Label style on hover
                data: pieChartData // Assign the city data
            }]
        };
    }

    // Set the initial view (Province level)
    nationalChart.setOption(createProvinceOption());

    // --- Back button logic for drill-down ---
    let backButton = null;
    function manageBackButton(show = false) {
        if (!backButton) { // Create the button only once
            backButton = document.createElement('button');
            backButton.textContent = '返回省份分布';
            backButton.className = 'back-to-province'; // Assign a class for potential specific styling
            // Basic button styling
            backButton.style.cssText = 'position: absolute; left: 20px; top: 15px; z-index: 100; padding: 8px 15px; background-color: #188df0; color: white; border: none; border-radius: 4px; cursor: pointer;';
            // Add click listener to go back to province view
            backButton.addEventListener('click', function() {
                nationalChart.setOption(createProvinceOption(), true); // Update chart smoothly
                manageBackButton(false); // Hide the button itself
            });
            // Append to parent node to position correctly relative to the chart container
             container.parentNode.style.position = 'relative'; // Ensure parent has relative position
             container.parentNode.appendChild(backButton);
        }
        // Show or hide the button
        backButton.style.display = show ? 'block' : 'none';
    }

    // Add click listener to the chart for drill-down functionality
    nationalChart.on('click', function(params) {
        // Check if the click was on a bar series (province level)
        if (params.componentType === 'series' && params.seriesType === 'bar') {
            const provinceName = params.name; // Get the clicked province name
            // Find the corresponding province data
            const provinceData = nationalDataRaw.find(item => item.name === provinceName);
            // If the province has city data, drill down
            if (provinceData?.cities?.length > 0) {
                nationalChart.setOption(createCityOption(provinceName), true); // Update chart to city view
                manageBackButton(true); // Show the back button
            }
        }
    });

    // Add resize listener
    window.addEventListener('resize', function() { nationalChart.resize(); });
    // Ensure rendering after initial load
    setTimeout(function() { nationalChart.resize(); }, 200);
}


// ==================================
// Modal Logic Functions (Library Showcase)
// ==================================
function initializeLibraryModal() {
    const modal = document.getElementById('libraryModal');
    const closeButton = modal?.querySelector('.close-button');
    const libraryCards = document.querySelectorAll('.showcase-item.library-card');

    // Exit if essential modal elements or library cards are missing
    if (!modal || !closeButton || libraryCards.length === 0) {
        console.warn("Modal elements (#libraryModal, .close-button) not found or no library cards (.showcase-item.library-card) present. Modal functionality disabled.");
        return;
    }

    // --- Data for specific libraries (Replace with actual data source if needed) ---
    const libraryDetails = {
        'shangyang': { name: "上阳宫城市书房", image: "static/picture/shangyang-library.webp", features: "坐落于上阳宫文化园内，建筑风格与园区唐风遗韵巧妙融合，提供沉浸式历史文化阅读体验。（注：该书房目前正在进行搬迁升级，具体开放信息请关注官方公告）", stats: { "类型": "历史文脉型 / 景区融合", "原面积": "约 200 ㎡", "原座席": "约 60 个", "原藏书量": "约 7,000 册", "特色": "唐风古韵，环境典雅，文旅结合", "当前状态": "<strong style='color:orange;'>搬迁升级中</strong>" }, description: "作为历史文脉型书房的代表，原上阳宫城市书房不仅是一个阅读空间，更是体验唐代宫廷文化、感受古都魅力的窗口。它将阅读服务与历史文化景区有机结合，吸引了大量市民和游客。目前，该书房正在进行搬迁升级，期待未来以崭新的面貌重新服务读者，具体信息请以官方发布为准。" },
        'yirenfang': { name: "宜人坊城市书房 (洛龙区最大)", image: "static/picture/yiren-library.webp", features: "由4S店改造升级，保留现代工业风设计，通过绿植与落地窗营造开放而静谧的阅读氛围。荣获河南省新型公共文化空间典型案例。", stats: { "类型": "空间改造共建型", "面积": "超 1000 ㎡", "座席": "150 余个", "藏书量": "配备 2 万余册", "开放时间": "自2019年开放 8:30-21:30" }, description: "宜人坊城市书房是洛阳探索“空间改造+社会参与”模式的杰出范例。它将闲置的大型商业空间巧妙转型为公共文化地标，不仅极大地拓展了阅读服务覆盖面，更以其独特的设计感、丰富的藏书和完善的便民设施（如水吧、儿童区），成为备受市民喜爱的“文化客厅”和社交空间。其成功经验为盘活城市存量资产、实现文化功能植入提供了宝贵借鉴。" },
        'community_park': { name: "伊川县西山植物园城市书房", image: "static/picture/yichuan-library.webp", features: "嵌入风景优美的西山植物园中，环境宜人，将阅读与自然休闲完美结合，服务周边社区居民及公园游客。", stats: { "类型": "社区嵌入型 / 公园型", "面积": "105 ㎡", "座席": "42", "藏书量": "约 5,000-6,000 册 (标准配置)", "特色": "环境优美，亲近自然，服务社区及游客" }, description: "此类“小而美”的书房是“河洛书苑”网络的重要组成部分，它们如同散落在社区公园里的“文化珍珠”，将阅读的便利送到了市民的日常生活中。西山植物园书房充分利用了公园的优美环境，为市民和游客提供了一个可以在鸟语花香中休憩、阅读的宁静角落，体现了公共文化服务的人性化关怀和与城市绿色空间的融合。" }
        // Add more library entries here following the same structure
    };
    // --- End Library Data ---

    // Cache modal elements for slightly better performance
    const modalName = document.getElementById('modal-library-name');
    const modalImage = document.getElementById('modal-library-image');
    const modalFeatures = document.getElementById('modal-library-features');
    const modalDescription = document.getElementById('modal-library-description');
    const modalStatsList = document.getElementById('modal-library-stats');

    // Add click listener to each library card
    libraryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Get the unique ID of the clicked library from its data attribute
            const libraryId = this.getAttribute('data-library-id');
            // Find the corresponding details from our data object
            const details = libraryDetails[libraryId];

            // Check if details were found and all necessary modal elements exist
            if (details && modalName && modalImage && modalFeatures && modalDescription && modalStatsList) {
                // Populate the modal with the library's details
                modalName.textContent = details.name;
                modalImage.src = details.image;
                modalImage.alt = details.name + " 图片"; // Set alt text for accessibility
                modalFeatures.textContent = details.features;
                modalDescription.textContent = details.description;

                // Populate the statistics list (ul)
                modalStatsList.innerHTML = ''; // Clear any previous stats
                if (details.stats) {
                    // Iterate through the stats object and create list items
                    for (const key in details.stats) {
                        const li = document.createElement('li');
                        // Use innerHTML to allow for the <strong> tag in the status
                        li.innerHTML = `<i class="fas fa-check-circle" style="color:#28a745; margin-right: 8px; font-size: 0.9em;"></i><strong>${key}:</strong> ${details.stats[key]}`;
                        modalStatsList.appendChild(li);
                    }
                }

                // Display the modal using flex and trigger animation
                modal.style.display = 'flex';
                // Force browser reflow to ensure the transition/animation plays correctly
                void modal.offsetWidth;
                // Add the 'show' class to trigger CSS animations/transitions
                modal.classList.add('show');
            } else {
                // Log an error if details or modal elements are missing
                console.error("Details not found for library ID:", libraryId, " or essential modal elements (#modal-library-name, #modal-library-image, etc.) are missing.");
            }
        });
    });

    // Function to close the modal
    function closeModal() {
        // Remove the 'show' class to trigger fade-out animation
        modal.classList.remove('show');
        // Wait for the animation to finish before setting display to none
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // This duration should match the animation duration in your CSS
    }

    // Add event listener to the close button
    closeButton.addEventListener('click', closeModal);

    // Add event listener to close the modal if the background overlay is clicked
    modal.addEventListener('click', function(event) {
        // Check if the click target is the modal background itself, not its content
        if (event.target === modal) {
            closeModal();
        }
    });

    // Add event listener to close the modal when the Escape key is pressed
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });
} // End initializeLibraryModal