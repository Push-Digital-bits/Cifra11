// offline.js — cache local pra funcionar (leitura) sem internet + registro do service worker (G11 Cifras)

const OFFLINE_PREFIXO = 'g11cache_';

function salvarCacheOffline(chave, dado) {
  try {
    localStorage.setItem(OFFLINE_PREFIXO + chave, JSON.stringify({ dado, quando: Date.now() }));
  } catch (e) {}
}

function lerCacheOffline(chave) {
  try {
    const bruto = localStorage.getItem(OFFLINE_PREFIXO + chave);
    if (!bruto) return null;
    return JSON.parse(bruto).dado;
  } catch (e) {
    return null;
  }
}

function mostrarAvisoOffline(mensagem) {
  let aviso = document.getElementById('avisoOffline');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = 'avisoOffline';
    aviso.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#F97316;color:#0F172A;text-align:center;font-size:12px;font-weight:700;padding:7px 10px;z-index:2000;';
    document.body.appendChild(aviso);
  }
  aviso.textContent = mensagem || '🔌 Sem internet — mostrando dados salvos';
  aviso.style.display = 'block';
  document.body.style.paddingTop = '44px';
}

function esconderAvisoOffline() {
  const aviso = document.getElementById('avisoOffline');
  if (aviso) aviso.style.display = 'none';
  document.body.style.paddingTop = '';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
