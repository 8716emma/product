const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const optionInput = document.getElementById('optionInput');
const addOptionBtn = document.getElementById('addOptionBtn');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const themeBtn = document.getElementById('themeBtn');

// 테마 관리
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList.toggle('light-mode', currentTheme === 'light');
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    drawWheel(); // 테마 변경 시 다시 그리기 (텍스트 그림자 등 대응)
});

let options = ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5', '옵션 6'];
let startAngle = 0;
let arc = Math.PI / (options.length / 2);
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;

const colors = [
    "#FFC312", "#F79F1F", "#E67E22", "#D35400", "#C0392B", "#E74C3C",
    "#9B59B6", "#8E44AD", "#2980B9", "#3498DB", "#1ABC9C", "#16A085",
    "#27AE60", "#2ECC71", "#34495E", "#2C3E50"
];

function drawWheel() {
    const outsideRadius = 200;
    const textRadius = 160;
    const insideRadius = 50;

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
        ctx.stroke();
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 5;
        ctx.fillStyle = "white";
        ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = options[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
}

function spin() {
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000; // 4~7초 사이
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = requestAnimationFrame(rotateWheel);
}

function stopRotateWheel() {
    cancelAnimationFrame(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px Pretendard, sans-serif';
    const text = options[index];
    resultDiv.innerHTML = `결과: <span style="color:${colors[index % colors.length]}">${text}</span>`;
    ctx.restore();
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

addOptionBtn.addEventListener('click', () => {
    const newOption = optionInput.value;
    if (newOption.trim() !== '') {
        options.push(newOption);
        optionInput.value = '';
        arc = Math.PI / (options.length / 2);
        drawWheel();
    }
});

spinBtn.addEventListener('click', () => {
    resultDiv.innerHTML = '';
    spin();
});

drawWheel();
