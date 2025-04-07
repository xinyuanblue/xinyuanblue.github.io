const translations = {
    zh: {
        // 导航
        'nav_home': '首页',
        'nav_reading_circle': '十五分钟阅读圈',
        'nav_population': '人口热力分布',
        'skip_nav': '跳过导航',
        'accessibility_tools': '无障碍工具',
        'high_contrast': '高对比度',
        'large_font': '大字体',
        'increase_line_height': '增加行距',
        'read_aloud': '朗读内容',
        
        // 页面标题
        'site_title': '河洛书苑生长笔记',
        'data_analysis_title': '从历史到数据：解读河洛书苑的成长密码',
        'main_title': '河洛书苑生长笔记：百座书房画出十五分钟阅读圈',
        'section_title_library_showcase': '城市书房风采',
        'section_title_reading_transition': '洛阳阅读空间的变迁',
        
        // 统计数据标签
        'annual_visitors': '年度进馆人数',
        'city_libraries': '城市书房',
        'total_loans': '累计借阅总量',
        'daily_visitors': '日均进馆人次',
        'intro_text': '这是洛阳市全民阅读的生动写照。在这座十三朝古都，一座座城市书房如星辰般点亮城市的每个角落，构建起便捷的"15分钟阅读圈"。每天，众多市民走进这些阅读空间，日均借阅流通量超过1万册，自助设备借还率达60%以上。从市中心到城郊，683个流通服务点织就了一张覆盖全城的阅读网络，让阅读成为洛阳市民日常生活的一部分。',
        'data_news_intro': '本数据新闻将从三个主线展开，全面呈现洛阳城市书房建设的成果与影响。首先，我们将探索城市书房的空间分布，揭示"15分钟阅读圈"如何覆盖城市各个角落，打造便捷的全民阅读网络。其次，通过发展时间轴，我们将追溯洛阳城市书房从无到有、从少到多的建设历程，见证阅读空间的蓬勃发展。最后，基于市民需求反馈，我们将展示城市书房如何满足市民多元阅读需求，以及这一文化工程为洛阳市民生活带来的深远影响。',
        
        
    },
    en: {
        // Navigation
        'nav_home': 'Home',
        'nav_reading_circle': '15-Min Reading Circle',
        'nav_population': 'Population Heatmap',
        'skip_nav': 'Skip Navigation',
        'accessibility_tools': 'Accessibility Tools',
        'high_contrast': 'High Contrast',
        'large_font': 'Large Font',
        'increase_line_height': 'Increase Line Height',
        'read_aloud': 'Read Aloud',
        
        // Page Titles
        'site_title': 'Heluo Library Growth Story',
        'data_analysis_title': 'From History to Data: Decoding the Growth of Heluo Library',
        'main_title': 'Growing Notes of Heluo Shuyuan: Mapping 15-Minute Reading Circles Around Over 200 Reading Rooms',
        'section_title_library_showcase': 'City Library Showcase',
        'section_title_reading_transition': 'Transition of Reading Spaces in Luoyang',
        
        // Statistics Labels
        'annual_visitors': 'Annual Visitors',
        'city_libraries': 'City Libraries',
        'total_loans': 'Total Loans',
        'daily_visitors': 'Daily Visitors',
        'intro_text': 'This is a vivid portrait of Luoyang\'s citywide reading initiative. In this ancient capital of thirteen dynasties, city libraries illuminate every corner like stars, creating convenient "15-minute reading circles." Each day, numerous citizens enter these reading spaces, with daily borrowing exceeding 10,000 volumes and self-service equipment handling over 60% of transactions. From downtown to suburbs, 683 service points weave a reading network covering the entire city, making reading an integral part of daily life for Luoyang residents.',
        'data_news_intro': 'This data news will unfold along three main threads, comprehensively presenting the achievements and impacts of Luoyang\'s city library construction. First, we will explore the spatial distribution of city libraries, revealing how the "15-minute reading circle" covers every corner of the city, creating a convenient reading network. Second, through a development timeline, we will trace the journey of Luoyang\'s city libraries from non-existence to abundance, witnessing the flourishing growth of reading spaces. Finally, based on citizen feedback, we will showcase how city libraries meet diverse reading needs and the profound impact this cultural project has brought to life in Luoyang.',
        
         }
};

// 翻译函数
function translatePage(lang) {
    console.log('Translating to:', lang);
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('Found elements:', elements.length);
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        } else {
            console.warn('Missing translation for key:', key, 'in language:', lang);
        }
    });
}

// 监听语言变化事件
document.addEventListener('languageChange', function(e) {
    console.log('Language change event:', e.detail.lang);
    translatePage(e.detail.lang);
});

// 初始化时使用默认语言
document.addEventListener('DOMContentLoaded', function() {
    const defaultLang = document.documentElement.lang || 'zh';
    console.log('Initial language:', defaultLang);
    translatePage(defaultLang);
});

// 确保全局可访问
window.translatePage = translatePage; 