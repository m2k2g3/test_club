const form = document.getElementById("FormRegistro");

if (form) {
    form.addEventListener("submit", async function (event) {
        // Evitar que se recargue la página al enviar el formulario
        event.preventDefault();

        const btnGuardar = form.querySelector("button[type='submit']");
        const mensajeP = document.getElementById("mensaje_registro");

        // 1. Obtener los valores de los inputs de contraseña
        const clave = form.querySelector("#clave").value;
        const claveConfirmar = form.querySelector("#clave-confirmar").value;

        // 2. Definir las reglas de validación de la contraseña
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
            if (mensajeP) {
                mensajeP.textContent = fallo.msg;
                mensajeP.dataset.tipo = "error";
                mensajeP.style.color = "#ff6b6b";
                mensajeP.style.fontWeight = "bold";
                mensajeP.style.textAlign = "center";
                mensajeP.style.marginTop = "12px";
            }
            return; // Detiene el envío si no cumple las reglas
        }

        // 4. Preparar los datos del formulario si las contraseñas son válidas
        const asociado = Object.fromEntries(new FormData(form).entries());

        // Eliminar 'clave-confirmar' antes de enviarlo al servidor
        delete asociado['clave-confirmar'];

        // Desactivar el botón mientras se procesa la solicitud
        if (btnGuardar) btnGuardar.disabled = true;

        if (mensajeP) {
            mensajeP.textContent = "Registrando asociado...";
            mensajeP.dataset.tipo = "info";
            mensajeP.style.color = "#ffffff";
        }

        try {
            const urlDestino = form.action || "../model/guardar_asociados.php";
            const response = await fetch(urlDestino, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asociado)
            });

            const resultado = await response.json();

            if (mensajeP) {
                mensajeP.textContent = resultado.mensaje || resultado.message || "Operación procesada.";
                mensajeP.style.textAlign = "center";
                mensajeP.style.marginTop = "12px";
                mensajeP.style.fontWeight = "bold";
            }

            if (resultado.success || resultado.ok) {
                if (mensajeP) {
                    mensajeP.dataset.tipo = "exito";
                    mensajeP.style.color = "#4eff9d";
                }

                form.reset();

                // Redirigir al inicio de sesión tras 2 segundos
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                if (mensajeP) {
                    mensajeP.dataset.tipo = "error";
                    mensajeP.style.color = "#ff6b6b";
                }
            }

        } catch (error) {
            console.error("Error al guardar el asociado:", error);
            if (mensajeP) {
                mensajeP.textContent = "Ocurrió un error al comunicarse con el servidor.";
                mensajeP.dataset.tipo = "error";
                mensajeP.style.color = "#ff6b6b";
            }
        } finally {
            if (btnGuardar) btnGuardar.disabled = false;
        }
    });
}
