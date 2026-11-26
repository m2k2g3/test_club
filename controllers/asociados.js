// ==========================================
// CONTROLADOR DE ASOCIADOS
// ==========================================

const listaAsociados = document.getElementById("listaAsociados");
const modalElemento = document.getElementById("modalAsociado");
const modalBootstrap = modalElemento ? new bootstrap.Modal(modalElemento) : null;
const formAsociado = document.getElementById("formAsociado");
const toastElemento = document.getElementById("toastAsociado");
const toastBootstrap = toastElemento ? new bootstrap.Toast(toastElemento) : null;

let asociados = [];

const CAMPOS_ASOCIADO = [
    "idAsociado",
    "documento",
    "nombres",
    "apellidos",
    "fechaNacimiento",
    "genero",
    "direccionResidencia",
    "ciudad",
    "telefono",
    "email",
    "rol",
];

// Evitar la advertencia de accesibilidad (aria-hidden) al cerrar el modal
modalElemento?.addEventListener("hide.bs.modal", () => {
    if (document.activeElement && modalElemento.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

function mostrarMensaje(texto, esError = false) {
    const contenedor = document.getElementById("mensajeAsociados");
    if (contenedor && toastBootstrap) {
        contenedor.textContent = texto;
        toastElemento.className = `toast toast-actividad align-items-center border-0 ${esError ? "toast-error" : "toast-exito"}`;
        toastBootstrap.show();
    }
}

async function solicitarApi(metodo, datos) {
    const opciones = {
        method: metodo,
        headers: { "Content-Type": "application/json" },
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    const rta = await fetch("../api/api_asociados.php", opciones);

    if (rta.status === 401) {
        window.location.href = "login.html";
        return;
    }

    if (rta.status === 403 && metodo === "GET") {
        window.location.href = "dashboard.html";
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

async function cargarAsociados() {
    try {
        const resultado = await solicitarApi("GET");
        if (!resultado) return;

        asociados = resultado.asociados || [];
        mostrarAsociados();
    } catch (error) {
        console.error("Error al cargar los asociados:", error.message);
        mostrarMensaje(error.message, true);
    }
}

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto ?? "";
    return celda;
}

function crearBoton(clase, icono, etiqueta, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn btn-sm ${clase}`;
    boton.title = etiqueta;
    boton.setAttribute("aria-label", etiqueta);
    boton.innerHTML = `<i class="bi ${icono}"></i>`;
    boton.addEventListener("click", accion);
    return boton;
}

function mostrarAsociados() {
    listaAsociados.replaceChildren();

    if (asociados.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 12;
        celda.className = "text-center py-4 text-white";
        celda.textContent = "No hay asociados registrados.";
        fila.append(celda);
        listaAsociados.append(fila);
        return;
    }

    asociados.forEach((asociado) => {
        const fila = document.createElement("tr");

        fila.append(
            crearCelda(asociado.idAsociado),
            crearCelda(asociado.documento),
            crearCelda(asociado.nombres),
            crearCelda(asociado.apellidos),
            crearCelda(asociado.fechaNacimiento),
            crearCelda(asociado.genero),
            crearCelda(asociado.direccionResidencia),
            crearCelda(asociado.ciudad),
            crearCelda(asociado.telefono),
            crearCelda(asociado.email),
            crearCelda(asociado.rol)
        );

        const acciones = document.createElement("td");
        acciones.className = "text-nowrap";
        acciones.append(
            crearBoton("btn-light me-2", "bi-pencil-square", "Editar asociado", () => abrirEditar(asociado)),
            crearBoton("btn-danger", "bi-trash", "Eliminar asociado", () => eliminarAsociado(asociado))
        );

        fila.append(acciones);
        listaAsociados.append(fila);
    });
}

// 1. Abrir modal para editar asociado
function abrirEditar(asociado) {
    formAsociado.reset();

    CAMPOS_ASOCIADO.forEach((campo) => {
        const input = document.getElementById(campo);
        if (input) input.value = asociado[campo] ?? "";
    });

    modalBootstrap?.show();
}

// 2. Eliminar asociado con confirmación
async function eliminarAsociado(asociado) {
    const nombre = `${asociado.nombres} ${asociado.apellidos}`;
    const confirmar = confirm(`¿Eliminar al asociado "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
        const respuesta = await solicitarApi("DELETE", { idAsociado: asociado.idAsociado });
        if (!respuesta) return;

        mostrarMensaje(respuesta.mensaje || "Asociado eliminado correctamente.");
        await cargarAsociados();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// 3. Guardar cambios del asociado
formAsociado?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = Object.fromEntries(new FormData(formAsociado));

    for (const campo in datos) {
        if (campo !== "clave" && typeof datos[campo] === "string") {
            datos[campo] = datos[campo].trim();
        }
    }
    datos.idAsociado = parseInt(datos.idAsociado, 10);
    if (!datos.clave) delete datos.clave;

    try {
        const respuesta = await solicitarApi("PUT", datos);
        if (!respuesta) return;

        mostrarMensaje(respuesta.mensaje || "Cambios guardados.");
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        modalBootstrap?.hide();
        await cargarAsociados();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

// Carga inicial
cargarAsociados();
