<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/asociados.php';

try {
    // 1. Validar que el método sea POST; si no lo es, lanzar excepción
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception('Método no permitido. Solo se acepta POST.');
    }

    // 2. Leer el contenido JSON de la solicitud enviada por fetch o fallback a $_POST
    $json = file_get_contents('php://input');
    $datos = json_decode($json, true);

    if (!is_array($datos) || json_last_error() !== JSON_ERROR_NONE) {
        $datos = $_POST;
    }

    // 3. Validar que los datos se hayan pasado a un array válido
    if (!is_array($datos) || empty($datos)) {
        http_response_code(400);
        throw new Exception('Datos inválidos o vacíos.');
    }

    // 4. Normalizar datos soportando nombres en singular y plural
    $datosNormalizados = [
        'documento'           => trim((string)($datos['documento'] ?? '')),
        'nombres'             => trim((string)($datos['nombres'] ?? $datos['nombre'] ?? '')),
        'apellidos'           => trim((string)($datos['apellidos'] ?? $datos['apellido'] ?? '')),
        'fechaNacimiento'     => trim((string)($datos['fechaNacimiento'] ?? '')),
        'genero'              => trim((string)($datos['genero'] ?? '')),
        'direccionResidencia' => trim((string)($datos['direccionResidencia'] ?? $datos['direccion'] ?? '')),
        'ciudad'              => trim((string)($datos['ciudad'] ?? $datos['cuidad'] ?? '')),
        'telefono'            => trim((string)($datos['telefono'] ?? '')),
        'email'               => trim((string)($datos['email'] ?? '')),
        'clave'               => (string)($datos['clave'] ?? '')
    ];

    $camposRequeridos = [
        'documento'           => 'documento',
        'nombres'             => 'nombres',
        'apellidos'           => 'apellidos',
        'fechaNacimiento'     => 'fechaNacimiento',
        'genero'              => 'genero',
        'direccionResidencia' => 'direccionResidencia',
        'ciudad'              => 'ciudad',
        'telefono'            => 'telefono',
        'email'               => 'email',
        'clave'               => 'clave'
    ];

    // 5. Validar que todos los campos obligatorios estén presentes y no vacíos
    foreach ($camposRequeridos as $claveCampo => $nombreVisible) {
        if ($datosNormalizados[$claveCampo] === '') {
            http_response_code(400);
            throw new Exception("El campo: '$nombreVisible' es obligatorio.");
        }
    }

    // 6. Validar el formato del campo email
    if (!filter_var($datosNormalizados['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        throw new Exception("El campo: 'email' no es válido.");
    }

    // 7. Validaciones de seguridad de la contraseña
    $clave = $datosNormalizados['clave'];

    if (mb_strlen($clave) < 8) {
        http_response_code(400);
        throw new Exception("La contraseña debe tener al menos 8 caracteres.");
    }

    $reglas = [
        '/[A-Z]/'         => "La contraseña debe incluir al menos una letra mayúscula.",
        '/[a-z]/'         => "La contraseña debe incluir al menos una letra minúscula.",
        '/\d/'            => "La contraseña debe incluir al menos un número.",
        '/[@$!%*?&_\-#]/' => "La contraseña debe incluir al menos un carácter especial (@$!%*?&-_#).",
    ];

    foreach ($reglas as $patron => $mensaje) {
        if (!preg_match($patron, $clave)) {
            http_response_code(400);
            throw new Exception($mensaje);
        }
    }

    // 8. Instanciar el modelo y guardar en la base de datos
    $asociado = new Asociado($datosNormalizados);
    $resultado = $asociado->guardarAsociado();

    if ($resultado) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'ok'      => true,
            'mensaje' => 'Asociado guardado correctamente.'
        ]);
    } else {
        http_response_code(500);
        throw new Exception('Error al guardar el asociado.');
    }

} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Código de violación de clave única (PK o UNIQUE)
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "ok"      => false,
            "mensaje" => "El documento o correo electrónico ya se encuentra registrado."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "ok"      => false,
            "mensaje" => "Error en la base de datos: " . $e->getMessage()
        ]);
    }
} catch (Throwable $e) {
    // Si ya se había asignado un código de error HTTP previo (400, 405), lo respetamos
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode([
        "success" => false,
        "ok"      => false,
        "mensaje" => $e->getMessage()
    ]);
}
