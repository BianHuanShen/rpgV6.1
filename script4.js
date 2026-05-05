// ================= CONFIG =================
const size = 10;
const cellSize = 30;

let level = 1;
let coins = 0;
let mode = "grid"; // grid | connect

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
    const cycle = Math.floor((level - 1) / 10) % 2;
    mode = cycle === 0 ? "grid" : "connect";
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
    playerShape = [];
    currentIndex = 0;

    if (mode === "grid") generateGridLevel();
    else generateConnectLevel();

    drawTarget();
    drawPlayer();
}

// ===== NIVEL CUADROS =====
function generateGridLevel() {
    const used = new Set();

    while (targetShape.length < level + 3) {
        const x = rand();
        const y = rand();
        const key = `${x}-${y}`;

        if (!used.has(key)) {
            used.add(key);
            targetShape.push({ x, y });
        }
    }
}

// ===== NIVEL UNIR PUNTOS =====
function generateConnectLevel() {
    const used = new Set();

    let x = rand();
    let y = rand();

    for (let i = 0; i < 6 + Math.floor(level / 3); i++) {
        const key = `${x}-${y}`;

        if (!used.has(key)) {
            used.add(key);
            targetShape.push({ x, y });
        }

        // mover sin repetir ni superponer
        let nx, ny, nkey;
        do {
            nx = clamp(x + randDir());
            ny = clamp(y + randDir());
            nkey = `${nx}-${ny}`;
        } while (used.has(nkey));

        x = nx;
        y = ny;
    }
}

// ================= UTIL =================
function rand() {
    return Math.floor(Math.random() * size);
}

function randDir() {
    return Math.floor(Math.random() * 3) - 1;
}

function clamp(v) {
    return Math.max(0, Math.min(size - 1, v));
}

// ================= DIBUJO =================
function drawTarget() {
    drawGrid(tCtx);

    if (mode === "grid") {
        tCtx.fillStyle = "black";
        targetShape.forEach(p => {
            tCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        });
    }

    if (mode === "connect") {
        tCtx.fillStyle = "black";
        tCtx.font = "12px Arial";
        tCtx.textAlign = "center";

        targetShape.forEach((p, i) => {
            const cx = p.x * cellSize + 15;
            const cy = p.y * cellSize + 15;

            tCtx.beginPath();
            tCtx.arc(cx, cy, 4, 0, Math.PI * 2);
            tCtx.fill();

            tCtx.fillText(i + 1, cx, cy - 8);
        });
    }
}

function drawPlayer() {
    drawGrid(pCtx);

    if (mode === "grid") {
        pCtx.fillStyle = "blue";
        playerShape.forEach(p => {
            pCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        });
    }

    if (mode === "connect") {
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
}

// ================= INPUT =================
function handleInput(clientX, clientY) {
    const rect = playerCanvas.getBoundingClientRect();

    const scaleX = playerCanvas.width / rect.width;
    const scaleY = playerCanvas.height / rect.height;

    const x = Math.floor(((clientX - rect.left) * scaleX) / cellSize);
    const y = Math.floor(((clientY - rect.top) * scaleY) / cellSize);

    if (mode === "grid") {
        togglePoint(x, y);
    } else {
        handleConnect(x, y);
    }

    drawPlayer();
}

function togglePoint(x, y) {
    const i = playerShape.findIndex(p => p.x === x && p.y === y);
    if (i >= 0) playerShape.splice(i, 1);
    else playerShape.push({ x, y });
}

function handleConnect(x, y) {
    const expected = targetShape[currentIndex];

    if (expected && expected.x === x && expected.y === y) {
        playerShape.push({ x, y });
        currentIndex++;

        if (currentIndex === targetShape.length) {
            levelComplete();
        }
    } else {
        showToast("❌ Orden incorrecto");
    }
}

// ================= EVENTOS =================
playerCanvas.addEventListener("click", (e) => {
    handleInput(e.clientX, e.clientY);
});

playerCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
});

// ================= VALIDACIÓN =================
function checkSolution() {
    if (mode !== "grid") return;

    const correct = targetShape.length === playerShape.length &&
        targetShape.every(t =>
            playerShape.some(p => p.x === t.x && p.y === t.y)
        );

    if (correct) levelComplete();
    else showToast("❌ Intenta otra vez");
}

// ================= NIVEL COMPLETADO =================
function levelComplete() {
    coins += 10 + level;
    level++;
    saveGame();

    animateWin();

    setTimeout(() => {
        playerShape = [];
        updateUI();
        generateLevel();
    }, 600);
}

// ================= ANIMACIÓN =================
function animateWin() {
    let alpha = 0;

    const i = setInterval(() => {
        alpha += 0.1;

        pCtx.fillStyle = `rgba(0,255,0,${alpha})`;
        pCtx.fillRect(0, 0, playerCanvas.width, playerCanvas.height);

        if (alpha >= 0.5) clearInterval(i);
    }, 40);
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
    updateUI();
}

initGame();
