<?php

require_once __DIR__ . '/../config/conexion.php';

class Asociado
{
    private ?PDO $conexion;

    // Columnas públicas devueltas al navegador. "clave" NUNCA se incluye.
    private const COLUMNAS_PUBLICAS = "idAsociado, documento, nombres, apellidos, fechaNacimiento,
        genero, direccionResidencia, ciudad, telefono, email, rol";

    public function __construct(?PDO $conexion = null)
    {
        if ($conexion !== null) {
            $this->conexion = $conexion;
        } else {
            $conexionBD = new Conexion();
            $this->conexion = $conexionBD->conectar();
        }
    }

    /**
     * Registra un nuevo asociado desde el formulario de registro.
     */
    public function registrar(array $datos): bool
    {
        $fechaRaw = $datos['fechaNacimiento'] ?? 'now';
        try {
            $fechaObj = new DateTime($fechaRaw);
            $fechaFormateada = $fechaObj->format('Y-m-d');
        } catch (Exception $e) {
            $fechaFormateada = date('Y-m-d');
        }

        $claveRaw = (string)($datos['clave'] ?? '');
        $claveHash = ($claveRaw !== '') ? password_hash($claveRaw, PASSWORD_DEFAULT) : '';
        $rol = !empty($datos['rol']) ? strtolower((string)$datos['rol']) : 'asociado';

        $sql = "INSERT INTO asociados (documento, nombres, apellidos, fechaNacimiento, genero, direccionResidencia, ciudad, telefono, email, clave, rol) 
                VALUES (:documento, :nombres, :apellidos, :fechaNacimiento, :genero, :direccionResidencia, :ciudad, :telefono, :email, :clave, :rol)";

        $parametros = [
            ':documento'           => trim((string)($datos['documento'] ?? '')),
            ':nombres'             => trim((string)($datos['nombres'] ?? $datos['nombre'] ?? '')),
            ':apellidos'           => trim((string)($datos['apellidos'] ?? $datos['apellido'] ?? '')),
            ':fechaNacimiento'     => $fechaFormateada,
            ':genero'              => trim((string)($datos['genero'] ?? '')),
            ':direccionResidencia' => trim((string)($datos['direccionResidencia'] ?? $datos['direccion'] ?? '')),
            ':ciudad'              => trim((string)($datos['ciudad'] ?? $datos['cuidad'] ?? '')),
            ':telefono'            => trim((string)($datos['telefono'] ?? '')),
            ':email'               => trim((string)($datos['email'] ?? '')),
            ':clave'               => $claveHash,
            ':rol'                 => $rol
        ];

        try {
            $consulta = $this->conexion->prepare($sql);
            return $consulta->execute($parametros);
        } catch (PDOException $e) {
            // Compatibilidad si la columna fue creada con el nombre histórico 'cuidad'
            if ($e->getCode() == '42S22' || str_contains($e->getMessage(), "Unknown column 'ciudad'")) {
                $sqlFallback = "INSERT INTO asociados (documento, nombres, apellidos, fechaNacimiento, genero, direccionResidencia, cuidad, telefono, email, clave, rol) 
                                VALUES (:documento, :nombres, :apellidos, :fechaNacimiento, :genero, :direccionResidencia, :cuidad, :telefono, :email, :clave, :rol)";
                $consultaFallback = $this->conexion->prepare($sqlFallback);
                $parametrosFallback = $parametros;
                $parametrosFallback[':cuidad'] = $parametrosFallback[':ciudad'];
                unset($parametrosFallback[':ciudad']);
                return $consultaFallback->execute($parametrosFallback);
            }
            throw $e;
        }
    }

    /**
     * Obtiene todos los asociados para la tabla de administración.
     */
    public function obtenerTodos(): array
    {
        $sql = "SELECT " . self::COLUMNAS_PUBLICAS . " FROM asociados ORDER BY idAsociado ASC";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un asociado por su ID numérico.
     */
    public function obtenerPorId(int $idAsociado): ?array
    {
        $sql = "SELECT " . self::COLUMNAS_PUBLICAS . " FROM asociados WHERE idAsociado = :idAsociado";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([':idAsociado' => $idAsociado]);
        $fila = $consulta->fetch(PDO::FETCH_ASSOC);
        return $fila ?: null;
    }

    /**
     * Obtiene los datos completos de un asociado por email o documento (usado para login).
     */
    public function obtenerPorEmail(string $email): ?array
    {
        $sql = "SELECT * FROM asociados WHERE email = :identificador OR documento = :identificadorDoc LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([
            ':identificador'    => $email,
            ':identificadorDoc' => $email
        ]);
        $fila = $consulta->fetch(PDO::FETCH_ASSOC);
        return $fila ?: null;
    }

    /**
     * Actualiza la información de un asociado desde el modal de administración.
     */
    public function actualizar(array $datos): bool
    {
        $sql = "UPDATE asociados
                SET documento           = :documento,
                    nombres             = :nombres,
                    apellidos           = :apellidos,
                    fechaNacimiento     = :fechaNacimiento,
                    genero              = :genero,
                    direccionResidencia = :direccionResidencia,
                    ciudad              = :ciudad,
                    telefono            = :telefono,
                    email               = :email,
                    rol                 = :rol";

        $parametros = [
            ":documento"           => $datos['documento'],
            ":nombres"             => $datos['nombres'],
            ":apellidos"           => $datos['apellidos'],
            ":fechaNacimiento"     => $datos['fechaNacimiento'],
            ":genero"              => $datos['genero'],
            ":direccionResidencia" => $datos['direccionResidencia'],
            ":ciudad"              => $datos['ciudad'],
            ":telefono"            => $datos['telefono'],
            ":email"               => $datos['email'],
            ":rol"                 => $datos['rol'],
            ":idAsociado"          => $datos['idAsociado']
        ];

        // La clave solo se actualiza si el administrador ingresó una nueva
        if (!empty($datos['clave'])) {
            $sql .= ", clave = :clave";
            $parametros[':clave'] = password_hash($datos['clave'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE idAsociado = :idAsociado";

        $consulta = $this->conexion->prepare($sql);
        return $consulta->execute($parametros);
    }

    /**
     * Elimina un asociado por su ID.
     */
    public function eliminar(int $idAsociado): bool
    {
        $sql = "DELETE FROM asociados WHERE idAsociado = :idAsociado";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([':idAsociado' => $idAsociado]);
        return $consulta->rowCount() > 0;
    }
}
