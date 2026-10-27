const usuariosDefault = [
    { usuario: '123@email.com', clave: '123', rol: 'admin', nombre: 'Admin salsa' },
    { usuario: '1234@email.com', clave: '1234', rol: 'asociado', nombre: 'Ricardo González' }
];

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const usuarioInput = document.getElementById('usuario').value.trim();
    const claveInput = document.getElementById('clave').value;

    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
    const todosLosUsuarios = [...usuariosDefault, ...usuariosGuardados];

    const usuarioEncontrado = todosLosUsuarios.find(u => u.usuario.toLowerCase() === usuarioInput.toLowerCase() && u.clave === claveInput);

    if (usuarioEncontrado) {
        localStorage.setItem('logueado', 'true');
        localStorage.setItem('rol', usuarioEncontrado.rol || 'asociado');
        localStorage.setItem('nombre', usuarioEncontrado.nombre || usuarioInput);
        window.location.href = 'dashboard.html';
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
});


/*document.getElementById('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuarioInput = document.getElementById('documento').value;
    const claveInput = document.getElementById('password').value;

    const usuarioEncontrado = usuarios.find(
        u => u.usuario === usuarioInput && u.clave === claveInput
    );

    if (usuarioEncontrado) {
        localStorage.setItem('logueado', 'true');
        localStorage.setItem('rol', usuarioEncontrado.rol);
        localStorage.setItem('nombre', usuarioEncontrado.nombre);
        window.location.href = 'dashboard.html';
    }else{
        alert('Usuario o contraseña incorrectos');
    }

});*/