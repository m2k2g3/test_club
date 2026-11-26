const formulario = document.getElementById('loginForm');

formulario?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const boton = formulario.querySelector('button[type="submit"]');
    const mensaje = document.getElementById('mensajeLogin');

    if (mensaje) mensaje.textContent = "Iniciando sesión...";
    if (boton) boton.disabled = true;

    const datosFormulario = Object.fromEntries(new FormData(formulario).entries());

    try {
        const urlDestino = formulario.action || "../api/api_login.php";
        const respuesta = await fetch(urlDestino, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosFormulario)
        });

        const resultado = await respuesta.json();

        if (!resultado.success) {
            if (mensaje) mensaje.textContent = resultado.mensaje || resultado.message || "Credenciales inválidas.";
            return;
        }

        localStorage.setItem('logueado', 'true');
        localStorage.setItem('rol', resultado.rol);
        localStorage.setItem('nombre', resultado.nombre || datosFormulario.email || 'Asociado');
        localStorage.setItem('email', resultado.email || datosFormulario.email || '');

        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        if (mensaje) mensaje.textContent = "Error al iniciar sesión. Inténtelo más tarde.";
    } finally {
        if (boton) boton.disabled = false;
    }
});
