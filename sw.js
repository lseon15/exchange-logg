/* 환전 기록 - 오프라인 지원 서비스워커 */
var CACHE = "hwanjeon-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  // 실시간 환율 API 등 외부 요청은 네트워크 우선 (캐시 안 함)
  if(req.method !== "GET" || req.url.indexOf("frankfurter") !== -1){
    return; // 브라우저 기본 처리
  }
  e.respondWith(
    caches.match(req).then(function(cached){
      return cached || fetch(req).then(function(res){
        return res;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
