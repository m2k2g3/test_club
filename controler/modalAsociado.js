// Instancias de Bootstrap
const modalElemento = document.getElementById("modalAsociado");
const modalBootstrap = modalElemento ? new bootstrap.Modal(modalElemento) : null;
const formAsociado = document.getElementById("formAsociado");
const toastElemento = document.getElementById("toastAsociado");
const toastBootstrap = toastElemento ? new bootstrap.Toast(toastElemento) : null;

// Campos del formulario que se rellenan al editar (los id coinciden con las columnas)
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

// Evita la advertencia de accesibilidad (aria-hidden) al cerrar el modal
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

// 1. Abrir el modal con los datos del asociado
function abrirEditar(asociado) {
  formAsociado.reset();

  CAMPOS_ASOCIADO.forEach((campo) => {
    document.getElementById(campo).value = asociado[campo] ?? "";
  });
  // La clave nunca llega del servidor: el campo queda vacío (vacío = no se cambia)

  modalBootstrap?.show();
}

// 2. Eliminar asociado
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

// 3. Guardar cambios
formAsociado?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Los name del formulario coinciden con las columnas, así que se envía todo de una vez
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