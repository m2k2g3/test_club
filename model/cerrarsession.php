<?php

use Random\Engine\Secure;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    //Saltar a catch y mostrar el mensaje de error
    throw new Exception("Método HTTP no permitido");
}

session_start();
$_SESSION = []; // vaciar la session

//eliminar / inavlidar la COOKIE
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params["domain"], $params["securee"], $params["httponly"]);
}



session_destroy();

echo json_encode(["susses" => true]);
