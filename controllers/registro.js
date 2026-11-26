const form = document.getElementById("FormRegistro");

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const btnGuardar = form.querySelector("button[type='submit']");
        const mensajeP = document.getElementById("mensaje_registro");

        const clave = form.querySelector("#clave").value;
        const claveConfirmar = form.querySelector("#clave-confirmar").value;

        const reglas = [
            { ok: clave.length >= 8, msg: "La contraseña debe tener al menos 8 caracteres." },
            { ok: /[a-z]/.test(clave), msg: "La contraseña debe incluir al menos una letra minúscula." },
            { ok: /[A-Z]/.test(clave), msg: "La contraseña debe incluir al menos una letra mayúscula." },
            { ok: /[0-9]/.test(clave), msg: "La contraseña debe incluir al menos un número." },
            { ok: /[@$!%*?&_\-#]/.test(clave), msg: "La contraseña debe incluir al menos un carácter especial (@$!%*?&-_#)." },
            { ok: clave === claveConfirmar, msg: "Las contraseñas no coinciden." }
        ];

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
            return;
        }

        const asociado = Object.fromEntries(new FormData(form).entries());
        delete asociado['clave-confirmar'];

        if (btnGuardar) btnGuardar.disabled = true;

        if (mensajeP) {
            mensajeP.textContent = "Registrando asociado...";
            mensajeP.dataset.tipo = "info";
            mensajeP.style.color = "#ffffff";
        }

        try {
            const urlDestino = form.action || "../api/api_registro.php";
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
            console.error("Error al registrar el asociado:", error);
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
