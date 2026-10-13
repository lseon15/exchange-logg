/* 환전 기록 - 서비스워커 (네트워크 우선, 오프라인 시 캐시) */
var CACHE = "hwanjeon-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", function(e){
  // 개별 캐시 — 파일 하나가 없어도 설치가 실패하지 않도록
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ASSETS.map(function(url){ return c.add(url).catch(function(){}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  if(new URL(req.url).origin !== self.location.origin) return; // 환율 API 등 외부 요청은 그대로 통과
  // 네트워크 우선: 새로 배포한 버전이 바로 반영되고, 오프라인일 때만 캐시 사용
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok){ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(hit){ return hit || caches.match("./index.html"); });
    })
  );
});
