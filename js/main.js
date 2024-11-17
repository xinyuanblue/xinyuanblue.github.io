document.addEventListener('DOMContentLoaded', function() {
    // 导航栏透明效果
    const nav = document.querySelector('.nav-container');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        if (window.scrollY > lastScrollY) {
            // 向下滚动
            nav.classList.add('nav-transparent');
        } else {
            // 向上滚动
            nav.classList.remove('nav-transparent');
        }
        lastScrollY = window.scrollY;
    });

    // 标题动画效果
    const titles = document.querySelectorAll('.section-container h2');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('title-animate');
            }
        });
    }, {
        threshold: 0.1
    });

    titles.forEach(title => {
        observer.observe(title);
    });
});