// 1. Obtener los valores de los inputs de contraseña
const clave = form.querySelector("#clave").value;
const claveConfirmar = form.querySelector("#clave-confirmar").value;

// 2. Definir tus reglas de validación
const reglas = [
    { ok: clave.length >= 8, msg: "La contraseña debe tener al menos 8 caracteres." },
    { ok: /[a-z]/.test(clave), msg: "La contraseña debe incluir al menos una letra minúscula." },
    { ok: /[A-Z]/.test(clave), msg: "La contraseña debe incluir al menos una letra mayúscula." },
    { ok: /[0-9]/.test(clave), msg: "La contraseña debe incluir al menos un número." },
    { ok: /[@$!%*?&_\-#]/.test(clave), msg: "La contraseña debe incluir al menos un carácter especial (@$!%*?&-_#)." },
    { ok: clave === claveConfirmar, msg: "Las contraseñas no coinciden." }
];

// 3. Buscar la primera regla que falle
const fallo = reglas.find(r => !r.ok);
if (fallo) {
    const mensajeP = document.getElementById("mensaje_registro");
    mensajeP.textContent = fallo.msg;
    mensajeP.dataset.tipo = "error";
    return; // Detiene el envío del formulario
}