
import { calculateSaju } from 'https://esm.sh/@fullstackfamily/manseryeok';

const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('saju-result');

calculateBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hour = parseInt(document.getElementById('hour').value);
    const minute = parseInt(document.getElementById('minute').value) || 0; // Default to 0 if empty

    resultDiv.classList.remove('visible');
    resultDiv.innerHTML = '';

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
        resultDiv.innerHTML = '<p style="color: #ff453a;">생년월일과 시간을 모두 정확히 입력해주세요.</p>';
        resultDiv.classList.add('visible');
        return;
    }

    setTimeout(() => {
        try {
            const saju = calculateSaju(year, month, day, hour, minute);

            // Defensive check
            if (!saju || !saju.yearPillar || !saju.monthPillar || !saju.dayPillar || !saju.hourPillar) {
                throw new Error("API로부터 유효한 사주 데이터를 받지 못했습니다.");
            }
            
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
            console.error("사주 계산 오류:", e); // Log the full error for debugging
            resultDiv.innerHTML = `<p style="color: #ff453a;">계산 중 오류가 발생했습니다. 입력 값을 다시 확인해주세요.</p>`;
        }
        
        resultDiv.classList.add('visible');
    }, 50);
});
