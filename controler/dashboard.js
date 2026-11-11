document.addEventListener('DOMContentLoaded', () => {
    const logueado = localStorage.getItem('logueado');

    if (logueado !== 'true') {
        window.location.href = '../vista/login.html';
        return;
    }

    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const rol = (localStorage.getItem('rol') || 'asociado').toLowerCase();

    const nombreElem = document.getElementById('NombreUsuario');
    if (nombreElem) {
        nombreElem.textContent = rol === 'admin' ? `Admin: ${nombre}` : `Asociado: ${nombre}`;
    }

    const seccionAdmin = document.getElementById('seccion-Admin');
    const seccionAsociado = document.getElementById('seccion-Asociado');

    if (rol === 'admin') {
        if (seccionAdmin) seccionAdmin.classList.remove('d-none');
        if (seccionAsociado) seccionAsociado.classList.remove('d-none');
    } else {
        if (seccionAdmin) seccionAdmin.classList.add('d-none');
        if (seccionAsociado) seccionAsociado.classList.remove('d-none');
    }

    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            localStorage.removeItem('logueado');
            localStorage.removeItem('nombre');
            localStorage.removeItem('rol');
            window.location.href = 'login.html';
        });
    }


async function CerrarSesion() {
    try {
        const respuesta = await fetch("../Modelo/cerrarSesion.php", { method: "POST" });

        if (!respuesta.ok) {
            throw new Error("Error al cerrar sesion");
        }

        // Si la sesión se cierra correctamente en el servidor:
        localStorage.clear();
        window.location.href = "../Vista/login.html";

    } catch (error) {
        console.error("Error al cerrar sesion:", error);
    }
}
});