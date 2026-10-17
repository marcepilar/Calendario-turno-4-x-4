// Calendario de Turnos 4×4 · PWA V5.0.5
const CACHE_NAME='calendario-turnos-4x4-v5.0.5';
const APP_SHELL=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('calendario-turnos-4x4-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/version.json'))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   try{const response=await fetch(request,{cache:'no-store'});if(response.ok){const c=await caches.open(CACHE_NAME);await c.put('./index.html',response.clone());}return response;}
   catch{const c=await caches.open(CACHE_NAME);return await c.match('./index.html')||Response.error();}
  })());return;
 }
 if(APP_SHELL.some(path=>url.pathname.endsWith('/'+path.slice(2)))){
  event.respondWith((async()=>{const c=await caches.open(CACHE_NAME);const cached=await c.match(request,{ignoreSearch:true});if(cached)return cached;const response=await fetch(request);if(response.ok)await c.put(request,response.clone());return response;})());
 }
});
