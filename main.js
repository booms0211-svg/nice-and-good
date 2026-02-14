
const recommendBtn = document.getElementById('recommend-btn');
const mealDisplay = document.getElementById('meal-display');
const recommendedMealSpan = document.getElementById('recommended-meal');
const historyList = document.getElementById('history-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    }
};

const toggleTheme = () => {
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
};

// Apply saved theme on initial load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggleBtn.addEventListener('click', toggleTheme);

const dinnerMenus = [
    "김치찌개", "된장찌개", "비빔밥", "불고기", "제육볶음",
    "삼겹살", "갈비찜", "닭갈비", "순두부찌개", "부대찌개",
    "초밥", "파스타", "피자", "스테이크", "돈까스",
    "샌드위치", "샐러드", "카레", "짜장면", "짬뽕"
];

const recommendMeal = () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    return dinnerMenus[randomIndex];
};

const displayMeal = (meal) => {
    recommendedMealSpan.textContent = meal;
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

// Initial recommendation
handleRecommendClick();

