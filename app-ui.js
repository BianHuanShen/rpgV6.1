// =======================
// UI MODO APP MÓVIL
// =======================

// Crear layout tipo app automáticamente
function initMobileUI() {
    document.body.innerHTML = `
        <div class="app">

            <header class="app-header">
                <div class="level">Nivel <span id="level">1</span></div>
                <div class="coins">💰 <span id="coins">0</span></div>
            </header>

            <main class="app-main">

                <div class="card">
                    <h3>Figura</h3>
                    <canvas id="targetCanvas"></canvas>
                </div>

                <div class="card">
                    <h3>Tu dibujo</h3>
                    <canvas id="playerCanvas"></canvas>
                </div>

            </main>

            <footer class="app-footer">
                <button id="btnCheck">✔ Verificar</button>
                <button id="btnClear">🧹 Limpiar</button>
            </footer>

            <div id="toast"></div>

        </div>
    `;

    attachEvents();
}

// =======================
// EVENTOS UI
// =======================
function attachEvents() {
    document.getElementById("btnCheck").onclick = () => {
        checkSolution();
        showToast(document.getElementById("message").textContent);
    };

    document.getElementById("btnClear").onclick = () => {
        clearBoard();
        showToast("Tablero limpio");
    };
}

// =======================
// TOAST (mensajes tipo app)
// =======================
function showToast(text) {
    const toast = document.getElementById("toast");
    toast.innerText = text;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// =======================
// HAPTIC (vibración móvil)
// =======================
function vibrate(ms = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(ms);
    }
}

// =======================
// MEJORAR INTERACCIÓN CANVAS
// =======================
function enhanceTouch() {
    document.addEventListener("click", () => vibrate(30));
}

// =======================
// RESPONSIVE CANVAS
// =======================
function resizeCanvas() {
    const canvases = document.querySelectorAll("canvas");

    canvases.forEach(c => {
        c.style.width = "100%";
        c.style.height = "auto";
    });
}

// =======================
// INIT APP UI
// =======================
window.addEventListener("load", () => {
    initMobileUI();

    // Esperar que tu script original cargue
    setTimeout(() => {
        resizeCanvas();
        enhanceTouch();

        // Re-vincular canvas al juego
        window.targetCanvas = document.getElementById("targetCanvas");
        window.playerCanvas = document.getElementById("playerCanvas");

        // Reiniciar juego
        generateLevel();
        drawPlayer();
        updateUI();
    }, 100);
});
