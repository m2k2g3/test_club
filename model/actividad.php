<?php
require_once __DIR__ . '/../config/conexion.php';

class Actividad
{
    private ?PDO $conexion;

    public function __construct()
    {
        $conexionDB = new Conexion();
        $this->conexion = $conexionDB->conectar();
    }

    public function obtenerActividades()
    {

        $sql = "SELECT * FROM actividades ORDER BY fechaEvento ASC";

        // Preparamos la consulta usando la propiedad de la clase
        $consulta = $this->conexion->prepare($sql);

        // Ejecutamos la consulta sobre la variable $consulta
        $consulta->execute();

        // Retornamos los resultados
        return $consulta->fetchAll();
    }

    public function guardar(array $datos)
    {
        $sql = "INSERT INTO actividades (nombreActividad, fechaEvento, municipio)
                VALUES (:nombreActividad, :fechaEvento, :municipio)";
        $consulta = $this->conexion->prepare($sql);
        return $consulta->execute([
            ":nombreActividad" => $datos['nombreActividad'],
            ":fechaEvento" =>  $datos['fechaEvento'],
            ":municipio" => $datos['municipio']
        ]);
    }

    public function eliminar(int $idActividad)
    {
        $sql = "DELETE FROM actividades WHERE idActividad = :idActividad";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute([':idActividad' => $idActividad]);
        return $consulta->rowCount() > 0; // Retorna true si se elimino alguna fila
    }

    public function editar(array $datos)
    {
        $sql = "UPDATE actividades 
                SET nombreActividad = :nombreActividad, 
                    fechaEvento = :fechaEvento, 
                    municipio = :municipio, 
                    totalRecaudado = :totalRecaudado 
                WHERE idActividad = :idActividad";
                
        $consulta = $this->conexion->prepare($sql);
        
        $consulta->execute([
            ":nombreActividad" => $datos['nombreActividad'],
            ":fechaEvento"     => $datos['fechaEvento'],
            ":municipio"       => $datos['municipio'],
            ":totalRecaudado"  => $datos['totalRecaudado'],
            ":idActividad"     => $datos['idActividad']
        ]);

        // Si se modificó al menos una fila, retorna true
        if ($consulta->rowCount() > 0) {
            return true;
        }

        //  Si no cambió nada (mismos datos), verificamos si el registro existe
        $verificar = $this->conexion->prepare("SELECT 1 FROM actividades WHERE idActividad = :idActividad");
        $verificar->execute([':idActividad' => $datos['idActividad']]);

        // Retorna true si el registro existe y false si no
        return (bool) $verificar->fetchColumn(); 
    }
}
