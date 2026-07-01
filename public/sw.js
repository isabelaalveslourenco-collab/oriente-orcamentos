// Service worker simples da Oriente Móveis.
// Objetivo principal: tornar o sistema instalável como app (PWA).
// Também guarda em cache os arquivos estáticos (visual do app), para que
// abrir o app seja mais rápido e ele não quebre totalmente sem internet
// (os dados de orçamentos continuam exigindo conexão com o Supabase).

const CACHE_NAME = "oriente-moveis-v1";
const ARQUIVOS_ESTATICOS = ["/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((nome) => nome !== CACHE_NAME).map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Só intercepta requisições GET simples (navegação e arquivos estáticos).
  // Chamadas à API e ao Supabase sempre vão direto para a rede.
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
