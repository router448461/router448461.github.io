/* ROUTER 448461 interaction engine: native cursor semantics + packet entropy, visual-only. */
(()=>{
  if(window.__routerInteractionEngine)return;
  window.__routerInteractionEngine=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.matchMedia('(max-width:740px)').matches;
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const svg=document.querySelector('.scene svg');
  if(!svg)return;

  // Use the browser's real pointer. No on-screen cursor is rendered.
  const nativeStyle=document.createElement('style');
  nativeStyle.textContent=`
    .primary,.secondary,.qr,.copy,.inspect,.card,a,button{cursor:pointer}
    .card{cursor:default}
    .card .primary{cursor:pointer}
    .card .secondary{cursor:pointer}
    .card .qr{cursor:crosshair}
    .card .copy{cursor:copy}
    .card .inspect{cursor:crosshair}
  `;
  document.head.appendChild(nativeStyle);

  const packets=[...svg.querySelectorAll('#adaptive-bg .ab-packet')];
  const routes=[...svg.querySelectorAll('#adaptive-bg .ab-route')];
  const relays=[...svg.querySelectorAll('#adaptive-bg .ab-relay')];
  if(!packets.length)return;

  const routePaths=()=>routes.map(r=>r.getAttribute('d')).filter(Boolean);
  let knownPaths=routePaths();
  function randomPacket(p){
    const motion=p.firstElementChild;
    if(!motion||!knownPaths.length)return;
    motion.setAttribute('path',knownPaths[Math.floor(rand()*knownPaths.length)]);
    motion.setAttribute('begin',`${(rand()*3.4).toFixed(2)}s`);
    motion.setAttribute('dur',`${(4.1+rand()*7.4).toFixed(1)}s`);
    if(rand()>.55)p.style.opacity=(.24+rand()*.56).toFixed(2);
  }
  function packetDecision(){
    knownPaths=routePaths();
    packets.forEach(p=>{if(rand()>.38)randomPacket(p)});
    schedulePacketDecision();
  }
  let packetTimer;
  function schedulePacketDecision(){clearTimeout(packetTimer);packetTimer=setTimeout(packetDecision,2600+rand()*12800)}

  // Nearby background nodes may react to the pointer, but their coordinates never move.
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||reduced||!relays.length)return;
    const x=e.clientX/innerWidth*1600,y=e.clientY/innerHeight*900;
    relays.forEach(r=>{
      const rx=parseFloat(r.getAttribute('x')||0),ry=parseFloat(r.getAttribute('y')||0);
      const d=Math.hypot(rx-x,ry-y);
      r.classList.toggle('hot',d<92);
    });
  },{passive:true});

  // Independent packet events prevent a single visible master loop.
  function packetPulse(){
    if(reduced||!packets.length)return;
    const p=packets[Math.floor(rand()*packets.length)];
    randomPacket(p);
    setTimeout(packetPulse,1800+rand()*11800);
  }

  function splitEvent(){
    if(reduced||!packets.length)return;
    const source=packets[Math.floor(rand()*packets.length)];
    const clone=source.cloneNode(true);
    clone.classList.add('interaction-child');
    clone.style.opacity='.26';
    svg.querySelector('#adaptive-bg')?.appendChild(clone);
    randomPacket(clone);
    setTimeout(()=>clone.remove(),700+rand()*1700);
  }

  function localRelayEvent(){
    if(reduced||!relays.length)return;
    const centre=relays[Math.floor(rand()*relays.length)];
    centre.classList.add('hot');
    setTimeout(()=>centre.classList.remove('hot'),350+rand()*1100);
    const neighbours=[];
    const cx=parseFloat(centre.getAttribute('x')||0),cy=parseFloat(centre.getAttribute('y')||0);
    relays.forEach(r=>{
      if(r===centre)return;
      const rx=parseFloat(r.getAttribute('x')||0),ry=parseFloat(r.getAttribute('y')||0);
      if(Math.hypot(rx-cx,ry-cy)<190)neighbours.push(r);
    });
    if(neighbours.length&&rand()>.35){
      const n=neighbours[Math.floor(rand()*neighbours.length)];
      n.classList.add('hot');setTimeout(()=>n.classList.remove('hot'),250+rand()*850);
    }
  }

  function idleEvent(){
    knownPaths=routePaths();
    if(rand()>.28)packetPulse();
    if(rand()>.52)splitEvent();
    if(rand()>.36)localRelayEvent();
    setTimeout(idleEvent,3800+rand()*17200);
  }

  if(!reduced){
    setTimeout(idleEvent,1800+rand()*4500);
    schedulePacketDecision();
  }
})();
