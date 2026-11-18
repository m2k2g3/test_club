(function () {
  // Reutiliza el <link rel="icon"> existente o crea uno
  var link = document.querySelector('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';

  var c = document.createElement('canvas');
  c.width = c.height = 64;
  var ctx = c.getContext('2d');
  var TAU = Math.PI * 2;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // p va de 0 a 1: la burbuja sube y se desvanece
  function bubble(x, yStart, yEnd, r, p) {
    ctx.globalAlpha = Math.sin(Math.PI * p) * 0.8;
    ctx.beginPath();
    ctx.arc(x, yStart + (yEnd - yStart) * p, r, 0, TAU);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw(ms) {
    var t = ms / 1000;
    ctx.clearRect(0, 0, 64, 64);

    // fondo
    roundRect(0, 0, 64, 64, 14);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();

    // burbujas
    bubble(54, 50, 14, 2, (t / 3) % 1);
    bubble(10, 56, 20, 1.5, ((((t - 1.2) / 3) % 1) + 1) % 1);

    // pez: desplazamiento suave (ciclo de 3 s)
    ctx.save();
    ctx.translate(Math.sin((t * TAU) / 3) * 3, 0);

    // cola: oscila sobre su base (ciclo de 0,9 s)
    ctx.save();
    ctx.translate(22, 32);
    ctx.rotate((Math.sin((t * TAU) / 0.9) * 12 * Math.PI) / 180);
    ctx.translate(-22, -32);
    ctx.beginPath();
    ctx.moveTo(22, 32);
    ctx.lineTo(6, 19);
    ctx.quadraticCurveTo(11, 32, 6, 45);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.restore();

    // cuerpo
    ctx.beginPath();
    ctx.ellipse(37, 32, 19, 13, 0, 0, TAU);
    ctx.fillStyle = '#fb923c';
    ctx.fill();

    // aleta
    ctx.beginPath();
    ctx.moveTo(34, 40);
    ctx.quadraticCurveTo(38, 50, 44, 45);
    ctx.quadraticCurveTo(40, 42, 40, 38);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();

    // ojo
    ctx.beginPath();
    ctx.arc(47, 28, 3.2, 0, TAU);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(48, 28, 1.6, 0, TAU);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.restore();

    link.href = c.toDataURL('image/png');
  }

  draw(performance.now());

  // ~10 fotogramas por segundo; se pausa si la pestaña está oculta
  setInterval(function () {
    if (!document.hidden) draw(performance.now());
  }, 100);
})();
