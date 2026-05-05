// BOTONES
document.getElementById("btnCheck").onclick = checkSolution;
document.getElementById("btnClear").onclick = clearBoard;

// TOAST
function showToast(text) {
    const toast = document.getElementById("toast");
    toast.innerText = text;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// VIBRACIÓN (móvil)
document.addEventListener("click", () => {
    if (navigator.vibrate) navigator.vibrate(30);
});
