<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../models/Asociado.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception('Método no permitido. Solo se acepta POST.');
    }

    $json = file_get_contents('php://input');
    $datos = json_decode($json, true);

    if (!is_array($datos) || json_last_error() !== JSON_ERROR_NONE) {
        $datos = $_POST;
    }

    if (!is_array($datos) || empty($datos)) {
        http_response_code(400);
        throw new Exception('Datos inválidos o vacíos.');
    }

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

    foreach ($camposRequeridos as $claveCampo => $nombreVisible) {
        if ($datosNormalizados[$claveCampo] === '') {
            http_response_code(400);
            throw new Exception("El campo '$nombreVisible' es obligatorio.");
        }
    }

    if (!filter_var($datosNormalizados['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        throw new Exception("El campo 'email' no es válido.");
    }

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

    $asociado = new Asociado();
    $resultado = $asociado->registrar($datosNormalizados);

    if ($resultado) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'ok'      => true,
            'mensaje' => 'Asociado registrado correctamente.',
            'message' => 'Asociado registrado correctamente.'
        ]);
    } else {
        http_response_code(500);
        throw new Exception('Error al registrar el asociado.');
    }

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "ok"      => false,
            "mensaje" => "El documento o correo electrónico ya se encuentra registrado.",
            "message" => "El documento o correo electrónico ya se encuentra registrado."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "ok"      => false,
            "mensaje" => "Error en la base de datos: " . $e->getMessage(),
            "message" => "Error en la base de datos: " . $e->getMessage()
        ]);
    }
} catch (Throwable $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode([
        "success" => false,
        "ok"      => false,
        "mensaje" => $e->getMessage(),
        "message" => $e->getMessage()
    ]);
}
