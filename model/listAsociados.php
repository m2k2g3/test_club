<?php

require_once __DIR__ . '/../config/conexion.php';

class Asociado
{
    private ?PDO $conexion;

    // Columnas que se devuelven al navegador. "clave" NUNCA se incluye.
    private const COLUMNAS = "idAsociado, documento, nombres, apellidos, fechaNacimiento,
        genero, direccionResidencia, ciudad, telefono, email, rol";

    public function __construct()
    {
        $conexionDB = new Conexion();
        $this->conexion = $conexionDB->conectar();
    }

    public function obtenerAsociados(): array
    {
        $sql = "SELECT " . self::COLUMNAS . " FROM asociados ORDER BY idAsociado ASC";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $idAsociado): ?array
    {
        $sql = "SELECT " . self::COLUMNAS . " FROM asociados WHERE idAsociado = :idAsociado";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([':idAsociado' => $idAsociado]);
        $fila = $consulta->fetch(PDO::FETCH_ASSOC);
        return $fila ?: null;
    }

    public function editar(array $datos): bool
    {
        $sql = "UPDATE asociados
                SET documento = :documento,
                    nombres = :nombres,
                    apellidos = :apellidos,
                    fechaNacimiento = :fechaNacimiento,
                    genero = :genero,
                    direccionResidencia = :direccionResidencia,
                    ciudad = :ciudad,
                    telefono = :telefono,
                    email = :email,
                    rol = :rol";

        $parametros = [
            ":documento" => $datos['documento'],
            ":nombres" => $datos['nombres'],
            ":apellidos" => $datos['apellidos'],
            ":fechaNacimiento" => $datos['fechaNacimiento'],
            ":genero" => $datos['genero'],
            ":direccionResidencia" => $datos['direccionResidencia'],
            ":ciudad" => $datos['ciudad'],
            ":telefono" => $datos['telefono'],
            ":email" => $datos['email'],
            ":rol" => $datos['rol'],
            ":idAsociado" => $datos['idAsociado']
        ];

        // La clave solo se cambia si llega una nueva (y siempre se guarda con hash)
        if (!empty($datos['clave'])) {
            $sql .= ", clave = :clave";
            $parametros[':clave'] = password_hash($datos['clave'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE idAsociado = :idAsociado";

        $consulta = $this->conexion->prepare($sql);
        return $consulta->execute($parametros);
    }

    public function eliminar(int $idAsociado): bool
    {
        $sql = "DELETE FROM asociados WHERE idAsociado = :idAsociado";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([':idAsociado' => $idAsociado]);
        return $consulta->rowCount() > 0;
    }
}