/* ROUTER 448461 interaction engine: native cursor semantics + fixed node geometry + packet entropy. */
(()=>{
  if(window.__routerInteractionEngine)return;
  window.__routerInteractionEngine=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.matchMedia('(max-width:740px)').matches;
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const svg=document.querySelector('.scene svg');
  if(!svg)return;

  // Native browser cursor only. No cursor graphic is drawn over the page.
  const nativeStyle=document.createElement('style');
  nativeStyle.textContent=`
    .primary,.secondary,.qr,.copy,.inspect,button{cursor:pointer}
    .copy{cursor:copy}
    .inspect{cursor:help}
    .qr{cursor:pointer}
    .secondary{cursor:pointer}
    .primary{cursor:pointer}
  `;
  document.head.appendChild(nativeStyle);

  const adaptive=svg.querySelector('#adaptive-bg');
  if(!adaptive)return;
  const packets=[...adaptive.querySelectorAll('.ab-packet')];
  const routes=[...adaptive.querySelectorAll('.ab-route')];
  const relays=[...adaptive.querySelectorAll('.ab-relay')];
  const links=[...adaptive.querySelectorAll('.ab-link')];
  const NS='http://www.w3.org/2000/svg';
  if(!packets.length||!relays.length)return;

  // Freeze relay coordinates. They are infrastructure, not floating objects.
  const fixed=relays.map(el=>({el,x:parseFloat(el.getAttribute('x')||0),y:parseFloat(el.getAttribute('y')||0)}));
  const restore=()=>fixed.forEach(n=>{if(n.el.getAttribute('x')!==String(n.x)||n.el.getAttribute('y')!==String(n.y)){n.el.setAttribute('x',n.x.toFixed(1));n.el.setAttribute('y',n.y.toFixed(1))}});
  const observer=new MutationObserver(muts=>{
    let changed=false;
    for(const m of muts){if(m.type==='attributes'&&(m.attributeName==='x'||m.attributeName==='y')){changed=true;break}}
    if(changed){restore();rewire()}
  });
  relays.forEach(r=>observer.observe(r,{attributes:true,attributeFilter:['x','y']}));

  const routePaths=()=>routes.map(r=>r.getAttribute('d')).filter(Boolean);
  let knownPaths=routePaths();
  function randomPacket(p){
    const motion=p.firstElementChild;
    if(!motion||!knownPaths.length)return;
    motion.setAttribute('path',knownPaths[Math.floor(rand()*knownPaths.length)]);
    motion.setAttribute('begin',`${(rand()*3.8).toFixed(2)}s`);
    motion.setAttribute('dur',`${(4.0+rand()*8.2).toFixed(1)}s`);
    p.style.opacity=(.22+rand()*.6).toFixed(2);
  }

  function rewire(){
    if(!links.length)return;
    const shuffled=fixed.slice().sort(()=>rand()-.5);
    links.forEach((l,i)=>{
      const a=shuffled[i%shuffled.length], b=shuffled[(i*7+3)%shuffled.length];
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      l.setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${mx.toFixed(1)} ${(my-32-rand()*28).toFixed(1)} ${(mx+rand()*40-20).toFixed(1)} ${(my+32+rand()*28).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      l.classList.toggle('hot',rand()>.82);
    });
  }

  function packetDecision(){
    knownPaths=routePaths();
    packets.forEach(p=>{if(rand()>.34)randomPacket(p)});
    setTimeout(packetDecision,2400+rand()*13500);
  }

  function localRelayEvent(){
    if(reduced||!relays.length)return;
    const active=fixed[Math.floor(rand()*fixed.length)];
    active.el.classList.add('hot');
    setTimeout(()=>active.el.classList.remove('hot'),320+rand()*1250);
    const nearby=fixed.filter(n=>n!==active&&Math.hypot(n.x-active.x,n.y-active.y)<210);
    if(nearby.length&&rand()>.28){
      const n=nearby[Math.floor(rand()*nearby.length)];n.el.classList.add('hot');setTimeout(()=>n.el.classList.remove('hot'),220+rand()*900);
    }
  }

  function rewireEvent(){
    rewire();
    setTimeout(()=>rewire(),500+rand()*1400);
  }

  function splitEvent(){
    if(reduced||!packets.length)return;
    const source=packets[Math.floor(rand()*packets.length)];
    const clone=source.cloneNode(true);
    clone.classList.add('interaction-child');
    clone.style.opacity='.22';
    adaptive.appendChild(clone);
    randomPacket(clone);
    setTimeout(()=>clone.remove(),650+rand()*1800);
  }

  function localLinkPulse(){
    if(!links.length)return;
    const count=1+Math.floor(rand()*4);
    for(let i=0;i<count;i++){
      const l=links[Math.floor(rand()*links.length)];
      l.classList.add('hot');
      setTimeout(()=>l.classList.remove('hot'),350+rand()*1600);
    }
  }

  // Pointer affects only emphasis, never geometry.
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||reduced||!relays.length)return;
    const x=e.clientX/innerWidth*1600,y=e.clientY/innerHeight*900;
    relays.forEach(r=>{
      const rx=parseFloat(r.getAttribute('x')||0),ry=parseFloat(r.getAttribute('y')||0);
      const d=Math.hypot(rx-x,ry-y);
      r.classList.toggle('hot',d<88);
    });
  },{passive:true});

  function idleEvent(){
    knownPaths=routePaths();
    const roll=rand();
    if(roll>.18)packetDecision();
    if(roll>.42)localRelayEvent();
    if(roll>.58)localLinkPulse();
    if(roll>.72)rewireEvent();
    if(roll>.84)splitEvent();
    setTimeout(idleEvent,2900+rand()*17800);
  }

  restore();
  rewire();
  if(!reduced){
    setTimeout(idleEvent,1600+rand()*4500);
    setTimeout(packetDecision,900+rand()*3200);
  }
})();
