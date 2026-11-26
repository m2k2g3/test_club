<?php
header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception("Método HTTP no permitido. Solo se acepta POST.");
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION = [];

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

    session_destroy();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "ok"      => true,
        "message" => "Sesión cerrada correctamente.",
        "mensaje" => "Sesión cerrada correctamente."
    ]);

} catch (Throwable $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode([
        "success" => false,
        "ok"      => false,
        "message" => $e->getMessage(),
        "mensaje" => $e->getMessage()
    ]);
}
