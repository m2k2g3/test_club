<?php

require_once __DIR__ . '/../config/conexion.php';

class Asociado {
    private string $documento;
    private string $nombres;
    private string $apellidos;
    private DateTime $fechaNacimiento;
    private string $genero;
    private string $direccionResidencia;
    private string $ciudad; 
    private string $telefono; 
    private string $email;
    private string $clave;
    
    private ?PDO $conexion;

    public function __construct(array $datos, ?PDO $conexion = null) {
        $this->documento = trim((string)($datos['documento'] ?? ''));
        // Soporte para 'nombres' o 'nombre'
        $this->nombres = trim((string)($datos['nombres'] ?? $datos['nombre'] ?? ''));
        // Soporte para 'apellidos' o 'apellido'
        $this->apellidos = trim((string)($datos['apellidos'] ?? $datos['apellido'] ?? ''));
        
        // Conversión segura a objeto DateTime para evitar fatal error al formatear
        $fechaRaw = $datos['fechaNacimiento'] ?? 'now';
        try {
            $this->fechaNacimiento = new DateTime($fechaRaw);
        } catch (Exception $e) {
            $this->fechaNacimiento = new DateTime();
        }

        $this->genero = trim((string)($datos['genero'] ?? ''));
        // Soporte para 'direccionResidencia' o 'direccion'
        $this->direccionResidencia = trim((string)($datos['direccionResidencia'] ?? $datos['direccion'] ?? ''));
        // Soporte para 'ciudad' o 'cuidad'
        $this->ciudad = trim((string)($datos['ciudad'] ?? $datos['cuidad'] ?? ''));
        $this->telefono = trim((string)($datos['telefono'] ?? ''));
        $this->email = trim((string)($datos['email'] ?? ''));

        // Hash seguro de la contraseña
        $claveRaw = (string)($datos['clave'] ?? '');
        $this->clave = ($claveRaw !== '') ? password_hash($claveRaw, PASSWORD_DEFAULT) : '';

        // Inyección o conexión a la base de datos
        if ($conexion !== null) {
            $this->conexion = $conexion;
        } else {
            $conexionBD = new Conexion();
            $this->conexion = $conexionBD->conectar();
        }
    }

    public function guardarAsociado(): bool {
        // Formatear la fecha a 'YYYY-MM-DD' para MySQL
        $fechaFormateada = $this->fechaNacimiento->format('Y-m-d');

        $sql = "INSERT INTO asociados (documento, nombres, apellidos, fechaNacimiento, genero, direccionResidencia, ciudad, telefono, email, clave) 
                VALUES (:documento, :nombres, :apellidos, :fechaNacimiento, :genero, :direccionResidencia, :ciudad, :telefono, :email, :clave)";

        try {
            $consulta = $this->conexion->prepare($sql);
            return $consulta->execute([
                ':documento'           => $this->documento,
                ':nombres'             => $this->nombres,
                ':apellidos'           => $this->apellidos,
                ':fechaNacimiento'     => $fechaFormateada,
                ':genero'              => $this->genero,
                ':direccionResidencia' => $this->direccionResidencia,
                ':ciudad'              => $this->ciudad,
                ':telefono'            => $this->telefono,
                ':email'               => $this->email,
                ':clave'               => $this->clave
            ]);
        } catch (PDOException $e) {
            // Compatibilidad si la tabla en MySQL fue creada con la columna 'cuidad' (código 42S22: Unknown column)
            if ($e->getCode() == '42S22' || str_contains($e->getMessage(), "Unknown column 'ciudad'")) {
                $sqlFallback = "INSERT INTO asociados (documento, nombres, apellidos, fechaNacimiento, genero, direccionResidencia, cuidad, telefono, email, clave) 
                                VALUES (:documento, :nombres, :apellidos, :fechaNacimiento, :genero, :direccionResidencia, :cuidad, :telefono, :email, :clave)";
                $consultaFallback = $this->conexion->prepare($sqlFallback);
                return $consultaFallback->execute([
                    ':documento'           => $this->documento,
                    ':nombres'             => $this->nombres,
                    ':apellidos'           => $this->apellidos,
                    ':fechaNacimiento'     => $fechaFormateada,
                    ':genero'              => $this->genero,
                    ':direccionResidencia' => $this->direccionResidencia,
                    ':cuidad'              => $this->ciudad,
                    ':telefono'            => $this->telefono,
                    ':email'               => $this->email,
                    ':clave'               => $this->clave
                ]);
            }
            throw $e;
        }
    }
}
