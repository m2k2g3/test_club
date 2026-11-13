<?php
session_start();
header("Content-Type: appplication/json; charset=UTF-8");

function leerDatos()
{
    $datos = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }
    return $datos;
}

try {
    if (!isset($_SESSION["documento"], $_SESSION["rol"])) {
        http_response_code(401);
        throw new Exception("Inciar sesion para consultar las actividades");
    }

    $metodo = $_SERVER["REQUEST_MRTHOD"];

    if (!in_array($metodo, ["GET", "POST", "PUT", "DELETE"], true)) {
        http_response_code(405);
        throw new Exception("Metodo HTTP no permitido");
    }

    if ($metodo !== "GET" && $_SESSION["rol"] !== "admin") {
        http_response_code(403);
        throw new Exception("No tienes permisos para realizar esta accion");
    }

    require_once __DIR__ . "/actividad.php";
    $actividad = new actividad();
    $resultado = [];    

    switch ($metodo) {
        case "GET":
            $resultado = [
                "sussess" => true,
                "rol" => $_SESSION["rol"],
                "actividades" => $actividad->obtenerActividades()
            ];
            http_response_code(200);
            break;

        // case "POST":
        //     // $datos = validarActividades(leerDatos());
        //     $actividad->guardar($datos);
        //     $resultado = [
        //         "success" => true,
        //         "message" => "Actividad creada exitosamente"
        //     ];
        //     http_response_code(201);
        //     break;
    }
    echo json_encode($resultado);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "mensage" => "Error en la base de datos: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()

    ]);
}






//lokijuhygt