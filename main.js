const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const langToggleBtn = document.getElementById('lang-toggle');
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

// Page-specific elements (may not exist on all pages)
const recommendBtn = document.getElementById('recommend-btn');
const recommendedMealSpan = document.getElementById('recommended-meal');
const historyList = document.getElementById('history-list');

let dinnerMenus = [];
let translations = {};

// Mobile nav toggle
if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        siteNav.classList.toggle('open');
        navToggle.classList.toggle('open');
    });
}

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

    if (translations.dinner_menus) {
        dinnerMenus = translations.dinner_menus;
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

// Recommender functionality (only on index page)
if (recommendBtn && recommendedMealSpan && historyList) {
    const recommendMeal = () => {
        const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
        return dinnerMenus[randomIndex];
    };

    const displayMeal = (meal) => {
        // Slot machine animation
        recommendedMealSpan.style.transition = 'none';
        recommendedMealSpan.style.opacity = '0';
        recommendedMealSpan.style.transform = 'translateY(-12px)';
        requestAnimationFrame(() => {
            recommendedMealSpan.textContent = meal;
            requestAnimationFrame(() => {
                recommendedMealSpan.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                recommendedMealSpan.style.opacity = '1';
                recommendedMealSpan.style.transform = 'translateY(0)';
            });
        });
    };

    const addToHistory = (meal) => {
        const listItem = document.createElement('li');
        listItem.textContent = meal;
        historyList.prepend(listItem);
    };

    const handleRecommendClick = () => {
        const meal = recommendMeal();
        displayMeal(meal);
        addToHistory(meal);
    };

    recommendBtn.addEventListener('click', handleRecommendClick);

    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage).then(() => {
        handleRecommendClick();
    });
} else {
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage);
}
