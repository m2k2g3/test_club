const lsitaActividades = document.getElementById('listaActividades');

async function solicitarApi (metodo, datos) {

    const opciones = {
        method:  metodo,
        headers : {'Content-type': 'application/json'},
    }

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    const rta = await fetch("../model/gestionActividades" ,opciones);
    const resl = await rta.json();

    if (rta.status === 401) {
    Window.location.href = "login.html";
    }

    if (!rta.ok || !resl.success) {
        throw new Error(resl.mensaje || "Error en la solicitud");
    }
return resl;
}