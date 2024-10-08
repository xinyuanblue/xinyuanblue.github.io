// 确保DOM完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取测试容器
    const testContainer = document.getElementById('test-container');
    
    // 确保容器存在
    if (!testContainer) {
        console.error('测试容器不存在');
        return;
    }

    // 测试问题
    const questions = [
        "我发现很难完全依赖他人。",
        "我担心他人不会像我在意他们那样在意我。",
        "我觉得他人不愿像我希望的那样亲近我。",
        "我不太担心被他人抛弃。",
        "我更喜欢不依赖他人。"
    ];

    // 创建 HTML 结构
    testContainer.innerHTML = `
        <h2>回避型依恋测试</h2>
        ${questions.map((q, i) => `
            <div class="question">
                <p>${q}</p>
                <div class="answers">
                    ${[1,2,3,4,5].map(v => `
                        <button onclick="handleAnswer(${i}, ${v})">${v}</button>
                    `).join('')}
                </div>
            </div>
        `).join('')}
        <button onclick="showResults()">查看结果</button>
        <div id="results" style="display:none;"></div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        #test-container { max-width: 600px; margin: 2em auto; padding: 1em; border: 1px solid #ddd; background-color: #f9f9f9; }
        .question { margin-bottom: 20px; }
        .answers { display: flex; justify-content: space-between; }
        button { padding: 5px 10px; }
    `;
    document.head.appendChild(style);
});

// 存储答案
let answers = new Array(5).fill(0);

// 处理回答
function handleAnswer(index, value) {
    answers[index] = value;
    document.querySelectorAll(`#test-container .question:nth-child(${index + 2}) button`).forEach(btn => {
        btn.style.backgroundColor = btn.textContent == value ? '#007bff' : '';
    });
}

// 显示结果
function showResults() {
    const score = (answers.reduce((a, b) => a + b, 0) / (5 * 5)) * 100;
    let style = score > 60 ? "回避型依恋倾向较高" :
                score > 40 ? "回避型依恋倾向中等" :
                "回避型依恋倾向较低";
    
    document.getElementById('results').innerHTML = `
        <h3>您的结果: ${style}</h3>
        <p>得分: ${score.toFixed(2)}%</p>
        <p>这个测试仅供参考。如果您对自己的依恋类型有疑问,建议咨询专业心理医生。</p>
    `;
    document.getElementById('results').style.display = 'block';
}
