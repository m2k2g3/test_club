<?php
// gestionAsociados.php
session_start();
header("Content-Type: application/json; charset=UTF-8");

// Ajusta estas listas a los valores que realmente guarda tu base de datos
const GENEROS = ["Masculino", "Femenino", "Otro"];
const ROLES = ["admin", "asociado"];

function leerDatos()
{
    $datos = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($datos)) {
        http_response_code(400);
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }
    return $datos;
}

function validarTexto($valor, string $campo, int $max): string
{
    if (!is_string($valor) || trim($valor) === "" || mb_strlen(trim($valor)) > $max) {
        http_response_code(400);
        throw new Exception("El campo $campo es obligatorio y no puede superar $max caracteres");
    }
    return trim($valor);
}

function validarAsociado(array $datos): array
{
    $documento = trim((string) ($datos['documento'] ?? ""));
    if (!preg_match('/^\d{5,15}$/', $documento)) {
        http_response_code(400);
        throw new Exception("El documento debe tener entre 5 y 15 dígitos");
    }

    $nombres = validarTexto($datos['nombres'] ?? null, "nombres", 60);
    $apellidos = validarTexto($datos['apellidos'] ?? null, "apellidos", 60);

    $fecha = $datos['fechaNacimiento'] ?? null;
    $f = is_string($fecha) ? DateTime::createFromFormat('!Y-m-d', $fecha) : false;
    if (!$f || $f->format('Y-m-d') !== $fecha || $f > new DateTime('today')) {
        http_response_code(400);
        throw new Exception("Ingrese una fecha de nacimiento válida (AAAA-MM-DD)");
    }

    $genero = $datos['genero'] ?? null;
    if (!in_array($genero, GENEROS, true)) {
        http_response_code(400);
        throw new Exception("Seleccione un género válido");
    }

    $direccion = validarTexto($datos['direccionResidencia'] ?? null, "dirección", 100);
    $ciudad = validarTexto($datos['ciudad'] ?? null, "ciudad", 50);

    $telefono = preg_replace('/[\s-]/', '', (string) ($datos['telefono'] ?? ""));
    if (!preg_match('/^\+?\d{7,15}$/', $telefono)) {
        http_response_code(400);
        throw new Exception("Ingrese un teléfono válido (7 a 15 dígitos)");
    }

    $email = trim((string) ($datos['email'] ?? ""));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 100) {
        http_response_code(400);
        throw new Exception("Ingrese un correo electrónico válido");
    }

    $rol = $datos['rol'] ?? null;
    if (!in_array($rol, ROLES, true)) {
        http_response_code(400);
        throw new Exception("Seleccione un rol válido");
    }

    // La clave es opcional al editar: vacía = no se cambia
    $clave = $datos['clave'] ?? "";
    if (!is_string($clave) || ($clave !== "" && mb_strlen($clave) < 8)) {
        http_response_code(400);
        throw new Exception("La nueva clave debe tener al menos 8 caracteres");
    }

    return [
        "documento" => $documento,
        "nombres" => $nombres,
        "apellidos" => $apellidos,
        "fechaNacimiento" => $fecha,
        "genero" => $genero,
        "direccionResidencia" => $direccion,
        "ciudad" => $ciudad,
        "telefono" => $telefono,
        "email" => $email,
        "rol" => $rol,
        "clave" => $clave
    ];
}

function validarID($id): int
{
    $idAsociado = filter_var($id, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
    if ($idAsociado === false) {
        http_response_code(400);
        throw new Exception("ID no válido");
    }
    return $idAsociado;
}

try {
    if (!isset($_SESSION["email"], $_SESSION["rol"])) {
        http_response_code(401);
        throw new Exception("Inicie sesión para gestionar los asociados");
    }

    // Aquí hay datos personales de todos: solo administradores, incluso para leer
    if ($_SESSION["rol"] !== "admin") {
        http_response_code(403);
        throw new Exception("No tienes permisos para gestionar asociados");
    }

    $metodo = $_SERVER["REQUEST_METHOD"];
    if (!in_array($metodo, ["GET", "PUT", "DELETE"], true)) {
        http_response_code(405);
        throw new Exception("Método HTTP no permitido");
    }

    require_once __DIR__ . "/listAsociados.php";
    $asociado = new Asociado();
    $resultado = [];

    switch ($metodo) {
        case "GET":
            $resultado = [
                "success" => true,
                "asociados" => $asociado->obtenerAsociados()
            ];
            http_response_code(200);
            break;

        case "PUT":
            $entrada = leerDatos();
            $id = validarID($entrada["idAsociado"] ?? null);
            $datos = validarAsociado($entrada);

            $actual = $asociado->obtenerPorId($id);
            if (!$actual) {
                http_response_code(404);
                throw new Exception("No se encontró el asociado");
            }

            // Evita que el administrador se quite el rol a sí mismo y se bloquee
            $esMismo = strcasecmp($actual["email"], $_SESSION["email"]) === 0;
            if ($esMismo && $datos["rol"] !== $actual["rol"]) {
                http_response_code(403);
                throw new Exception("No puedes cambiar tu propio rol");
            }

            $asociado->editar($datos + ["idAsociado" => $id]);

            if ($esMismo) {
                $_SESSION["email"] = $datos["email"];
            }

            $resultado = [
                "success" => true,
                "mensaje" => "Asociado actualizado correctamente."
            ];
            break;

        case "DELETE":
            $entrada = leerDatos();
            $id = validarID($entrada["idAsociado"] ?? null);

            $actual = $asociado->obtenerPorId($id);
            if (!$actual) {
                http_response_code(404);
                throw new Exception("No se encontró el asociado");
            }

            if (strcasecmp($actual["email"], $_SESSION["email"]) === 0) {
                http_response_code(403);
                throw new Exception("No puedes eliminar tu propia cuenta");
            }

            $asociado->eliminar($id);
            $resultado = [
                "success" => true,
                "mensaje" => "Asociado eliminado correctamente."
            ];
            break;
    }

    echo json_encode($resultado);
} catch (PDOException $e) {
    error_log("gestionAsociados.php: " . $e->getMessage());

    // Códigos de MySQL/MariaDB: 1062 = valor duplicado, 1451 = tiene registros relacionados
    $codigoDB = (int) ($e->errorInfo[1] ?? 0);

    if ($codigoDB === 1062) {
        http_response_code(409);
        $mensaje = "Ya existe un asociado con ese documento o correo";
    } elseif ($codigoDB === 1451) {
        http_response_code(409);
        $mensaje = "No se puede eliminar: el asociado tiene registros relacionados";
    } else {
        http_response_code(500);
        $mensaje = "Error en la base de datos";
    }

    echo json_encode(["success" => false, "message" => $mensaje]);
} catch (Exception $e) {
    if (http_response_code() === 200) {
        http_response_code(500);
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}