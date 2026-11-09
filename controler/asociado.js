// tomar datos del formulario
const form = document.getElementById("FormRegistro");

form.addEventListener("submit", async function (event) {

    // Evitar que se recargue la página al enviar el formulario
    event.preventDefault();

    //bloquear el boton de guardar
    const btnGuardar = form.querySelector("button[type='submit']");

    //leer campos del formulario y los convierte en un objeto
    const asociado = Object.fromEntries(new FormData(form).entries());

    if (asociado.clave !== asociado["clave-confirmar"]) {
        document.getElementById("mensaje_registro").textContent = "Las contraseñas no coinciden."; // Mostrar mensaje en el párrafo
        document.getElementById("mensaje_registro").dataset.tipo = "error";

    }

    delete asociado["clave-confirmar"]; // Eliminar la propiedad "clave-confirmar" del objeto asociado

    btnGuardar.disabled = true; //desactivar el botón de guardar mientras se procesa la solicitud

    try {
        const response = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(asociado) });
        const resultado = await response.json();//pasar la respuesta de json a un objeto de javascript
        document.getElementById("mensaje_registro").textContent = "guardo exitosamente"; // Mostrar mensaje en el párrafo
        document.getElementById("mensaje_registro").dataset.tipo = "";
        document.getElementById("mensaje_registro").textContent = resultado.mensaje; // Mostrar mensaje en el párrafo
        if (resultado.ok && resultado.success) {
            form.reset(); // Limpiar el formulario si la 

            // Si el registro fue exitoso, redirigir a la página de inicio de sesión
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        }

    } catch (error) {
        console.error("Error al guardar el asociado:", error);
        alert("Ocurrió un error al guardar el asociado.");
        document.getElementById("mensaje_registro").textContent = "Ocurrió un error al guardar el asociado."; // Mostrar mensaje en el párrafo
    }

    btnGuardar.disabled = false; //activar el botón de guardar después de procesar la solicitud

});



