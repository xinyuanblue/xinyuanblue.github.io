document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航项和章节
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');
    
    // 检查元素是否在视口中
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight / 2) &&
            rect.bottom >= (window.innerHeight / 2)
        );
    }

    // 更新活动导航项
    function updateActiveNavItem() {
        sections.forEach(section => {
            if (isInViewport(section)) {
                const id = section.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href').slice(1) === id) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    // 添加滚动事件监听器
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveNavItem);
    });

    // 添加点击事件监听器
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 初始化活动导航项
    updateActiveNavItem();
});
