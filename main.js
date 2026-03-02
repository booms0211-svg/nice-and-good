import { calculateSaju } from 'https://esm.sh/@fullstackfamily/manseryeok';

const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('saju-result');

calculateBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hour = parseInt(document.getElementById('hour').value);

    // Always reset the result div
    resultDiv.classList.remove('visible');
    resultDiv.innerHTML = '';

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
        resultDiv.innerHTML = '<p style="color: #ff453a;">생년월일시를 정확히 입력해주세요.</p>';
        resultDiv.classList.add('visible');
        return;
    }

    // A short delay to allow the "visible" class removal to render, ensuring the animation restarts
    setTimeout(() => {
        try {
            const saju = calculateSaju(year, month, day, hour);
            
            resultDiv.innerHTML = `
                <h2>당신의 사주팔자</h2>
                <div class="saju-grid">
                    <div class="saju-pillar">
                        <h3>년주 (年柱)</h3>
                        <p>${saju.yearPillar} <span>${saju.yearPillarHanja}</span></p>
                    </div>
                    <div class="saju-pillar">
                        <h3>월주 (月柱)</h3>
                        <p>${saju.monthPillar} <span>${saju.monthPillarHanja}</span></p>
                    </div>
                    <div class="saju-pillar">
                        <h3>일주 (日柱)</h3>
                        <p>${saju.dayPillar} <span>${saju.dayPillarHanja}</span></p>
                    </div>
                    <div class="saju-pillar">
                        <h3>시주 (時柱)</h3>
                        <p>${saju.hourPillar} <span>${saju.hourPillarHanja}</span></p>
                    </div>
                </div>
            `;
        } catch (e) {
            resultDiv.innerHTML = `<p style="color: #ff453a;">계산 중 오류가 발생했습니다. 입력 값을 확인해주세요. (${e.message})</p>`;
        }
        
        resultDiv.classList.add('visible');
    }, 50);
});
