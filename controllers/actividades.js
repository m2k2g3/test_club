// ==========================================
// CONTROLADOR DE ACTIVIDADES
// ==========================================

const listaActividades = document.getElementById('listaActividades');
const modalElemento = document.getElementById("modalActividad");
const modalBootstrap = modalElemento ? new bootstrap.Modal(modalElemento) : null;
const formActividad = document.getElementById("formActividad");
const toastElemento = document.getElementById("toastActividad");
const toastBootstrap = toastElemento ? new bootstrap.Toast(toastElemento) : null;

let esAdmin = false;
let actividades = [];
let accionesConfi = false;

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
        toastElemento.className = `toast align-items-center text-bg-${esError ? 'danger' : 'success'} border-0`;
        toastBootstrap.show();
    }
}

async function solicitarApi(metodo, datos) {
    const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    const rta = await fetch("../api/api_actividades.php", opciones);

    if (rta.status === 401) {
        window.location.href = "login.html";
        return;
    }

    const textoRespuesta = await rta.text();
    let resl;
    try {
        resl = JSON.parse(textoRespuesta);
    } catch (e) {
        console.error("Respuesta cruda del servidor:", textoRespuesta);
        throw new Error("El servidor no devolvió un JSON válido. Revisa la consola.");
    }

    if (!rta.ok || !resl.success) {
        throw new Error(resl.mensaje || resl.message || "Error en la solicitud");
    }

    return resl;
}

async function cargarActividades() {
    try {
        const resultado = await solicitarApi("GET");
        if (!resultado) return;

        esAdmin = resultado.rol === "admin";
        configurarAcciones();
        actividades = resultado.actividades || [];
        mostrarActividades();

    } catch (error) {
        console.error("Error al cargar las actividades:", error.message);
        mostrarMensaje(error.message, true);
    }
}

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto ?? "";
    return celda;
}

function mostrarActividades() {
    listaActividades.replaceChildren();

    if (actividades.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = esAdmin ? 5 : 4;
        celda.className = "text-center py-4 text-muted";
        celda.textContent = "No hay actividades disponibles.";
        fila.append(celda);
        listaActividades.append(fila);
        return;
    }

    actividades.forEach((actividad) => {
        const fila = document.createElement("tr");

        const montoRecaudado = (actividad.totalRecaudado === null || actividad.totalRecaudado === undefined)
            ? "0 o pendiente"
            : Number(actividad.totalRecaudado).toLocaleString("es-CO", { style: "currency", currency: "COP" });

        fila.append(
            crearCelda(actividad.nombreActividad),
            crearCelda(actividad.fechaEvento),
            crearCelda(actividad.municipio),
            crearCelda(montoRecaudado)
        );

        if (esAdmin) {
            const acciones = document.createElement("td");
            acciones.className = "text-nowrap";

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.className = "btn btn-sm btn-outline-primary me-2";
            btnEditar.innerHTML = '<i class="bi bi-pencil-square"></i>';
            btnEditar.title = "Editar actividad";
            btnEditar.addEventListener("click", () => abrirEditar(actividad));

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.className = "btn btn-sm btn-outline-danger";
            btnEliminar.innerHTML = '<i class="bi bi-trash"></i>';
            btnEliminar.title = "Eliminar actividad";
            btnEliminar.addEventListener("click", () => eliminarActividad(actividad));

            acciones.append(btnEditar, btnEliminar);
            fila.append(acciones);
        }

        listaActividades.append(fila);
    });
}

function configurarAcciones() {
    if (accionesConfi) return;

    const btnNueva = document.getElementById("nuevaActividad");
    const encabezadoAcciones = document.getElementById("encabezadoAcciones");

    if (esAdmin) {
        btnNueva?.classList.remove("d-none");
        encabezadoAcciones?.classList.remove("d-none");
        accionesConfi = true;
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

// 3. Eliminar actividad con confirmación
async function eliminarActividad(actividad) {
    const confirmar = confirm(`¿Estás seguro de eliminar la actividad "${actividad.nombreActividad}"?`);
    if (!confirmar) return;

    try {
        const respuesta = await solicitarApi("DELETE", { idActividad: actividad.idActividad });
        mostrarMensaje(respuesta.mensaje || "Actividad eliminada con éxito.");
        await cargarActividades();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// 4. Guardar actividad (Crear o Editar)
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
        datos.idActividad = parseInt(id, 10);
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

// Carga inicial
cargarActividades();
