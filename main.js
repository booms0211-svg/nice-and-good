
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColor(number);

        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    background-color: ${color};
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }

    getColor(number) {
        const num = parseInt(number);
        if (num <= 10) return '#f59e0b'; // Yellow
        if (num <= 20) return '#3b82f6'; // Blue
        if (num <= 30) return '#ef4444'; // Red
        if (num <= 40) return '#22c55e'; // Green
        return '#a855f7'; // Purple
    }
}

customElements.define('lotto-ball', LottoBall);

const generateBtn = document.getElementById('generate-btn');
const numbersDisplay = document.getElementById('numbers-display');
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

const generateNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
};

const displayNumbers = (numbers) => {
    numbersDisplay.innerHTML = '';
    numbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        numbersDisplay.appendChild(lottoBall);
    });
};

const addToHistory = (numbers) => {
    const listItem = document.createElement('li');
    listItem.textContent = numbers.join(', ');
    historyList.prepend(listItem);
};

const handleGenerateClick = () => {
    const numbers = generateNumbers();
    displayNumbers(numbers);
    addToHistory(numbers);
};

generateBtn.addEventListener('click', handleGenerateClick);

// Initial generation
handleGenerateClick();

