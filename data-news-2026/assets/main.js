const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function updateProgress() {
  const progress = $("#progress");
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}

function renderInsights(root = document) {
  $$(".insights[data-items]", root).forEach((box) => {
    const items = JSON.parse(box.dataset.items);
    box.innerHTML = items.map((item) => `
      <div class="insight">
        <strong>${item.value}</strong>
        <span>${item.label}</span>
      </div>
    `).join("");
  });
}

function renderBars(root = document) {
  $$(".bar-list[data-bars]", root).forEach((box) => {
    const bars = JSON.parse(box.dataset.bars);
    const max = Math.max(...bars.map((bar) => bar.value));
    box.innerHTML = bars.map((bar, index) => {
      const width = max ? Math.round((bar.value / max) * 100) : 0;
      const colors = ["", "blue", "coral", "gold", "violet"];
      return `
        <div class="bar-row">
          <span>${bar.label}</span>
          <div class="track"><div class="fill ${colors[index % colors.length]}" style="width:${width}%"></div></div>
          <strong>${bar.display || bar.value}</strong>
        </div>
      `;
    }).join("");
  });
}

function renderLineCharts(root = document) {
  $$(".chart[data-line]", root).forEach((box) => {
    const data = JSON.parse(box.dataset.line);
    const w = 680;
    const h = 310;
    const pad = { t: 26, r: 22, b: 46, l: 52 };
    const max = Math.max(...data.map((d) => d.value)) * 1.08;
    const min = Math.min(0, ...data.map((d) => d.value));
    const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1 || 1);
    const y = (v) => h - pad.b - ((v - min) / (max - min || 1)) * (h - pad.t - pad.b);
    const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
    const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const gy = pad.t + ratio * (h - pad.t - pad.b);
      return `<line class="grid-line" x1="${pad.l}" x2="${w - pad.r}" y1="${gy}" y2="${gy}"></line>`;
    }).join("");
    box.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="折线图">
        ${grid}
        <line class="axis" x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}"></line>
        <line class="axis" x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}"></line>
        <polyline points="${points}" fill="none" stroke="var(--green)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${data.map((d, i) => `
          <circle cx="${x(i)}" cy="${y(d.value)}" r="5" fill="var(--coral)"></circle>
          <text class="value" x="${x(i)}" y="${y(d.value) - 12}" text-anchor="middle">${d.display || d.value}</text>
          <text class="label" x="${x(i)}" y="${h - 16}" text-anchor="middle">${d.label}</text>
        `).join("")}
      </svg>
    `;
  });
}

function boot() {
  renderInsights();
  renderBars();
  renderLineCharts();
  updateProgress();
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
document.addEventListener("DOMContentLoaded", boot);
