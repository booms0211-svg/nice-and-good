const recommendBtn = document.getElementById('recommend-btn');
const mealDisplay = document.getElementById('meal-display');
const recommendedMealSpan = document.getElementById('recommended-meal');
const mealImage = document.getElementById('meal-image');
const historyList = document.getElementById('history-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const langToggleBtn = document.getElementById('lang-toggle');

let dinnerMenus = [];
let translations = {};

const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.textContent = translations.theme_toggle_light;
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.textContent = translations.theme_toggle_dark;
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
        elem.textContent = translations[key];
    });
    document.title = translations.title;
    dinnerMenus = translations.dinner_menus;
};

const loadTranslations = async (lang) => {
    const response = await fetch(`locales/${lang}.json`);
    translations = await response.json();
    applyTranslations();
    // Re-apply theme to update button text
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
};

const updateLangButton = (lang) => {
    langToggleBtn.textContent = lang === 'ko' ? 'English' : '한국어';
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

langToggleBtn.addEventListener('click', toggleLanguage);

// Apply saved theme on initial load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggleBtn.addEventListener('click', toggleTheme);

const recommendMeal = () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    return dinnerMenus[randomIndex];
};

const displayMeal = async (meal) => {
    recommendedMealSpan.textContent = meal;
    try {
        const response = await fetch(`https://source.unsplash.com/random/800x600/?${meal}`);
        mealImage.src = response.url;
        mealImage.alt = meal;
        mealImage.style.display = 'block';
    } catch (error) {
        console.error('Error fetching image:', error);
        mealImage.style.display = 'none';
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

// Initial load
const savedLanguage = localStorage.getItem('language') || 'ko';
updateLangButton(savedLanguage);
loadTranslations(savedLanguage).then(async () => {
    await handleRecommendClick();
});
