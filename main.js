// 테마 관리
const themeBtn = document.getElementById('themeBtn');
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList.toggle('light-mode', currentTheme === 'light');
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    drawWheel(); 
});

// --- 페이지 전환 로직 ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(pageId)) item.classList.add('active');
    });

    if (pageId === 'wheelPage') drawWheel();
}
window.showPage = showPage;

// --- 돌림판 로직 ---
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const optionInput = document.getElementById('optionInput');
const addOptionBtn = document.getElementById('addOptionBtn');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
let options = ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5', '옵션 6'];
let startAngle = 0;
let arc = Math.PI / (options.length / 2);
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
const colors = ["#FFC312", "#F79F1F", "#E67E22", "#D35400", "#C0392B", "#E74C3C", "#9B59B6", "#8E44AD", "#2980B9", "#3498DB", "#1ABC9C", "#16A085", "#27AE60", "#2ECC71", "#34495E", "#2C3E50"];

function drawWheel() {
    const outsideRadius = 200, textRadius = 160, insideRadius = 50;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = document.body.classList.contains('light-mode') ? "#ccc" : "#fff";
    ctx.lineWidth = 2;
    ctx.font = 'bold 18px Pretendard, sans-serif';
    for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
        ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
        ctx.stroke(); ctx.fill();
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 5; ctx.fillStyle = "white";
        ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = options[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
}

function spin() { spinTime = 0; spinTimeTotal = Math.random() * 3000 + 4000; rotateWheel(); }
function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) { stopRotateWheel(); return; }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180); drawWheel();
    spinTimeout = requestAnimationFrame(rotateWheel);
}
function stopRotateWheel() {
    cancelAnimationFrame(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90, arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    resultDiv.innerHTML = `결과: <span style="color:${colors[index % colors.length]}">${options[index]}</span>`;
}
function easeOut(t, b, c, d) { const ts = (t /= d) * t, tc = ts * t; return b + c * (tc + -3 * ts + 3 * t); }
addOptionBtn.addEventListener('click', () => {
    if (optionInput.value.trim() !== '') { options.push(optionInput.value); optionInput.value = ''; arc = Math.PI / (options.length / 2); drawWheel(); }
});
spinBtn.addEventListener('click', () => { resultDiv.innerHTML = ''; spin(); });
drawWheel();

// --- AI 동물상 테스트 로직 (이미지 업로드 방식) ---
const AI_URL = "https://teachablemachine.withgoogle.com/models/JZKjOD0_-/";
let aiModel, maxPredictions;

async function loadModel() {
    if (!aiModel) {
        const modelURL = AI_URL + "model.json";
        const metadataURL = AI_URL + "metadata.json";
        aiModel = await tmImage.load(modelURL, metadataURL);
        maxPredictions = aiModel.getTotalClasses();
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const spinner = document.getElementById("loading-spinner");
    const previewContainer = document.getElementById("image-preview-container");
    const faceImage = document.getElementById("face-image");
    const labelContainer = document.getElementById("label-container");

    spinner.classList.remove("hidden");
    labelContainer.innerHTML = "";
    previewContainer.classList.add("hidden");

    // 이미지 미리보기 세팅
    const reader = new FileReader();
    reader.onload = async (e) => {
        faceImage.src = e.target.result;
        previewContainer.classList.remove("hidden");
        
        // 모델 로드 및 예측
        await loadModel();
        
        // 이미지 객체 생성하여 예측 (약간의 딜레이를 주어 이미지가 완전히 로드되게 함)
        setTimeout(async () => {
            const prediction = await aiModel.predict(faceImage);
            displayResults(prediction);
            spinner.classList.add("hidden");
        }, 200);
    };
    reader.readAsDataURL(file);
}
window.handleImageUpload = handleImageUpload;

function displayResults(prediction) {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classTitle = prediction[i].className === "Class 1" ? "강아지" : 
                           prediction[i].className === "Class 2" ? "고양이" : prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const barContainer = document.createElement("div");
        barContainer.className = "prediction-bar-container";
        
        const bar = document.createElement("div");
        bar.className = "prediction-bar";
        bar.style.width = probability + "%";
        
        const label = document.createElement("span");
        label.className = "prediction-label";
        label.innerHTML = `${classTitle}: ${probability}%`;
        
        if (probability > 50) {
            bar.style.background = "var(--accent-color)";
        } else {
            bar.style.background = "rgba(255, 255, 255, 0.3)";
        }
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        labelContainer.appendChild(barContainer);
    }
}
