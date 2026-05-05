// ================= CONFIG =================
const size = 10;
const cellSize = 30;

let level = 1;
let coins = 0;

let mode = "points"; // points | lines | final

const targetCanvas = document.getElementById("targetCanvas");
const playerCanvas = document.getElementById("playerCanvas");

targetCanvas.width = playerCanvas.width = size * cellSize;
targetCanvas.height = playerCanvas.height = size * cellSize;

const tCtx = targetCanvas.getContext("2d");
const pCtx = playerCanvas.getContext("2d");

let targetShape = [];
let playerShape = [];
let currentIndex = 0;

// ================= GUARDADO =================
function saveGame() {
    localStorage.setItem("gameData", JSON.stringify({ level, coins }));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("gameData"));
    if (data) {
        level = data.level;
        coins = data.coins;
    }
}

// ================= MODOS =================
function updateMode() {
    if (level % 10 === 0) mode = "final";
    else if (level % 5 === 0) mode = "lines";
    else mode = "points";
}

// ================= GRID =================
function drawGrid(ctx) {
    ctx.clearRect(0, 0, size * cellSize, size * cellSize);
    ctx.strokeStyle = "#ccc";

    for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size * cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size * cellSize, i * cellSize);
        ctx.stroke();
    }
}

// ================= GENERAR NIVEL =================
function generateLevel() {
    updateMode();
    targetShape = [];
    currentIndex = 0;

    // Generar puntos en orden (para modo cuaderno)
    let x = Math.floor(Math.random() * size);
    let y = Math.floor(Math.random() * size);

    for (let i = 0; i < 5 + Math.floor(level / 2); i++) {
        targetShape.push({ x, y });

        x = clamp(x + randDir());
        y = clamp(y + randDir());
    }

    drawTarget();
}

// ================= UTIL =================
function randDir() {
    return Math.floor(Math.random() * 3) - 1;
}

function clamp(v) {
    return Math.max(0, Math.min(size - 1, v));
}

// ================= DIBUJO =================
function drawTarget() {
    drawGrid(tCtx);

    tCtx.fillStyle = "black";
    tCtx.font = "12px Arial";
    tCtx.textAlign = "center";

    targetShape.forEach((p, i) => {
        const cx = p.x * cellSize + 15;
        const cy = p.y * cellSize + 15;

        // Punto
        tCtx.beginPath();
        tCtx.arc(cx, cy, 4, 0, Math.PI * 2);
        tCtx.fill();

        // Número
        tCtx.fillText(i + 1, cx, cy - 8);
    });
}

// DIBUJO JUGADOR
function drawPlayer() {
    drawGrid(pCtx);

    pCtx.strokeStyle = "blue";
    pCtx.lineWidth = 2;

    for (let i = 0; i < playerShape.length - 1; i++) {
        const a = playerShape[i];
        const b = playerShape[i + 1];

        pCtx.beginPath();
        pCtx.moveTo(a.x * cellSize + 15, a.y * cellSize + 15);
        pCtx.lineTo(b.x * cellSize + 15, b.y * cellSize + 15);
        pCtx.stroke();
    }
}

// ================= INPUT =================
function handleInput(clientX, clientY) {
    const rect = playerCanvas.getBoundingClientRect();

    const scaleX = playerCanvas.width / rect.width;
    const scaleY = playerCanvas.height / rect.height;

    const x = Math.floor(((clientX - rect.left) * scaleX) / cellSize);
    const y = Math.floor(((clientY - rect.top) * scaleY) / cellSize);

    const expected = targetShape[currentIndex];

    // Solo permite seguir el orden correcto (1 → 2 → 3...)
    if (expected && expected.x === x && expected.y === y) {
        playerShape.push({ x, y });
        currentIndex++;
        drawPlayer();

        // COMPLETADO
        if (currentIndex === targetShape.length) {
            levelCompleteAnimation();
        }
    } else {
        showToast("❌ Orden incorrecto");
    }
}

playerCanvas.addEventListener("click", (e) => {
    handleInput(e.clientX, e.clientY);
});

playerCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
});

// ================= ANIMACIÓN =================
function levelCompleteAnimation() {
    let alpha = 0;

    const interval = setInterval(() => {
        alpha += 0.1;

        pCtx.fillStyle = `rgba(0,255,0,${alpha})`;
        pCtx.fillRect(0, 0, playerCanvas.width, playerCanvas.height);

        if (alpha >= 0.5) {
            clearInterval(interval);

            coins += 10 + level;
            level++;
            saveGame();

            showToast("🎉 Figura completada!");

            playerShape = [];
            updateUI();
            generateLevel();
            drawPlayer();
        }
    }, 50);
}

// ================= RESET =================
function clearBoard() {
    playerShape = [];
    currentIndex = 0;
    drawPlayer();
}

// ================= UI =================
function updateUI() {
    document.getElementById("level").textContent = level;
    document.getElementById("coins").textContent = coins;
}

// ================= INIT =================
function initGame() {
    loadGame();
    generateLevel();
    drawPlayer();
    updateUI();
}

initGame();
