const lsitaActividades = document.getElementById('listaActividades');
let esAdmin = false;
let actividades = [];

async function solicitarApi(metodo, datos) {
    const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
    }

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    let resl;

    const rta = await fetch("../model/gestionActividades.php", opciones);
    // 1. Primero validamos si no está autorizado antes de intentar leer JSON
    if (rta.status === 401) {
        window.location.href = "login.html";
        return;
    }

    // 2. Leemos la respuesta como texto primero por si el servidor devuelve un error de PHP o HTML
    const textoRespuesta = await rta.text();


    try {
        resl = JSON.parse(textoRespuesta);
    } catch (e) {
        // Si no es un JSON válido (por ejemplo, si bota un error de PHP o texto plano), mostramos qué respondió el servidor
        console.error("Respuesta del servidor no válida:", textoRespuesta);
        throw new Error("El servidor no devolvió un JSON válido. Revisa la consola.");
    }

    if (!rta.ok || !resl.success) {
        throw new Error(resl.mensaje || "Error en la solicitud");
    }
    return resl;
}

async function cargarActividades() {
    try {
        const resultado = await solicitarApi("GET");
        esAdmin = resultado.rol === "admin";

        // Si es admin, mostrar el botón de nueva actividad y la columna de acciones
        if (esAdmin) {
            document.getElementById("nuevaActividad")?.classList.remove("d-none");
            document.getElementById("encabezadoAcciones")?.classList.remove("d-none");
        }

        // configurarAcciones();
        actividades = resultado.actividades || [];
        mostrarActividades();

    } catch (error) {
        console.error("error al cargar las actividadess: ", error.message);
    }
}

async function mostrarActividades() {
    lsitaActividades.replaceChildren();

    if (actividades.length === 0) {//esto es por si no encuentra nada en la base de datos
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = esAdmin ? 5 : 4;
        celda.className = "text-center py-4 text-muted";
        celda.textContent = "NO hay actividades disponibles.";
        fila.append(celda);
        lsitaActividades.append(fila);
        return;
    }

    actividades.forEach((actividad) => {
        const fila = document.createElement("tr");

        fila.append(
            crearCelda(actividad.nombreActividad),
            crearCelda(actividad.fechaEvento),
            crearCelda(actividad.municipio),
            crearCelda(actividad.totalRecaudado === null ? "0 o pendiente" : Number(actividad.totalRecaudado).toLocaleString("es-CO", { style: "currency", currency: "COP" })
            )
        );

        if (esAdmin) {
            const acciones = document.createElement("td");
            acciones.className = "text-nowrap";

            const bntEditar = document.createElement("button");
            bntEditar.type = "button";
            bntEditar.className = "btn btn-sm btn-outline-primary me-2";
            bntEditar.innerHTML = '<i class="bi bi-terminal-x"></i>';
            bntEditar.addEventListener("click", () => abrirEditar(actividad));

            const bntEliminar = document.createElement("button");
            bntEliminar.type = "button";
            bntEliminar.className = "btn btn-sm btn-outline-danger me-2";
            bntEliminar.innerHTML = '<i class="bi bi-chevron-bar-contract"></i>';
            bntEliminar.addEventListener("click", () => eliminarActividad(actividad));

            acciones.append(bntEditar, bntEliminar);
            fila.append(acciones);

        }
        lsitaActividades.append(fila);
    });
}

// Instancia del modal de Bootstrap
const modalElemento = document.getElementById("modalActividad");
const modalBootstrap = modalElemento ? new bootstrap.Modal(modalElemento) : null;
const formActividad = document.getElementById("formActividad");
const toastElemento = document.getElementById("toastActividad");
const toastBootstrap = toastElemento ? new bootstrap.Toast(toastElemento) : null;

function mostrarMensaje(texto, esError = false) {
    const contenedor = document.getElementById("mensajeActividades");
    if (contenedor && toastBootstrap) {
        contenedor.textContent = texto;
        toastElemento.className = `toast align-items-center text-bg-${esError ? 'danger' : 'success'} border-0`;
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
        mostrarMensaje(respuesta.message || "Guardado exitosamente.");
        modalBootstrap?.hide();
        await cargarActividades();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

cargarActividades();