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
            // 先更新状态，防止事件回调中的重复处理 (虽然onerror/onend会处理，但提前设置UI反馈更及时)
            isReading = false;
            this.setAttribute('aria-pressed', 'false');

            // 取消朗读 (这会触发 utterance.onerror 事件，并将 error 设为 'interrupted')
            synth.cancel();
            // console.log("请求停止朗读"); // 可选：用于调试
            return;
        }

        // 如果当前有正在等待或暂停的朗读任务，也先取消
        if (synth.speaking || synth.pending || synth.paused) {
             // console.log("发现正在进行或暂停的朗读，先取消"); // 可选：用于调试
            synth.cancel();
            // 短暂延迟确保完全取消，然后再开始新的朗读
            // 注意：这里的cancel也会触发之前的utterance的onerror事件
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
                // console.log("朗读正常结束");
                isReading = false;
                if (buttonElement) buttonElement.setAttribute('aria-pressed', 'false');
            };
            // 朗读错误时的回调 (添加了详细日志)
            utterance.onerror = (event) => {
                console.log(`[DEBUG] utterance.onerror triggered. Event object:`, event); // 打印整个事件对象
                console.log(`[DEBUG] event.error value: "${event.error}"`); // 明确打印 error 的值
                console.log(`[DEBUG] event.error type: ${typeof event.error}`); // 确认类型是 string
                console.log(`[DEBUG] Comparing event.error with 'interrupted'. Is it different?`, event.error !== 'interrupted'); // 检查比较结果

                // *** 修改点：只在非用户中断的情况下报告错误 ***
                if (event.error !== 'interrupted') {
                    console.error('[DEBUG] INSIDE IF (Real Error): 语音合成发生意外错误:', event.error); // 在 IF 内部加标记
                    // 可以在这里添加更友好的用户提示，而不是简单的 alert
                    // 例如：显示一个临时的错误消息条
                    alert(`朗读时发生错误: ${event.error}。请稍后重试或检查您的网络连接。`);
                } else {
                    console.log('[DEBUG] INSIDE ELSE (Interrupted): Skipping console.error because event.error === "interrupted".'); // 在 ELSE 内部加标记
                    // （可选）如果需要明确知道是用户中断的，可以加一个 log
                    // console.log('语音合成被用户中断。');
                }

                // 无论错误类型如何（包括interrupted），都重置状态
                console.log("[DEBUG] Resetting state in onerror.");
                isReading = false;
                // 确保按钮状态也重置
                if (buttonElement) {
                     console.log("[DEBUG] Resetting button aria-pressed in onerror.");
                     buttonElement.setAttribute('aria-pressed', 'false');
                } else {
                     console.warn("[DEBUG] buttonElement not available in onerror scope.");
                }
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
        // 移除脚本、样式、按钮、语言切换、页脚、导航等非主要内容区域
        clone.querySelectorAll('script, style, noscript, .accessibility-buttons, .language-switch, footer, nav, header, aside, [aria-hidden="true"], form, button, input, select, textarea, details:not([open]) summary') // 增加了更多可能不需要朗读的元素
               .forEach(el => el.remove());
        // 尝试移除注释节点
        const nodeIterator = document.createNodeIterator(clone, NodeFilter.SHOW_COMMENT);
        let commentNode;
        while(commentNode = nodeIterator.nextNode()) {
            commentNode.parentNode.removeChild(commentNode);
        }
        // 获取文本内容并清理空白
        let text = clone.textContent || "";
        // 替换多个空白为一个空格，并移除首尾空白
        text = text.replace(/\s+/g, ' ').trim();
        // （可选）可以进一步处理，比如将句号、问号、感叹号后的空格替换为换行，模拟段落感
        // text = text.replace(/([.?!])\s+/g, "$1\n\n");
        return text;
    }


    // --- 保存与加载设置 ---

    // 保存设置到 localStorage
    function saveAccessibilitySettings() {
        try {
            const settings = {
                highContrast: document.documentElement.classList.contains('high-contrast'),
                fontSize: document.documentElement.getAttribute('data-font-size') || '',
                lineHeight: document.documentElement.getAttribute('data-line-height') || ''
                // 注意：朗读状态不应保存，它应在每次页面加载时重置
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
     // 页面卸载时停止朗读，防止后台继续播放或报错
     window.addEventListener('beforeunload', () => {
        // 检查 synth 是否存在，以及是否正在说话或有待处理/暂停的任务
        if (synth && (synth.speaking || synth.pending || synth.paused)) {
            // console.log("页面卸载，取消所有语音合成任务");
            // 使用 cancel() 来停止当前和队列中的所有任务
            synth.cancel();
        }
        // isReading 状态会在页面重新加载时自然重置为 false
    });

}); // End DOMContentLoaded