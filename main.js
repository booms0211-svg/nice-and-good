const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const langToggleBtn = document.getElementById('lang-toggle');
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

let translations = {};

// Mobile nav toggle
if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        siteNav.classList.toggle('open');
        navToggle.classList.toggle('open');
    });
}

// ===== Theme =====
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggleBtn && translations.theme_toggle_light) {
            themeToggleBtn.textContent = translations.theme_toggle_light;
        }
    } else {
        body.classList.remove('dark-theme');
        if (themeToggleBtn && translations.theme_toggle_dark) {
            themeToggleBtn.textContent = translations.theme_toggle_dark;
        }
    }
};

const toggleTheme = () => {
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
};

// ===== Translations =====
const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (translations[key]) {
            elem.textContent = translations[key];
        }
    });

    const pageTitleKey = document.querySelector('[data-page-title]');
    if (pageTitleKey) {
        const key = pageTitleKey.getAttribute('data-page-title');
        if (translations[key]) {
            document.title = translations[key];
        }
    } else {
        document.title = translations.title || document.title;
    }
};

const loadTranslations = async (lang) => {
    const response = await fetch(`locales/${lang}.json`);
    translations = await response.json();
    applyTranslations();
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
};

const updateLangButton = (lang) => {
    if (langToggleBtn) {
        langToggleBtn.textContent = lang === 'ko' ? 'EN' : 'KO';
    }
};

const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    loadTranslations(lang);
    updateLangButton(lang);
};

const toggleLanguage = () => {
    const current = localStorage.getItem('language') || 'ko';
    setLanguage(current === 'ko' ? 'en' : 'ko');
};

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// ===== Guide Page Tab System =====
const tabBtns = document.querySelectorAll('.guide-tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.guide-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const target = document.getElementById(targetTab);
            if (target) target.classList.add('active');
        });
    });
}

// ===== Fear & Greed Index (only on index page) =====
const cryptoNeedle = document.getElementById('crypto-needle');
const stockNeedle = document.getElementById('stock-needle');
const vixNeedle = document.getElementById('vix-needle');

if (cryptoNeedle) {
    const CRYPTO_API = 'https://api.alternative.me/fng/?limit=30&date_format=world';
    const CNN_TARGET = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const VIX_TARGET = 'https://query2.finance.yahoo.com/v8/finance/chart/%5EVIX?range=7d&interval=1d';

    async function proxyFetch(targetUrl, timeout = 8000) {
        const proxies = [
            { url: 'https://corsproxy.io/?' + encodeURIComponent(targetUrl), type: 'raw' },
            { url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl), type: 'allorigins' },
            { url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl), type: 'raw' },
        ];
        for (const proxy of proxies) {
            try {
                const res = await fetch(proxy.url, { signal: AbortSignal.timeout(timeout) });
                if (!res.ok) continue;
                if (proxy.type === 'allorigins') {
                    const wrapper = await res.json();
                    if (wrapper && wrapper.contents) return JSON.parse(wrapper.contents);
                    continue;
                }
                const text = await res.text();
                try { return JSON.parse(text); } catch (e) { continue; }
            } catch (e) { continue; }
        }
        return null;
    }

    // ===== US Market Hours Detection =====
    function isUSMarketHours() {
        const now = new Date();
        const estOffset = -5;
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const est = new Date(utc + 3600000 * estOffset);
        const day = est.getDay();
        const hours = est.getHours();
        const minutes = est.getMinutes();
        const timeInMinutes = hours * 60 + minutes;
        // Monday-Friday, 09:30-16:00 EST
        return day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes <= 960;
    }

    // ===== Timestamp Formatting =====
    function formatTimestamp() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateTimestamp(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            const prefix = translations.last_updated_at || '마지막 업데이트: ';
            el.textContent = prefix + formatTimestamp();
        }
    }

    // ===== Status Info =====
    function getStatusInfo(score) {
        if (score <= 24) return { key: 'status_extreme_fear', color: '#ea3943', fallback: '극도의 공포' };
        if (score <= 44) return { key: 'status_fear', color: '#ea8c00', fallback: '공포' };
        if (score <= 55) return { key: 'status_neutral', color: '#f5c623', fallback: '중립' };
        if (score <= 74) return { key: 'status_greed', color: '#6ec66a', fallback: '탐욕' };
        return { key: 'status_extreme_greed', color: '#16c784', fallback: '극도의 탐욕' };
    }

    function getVixStatusInfo(vixValue) {
        if (vixValue >= 40) return { key: 'vix_status_extreme_fear', color: '#ea3943', fallback: '극도의 공포' };
        if (vixValue >= 30) return { key: 'vix_status_fear', color: '#ea8c00', fallback: '공포' };
        if (vixValue >= 20) return { key: 'vix_status_caution', color: '#f5c623', fallback: '주의' };
        if (vixValue >= 15) return { key: 'vix_status_stable', color: '#6ec66a', fallback: '안정' };
        return { key: 'vix_status_very_stable', color: '#16c784', fallback: '매우 안정' };
    }

    // ===== Gauge Updates =====
    function updateGauge(prefix, score) {
        const needle = document.getElementById(`${prefix}-needle`);
        const scoreEl = document.getElementById(`${prefix}-score`);
        const labelEl = document.getElementById(`${prefix}-label`);

        if (!needle || !scoreEl || !labelEl) return;

        const rotation = score * 1.8;
        needle.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
        needle.setAttribute('transform', `rotate(${rotation}, 100, 105)`);

        scoreEl.textContent = score;
        scoreEl.className = 'gauge-score';

        const status = getStatusInfo(score);
        labelEl.textContent = translations[status.key] || status.fallback;
        labelEl.style.color = status.color;
        scoreEl.style.color = status.color;
    }

    function updateVixGauge(vixValue) {
        const needle = document.getElementById('vix-needle');
        const scoreEl = document.getElementById('vix-score');
        const labelEl = document.getElementById('vix-label');

        if (!needle || !scoreEl || !labelEl) return;

        // VIX range: 10-80, normalize to 0-1 then to 0-180 degrees
        const clamped = Math.max(10, Math.min(80, vixValue));
        const normalized = (clamped - 10) / 70;
        const rotation = normalized * 180;

        needle.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
        needle.setAttribute('transform', `rotate(${rotation}, 100, 105)`);

        scoreEl.textContent = vixValue.toFixed(1);
        scoreEl.className = 'gauge-score';

        const status = getVixStatusInfo(vixValue);
        labelEl.textContent = translations[status.key] || status.fallback;
        labelEl.style.color = status.color;
        scoreEl.style.color = status.color;
    }

    function showGaugeError(prefix) {
        const scoreEl = document.getElementById(`${prefix}-score`);
        const labelEl = document.getElementById(`${prefix}-label`);
        if (scoreEl) {
            scoreEl.textContent = translations.score_error || '불러올 수 없음';
            scoreEl.style.color = 'var(--text-tertiary)';
            scoreEl.style.fontSize = '18px';
        }
        if (labelEl) labelEl.textContent = '';
    }

    // ===== Trend Bars =====
    function renderTrendBars(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const items = data.slice(0, 7).reverse();
        container.innerHTML = '';

        items.forEach(item => {
            const score = parseInt(item.value);
            const status = getStatusInfo(score);
            const date = item.dateLabel || '';

            const bar = document.createElement('div');
            bar.className = 'trend-bar';

            const fill = document.createElement('div');
            fill.className = 'trend-bar-fill';
            fill.style.height = `${score}%`;
            fill.style.backgroundColor = status.color;

            const valueLabel = document.createElement('span');
            valueLabel.className = 'trend-value';
            valueLabel.textContent = score;

            const dateLabel = document.createElement('span');
            dateLabel.className = 'trend-date';
            dateLabel.textContent = date;

            bar.appendChild(valueLabel);
            bar.appendChild(fill);
            bar.appendChild(dateLabel);
            container.appendChild(bar);
        });
    }

    function renderVixTrendBars(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const items = data.slice(0, 7).reverse();
        container.innerHTML = '';

        items.forEach(item => {
            const val = parseFloat(item.value);
            const status = getVixStatusInfo(val);
            const date = item.dateLabel || '';

            // Normalize VIX (10-80) to percentage for bar height (max 100%)
            const pct = Math.min(100, Math.max(5, ((val - 10) / 70) * 100));

            const bar = document.createElement('div');
            bar.className = 'trend-bar';

            const fill = document.createElement('div');
            fill.className = 'trend-bar-fill';
            fill.style.height = `${pct}%`;
            fill.style.backgroundColor = status.color;

            const valueLabel = document.createElement('span');
            valueLabel.className = 'trend-value';
            valueLabel.textContent = val.toFixed(1);

            const dateLabel = document.createElement('span');
            dateLabel.className = 'trend-date';
            dateLabel.textContent = date;

            bar.appendChild(valueLabel);
            bar.appendChild(fill);
            bar.appendChild(dateLabel);
            container.appendChild(bar);
        });
    }

    function formatDate(timestamp) {
        const d = new Date(parseInt(timestamp) * 1000);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    }

    // ===== Line Charts (Chart.js) =====
    const chartInstances = {};
    let currentPeriod = '30d';

    const PERIOD_CONFIG = {
        '30d':  { cryptoLimit: 30,   vixRange: '1mo',  vixInterval: '1d',  dateFormat: 'short' },
        '1y':   { cryptoLimit: 365,  vixRange: '1y',   vixInterval: '1d',  dateFormat: 'month' },
        '3y':   { cryptoLimit: 1095, vixRange: '3y',   vixInterval: '1wk', dateFormat: 'month' },
        '5y':   { cryptoLimit: 1825, vixRange: '5y',   vixInterval: '1wk', dateFormat: 'year' },
        '10y':  { cryptoLimit: 3650, vixRange: '10y',  vixInterval: '1mo', dateFormat: 'year' },
    };

    function formatChartDate(timestamp, fmt) {
        const d = (typeof timestamp === 'number' && timestamp < 1e12)
            ? new Date(timestamp * 1000)
            : new Date(timestamp);
        if (fmt === 'year') return `${d.getFullYear()}`;
        if (fmt === 'month') return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}`;
        return `${d.getMonth()+1}/${d.getDate()}`;
    }

    function getChartColors() {
        const isDark = document.body.classList.contains('dark-theme');
        return {
            gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            textColor: isDark ? '#868e96' : '#8b95a1',
        };
    }

    function createGradientFill(ctx, colorStops) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        colorStops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
        return gradient;
    }

    function calcMaxTicks(period) {
        if (period === '30d') return 10;
        if (period === '1y') return 12;
        return 10;
    }

    function renderLineChart(canvasId, labels, data, { color, fillStops, yMin, yMax, isVix }) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const ctx = canvas.getContext('2d');
        const colors = getChartColors();
        const fill = createGradientFill(ctx, fillStops);

        const showPoints = data.length <= 60;

        let segmentColor;
        if (!isVix) {
            segmentColor = (ctx) => {
                const v = ctx.p1.parsed.y;
                if (v <= 24) return '#ea3943';
                if (v <= 44) return '#ea8c00';
                if (v <= 55) return '#f5c623';
                if (v <= 74) return '#6ec66a';
                return '#16c784';
            };
        } else {
            segmentColor = (ctx) => {
                const v = ctx.p1.parsed.y;
                if (v >= 40) return '#ea3943';
                if (v >= 30) return '#ea8c00';
                if (v >= 20) return '#f5c623';
                if (v >= 15) return '#6ec66a';
                return '#16c784';
            };
        }

        chartInstances[canvasId] = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data,
                    borderWidth: 2,
                    pointRadius: showPoints ? 2 : 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: color,
                    pointBorderColor: color,
                    fill: true,
                    backgroundColor: fill,
                    tension: 0.3,
                    segment: { borderColor: segmentColor },
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 13, weight: 'bold' },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: colors.textColor,
                            font: { size: 10 },
                            maxRotation: 0,
                            maxTicksLimit: calcMaxTicks(currentPeriod),
                        },
                    },
                    y: {
                        min: yMin,
                        max: yMax,
                        grid: { color: colors.gridColor },
                        ticks: { color: colors.textColor, font: { size: 10 } },
                    }
                },
                interaction: { intersect: false, mode: 'index' },
            }
        });
    }

    // ===== Chart Data Fetching by Period =====
    async function fetchCryptoChart(period) {
        const config = PERIOD_CONFIG[period];
        try {
            const res = await fetch(`https://api.alternative.me/fng/?limit=${config.cryptoLimit}&date_format=world`);
            const json = await res.json();
            const chartData = json.data.slice(0, config.cryptoLimit).reverse();
            renderLineChart('crypto-chart',
                chartData.map(d => formatChartDate(d.timestamp, config.dateFormat)),
                chartData.map(d => parseInt(d.value)),
                { color: '#3182f6', fillStops: [[0,'rgba(49,130,246,0.2)'],[1,'rgba(49,130,246,0.01)']], yMin: 0, yMax: 100, isVix: false }
            );
        } catch (e) { console.error('Crypto chart error:', e); }
    }

    async function fetchCNNChart(period) {
        const config = PERIOD_CONFIG[period];
        const data = await proxyFetch(CNN_TARGET);
        if (data && data.fear_and_greed_historical && data.fear_and_greed_historical.data) {
            const histData = data.fear_and_greed_historical.data;
            const sliceCount = { '30d': 30, '1y': 365, '3y': 1095, '5y': 1825, '10y': 3650 }[period] || 30;
            const chartSlice = histData.slice(-sliceCount);
            renderLineChart('cnn-chart',
                chartSlice.map(d => formatChartDate(d.x, config.dateFormat)),
                chartSlice.map(d => Math.round(d.y)),
                { color: '#e8593e', fillStops: [[0,'rgba(232,89,62,0.2)'],[1,'rgba(232,89,62,0.01)']], yMin: 0, yMax: 100, isVix: false }
            );
        }
    }

    async function fetchVIXChart(period) {
        const config = PERIOD_CONFIG[period];
        const vixUrl = `https://query2.finance.yahoo.com/v8/finance/chart/%5EVIX?range=${config.vixRange}&interval=${config.vixInterval}`;
        const data = await proxyFetch(vixUrl);
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const closes = result.indicators.quote[0].close;
            const timestamps = result.timestamp;
            const chartLabels = [];
            const chartValues = [];
            for (let i = 0; i < timestamps.length; i++) {
                if (closes[i] !== null) {
                    chartLabels.push(formatChartDate(timestamps[i], config.dateFormat));
                    chartValues.push(parseFloat(closes[i].toFixed(1)));
                }
            }
            const yMaxVal = Math.ceil(Math.max(...chartValues, 40) / 10) * 10;
            renderLineChart('vix-chart',
                chartLabels, chartValues,
                { color: '#8b5cf6', fillStops: [[0,'rgba(139,92,246,0.2)'],[1,'rgba(139,92,246,0.01)']], yMin: 10, yMax: yMaxVal, isVix: true }
            );
        }
    }

    async function fetchAllCharts(period) {
        currentPeriod = period;
        await Promise.allSettled([fetchCryptoChart(period), fetchCNNChart(period), fetchVIXChart(period)]);
    }

    // Period selector buttons
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchAllCharts(btn.getAttribute('data-period'));
        });
    });

    // ===== Fetch Functions =====
    async function fetchCryptoFGI() {
        try {
            const res = await fetch(CRYPTO_API);
            const json = await res.json();
            const current = json.data[0];
            const score = parseInt(current.value);

            updateGauge('crypto', score);
            updateTimestamp('crypto-updated');

            const trendData = json.data.slice(0, 7).map(d => ({
                value: d.value,
                dateLabel: formatDate(d.timestamp)
            }));
            renderTrendBars('crypto-trend', trendData);

        } catch (e) {
            console.error('Crypto FGI fetch error:', e);
            showGaugeError('crypto');
        }
    }

    async function fetchCNNFGI() {
        const data = await proxyFetch(CNN_TARGET);

        if (data && data.fear_and_greed) {
            const score = Math.round(data.fear_and_greed.score);
            updateGauge('stock', score);
            updateTimestamp('stock-updated');

            // Parse historical data for trend
            if (data.fear_and_greed_historical && data.fear_and_greed_historical.data) {
                const histData = data.fear_and_greed_historical.data;
                const recentData = histData.slice(-7).map(d => {
                    const date = new Date(d.x);
                    return {
                        value: String(Math.round(d.y)),
                        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`
                    };
                }).reverse();
                renderTrendBars('stock-trend', recentData);
            }
        } else {
            showGaugeError('stock');
            const trendSection = document.getElementById('stock-trend-section');
            const fallback = document.getElementById('stock-fallback');
            if (trendSection) trendSection.style.display = 'none';
            if (fallback) fallback.style.display = 'block';
        }
    }

    async function fetchVIX() {
        const data = await proxyFetch(VIX_TARGET);

        if (data && data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const closes = result.indicators.quote[0].close;
            const timestamps = result.timestamp;

            // Get the latest valid close value
            let latestVix = null;
            for (let i = closes.length - 1; i >= 0; i--) {
                if (closes[i] !== null) {
                    latestVix = closes[i];
                    break;
                }
            }

            if (latestVix !== null) {
                updateVixGauge(latestVix);
                updateTimestamp('vix-updated');

                // Build trend data from daily closes
                const trendData = [];
                for (let i = 0; i < timestamps.length; i++) {
                    if (closes[i] !== null) {
                        const d = new Date(timestamps[i] * 1000);
                        trendData.push({
                            value: closes[i].toFixed(1),
                            dateLabel: `${d.getMonth() + 1}/${d.getDate()}`
                        });
                    }
                }
                renderVixTrendBars('vix-trend', trendData.slice(-7).reverse());
            } else {
                showGaugeError('vix');
            }
        } else {
            showGaugeError('vix');
        }
    }

    async function fetchAllData() {
        await Promise.allSettled([fetchCryptoFGI(), fetchCNNFGI(), fetchVIX()]);
    }

    // ===== Differential Refresh =====
    let cryptoTimer = null;
    let cnnTimer = null;
    let vixTimer = null;

    function startDifferentialRefresh() {
        // Clear existing timers
        if (cryptoTimer) clearInterval(cryptoTimer);
        if (cnnTimer) clearInterval(cnnTimer);
        if (vixTimer) clearInterval(vixTimer);

        const marketOpen = isUSMarketHours();

        // Crypto: always 30 min (daily update)
        cryptoTimer = setInterval(fetchCryptoFGI, 30 * 60 * 1000);

        // CNN: 1 min during market hours, 10 min otherwise
        const cnnInterval = marketOpen ? 1 * 60 * 1000 : 10 * 60 * 1000;
        cnnTimer = setInterval(fetchCNNFGI, cnnInterval);

        // VIX: 3 min during market hours, 30 min otherwise
        const vixInterval = marketOpen ? 3 * 60 * 1000 : 30 * 60 * 1000;
        vixTimer = setInterval(fetchVIX, vixInterval);

        // Update auto-refresh label
        const refreshLabel = document.querySelector('.auto-refresh-label');
        if (refreshLabel) {
            if (marketOpen) {
                refreshLabel.textContent = translations.auto_refresh_market || '장중: CNN 1분 / VIX 3분 / 크립토 30분 간격 갱신';
            } else {
                refreshLabel.textContent = translations.auto_refresh_closed || '장외: CNN 10분 / VIX 30분 / 크립토 30분 간격 갱신';
            }
        }
    }

    // Re-check market hours every 5 minutes to switch intervals
    setInterval(() => {
        startDifferentialRefresh();
    }, 5 * 60 * 1000);

    // Init
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage).then(() => {
        fetchAllData();
        fetchAllCharts('30d');
        startDifferentialRefresh();
    });

} else {
    // Non-dashboard pages
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage);
}
