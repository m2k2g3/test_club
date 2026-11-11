<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

try {
    // 1. Validar que el método sea POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception('Método no permitido. Solo se acepta POST.');
    }

    // 2. Leer datos tanto si vienen por JSON (fetch) como por $_POST
    $input = file_get_contents('php://input');
    $datos = json_decode($input, true);

    if (!is_array($datos) || json_last_error() !== JSON_ERROR_NONE) {
        $datos = $_POST;
    }

    if (!is_array($datos) || empty($datos)) {
        http_response_code(400);
        throw new Exception('Datos inválidos o vacíos.');
    }

    // 3. Extraer email y clave (admitiendo 'email' o 'usuario')
    $email = trim((string)($datos['email'] ?? $datos['usuario'] ?? ''));
    $clave = (string)($datos['clave'] ?? '');

    // Validar que no estén vacíos
    if ($email === '' || $clave === '') {
        http_response_code(400);
        throw new Exception('Los campos email y contraseña son obligatorios.');
    }

    // 4. Conexión a la base de datos
    require_once __DIR__ . '/../config/conexion.php';
    $conexion = (new Conexion())->conectar();

    // 5. Preparar y ejecutar la consulta para buscar al asociado por email
    $consulta = $conexion->prepare("SELECT * FROM asociados WHERE email = :email LIMIT 1");
    $consulta->execute([':email' => $email]);
    $asociado = $consulta->fetch(PDO::FETCH_ASSOC);

    // 6. Obtener el hash de la contraseña guardada (admite 'clave' o 'clave_hash')
    $hashBD = (string)($asociado['clave'] ?? $asociado['clave_hash'] ?? '');

    // 7. Validación segura: verificar existencia, presencia de hash y contraseña correcta
    if (!$asociado || $hashBD === '' || !password_verify($clave, $hashBD)) {
        http_response_code(401);
        throw new Exception('Credenciales inválidas.');
    }

    // 8. Iniciar sesión y almacenar datos en $_SESSION
    $rol = !empty($asociado['rol']) ? strtolower((string)$asociado['rol']) : 'asociado';
    $_SESSION["rol"] = $rol;
    $_SESSION["email"] = $asociado['email'] ?? $email;

    $nombreCompleto = trim(($asociado['nombres'] ?? '') . ' ' . ($asociado['apellidos'] ?? ''));
    if ($nombreCompleto === '') {
        $nombreCompleto = $email;
    }

    // 9. Responder JSON con toda la información necesaria
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
