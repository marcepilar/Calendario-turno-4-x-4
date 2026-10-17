// Calendario de Turnos 4×4 — PWA V5.0.6
const CACHE_NAME='calendario-turnos-4x4-v5.0.6';
const SHELL=['./index.html','./manifest.webmanifest','./icon-192.png',
 './icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];

self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
 self.skipWaiting();
});

self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name => name.startsWith('calendario-turnos-4x4-') && name!==CACHE_NAME).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});

self.addEventListener('message', event => {
 if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/version.json'))return; // Siempre validar en red.

 const isHTML=request.mode==='navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/');
 if(isHTML){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok)await cache.put('./index.html',response.clone());
    return response;
   }catch{
    return (await cache.match('./index.html')) || Response.error();
   }
  })());
  return;
 }
 if(SHELL.some(item=>url.pathname.endsWith('/'+item.slice(2)))){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   const cached=await cache.match(request,{ignoreSearch:true});
   if(cached)return cached;
   const response=await fetch(request);
   if(response.ok)await cache.put(request,response.clone());
   return response;
  })());
 }
});
