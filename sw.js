const CACHE_NAME = "vi-gestion-v2";
const APP_SHELL = [
  "./",
  "./demo-plataforma.html",
  "./manifest.webmanifest",
  "./photos/icon-192.png",
  "./photos/icon-512.png",
  "./photos/icon-maskable-512.png",
  "./photos/logo-mark-ink.png",
  "./photos/logo-mark-white.png",
  "./photos/logo-stacked-ink.png",
];

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(APP_SHELL); })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  const req = event.request;
  if(req.method !== "GET") return;
  event.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
      }
      return res;
    }).catch(function(){ return caches.match(req); })
  );
});
