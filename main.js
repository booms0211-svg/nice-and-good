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

// ===== Fear & Greed Index (only on index page) =====
const cryptoNeedle = document.getElementById('crypto-needle');
const stockNeedle = document.getElementById('stock-needle');

if (cryptoNeedle) {
    const CRYPTO_API = 'https://api.alternative.me/fng/?limit=30&date_format=world';
    const CNN_PROXY_URLS = [
        'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://production.dataviz.cnn.io/index/fearandgreed/graphdata'),
        'https://corsproxy.io/?' + encodeURIComponent('https://production.dataviz.cnn.io/index/fearandgreed/graphdata')
    ];

    function getStatusInfo(score) {
        if (score <= 24) return { key: 'status_extreme_fear', color: '#ea3943', fallback: '극도의 공포' };
        if (score <= 44) return { key: 'status_fear', color: '#ea8c00', fallback: '공포' };
        if (score <= 55) return { key: 'status_neutral', color: '#f5c623', fallback: '중립' };
        if (score <= 74) return { key: 'status_greed', color: '#6ec66a', fallback: '탐욕' };
        return { key: 'status_extreme_greed', color: '#16c784', fallback: '극도의 탐욕' };
    }

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

    function formatDate(timestamp) {
        const d = new Date(parseInt(timestamp) * 1000);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    }

    async function fetchCryptoFGI() {
        try {
            const res = await fetch(CRYPTO_API);
            const json = await res.json();
            const current = json.data[0];
            const score = parseInt(current.value);

            updateGauge('crypto', score);

            const updatedEl = document.getElementById('crypto-updated');
            if (updatedEl) {
                const prefix = translations.updated_prefix || '업데이트: ';
                updatedEl.textContent = prefix + formatDate(current.timestamp);
            }

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
        let data = null;

        for (const url of CNN_PROXY_URLS) {
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
                if (res.ok) {
                    data = await res.json();
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (data && data.fear_and_greed) {
            const score = Math.round(data.fear_and_greed.score);
            updateGauge('stock', score);

            const updatedEl = document.getElementById('stock-updated');
            if (updatedEl) {
                const prefix = translations.updated_prefix || '업데이트: ';
                updatedEl.textContent = prefix + (translations.updated_just_now || '방금 전');
            }

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

    async function fetchAllData() {
        await Promise.allSettled([fetchCryptoFGI(), fetchCNNFGI()]);
    }

    // Init
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage).then(() => {
        fetchAllData();
    });

    // Auto-refresh every 5 minutes
    setInterval(fetchAllData, 5 * 60 * 1000);

} else {
    // Non-dashboard pages
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage);
}
