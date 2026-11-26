<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../models/Asociado.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception('Método no permitido. Solo se acepta POST.');
    }

    $input = file_get_contents('php://input');
    $datos = json_decode($input, true);

    if (!is_array($datos) || json_last_error() !== JSON_ERROR_NONE) {
        $datos = $_POST;
    }

    if (!is_array($datos) || empty($datos)) {
        http_response_code(400);
        throw new Exception('Datos inválidos o vacíos.');
    }

    $email = trim((string)($datos['email'] ?? $datos['usuario'] ?? ''));
    $clave = (string)($datos['clave'] ?? '');

    if ($email === '' || $clave === '') {
        http_response_code(400);
        throw new Exception('Los campos email y contraseña son obligatorios.');
    }

    $modelo = new Asociado();
    $asociado = $modelo->obtenerPorEmail($email);

    $hashBD = (string)($asociado['clave'] ?? $asociado['clave_hash'] ?? '');

    $claveValida = false;
    if ($asociado && $hashBD !== '') {
        if (password_verify($clave, $hashBD)) {
            $claveValida = true;
        } elseif ($clave === $hashBD) {
            // Compatibilidad por si se insertó en texto plano en la base de datos
            $claveValida = true;
        }
    }

    if (!$claveValida) {
        http_response_code(401);
        throw new Exception('Credenciales inválidas.');
    }

    $rol = !empty($asociado['rol']) ? strtolower((string)$asociado['rol']) : 'asociado';
    $_SESSION["rol"] = $rol;
    $_SESSION["email"] = $asociado['email'] ?? $email;

    $nombreCompleto = trim(($asociado['nombres'] ?? '') . ' ' . ($asociado['apellidos'] ?? ''));
    if ($nombreCompleto === '') {
        $nombreCompleto = $email;
    }

    echo json_encode([
        'success' => true,
        'ok'      => true,
        'message' => 'Inicio de sesión exitoso.',
        'mensaje' => 'Inicio de sesión exitoso.',
        'rol'     => $rol,
        'email'   => $asociado['email'] ?? $email,
        'nombre'  => $nombreCompleto,
        'nombres' => $nombreCompleto
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'ok'      => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage(),
        'mensaje' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Throwable $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'ok'      => false,
        'message' => $e->getMessage(),
        'mensaje' => $e->getMessage()
    ]);
}
