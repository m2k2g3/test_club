<?php
header('Content-Type: application/json');

// Asegúrate de que el nombre de tu archivo de clase sea exacto (asociado.php o asociados.php)
require_once __DIR__ . '/asociados.php'; 

try {
    // 1. Intentar leer los datos como JSON (desde JavaScript fetch)
    $json = file_get_contents('php://input');
    $datos = json_decode($json, true);

    // 2. PLAN B: Si el JSON llegó vacío, intentar leer desde $_POST clásico
    if (empty($datos)) {
        $datos = $_POST;
    }

    // 3. Validar que realmente haya llegado información por alguna de las dos vías
    if (empty($datos)) {
        http_response_code(400);
        echo json_encode(["success" => false, "mensaje" => "No se recibieron datos válidos."]);
        exit;
    }

    // 4. Validaciones de cada campo
    if (empty($datos['documento']) || !is_numeric($datos['documento'])) {
        http_response_code(400);
        throw new Exception("El campo 'documento' es obligatorio y debe ser numérico.");
    }

    if (empty(trim($datos['nombres']))) {
        http_response_code(400);
        throw new Exception("El campo 'nombres' es obligatorio.");
    }

    if (empty(trim($datos['apellidos']))) {
        http_response_code(400);
        throw new Exception("El campo 'apellido' es obligatorio.");
    }

    if (empty($datos['fechaNacimiento'])) {
        http_response_code(400);
        throw new Exception("El campo 'fechaNacimiento' es obligatorio.");
    }
    $d = DateTime::createFromFormat('Y-m-d', $datos['fechaNacimiento']);
    if (!$d || $d->format('Y-m-d') !== $datos['fechaNacimiento']) {
        http_response_code(400);
        throw new Exception("El formato de la 'fechaNacimiento' no es válido.");
    }

    $generosPermitidos = ['Masculino', 'Femenino', 'Otro'];
    if (empty($datos['genero']) || !in_array($datos['genero'], $generosPermitidos)) {
        http_response_code(400);
        throw new Exception("El campo 'género' no es válido.");
    }


if (empty(trim($datos['direccionResidencia']))) {
    http_response_code(400);
    throw new Exception("El campo 'dirección' es obligatorio.");
}

    $ciudadesPermitidas = ['Sogamoso', 'Duitama', 'Tunja'];
    if (empty($datos['ciudad']) || !in_array($datos['ciudad'], $ciudadesPermitidas)) {
        http_response_code(400);
        throw new Exception("La ciudad seleccionada no es válida.");
    }

    if (empty($datos['telefono']) || !is_numeric($datos['telefono'])) {
        http_response_code(400);
        throw new Exception("El campo 'teléfono' es obligatorio y debe ser numérico.");
    }

    if (empty($datos['email']) || !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        throw new Exception("El campo 'email' no es válido.");
    }

    // 5. Instanciar y guardar en la base de datos
    $asociado = new Asociado($datos);
    $resultado = $asociado->guardarAsociado();

    if ($resultado) {
        echo json_encode([
            "ok" => true, 
            "success" => true, 
            "mensaje" => "Asociado guardado exitosamente"
        ]);
    } else {
        echo json_encode([
            "ok" => false, 
            "success" => false, 
            "mensaje" => "No se pudo guardar el asociado en la base de datos."
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "ok" => false, 
        "success" => false, 
        "mensaje" => $e->getMessage()
    ]);
}