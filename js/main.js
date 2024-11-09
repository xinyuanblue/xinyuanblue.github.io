// 主要交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各种可视化
    initCounterAnimation();
    
    // 滚动监听
    const sections = document.querySelectorAll('.scroll-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 触发相应的动画或数据加载
            }
        });
    });
    
    sections.forEach(section => observer.observe(section));
});
