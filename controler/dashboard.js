document.addEventListener('DOMContentLoaded', () => {
    // 1. Validar autenticación local
    const logueado = localStorage.getItem('logueado');

    if (logueado !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Cargar datos del usuario en la interfaz
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const rol = (localStorage.getItem('rol') || 'asociado').toLowerCase();

    const nombreElem = document.getElementById('NombreUsuario');
    if (nombreElem) {
        nombreElem.textContent = rol === 'admin' ? `Admin: ${nombre}` : `Asociado: ${nombre}`;
    }

    // 3. Control de visibilidad por rol
    const seccionAdmin = document.getElementById('seccion-Admin');
    const seccionAsociado = document.getElementById('seccion-Asociado');

    if (rol === 'admin') {
        if (seccionAdmin) seccionAdmin.classList.remove('d-none');
        if (seccionAsociado) seccionAsociado.classList.remove('d-none');
    } else {
        if (seccionAdmin) seccionAdmin.classList.add('d-none');
        if (seccionAsociado) seccionAsociado.classList.remove('d-none');
    }

    // 4. Asignar evento al botón de Cerrar Sesión
    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', async () => {
            btnCerrar.disabled = true;
            btnCerrar.innerHTML = 'Cerrando... <span class="spinner-border spinner-border-sm"></span>';
            await cerrarSesion();
        });
    }

    // 5. Función que destruye la sesión en el servidor y limpia el navegador
    async function cerrarSesion() {
        try {
            const respuesta = await fetch("../model/cerrarsession.php", { 
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!respuesta.ok) {
                console.warn("El servidor respondió con error al cerrar sesión.");
            }
        } catch (error) {
            console.error("Error de red al cerrar sesión en el servidor:", error);
        } finally {
            // Se limpia el almacenamiento local y se redirige pase lo que pase
            localStorage.clear();
            window.location.href = 'login.html';
        }
    }
});