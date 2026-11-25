const lsitaActividades = document.getElementById('listaActividades');
let esAdmin = false;
let actividades = [];
let accionesConfi = false;

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
        esAdmin = resultado.rol === "admin";

        configurarAcciones();
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
        celda.className = "text-center py-4 text-white";
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
            bntEditar.className = "btn btn-sm btn-light me-2 fw-bold";
            bntEditar.innerHTML = '<i class="bi bi-terminal-x"></i>';
            bntEditar.addEventListener("click", () => abrirEditar(actividad));

            const bntEliminar = document.createElement("button");
            bntEliminar.type = "button";
            bntEliminar.className = "btn btn-sm btn-danger me-2";
            bntEliminar.innerHTML = '<i class="bi bi-chevron-bar-contract"></i>';
            bntEliminar.addEventListener("click", () => eliminarActividad(actividad));

            acciones.append(bntEditar, bntEliminar);
            fila.append(acciones);

        }
        lsitaActividades.append(fila);
    });
}

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}



function configurarAcciones() {
    if (accionesConfi) return;

    const bntNueva = document.getElementById("nuevaActividad");
    const encabezadoAcciones = document.getElementById("encabezadoAcciones");

    if (esAdmin) {
        bntNueva.classList.remove("d-none");
        encabezadoAcciones.classList.remove("d-none");
        accionesConfi = true;
        return;
    }

}

cargarActividades();