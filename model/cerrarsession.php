<?php
header('Content-Type: application/json; charset=utf-8');

try {
    // 1. Validar que el método HTTP sea POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception("Método HTTP no permitido. Solo se acepta POST.");
    }

    // 2. Iniciar sesión si no está iniciada para poder destruirla
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 3. Vaciar todas las variables de sesión
    $_SESSION = [];

    // 4. Invalidar y borrar la cookie de sesión del navegador
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    // 5. Destruir la sesión en el servidor
    session_destroy();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "ok"      => true,
        "message" => "Sesión cerrada correctamente."
    ]);

} catch (Throwable $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode([
        "success" => false,
        "ok"      => false,
        "message" => $e->getMessage()
    ]);
}