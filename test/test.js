const dialog = document.querySelector("#window");
const openBtn = document.querySelector("#openModal");
const closeBtn = document.querySelector("#closeBtn");
const minimizeBtn = document.querySelector("#minimizeBtn");
const handle = document.querySelector("#dragHandle");

openBtn.addEventListener("click", () => dialog.showModal());
closeBtn.addEventListener("click", () => dialog.close());

// Se ejecuta con cualquier cierre: botón ×, "Entendido" o tecla Esc
dialog.addEventListener("close", () => {
  setMinimized(false);
  dialog.style.cssText = "";
});

// Minimizar y restaurar
let minimized = false;
let savedStyle = "";

function setMinimized(value) {
  if (value === minimized) return;
  minimized = value;
  dialog.classList.toggle("is-minimized", minimized);
  minimizeBtn.setAttribute("aria-pressed", String(minimized));

  if (minimized) {
    savedStyle = dialog.style.cssText;
    const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);
    dialog.style.left = `${Math.min(20, maxLeft)}px`;
    dialog.style.top = `${Math.max(0, Math.min(window.innerHeight - dialog.offsetHeight - 20, maxTop))}px`;
    dialog.style.transform = "none";
  } else {
    dialog.style.cssText = savedStyle;
  }
}

minimizeBtn.addEventListener("click", () => setMinimized(!minimized));

// Arrastrar con Pointer Events
let dragging = false;
let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

handle.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;

  const rect = dialog.getBoundingClientRect();
  dragging = true;
  startX = event.clientX;
  startY = event.clientY;
  initialLeft = rect.left;
  initialTop = rect.top;

  dialog.style.left = `${initialLeft}px`;
  dialog.style.top = `${initialTop}px`;
  dialog.style.transform = "none";

  handle.setPointerCapture(event.pointerId);
});

handle.addEventListener("pointermove", (event) => {
  if (!dragging) return;

  const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);

  const newLeft = Math.max(0, Math.min(initialLeft + (event.clientX - startX), maxLeft));
  const newTop = Math.max(0, Math.min(initialTop + (event.clientY - startY), maxTop));

  dialog.style.left = `${newLeft}px`;
  dialog.style.top = `${newTop}px`;
});

const stopDragging = (event) => {
  if (!dragging) return;
  dragging = false;
  if (event && handle.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId);
  }
};

handle.addEventListener("pointerup", stopDragging);
handle.addEventListener("pointercancel", stopDragging);

// Mantener la ventana dentro de la pantalla al redimensionar el navegador
window.addEventListener("resize", () => {
  if (!dialog.open) return;
  if (dialog.style.transform !== "none") return;

  const rect = dialog.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);

  dialog.style.left = `${Math.max(0, Math.min(rect.left, maxLeft))}px`;
  dialog.style.top = `${Math.max(0, Math.min(rect.top, maxTop))}px`;
});