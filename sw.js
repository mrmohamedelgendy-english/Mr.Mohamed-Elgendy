const V="gendy-v2";
const CORE=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url),same=u.origin===location.origin;
  // لا نخزّن طلبات السحابة (Supabase) ولا تيليجرام: بيانات حيّة دايمًا
  if(!same&&!/(^|\.)cdnjs\.cloudflare\.com$|^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))return;
  const keep=res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp)).catch(()=>{});return res};
  if(same){
    e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
  }else{
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(keep).catch(()=>m)));
  }
});
