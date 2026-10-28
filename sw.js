/* Offline för Lilla Byn.
   Sidan hämtas från nätet först så att nya versioner kommer fram direkt, och från cachen när man är offline.
   Övriga filer tas från cachen. Höj VERSION när filer läggs till, tas bort eller byts ut (t.ex. ikoner). */
const VERSION='lilla-byn-1';
const FILES=['./','index.html','manifest.webmanifest','icon.svg','apple-touch-icon.png','icon-192.png','icon-512.png','fonts/baloo2.woff2'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  /* Samma adress delas med andra spel, så rör bara cachar som hör till Lilla Byn */
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lilla-byn-')&&k!==VERSION).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
const timeout=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(timeout(fetch(req),4000).then(r=>{
      if(r.ok){const c=r.clone();caches.open(VERSION).then(ca=>ca.put('index.html',c))}
      return r;
    }).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{
    if(res.ok){const c=res.clone();caches.open(VERSION).then(ca=>ca.put(req,c))}
    return res;
  })));
});
