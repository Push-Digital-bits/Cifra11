// sw.js — cache dos arquivos do app pra abrir mesmo sem internet (G11 Cifras)
const CACHE_NOME = 'g11cifras-v4';
const CDN_SUPABASE = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

const ARQUIVOS_ESSENCIAIS = [
  'index.html',
  'login.html',
  'cifra.html',
  'repertorio.html',
  'admin.html',
  'nova-musica.html',
  'novo-repertorio.html',
  'importar.html',
  'trocar-grupo.html',
  'gerenciar-grupos.html',
  'estilo.css',
  'fundo.js',
  'fundo-login.png',
  'logo.png',
  'auth.js',
  'supabaseClient.js',
  'tema.js',
  'offline.js',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NOME);
      try {
        await cache.addAll(ARQUIVOS_ESSENCIAIS);
      } catch (e) {
        await Promise.all(ARQUIVOS_ESSENCIAIS.map((arq) => cache.add(arq).catch(() => {})));
      }
      try {
        await cache.add(CDN_SUPABASE);
      } catch (e) {}
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  const url = evento.request.url;
  const mesmaOrigem = url.startsWith(self.location.origin);
  const ehCdnConhecido = url.startsWith(CDN_SUPABASE);

  if (evento.request.method !== 'GET' || (!mesmaOrigem && !ehCdnConhecido)) return;

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      const buscaRede = fetch(evento.request)
        .then((respostaRede) => {
          if (respostaRede && respostaRede.ok) {
            const copia = respostaRede.clone();
            caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
          }
          return respostaRede;
        })
        .catch(() => respostaCache);

      return respostaCache || buscaRede;
    })
  );
});
