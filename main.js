const recommendBtn = document.getElementById('recommend-btn');
const mealDisplay = document.getElementById('meal-display');
const recommendedMealSpan = document.getElementById('recommended-meal');
const mealImage = document.getElementById('meal-image');
const historyList = document.getElementById('history-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const langKoBtn = document.getElementById('lang-ko');
const langEnBtn = document.getElementById('lang-en');

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

const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    loadTranslations(lang);
};

langKoBtn.addEventListener('click', () => setLanguage('ko'));
langEnBtn.addEventListener('click', () => setLanguage('en'));

// Apply saved theme on initial load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggleBtn.addEventListener('click', toggleTheme);

const recommendMeal = () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    return dinnerMenus[randomIndex];
};

const displayMeal = (meal) => {
    recommendedMealSpan.textContent = meal;
    const mealImageName = meal.toLowerCase().replace(/ /g, '_') + '.jpg';
    mealImage.src = `images/${mealImageName}`;
    mealImage.alt = meal;
    mealImage.style.display = 'block';
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

// Initial load
const savedLanguage = localStorage.getItem('language') || 'ko';
loadTranslations(savedLanguage).then(() => {
    handleRecommendClick();
});
