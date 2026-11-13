const lsitaActividades = document.getElementById('listaActividades');
let esAdmin = false;
let actividades = [];

async function solicitarApi(metodo, datos) {

    const opciones = {
        method: metodo,
        headers: { 'Content-type': 'application/json' },
    }

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }
    const rta = await fetch("../model/gestionActividades.php", opciones);
    const resl = await rta.json();

    if (rta.status === 401) {
        window.location.href = "login.html";
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
        // configurarAcciones();
        actividades = resultado.actividades;
        mostrarActividades();

    } catch (error) {
        alert("error al cargar las actividadess: " + error.message);
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
            acciones.className="text-nowrap";
            
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
}

function crearCelda (texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

cargarActividades();