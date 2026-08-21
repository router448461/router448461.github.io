/* ROUTER 448461 service worker: network-first UI v19. */
const CACHE='router448461-v19';
const INJECT=`<script src="/background-engine.js?v=19" defer></script><script src="/interaction-engine.js?v=19" defer></script>`;
async function enhance(response){
  if(!response||!response.ok)return response;
  const ct=response.headers.get('content-type')||'';
  if(!ct.includes('text/html'))return response;
  let html=await response.text();
  html=html.replace(/<script[^>]+(?:background-engine|interaction-engine)[^>]*><\\/script>/g,'');
  if(!html.includes('/background-engine.js?v=19'))html=html.replace('</body>',INJECT+'</body>');
  const headers=new Headers(response.headers);headers.delete('content-length');
  headers.set('Cache-Control','no-store, max-age=0');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin&&(u.pathname==='/'||u.pathname.endsWith('.html'))){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(enhance));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});