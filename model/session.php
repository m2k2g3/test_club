<?php
//
session_start();
header("content-type: application/json; charset=utf-8");

try{
// Validar que el método sea POST; si no lo es, lanzar excepción
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new Exception('Método no permitido.');
    }
// Leer el contenido JSON de la solicitud enviada por fetch
$pdepepitoperez = json_decode(file_get_contents('php://input'), true);

// Validar que los datos se hayan pasado a un array
if (!is_array($pdepepitoperez) || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        throw new Exception('Datos inválidos.');
    }       
// Validar que todos los campos obligatorios estén presentes y no estén vacíos
$email = $pdepepitoperez['email'] ?? "";
$clave = $pdepepitoperez['clave'] ?? "";

// Validar que los campos email y clave no estén vacíos
if (!is_string($email) || !is_string($clave) || empty(trim($email)) || empty(trim($clave))) {
    http_response_code(400);
    throw new Exception('Los campos email y clave son obligatorios o datos inválidos.');
}

}catch(PDOException $e){
    // Manejo de errores de la base de datos
    http_response_code(500);
    echo json_encode(["success" => false, "mensaje" => "Error en la base de datos: " . $e->getMessage()]);
}

// Conexión a la base de datos
require_once __DIR__ . '/../config/conexion.php';
$coxionKFC = (new Conexion()) ->conectar();
// Preparar la consulta para verificar el email
$consulta = $coxionKFC->prepare("SELECT * FROM asociados WHERE email = :email");
$consulta->execute([':email' => $email]);

?>