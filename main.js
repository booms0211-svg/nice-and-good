
import { calculateSaju } from 'https://esm.sh/@fullstackfamily/manseryeok';

const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('saju-result');

calculateBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hour = parseInt(document.getElementById('hour').value);

    resultDiv.classList.remove('visible');

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
        resultDiv.innerHTML = '<p>생년월일시를 모두 입력해주세요.</p>';
        resultDiv.classList.add('visible');
        return;
    }

    try {
        const saju = calculateSaju(year, month, day, hour);
        
        resultDiv.innerHTML = `
            <h2>당신의 사주팔자</h2>
            <div class="saju-grid">
                <div class="saju-pillar">
                    <h3>년주 (年柱)</h3>
                    <p>${saju.yearPillar.join(' ')}</p>
                </div>
                <div class="saju-pillar">
                    <h3>월주 (月柱)</h3>
                    <p>${saju.monthPillar.join(' ')}</p>
                </div>
                <div class="saju-pillar">
                    <h3>일주 (日柱)</h3>
                    <p>${saju.dayPillar.join(' ')}</p>
                </div>
                <div class="saju-pillar">
                    <h3>시주 (時柱)</h3>
                    <p>${saju.hourPillar.join(' ')}</p>
                </div>
            </div>
        `;
    } catch (e) {
        resultDiv.innerHTML = `<p>사주를 계산하는 중 오류가 발생했습니다: ${e.message}</p>`;
    }

    // Add visible class to trigger animation
    setTimeout(() => {
        resultDiv.classList.add('visible');
    }, 10);
});
