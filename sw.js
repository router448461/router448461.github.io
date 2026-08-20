/* ROUTER 448461 legacy service-worker shutdown. */
const CACHE='router448461-disabled-v15';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
    .then(()=>self.registration.unregister())
    .then(()=>self.clients.matchAll({type:'window',includeUncontrolled:true}))
    .then(clients=>clients.forEach(client=>client.navigate(client.url)))
));
