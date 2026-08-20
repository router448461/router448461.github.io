/* ROUTER 448461 interaction compatibility layer: native browser controls only. */
(()=>{
  if(window.__routerInteractionEngineV2)return;
  window.__routerInteractionEngineV2=true;
  const cleanup=()=>{
    document.querySelectorAll('.router-cursor,.ab-handoff-overlay,.ab-handoff-label').forEach(e=>e.remove());
    document.querySelectorAll('.primary,.secondary,.qr,.copy,.inspect,button').forEach(el=>{el.style.cursor='';});
  };
  cleanup();
  const style=document.createElement('style');
  style.textContent=`
    .primary,.secondary,.qr{cursor:pointer!important}
    .copy{cursor:copy!important}
    .inspect{cursor:help!important}
    .card{cursor:default}
  `;
  document.head.appendChild(style);
  if(navigator.serviceWorker?.getRegistrations){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  }
  if(window.caches?.keys){caches.keys().then(keys=>keys.forEach(k=>caches.delete(k))).catch(()=>{});}
  const cards=[...document.querySelectorAll('.card')];
  cards.forEach((card,i)=>{
    const primary=card.querySelector('.primary');
    if(primary){
      primary.onclick=null;
      primary.href=card.dataset.u||'#';
      primary.target='_blank';
      primary.rel='noopener noreferrer';
      primary.textContent='USE REFERRAL';
    }
    const name=card.dataset.n||'';
    if(name==='COINBASE ADVANCED'){
      const foot=card.querySelector('.foot b');
      if(foot)foot.textContent='COINBASE ADVANCED';
    }
    card.addEventListener('mouseenter',()=>window.__routerSetFocus?.(i),{passive:true});
    card.addEventListener('focusin',()=>window.__routerSetFocus?.(i),{passive:true});
    card.addEventListener('mouseleave',()=>window.__routerSetFocus?.(-1),{passive:true});
  });
})();