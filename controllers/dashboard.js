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

    async function cerrarSesion() {
        try {
            await fetch("../api/api_logout.php", { 
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
        } finally {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    }
});
