import { calculateSaju } from 'https://esm.sh/@fullstackfamily/manseryeok';
import { BaziCalculator } from 'https://esm.sh/bazi-calculator-by-alvamind';

const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('saju-result');
const analysisResultDiv = document.getElementById('saju-analysis-result');

// Simple mapping for generating generic advice
const dayMasterAdvice = {
    '甲': '2026년은 새로운 시작을 하기에 좋은 해입니다. 주변 사람들과의 협력을 통해 큰 성과를 이룰 수 있습니다.',
    '乙': '꾸준함이 빛을 발하는 한 해입니다. 진행 중인 일을 마무리하고 내실을 다지는 데 집중하세요.',
    '丙': '당신의 열정이 주변을 밝게 비춥니다. 리더십을 발휘하여 새로운 프로젝트를 이끌어보세요.',
    '丁': '내면의 목소리에 귀 기울여야 할 때입니다. 창의적인 활동이나 명상을 통해 자신을 돌아보세요.',
    '戊': '안정적인 기반 위에 새로운 성을 쌓는 시기입니다. 신중한 계획을 통해 장기적인 성공을 도모하세요.',
    '己': '주변 사람들을 돕고 관계를 돈독히 하는 것이 중요합니다. 당신의 포용력이 빛을 발할 것입니다.',
    '庚': '결단력이 필요한 시기입니다. 과감한 결정으로 정체된 상황을 돌파하고 새로운 길을 개척하세요.',
    '辛': '섬세함과 디테일이 당신의 가치를 높여줍니다. 예술적인 감각을 발휘하거나 전문성을 키워보세요.',
    '壬': '유연한 사고와 적응력이 필요한 한 해입니다. 변화의 물결을 타고 새로운 기회를 잡으세요.',
    '癸': '지혜와 통찰력이 빛을 발합니다. 학문이나 연구에 몰두하여 깊이를 더하기 좋은 시기입니다.'
};

calculateBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hour = parseInt(document.getElementById('hour').value);
    const minute = parseInt(document.getElementById('minute').value) || 0;

    resultDiv.classList.remove('visible');
    resultDiv.innerHTML = ''; // Clear previous results completely

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
        resultDiv.innerHTML = '<p style="color: #ff3c41;">생년월일시를 모두 정확히 입력해주세요.</p>';
        resultDiv.classList.add('visible');
        return;
    }

    setTimeout(() => {
        try {
            // --- Part 1: Calculate Pillars using manseryeok-js ---
            const sajuPillars = calculateSaju(year, month, day, hour, minute);
            if (!sajuPillars || !sajuPillars.yearPillar) {
                throw new Error("Pillar calculation failed.");
            }

            const pillarsHTML = `
                <h2>기본 사주 정보</h2>
                <div class="saju-grid">
                    <div class="saju-pillar"><h3>년주 (年柱)</h3><p>${sajuPillars.yearPillar} <span>${sajuPillars.yearPillarHanja}</span></p></div>
                    <div class="saju-pillar"><h3>월주 (月柱)</h3><p>${sajuPillars.monthPillar} <span>${sajuPillars.monthPillarHanja}</span></p></div>
                    <div class="saju-pillar"><h3>일주 (日柱)</h3><p>${sajuPillars.dayPillar} <span>${sajuPillars.dayPillarHanja}</span></p></div>
                    <div class="saju-pillar"><h3>시주 (時柱)</h3><p>${sajuPillars.hourPillar} <span>${sajuPillars.hourPillarHanja}</span></p></div>
                </div>`;

            // --- Part 2: Get Analysis using bazi-calculator-by-alvamind ---
            // Note: This library requires a gender input, which we don't have. 
            // We'll proceed without it, which might affect the accuracy of some analyses like Da Yun.
            // For basic analysis, it should be acceptable.
            const calculator = new BaziCalculator(year, month, day, hour, 'male'); // Using 'male' as a placeholder
            const analysis = calculator.getCompleteAnalysis();
            const dayMaster = analysis.dayMaster.character;

            // --- Part 3: Generate and display interpretation ---
            const analysisHTML = `
                <div class="analysis-section">
                    <h2>AI 기본 성향 분석</h2>
                    <p>당신은 <strong>${dayMaster} (${analysis.dayMaster.element.name_kr})</strong>의 기운을 가지고 태어났습니다. 이는 ${analysis.dayMaster.yin_yang_kr}의 속성을 지니며, ${analysis.dayMaster.description_kr}</p>
                </div>
                <div class="analysis-section">
                    <h2>2026년 총운</h2>
                    <p>${dayMasterAdvice[dayMaster] || '당신의 2026년을 응원합니다.'}</p>
                </div>
            `;
            
            resultDiv.innerHTML = pillarsHTML;
            resultDiv.innerHTML += analysisHTML; // Append analysis

        } catch (e) {
            console.error("Saju analysis error:", e);
            resultDiv.innerHTML = `<p style="color: #ff3c41;">분석 중 오류가 발생했습니다. 입력 값을 다시 확인해주세요.</p>`;
        }
        
        resultDiv.classList.add('visible');
    }, 50);
});
