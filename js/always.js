// always.js

// 初始化全局变量
window.myGlobalVar = {
    someData: [],
    config: {
        apiUrl: 'https://api.example.com'
    }
};

// DOM 元素的选择和初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const button = document.getElementById('myButton');
    const container = document.getElementById('myContainer');

    // 初始化事件监听器
    button.addEventListener('click', handleButtonClick);

    // 其他初始化逻辑
    initializeSomething();
});

// 处理按钮点击事件
function handleButtonClick() {
    console.log('按钮被点击了！');
    fetchData('https://api.example.com/data', data => {
        console.log('获取的数据:', data);
        updateUI(data);
    });
}

// 更新 UI
function updateUI(data) {
    const container = document.getElementById('myContainer');
    container.innerHTML = JSON.stringify(data, null, 2);
}

// 初始化页面
function initializeSomething() {
    console.log('初始化完成');
}

// 功能函数：异步数据请求
function fetchData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (callback) {
                callback(data);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
        });
}

// 实用工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this,
              args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// 实用工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 初始化第三方库（假设使用 jQuery）
$(document).ready(function() {
    // 使用 jQuery 初始化某些功能
    $('#myButton').on('click', function() {
        console.log('按钮被点击了！');
    });
});
