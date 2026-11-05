<?php

require_once __DIR__. '/../config/conexion.php';
class asociado {
    private string $documento;
    private string $nombres;
    private string $apellidos;
    private Datetime $fechaNacimiento;
    private string $genero;
    private string $direccionResidencia;
    private string $cuidad;
    private int $telefono;
    private string $email;
    
    private ?PDO $conexion;

    public function __construct($datos) {
        $this->documento = $datos['documento'];
        $this->nombres = $datos['nombres'];
        $this->apellidos = $datos['apellidos'];
        $this->fechaNacimiento = new DateTime($datos['fechaNacimiento']);       
        $this->genero = $datos['genero'];
        $this->direccionResidencia = $datos['direccionResidencia'];
        $this->cuidad = $datos['cuidad'];
        $this->telefono = $datos['telefono'];
        $this->email = $datos['email'];

        $conexionBD = new Conexion();
        $this->conexion = $conexionBD->conectar();
    }


public function guardarAsociado() {
    //insetamos datos
    $slq = "INSERT INTO asociados (documento, nombres, apellidos, fechaNacimiento, genero, direccionResidencia, cuidad, telefono, email) 
            VALUES (:documento, :nombres, :apellidos, :fechaNacimiento, :genero, :direccionResidencia, :cuidad, :telefono, :email)";

    $consulta = $this->conexion->prepare($slq);//se ejecuta la consulta
    $fechaFormateada = $this->fechaNacimiento->format('Y-m-d');
    //se pasan los parametros a la consulta
    return $consulta->execute([
        ':documento' => $this->documento,
        ':nombres' => $this->nombres,
        ':apellidos' => $this->apellidos,
        ':fechaNacimiento' => $this->fechaNacimiento,
        ':genero' => $this->genero,
        ':direccionResidencia' => $this->direccionResidencia,
        ':cuidad' => $this->cuidad,
        ':telefono' => $this->telefono,
        ':email' => $this->email
    ]);
}


}