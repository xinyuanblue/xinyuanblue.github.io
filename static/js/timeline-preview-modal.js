// static/js/timeline-preview-modal.js

document.addEventListener('DOMContentLoaded', function() {
    // --- 获取 DOM 元素 ---
    const timelineItems = document.querySelectorAll('#journey-timeline-preview .timeline-item');
    const storyPreviews = document.querySelectorAll('#journey-timeline-preview .story-preview');
    const storyModal = document.getElementById('storyModal');
    const modalContent = storyModal?.querySelector('.story-modal-content'); // 获取模态框内容容器
    const modalTitle = document.getElementById('storyModalTitle');
    const modalBody = document.getElementById('storyModalBody');
    const modalClose = document.getElementById('storyModalClose');

    // --- Intersection Observer for Timeline Item Loading ---
    // (这段代码用于时间轴项目的懒加载动画，保持不变)
    if ('IntersectionObserver' in window && timelineItems.length > 0) {
        const observerOptions = {
            root: null, // 视口作为根
            rootMargin: '0px 0px -25% 0px', // 距离底部25%时触发
            threshold: 0.1 // 至少10%可见时触发
        };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // 添加可见类，触发CSS动画
                    observer.unobserve(entry.target); // 动画只触发一次
                }
            });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        timelineItems.forEach(item => observer.observe(item));
    } else {
        // 如果浏览器不支持 IntersectionObserver 或没有时间轴项目，直接显示所有项目
        console.warn("IntersectionObserver not supported or no timeline items. Showing all items.");
        timelineItems.forEach(item => item.classList.add('is-visible'));
    }

    // --- Modal Logic ---
    // 检查核心模态框元素是否存在，如果缺少则无法继续
    if (!storyModal || !modalContent || !modalTitle || !modalBody || !modalClose) {
        console.error("Modal elements (.story-modal, .story-modal-content, #storyModalTitle, #storyModalBody, #storyModalClose) not found. Story preview click will not work.");
        // 阻止后续代码执行，因为模态框无法正常工作
        // 可以选择性地禁用所有预览点击
        storyPreviews.forEach(preview => {
             preview.style.cursor = 'default';
             preview.onclick = (e) => e.preventDefault(); // 阻止默认行为
        });
        return; // 退出函数
    }

    /**
     * 打开故事模态框并设置内容和背景
     * @param {string} titleHTML - 模态框标题的 HTML 内容
     * @param {string} contentHTML - 模态框主体内容的 HTML 内容
     * @param {string|null} backgroundUrl - 背景图片的 URL，如果没有则为 null
     */
    function openStoryModal(titleHTML, contentHTML, backgroundUrl) {
        // 设置标题和主体内容
        modalTitle.innerHTML = titleHTML;
        modalBody.innerHTML = contentHTML;

        // 根据是否有背景图来设置样式
        if (backgroundUrl && modalContent) {
            // 设置模态框容器的背景
            modalContent.style.backgroundImage = `url('${backgroundUrl}')`;
            modalContent.style.backgroundSize = 'cover';
            modalContent.style.backgroundPosition = 'center';

            // --- 增加样式以保证文本可读性 ---
            // 给外部容器增加内边距，让内容区与边缘有距离
            modalContent.style.padding = '40px';
            // 给标题和主体内容区添加半透明背景
            modalTitle.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            modalTitle.style.paddingLeft = '20px'; // 调整内边距
            modalTitle.style.paddingRight = '20px';
            modalTitle.style.borderRadius = '5px 5px 0 0'; // 添加圆角

            modalBody.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            modalBody.style.padding = '20px'; // 添加内边距
            modalBody.style.borderRadius = '0 0 5px 5px'; // 添加圆角
             modalBody.style.marginTop = '-1px'; // 微调，防止与标题背景有缝隙

        } else if (modalContent) {
            // 如果没有背景图，重置所有相关样式到默认状态
            modalContent.style.backgroundImage = 'none';
            modalContent.style.padding = '30px 40px'; // 恢复默认内边距
            modalTitle.style.backgroundColor = 'transparent';
            modalTitle.style.paddingLeft = '0';
            modalTitle.style.paddingRight = '0';
            modalTitle.style.borderRadius = '0';
            modalBody.style.backgroundColor = 'transparent';
            modalBody.style.padding = '0';
            modalBody.style.borderRadius = '0';
            modalBody.style.marginTop = '0';
        }

        // 显示模态框
        storyModal.classList.add('show');
        // 阻止页面背景滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭故事模态框并重置样式
     */
    function closeStoryModal() {
        // 开始隐藏动画
        storyModal.classList.remove('show');
        // 等待动画结束后执行清理操作
         setTimeout(() => {
            // 恢复页面背景滚动
            document.body.style.overflow = '';
            // 重置模态框内容区的背景和相关样式，为下次打开做准备
            if (modalContent) {
                 modalContent.style.backgroundImage = 'none';
                 modalContent.style.padding = '30px 40px'; // 恢复默认内边距
                 modalTitle.style.backgroundColor = 'transparent';
                 modalTitle.style.paddingLeft = '0';
                 modalTitle.style.paddingRight = '0';
                 modalTitle.style.borderRadius = '0';
                 modalBody.style.backgroundColor = 'transparent';
                 modalBody.style.padding = '0';
                 modalBody.style.borderRadius = '0';
                 modalBody.style.marginTop = '0';
            }
            // 清空内容（可选，如果希望每次打开都是空的）
            // modalTitle.innerHTML = '';
            // modalBody.innerHTML = '';
         }, 300); // 这个时间应与 CSS 中的 transition duration 匹配
    }

    // 为每个故事预览块添加点击事件监听器
    storyPreviews.forEach(preview => {
        // 获取目标故事的 ID
        const targetStoryId = preview.getAttribute('data-target-story');
        if (!targetStoryId) {
            console.warn("Story preview is missing the 'data-target-story' attribute:", preview);
            return; // 跳过这个预览块
        }

        // 使用故事 ID 找到对应的隐藏的故事内容模块
        const fullStoryModule = document.querySelector(`.story-module-full[data-story-id="${targetStoryId}"]`);
        if (!fullStoryModule) {
            console.warn(`Could not find the full story module with data-story-id="${targetStoryId}". Preview click disabled.`);
            // 禁用这个预览块的点击
            preview.style.cursor = 'default';
            preview.onclick = (e) => e.preventDefault();
            return; // 跳过这个预览块
        }

        // 查找故事模块内的标题元素 (h4)
        const storyTitleElement = fullStoryModule.querySelector('h4');
        if (!storyTitleElement) {
             console.warn(`Could not find the h4 title element within the story module "${targetStoryId}".`);
             return; // 跳过，因为没有标题
        }

        // 准备模态框所需的数据
        const storyTitleHTML = storyTitleElement.innerHTML; // 获取标题的完整 HTML（包括图标）
        const backgroundUrl = fullStoryModule.dataset.background || null; // 从 data-background 属性获取背景图 URL，若无则为 null
        const storyContentHTML = Array.from(fullStoryModule.querySelectorAll('p')) // 获取所有段落元素
                                     .map(p => p.outerHTML) // 获取每个段落的完整 HTML
                                     .join(''); // 将所有段落 HTML 连接成一个字符串

        // 添加点击事件
        preview.addEventListener('click', (event) => {
             event.stopPropagation(); // 阻止事件冒泡，以防父元素也有点击事件
             // 调用打开模态框的函数，传入准备好的数据
             openStoryModal(storyTitleHTML, storyContentHTML, backgroundUrl);
        });
    });

    // 添加关闭模态框的事件监听器
    // 1. 点击关闭按钮
    modalClose.addEventListener('click', closeStoryModal);
    // 2. 点击模态框外部的遮罩层
    storyModal.addEventListener('click', function(event) {
        // 确保点击的是遮罩层本身，而不是其内部元素
        if (event.target === storyModal) {
            closeStoryModal();
        }
    });
    // 3. 按下 Escape 键
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && storyModal.classList.contains('show')) {
            closeStoryModal();
        }
    });

}); // 结束 DOMContentLoaded 事件监听