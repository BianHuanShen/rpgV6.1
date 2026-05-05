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
let tempPoint = null;

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

    if (mode === "points" || mode === "final") {
        for (let i = 0; i < level + 2; i++) {
            targetShape.push(randomPoint());
        }
    }

    if (mode === "lines") {
        let start = randomPoint();

        for (let i = 0; i < 5 + Math.floor(level / 2); i++) {
            let next = {
                x: clamp(start.x + randDir()),
                y: clamp(start.y + randDir())
            };

            targetShape.push({ from: start, to: next });
            start = next;
        }
    }

    drawTarget();
}

// ================= UTIL =================
function randomPoint() {
    return {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size)
    };
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
    tCtx.fillStyle = "black";
    tCtx.strokeStyle = "black";

    if (mode === "points" || mode === "final") {
        targetShape.forEach(p => {
            tCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        });
    }

    if (mode === "lines") {
        targetShape.forEach(l => {
            tCtx.beginPath();
            tCtx.moveTo(l.from.x * cellSize + 15, l.from.y * cellSize + 15);
            tCtx.lineTo(l.to.x * cellSize + 15, l.to.y * cellSize + 15);
            tCtx.stroke();
        });
    }
}

function drawPlayer() {
    drawGrid(pCtx);
    pCtx.fillStyle = "blue";
    pCtx.strokeStyle = "blue";

    if (mode === "points" || mode === "final") {
        playerShape.forEach(p => {
            pCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
        });
    }

    if (mode === "lines") {
        playerShape.forEach(l => {
            pCtx.beginPath();
            pCtx.moveTo(l.from.x * cellSize + 15, l.from.y * cellSize + 15);
            pCtx.lineTo(l.to.x * cellSize + 15, l.to.y * cellSize + 15);
            pCtx.stroke();
        });
    }
}

// ================= INPUT =================
function handleInput(clientX, clientY) {
    const rect = playerCanvas.getBoundingClientRect();

    const scaleX = playerCanvas.width / rect.width;
    const scaleY = playerCanvas.height / rect.height;

    const x = Math.floor(((clientX - rect.left) * scaleX) / cellSize);
    const y = Math.floor(((clientY - rect.top) * scaleY) / cellSize);

    if (mode === "points" || mode === "final") {
        togglePoint(x, y);
    } else {
        if (!tempPoint) {
            tempPoint = { x, y };
        } else {
            playerShape.push({ from: tempPoint, to: { x, y } });
            tempPoint = null;
        }
    }

    drawPlayer();
}

function togglePoint(x, y) {
    const i = playerShape.findIndex(p => p.x === x && p.y === y);
    if (i >= 0) playerShape.splice(i, 1);
    else playerShape.push({ x, y });
}

playerCanvas.addEventListener("click", (e) => {
    handleInput(e.clientX, e.clientY);
});

playerCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
});

// ================= VALIDACIÓN =================
function checkSolution() {
    let correct = false;

    if (mode === "points" || mode === "final") {
        correct = targetShape.length === playerShape.length &&
            targetShape.every(t =>
                playerShape.some(p => p.x === t.x && p.y === t.y)
            );
    }

    if (mode === "lines") {
        correct = playerShape.length === targetShape.length;
    }

    if (correct) {
        coins += 10 + level;
        level++;
        saveGame();

        showToast("✔ Nivel superado");
        playerShape = [];

        updateUI();
        generateLevel();
    } else {
        showToast("❌ Sigue intentando");
    }
}

// ================= RESET =================
function clearBoard() {
    playerShape = [];
    tempPoint = null;
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
