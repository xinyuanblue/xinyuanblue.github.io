// static/js/accessibility.js

document.addEventListener('DOMContentLoaded', function() {
    // --- 获取按钮元素 ---
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontSizeToggle = document.getElementById('font-size-toggle');
    const lineHeightToggle = document.getElementById('line-height-toggle');
    const readAloudToggle = document.getElementById('read-aloud-toggle');

    // --- 检查按钮是否存在 ---
    if (!contrastToggle || !fontSizeToggle || !lineHeightToggle || !readAloudToggle) {
        console.warn("未能找到所有无障碍功能按钮，部分功能可能无法使用。");
        // 可以选择隐藏整个按钮容器
        const accessibilityButtonsContainer = document.querySelector('.accessibility-buttons');
        if (accessibilityButtonsContainer) accessibilityButtonsContainer.style.display = 'none';
        return; // 如果关键按钮缺失，后续逻辑可能出错，提前退出
    }

    // --- 状态变量 ---
    let isReading = false;
    let utterance = null;
    const synth = window.speechSynthesis; // 获取语音合成接口

    // --- 高对比度切换 ---
    contrastToggle.addEventListener('click', function() {
        // 使用 documentElement (html 标签) 来切换类
        document.documentElement.classList.toggle('high-contrast');
        const isHighContrast = document.documentElement.classList.contains('high-contrast');
        // 更新 ARIA 状态
        this.setAttribute('aria-pressed', isHighContrast.toString());
        // 保存设置
        saveAccessibilitySettings();
    });

    // --- 字体大小切换 (循环: 默认 -> large -> x-large -> 默认) ---
    fontSizeToggle.addEventListener('click', function() {
        const htmlElement = document.documentElement;
        const currentSize = htmlElement.getAttribute('data-font-size');
        let newSize = ''; // Default state

        if (!currentSize) {
            newSize = 'large'; // to Large
        } else if (currentSize === 'large') {
            newSize = 'x-large'; // to X-Large
        } // else: from x-large back to default (newSize remains '')

        if (newSize) {
            htmlElement.setAttribute('data-font-size', newSize);
        } else {
            htmlElement.removeAttribute('data-font-size');
        }
        // 更新 ARIA 状态
        this.setAttribute('aria-pressed', !!newSize); // true if newSize is not empty
        // 保存设置
        saveAccessibilitySettings();
    });

    // --- 行高切换 ---
    lineHeightToggle.addEventListener('click', function() {
        const htmlElement = document.documentElement;
        const isIncreased = htmlElement.getAttribute('data-line-height') === 'increased';

        if (isIncreased) {
             htmlElement.removeAttribute('data-line-height');
        } else {
             htmlElement.setAttribute('data-line-height', 'increased');
        }
        // 更新 ARIA 状态
        this.setAttribute('aria-pressed', !isIncreased);
        // 保存设置
        saveAccessibilitySettings();
    });

    // --- 朗读功能 ---
    readAloudToggle.addEventListener('click', function() {
        // 检查浏览器是否支持语音合成
        if (!synth) {
            alert('抱歉，您的浏览器不支持语音合成功能。');
            return;
        }

        // 如果正在朗读，则停止
        if (isReading) {
            synth.cancel(); // 停止当前和队列中的所有朗读
            isReading = false;
            this.setAttribute('aria-pressed', 'false');
            // console.log("朗读已停止");
            return; // 退出函数
        }

        // 如果当前有正在等待或暂停的朗读任务，也先取消
        if (synth.speaking || synth.pending || synth.paused) {
             synth.cancel();
             // 短暂延迟确保完全取消
             setTimeout(() => { startReading(this); }, 100);
        } else {
            startReading(this);
        }
    });

    // 开始朗读的辅助函数
    function startReading(buttonElement) {
        // 确定要朗读的内容区域
        // 优先选择有 main 角色的元素，其次是 #main-content, .container, 最后是 body
        const mainContentElement = document.querySelector('[role="main"]') || document.getElementById('main-content') || document.querySelector('.container') || document.body;
        let textToRead = '';

        if (mainContentElement) {
            // 尝试提取可读文本，移除脚本和样式内容，替换多余空白
            textToRead = extractReadableText(mainContentElement);
        }

        if (textToRead) {
            // console.log("准备朗读:", textToRead.substring(0, 100) + "..."); // 打印前100个字符
            utterance = new SpeechSynthesisUtterance(textToRead);
            // 根据页面语言设置朗读语言
            utterance.lang = document.documentElement.lang === 'en' ? 'en-US' : 'zh-CN';
            utterance.rate = 0.9; // 语速稍慢

            // 朗读结束时的回调
            utterance.onend = () => {
                // console.log("朗读结束");
                isReading = false;
                if (buttonElement) buttonElement.setAttribute('aria-pressed', 'false');
            };

            // 朗读错误时的回调
            utterance.onerror = (event) => {
                console.error('语音合成错误:', event.error);
                alert(`朗读时发生错误: ${event.error}`);
                isReading = false;
                if (buttonElement) buttonElement.setAttribute('aria-pressed', 'false');
            };

            // 开始朗读
            synth.speak(utterance);
            isReading = true;
            if (buttonElement) buttonElement.setAttribute('aria-pressed', 'true');
            // console.log("开始朗读");

        } else {
            alert('未能找到可朗读的主要内容。');
            isReading = false; // 确保状态复位
            if (buttonElement) buttonElement.setAttribute('aria-pressed', 'false');
        }
    }

    // 提取可读文本的辅助函数 (简化版)
    function extractReadableText(element) {
        // 克隆节点以避免修改原始DOM
        const clone = element.cloneNode(true);
        // 移除脚本和样式标签
        clone.querySelectorAll('script, style, noscript, .accessibility-buttons, .language-switch, footer, nav').forEach(el => el.remove());
        // 获取文本内容并清理空白
        let text = clone.textContent || "";
        return text.replace(/\s+/g, ' ').trim(); // 替换多个空白为一个空格
    }


    // --- 保存与加载设置 ---

    // 保存设置到 localStorage
    function saveAccessibilitySettings() {
        try {
            const settings = {
                highContrast: document.documentElement.classList.contains('high-contrast'),
                fontSize: document.documentElement.getAttribute('data-font-size') || '',
                lineHeight: document.documentElement.getAttribute('data-line-height') || ''
            };
            localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
            // console.log("无障碍设置已保存:", settings);
        } catch (e) {
            console.error("无法保存无障碍设置到LocalStorage:", e);
        }
    }

    // 加载设置
    function loadAccessibilitySettings() {
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                // console.log("加载无障碍设置:", settings);

                // 应用高对比度
                if (settings.highContrast) {
                    document.documentElement.classList.add('high-contrast');
                    if (contrastToggle) contrastToggle.setAttribute('aria-pressed', 'true');
                } else {
                    document.documentElement.classList.remove('high-contrast'); // 确保移除
                    if (contrastToggle) contrastToggle.setAttribute('aria-pressed', 'false');
                }

                // 应用字体大小
                if (settings.fontSize) {
                    document.documentElement.setAttribute('data-font-size', settings.fontSize);
                    if (fontSizeToggle) fontSizeToggle.setAttribute('aria-pressed', 'true');
                } else {
                    document.documentElement.removeAttribute('data-font-size'); // 确保移除
                    if (fontSizeToggle) fontSizeToggle.setAttribute('aria-pressed', 'false');
                }

                // 应用行高
                if (settings.lineHeight) {
                    document.documentElement.setAttribute('data-line-height', settings.lineHeight);
                    if (lineHeightToggle) lineHeightToggle.setAttribute('aria-pressed', 'true');
                } else {
                    document.documentElement.removeAttribute('data-line-height'); // 确保移除
                    if (lineHeightToggle) lineHeightToggle.setAttribute('aria-pressed', 'false');
                }
            } else {
                 // console.log("未找到已保存的无障碍设置");
            }
        } catch (e) {
             console.error("无法从LocalStorage加载或应用无障碍设置:", e);
        }
    }

    // --- 初始化 ---
    // 页面加载时应用保存的设置
    loadAccessibilitySettings();

     // --- 语音合成相关清理 ---
     // 页面卸载时停止朗读
     window.addEventListener('beforeunload', () => {
        if (isReading && synth) {
            // console.log("页面卸载，停止朗读");
            synth.cancel();
        }
    });

}); // End DOMContentLoaded