// static/js/comparison-animation.js

document.addEventListener('DOMContentLoaded', function() {
    const target = document.querySelector('#journey-comparison-static');

    // Safety check: If the target element doesn't exist, do nothing.
    if (!target) {
        console.warn("今昔对比区域 '#journey-comparison-static' 未在页面中找到，动画脚本未执行。");
        return;
    }

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // Use the viewport as the root
            rootMargin: '0px 0px -20% 0px', // Trigger when bottom 20% enters viewport
            threshold: 0.1 // Trigger when at least 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to trigger CSS animations
                    target.classList.add('is-visible');
                    // Optional: Unobserve after triggering once if you don't need it to re-animate
                    observer.unobserve(target);
                }
                // Optional: Remove class if you want re-animation on scroll up
                // else {
                //     target.classList.remove('is-visible');
                // }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(target);

    } else {
        // Fallback for older browsers that don't support IntersectionObserver
        // Make the content visible immediately
        console.warn("浏览器不支持 IntersectionObserver, 动画将直接显示。");
        target.style.opacity = 1;
        target.style.transform = 'translateY(0)';
        // Make cards visible too, delays won't apply without the class trigger
        const cards = target.querySelectorAll('.timeline-card');
        cards.forEach(card => {
             card.style.opacity = 1;
             card.style.transform = 'scale(1) translateY(0)';
        });
        const innerElements = target.querySelectorAll('.content-block');
         innerElements.forEach(el => {
             el.style.opacity = 1;
             el.style.transform = 'translateY(0)';
         });
    }
});