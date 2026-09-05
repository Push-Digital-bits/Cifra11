// fundo.js — fundo animado de partículas conectadas (efeito "constelação") pro G11 Cifras

(function () {
  const reduzMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.id = 'fundoAnimado';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let largura = 0;
  let altura = 0;
  let particulas = [];
  let animId = null;
  let visivel = !document.hidden;

  const CORES_PONTO = ['rgba(148,163,184,0.85)', 'rgba(148,163,184,0.5)', 'rgba(249,115,22,0.85)'];
  const COR_LINHA = 'rgba(148,163,184,';
  const DISTANCIA_MAX = 130;

  function contarParticulas() {
    const area = largura * altura;
    return Math.max(22, Math.min(70, Math.round(area / 16000)));
  }

  function criarParticulas() {
    const n = contarParticulas();
    particulas = Array.from({ length: n }, () => {
      const grande = Math.random() < 0.15;
      const sorte = Math.random();
      return {
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: grande ? 2 + Math.random() * 1.8 : 0.8 + Math.random() * 1.2,
        cor: sorte < 0.08 ? CORES_PONTO[2] : (sorte < 0.55 ? CORES_PONTO[0] : CORES_PONTO[1])
      };
    });
  }

  function redimensionar() {
    largura = canvas.width = window.innerWidth;
    altura = canvas.height = window.innerHeight;
    criarParticulas();
  }

  function desenharFrame() {
    ctx.clearRect(0, 0, largura, altura);

    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const a = particulas[i];
        const b = particulas[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DISTANCIA_MAX) {
          ctx.strokeStyle = COR_LINHA + (0.14 * (1 - dist / DISTANCIA_MAX)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particulas) {
      ctx.beginPath();
      ctx.fillStyle = p.cor;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function passo() {
    for (const p of particulas) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = largura; else if (p.x > largura) p.x = 0;
      if (p.y < 0) p.y = altura; else if (p.y > altura) p.y = 0;
    }
    desenharFrame();
    if (visivel && !reduzMovimento) {
      animId = requestAnimationFrame(passo);
    }
  }

  let redimensionarPendente = null;
  window.addEventListener('resize', () => {
    clearTimeout(redimensionarPendente);
    redimensionarPendente = setTimeout(() => {
      redimensionar();
      if (reduzMovimento) desenharFrame();
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    visivel = !document.hidden;
    if (visivel && !reduzMovimento && animId === null) {
      passo();
    } else if (!visivel && animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });

  function iniciar() {
    redimensionar();
    if (reduzMovimento) {
      desenharFrame();
    } else {
      passo();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
