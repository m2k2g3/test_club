const listaAsociados = document.getElementById("listaAsociados");
let asociados = [];

async function solicitarApi(metodo, datos) {
  const opciones = {
    method: metodo,
    headers: { "Content-Type": "application/json" },
  };

  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  const rta = await fetch("../model/gestionAsociados.php", opciones);

  // Sin sesión: al login
  if (rta.status === 401) {
    window.location.href = "login.html";
    return;
  }

  // Sin permisos para ver la lista: al panel
  // (solo en GET, porque PUT/DELETE también devuelven 403 por reglas como "no puedes eliminarte")
  if (rta.status === 403 && metodo === "GET") {
    window.location.href = "dashboard.html";
    return;
  }

  // Se lee como texto por si PHP devuelve un error en HTML en lugar de JSON
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

cargarAsociados();