const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const langToggleBtn = document.getElementById('lang-toggle');
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

// Page-specific elements (may not exist on all pages)
const recommendBtn = document.getElementById('recommend-btn');
const mealDisplay = document.getElementById('meal-display');
const recommendedMealSpan = document.getElementById('recommended-meal');
const mealImage = document.getElementById('meal-image');
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

    // Update page title based on page-specific title keys
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
        langToggleBtn.textContent = lang === 'ko' ? 'English' : '한국어';
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

// Apply saved theme on initial load
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

    const displayMeal = async (meal) => {
        recommendedMealSpan.textContent = meal;
        if (mealImage) {
            try {
                const response = await fetch(`https://source.unsplash.com/random/800x600/?${meal}`);
                mealImage.src = response.url;
                mealImage.alt = meal;
                mealImage.style.display = 'block';
            } catch (error) {
                console.error('Error fetching image:', error);
                mealImage.style.display = 'none';
            }
        }
    };

    const addToHistory = (meal) => {
        const listItem = document.createElement('li');
        listItem.textContent = meal;
        historyList.prepend(listItem);
    };

    const handleRecommendClick = async () => {
        const meal = recommendMeal();
        await displayMeal(meal);
        addToHistory(meal);
    };

    recommendBtn.addEventListener('click', handleRecommendClick);

    // Initial load with recommendation
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage).then(async () => {
        await handleRecommendClick();
    });
} else {
    // Non-index pages: just load translations
    const savedLanguage = localStorage.getItem('language') || 'ko';
    updateLangButton(savedLanguage);
    loadTranslations(savedLanguage);
}
