<?php
// gestionActividades.php
session_start();
header("Content-Type: application/json; charset=UTF-8");

function leerDatos()
{
    $datos = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }
    return $datos;
}

function validarActividades(array $datos)
{
    $nombre = $datos['nombreActividad'] ?? null;
    $fecha = $datos['fechaEvento'] ?? null;
    $municipio = $datos['municipio'] ?? null;

    if (
        !is_string($nombre) || trim($nombre) === "" || strlen($nombre) > 100
        || !is_string($municipio) || trim($municipio) === "" || strlen($municipio) > 50
    ) {
        http_response_code(400);
        throw new Exception(
            "ingrese un nobre y municipio validos"
        );
    }
    return [
        "nombreActividad" => trim($nombre),
        "fechaEvento" => $fecha,
        "municio" => trim($municipio)
    ];
}

function validarID(int $id)
{
    $idActividad = filter_var($id, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
    if ($idActividad === false) {
        http_response_code(400);
        throw new Exception(
            "ID no valido"
        );
    }
    return $idActividad;
}

try {
    if (!isset($_SESSION["email"], $_SESSION["rol"])) {
        http_response_code(401);
        throw new Exception("Inciar sesion para consultar las actividades");
    }

    $metodo = $_SERVER["REQUEST_METHOD"];

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
                "success" => true,
                "rol" => $_SESSION["rol"],
                "actividades" => $actividad->obtenerActividades()
            ];
            http_response_code(200);
            break;

        case "POST":
            $datos = validarActividades(leerDatos());
            $actividad->guardar($datos);
            $resultado = [
                "success" => true,
                "message" => "Actividad creada exitosamente"
            ];
            http_response_code(201);
            break;

        case "PUT":
            $datos = leerDatos();
            $datos["idActividad"] = validarID($datos["idActividad"]) ?? null;
            $datos = array_merge($datos, validarActividades($datos));

            if (!$actividad->editar($datos)) {
                http_response_code(404);
                throw new Exception("no se encontro la actividad :<");
            }
            $resultado = [
                "success" => true,
                "mensaje" => "Actividad actualizada correctamente :>"
            ];
            break;

        case "DELETE":
            $datos = leerDatos();
            $idActividad = validarActividades($datos["idActividad"] ?? null);

            if (!$actividad->eliminar($datos)) {
                http_response_code(404);
                throw new Exception("no se encontro la activida :<");
            }
            $resultado = [
                "success" => true,
                "mensaje" => "Actividad se elimino correctamente :>"
            ];
            break;
    }
    echo json_encode($resultado);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en la base de datos: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()

    ]);
}
