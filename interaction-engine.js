/* ROUTER 448461 interaction engine: procedural motion + intelligent cursor, visual-only. */
(()=>{
  if(window.__routerInteractionEngine)return;
  window.__routerInteractionEngine=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.matchMedia('(max-width:740px)').matches;
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const scene=document.querySelector('.scene');
  const svg=scene?.querySelector('svg');
  if(!scene||!svg)return;

  const style=document.createElement('style');
  style.textContent=`
    .router-cursor{position:fixed;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border:1px solid rgba(200,255,61,.72);border-radius:50%;pointer-events:none;z-index:60;opacity:0;transform:translate3d(0,0,0) scale(.78);transition:opacity .16s,transform .14s,border-color .16s,box-shadow .16s;will-change:transform}
    .router-cursor:before,.router-cursor:after{content:'';position:absolute;left:50%;top:50%;background:currentColor;transform:translate(-50%,-50%)}
    .router-cursor:before{width:1px;height:26px}.router-cursor:after{width:26px;height:1px}
    .router-cursor.show{opacity:1;transform:translate3d(0,0,0) scale(1)}
    .router-cursor.hot{color:#c8ff3d;border-color:#c8ff3d;box-shadow:0 0 18px rgba(200,255,61,.22)}
    .router-cursor.qr{border-radius:2px;color:#dbe5df;border-color:#dbe5df}
    .router-cursor.copy{border-radius:3px;color:#8ab1ff;border-color:#8ab1ff}
    .router-cursor.inspect{color:#4e8cff;border-color:#4e8cff;box-shadow:0 0 16px rgba(78,140,255,.18)}
    @media (pointer:coarse),(prefers-reduced-motion:reduce){.router-cursor{display:none!important}}
  `;
  document.head.appendChild(style);

  const cursor=document.createElement('div');cursor.className='router-cursor';document.body.appendChild(cursor);
  let mx=0,my=0,tx=0,ty=0,inside=false;
  const cursorStep=()=>{
    if(!inside)return requestAnimationFrame(cursorStep);
    mx+=(tx-mx)*.34;my+=(ty-my)*.34;
    cursor.style.transform=`translate3d(${mx}px,${my}px,0) scale(${cursor.classList.contains('show')?1:.78})`;
    requestAnimationFrame(cursorStep);
  };
  requestAnimationFrame(cursorStep);

  const interactiveSelector='.primary,.secondary,.qr,.copy,.inspect,button,a,.card';
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;inside=true;tx=e.clientX;ty=e.clientY;cursor.classList.add('show');const t=e.target?.closest?.(interactiveSelector);cursor.classList.remove('hot','qr','copy','inspect');if(t){if(t.matches('.qr'))cursor.classList.add('qr');else if(t.matches('.copy'))cursor.classList.add('copy');else if(t.matches('.inspect'))cursor.classList.add('inspect');else cursor.classList.add('hot')}} ,{passive:true});
  addEventListener('pointerleave',()=>{inside=false;cursor.classList.remove('show')},{passive:true});

  const packets=[...svg.querySelectorAll('#adaptive-bg .ab-packet')];
  const routes=[...svg.querySelectorAll('#adaptive-bg .ab-route')];
  const relays=[...svg.querySelectorAll('#adaptive-bg .ab-relay')];
  if(!packets.length)return;

  const routePaths=()=>routes.length?routes.map(r=>r.getAttribute('d')).filter(Boolean):[];
  let knownPaths=routePaths();
  function randomPacket(p){
    const motion=p.firstElementChild;
    if(!motion)return;
    const pathPool=knownPaths.length?knownPaths:routePaths();
    if(!pathPool.length)return;
    const path=pathPool[Math.floor(rand()*pathPool.length)];
    motion.setAttribute('path',path);
    motion.setAttribute('begin',`${(rand()*2.8).toFixed(2)}s`);
    const dur=4.2+rand()*5.8;
    motion.setAttribute('dur',`${dur.toFixed(1)}s`);
  }
  function packetDecision(){
    knownPaths=routePaths();
    for(const p of packets){
      if(rand()>.48)randomPacket(p);
      if(rand()>.72)p.style.opacity=(.28+rand()*.5).toFixed(2);
    }
    schedulePacketDecision();
  }
  let packetTimer;
  function schedulePacketDecision(){clearTimeout(packetTimer);packetTimer=setTimeout(packetDecision,4200+rand()*9800)}

  // Small, constrained relay drift. The topology remains readable; motion is local rather than screen-wide.
  const relayState=relays.slice(0,24).map((el,i)=>({el,x:parseFloat(el.getAttribute('x')||0),y:parseFloat(el.getAttribute('y')||0),vx:0,vy:0,phase:rand()*Math.PI*2,speed:.00055+rand()*.0008,amp:1.5+rand()*4.5,i}));
  function driftRelays(t){
    if(!reduced&&!mobile){
      for(const r of relayState){
        const dx=Math.sin(t*r.speed+r.phase)*r.amp,dy=Math.cos(t*r.speed*.83+r.phase*.7)*r.amp*.7;
        r.el.style.transform=`translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
      }
    }
    requestAnimationFrame(driftRelays);
  }
  requestAnimationFrame(driftRelays);

  // Local cursor field: nearby relays wake slightly as the pointer approaches.
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||reduced||!relays.length)return;
    const x=e.clientX/innerWidth*1600,y=e.clientY/innerHeight*900;
    relays.forEach((r,i)=>{
      const rx=parseFloat(r.getAttribute('x')||0),ry=parseFloat(r.getAttribute('y')||0),d=Math.hypot(rx-x,ry-y);
      r.classList.toggle('hot',d<105);
    });
  },{passive:true});

  // Occasional split/merge illusion: a packet briefly spawns a child packet, then disappears.
  function splitEvent(){
    if(reduced||!packets.length)return;
    const source=packets[Math.floor(rand()*packets.length)];
    const clone=source.cloneNode(true);
    clone.classList.add('interaction-child');
    clone.style.opacity='.34';
    svg.querySelector('#adaptive-bg')?.appendChild(clone);
    randomPacket(clone);
    setTimeout(()=>clone.remove(),900+rand()*1300);
  }

  // Re-seed decisions occasionally so the movement never settles into a visible loop.
  function idleEvent(){
    if(rand()>.35)splitEvent();
    if(rand()>.45)packetDecision();
    setTimeout(idleEvent,6500+rand()*14500);
  }
  if(!reduced){setTimeout(idleEvent,3000+rand()*4000);schedulePacketDecision()}

  // Keep the cursor semantics explicit for the referral action without replacing the existing handoff behaviour.
  document.addEventListener('pointerdown',e=>{
    const primary=e.target?.closest?.('.primary');
    if(!primary||reduced)return;
    cursor.classList.add('hot');
    setTimeout(()=>cursor.classList.remove('hot'),650);
  },{passive:true,capture:true});
})();
