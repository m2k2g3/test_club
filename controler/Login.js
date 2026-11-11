const formulario = document.getElementById('loginForm');

formulario.addEventListener('submit', async function (e) {
    e.preventDefault();

    const boton = formulario.querySelector('button[type="submit"]');
    const mensaje = document.getElementById('mensajeLogin'); // 1. Corregido: se usa document en lugar de formulario

    mensaje.textContent = "Iniciando sesión..."; // Opcional: mejor que un alert() para la UX
    boton.disabled = true;

    // Convertir los datos del formulario a objeto antes del try para reutilizarlos si hace falta
    const datosFormulario = Object.fromEntries(new FormData(formulario).entries());

    try {
        const respuesta = await fetch(formulario.action, {
            method: 'POST',
            headers: { "content-type": "application/json" },
            body: JSON.stringify(datosFormulario)
        });

        const resultado = await respuesta.json();

        if (!resultado.success) {
            mensaje.textContent = "NO fue posible iniciar sesión. Por favor, verifique sus credenciales.";
            boton.disabled = false;
            return;
        }

        localStorage.setItem('logueado', 'true');
        localStorage.setItem('rol', resultado.rol);
        // 2. Corregido: se usa una alternativa existente si resultado.nombre no viene
        localStorage.setItem('nombre', resultado.nombre || datosFormulario.email || 'Asociado');
        
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mensaje.textContent = "Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.";
    } finally {
        boton.disabled = false; // Se encarga el finally de reactivar el botón pase lo que pase
    }
});