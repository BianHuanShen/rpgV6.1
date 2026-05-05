const size = 10;
const cellSize = 30;

let level = 1;
let coins = 0;

const targetCanvas = document.getElementById("targetCanvas");
const playerCanvas = document.getElementById("playerCanvas");

targetCanvas.width = playerCanvas.width = size * cellSize;
targetCanvas.height = playerCanvas.height = size * cellSize;

const tCtx = targetCanvas.getContext("2d");
const pCtx = playerCanvas.getContext("2d");

let targetShape = [];
let playerShape = [];

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

// ================= NIVEL =================
function generateLevel() {
    targetShape = [];

    for (let i = 0; i < level + 2; i++) {
        targetShape.push({
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size)
        });
    }

    drawTarget();
}

// ================= DIBUJO =================
function drawTarget() {
    drawGrid(tCtx);

    tCtx.fillStyle = "black";
    targetShape.forEach(p => {
        tCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    });
}

function drawPlayer() {
    drawGrid(pCtx);

    pCtx.fillStyle = "blue";
    playerShape.forEach(p => {
        pCtx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    });
}

// ================= INPUT =================
playerCanvas.addEventListener("click", (e) => {
    const rect = playerCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    const index = playerShape.findIndex(p => p.x === x && p.y === y);

    if (index >= 0) playerShape.splice(index, 1);
    else playerShape.push({ x, y });

    drawPlayer();
});

// ================= VALIDAR =================
function checkSolution() {
    const correct = targetShape.length === playerShape.length &&
        targetShape.every(t =>
            playerShape.some(p => p.x === t.x && p.y === t.y)
        );

    if (correct) {
        coins += 10;
        level++;
        saveGame();
        showToast("✔ Correcto!");
        playerShape = [];
        updateUI();
        generateLevel();
    } else {
        showToast("❌ Intenta otra vez");
    }
}

// ================= RESET =================
function clearBoard() {
    playerShape = [];
    drawPlayer();
}

// ================= UI =================
function updateUI() {
    document.getElementById("level").textContent = level;
    document.getElementById("coins").textContent = coins;
}

// ================= INIT =================
loadGame();
generateLevel();
drawPlayer();
updateUI();
