
// Instancia del modal de Bootstrap
const modalElemento = document.getElementById("modalActividad");
const modalBootstrap = modalElemento ? new bootstrap.Modal(modalElemento) : null;
const formActividad = document.getElementById("formActividad");
const toastElemento = document.getElementById("toastActividad");
const toastBootstrap = toastElemento ? new bootstrap.Toast(toastElemento) : null;

// Evitar la advertencia de accesibilidad (aria-hidden) al cerrar el modal
modalElemento?.addEventListener("hide.bs.modal", () => {
    if (document.activeElement && modalElemento.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

function mostrarMensaje(texto, esError = false) {
    const contenedor = document.getElementById("mensajeActividades");
    if (contenedor && toastBootstrap) {
        contenedor.textContent = texto;
        toastElemento.className = `toast toast-actividad align-items-center border-0 ${esError ? 'toast-error' : 'toast-exito'}`;
        toastBootstrap.show();
    }
}

// 1. Abrir modal para crear nueva actividad
document.getElementById("nuevaActividad")?.addEventListener("click", () => {
    formActividad.reset();
    document.getElementById("idActividad").value = "";
    document.getElementById("tituloModalActividad").textContent = "Nueva actividad";
    document.getElementById("campoTotalRecaudado").classList.add("d-none");
    modalBootstrap?.show();
});

// 2. Abrir modal en modo edición
function abrirEditar(actividad) {
    formActividad.reset();
    document.getElementById("idActividad").value = actividad.idActividad;
    document.getElementById("nombreActividad").value = actividad.nombreActividad;
    document.getElementById("fechaEvento").value = actividad.fechaEvento;
    document.getElementById("municipio").value = actividad.municipio;

    const campoRecaudado = document.getElementById("campoTotalRecaudado");
    campoRecaudado.classList.remove("d-none");
    document.getElementById("totalRecaudado").value = actividad.totalRecaudado || 0;

    document.getElementById("tituloModalActividad").textContent = "Editar actividad";
    modalBootstrap?.show();
}

// 3. Eliminar actividad
async function eliminarActividad(actividad) {
    const confirmar = confirm(`¿Estás seguro de eliminar la actividad "${actividad.nombreActividad}"?`);
    if (!confirmar) return;

    try {
        await solicitarApi("DELETE", { idActividad: actividad.idActividad });
        mostrarMensaje("Actividad eliminada con éxito.");
        await cargarActividades();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// 4. Guardar (crear o editar)
formActividad?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("idActividad").value;
    const datos = {
        nombreActividad: document.getElementById("nombreActividad").value.trim(),
        fechaEvento: document.getElementById("fechaEvento").value,
        municipio: document.getElementById("municipio").value.trim()
    };

    const metodo = id ? "PUT" : "POST";
    if (id) {
        datos.idActividad = parseInt(id);
        datos.totalRecaudado = parseFloat(document.getElementById("totalRecaudado").value) || 0;
    }

    try {
        const respuesta = await solicitarApi(metodo, datos);
        mostrarMensaje(respuesta.mensaje || respuesta.message || "Guardado exitosamente.");
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        modalBootstrap?.hide();
        await cargarActividades();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

// function crearCelda(texto) {
//     const celda = document.createElement("td");
//     celda.textContent = texto;
//     return celda;
// }