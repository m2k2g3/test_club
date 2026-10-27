document.addEventListener('DOMContentLoaded', () => {
    const logueado = localStorage.getItem('logueado');

    if (logueado !== 'true') {
        window.location.href = 'login.html';
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
            localStorage.removeItem('logeado');
            localStorage.removeItem('nombre');
            localStorage.removeItem('rol');
            window.location.href = 'login.html';
        });
    }
});
