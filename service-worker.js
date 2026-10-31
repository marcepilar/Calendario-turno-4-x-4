const CACHE='turnos4x4-5.11.1-agenda-hora-unificada-rc1';
const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url=new URL(event.request.url);

  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }

  event.respondWith(
    fetch(event.request).then(response => {
      if(response && response.ok && url.origin === self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request,copy));
      }
      return response;
    }).catch(async()=>{
      const cached=await caches.match(event.request);
      if(cached) return cached;
      if(event.request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    })
  );
});
