/* ROUTER 448461 quiet-intelligence background engine: visual-only, independent from referral UI. */
(()=>{
  const scene=document.querySelector('.scene');
  const svg=scene?.querySelector('svg');
  if(!svg || svg.querySelector('#adaptive-bg')) return;
  const NS='http://www.w3.org/2000/svg';
  const g=document.createElementNS(NS,'g'); g.id='adaptive-bg'; g.setAttribute('aria-hidden','true'); svg.appendChild(g);
  const css=document.createElement('style');
  css.textContent=`
    #adaptive-bg .ab-link{fill:none;stroke:#9fb69a;stroke-width:.38;stroke-dasharray:2 17;opacity:.07;transition:opacity 1.2s}
    #adaptive-bg .ab-link.hot{opacity:.20}
    #adaptive-bg .ab-route{fill:none;stroke-width:.82;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:7 26;opacity:.085;transition:opacity 1.1s}
    #adaptive-bg .ab-route.active{opacity:.56}
    #adaptive-bg .ab-relay{fill:#b8c9b1;opacity:.075;transition:opacity .7s}
    #adaptive-bg .ab-relay.hot{fill:#c8ff3d;opacity:.30}
    #adaptive-bg .ab-relay.dim{opacity:.025}
    #adaptive-bg .ab-packet{opacity:.58;filter:url(#blur2)}
    #adaptive-bg .ab-packet.slow{opacity:.38}
    #adaptive-bg .ab-packet.handoff{opacity:1;filter:url(#blur)}
    #adaptive-bg .ab-memory{fill:none;stroke:#d6e2d2;stroke-width:.38;opacity:0}
    #adaptive-bg .ab-memory.show{animation:ab-memory 5.2s ease-out forwards}
    #adaptive-bg .ab-burst{fill:#dce7d9;opacity:0;animation:ab-burst 1.25s ease-out forwards}
    #adaptive-bg .ab-core-ring{fill:none;stroke:#9fb69a;stroke-width:.42;stroke-dasharray:2 20;opacity:.11;transform-origin:800px 450px;animation:ab-spin 31s linear infinite}
    #adaptive-bg .ab-core-ring.r2{stroke:#c8ff3d;stroke-dasharray:1 28;opacity:.13;animation-duration:21s;animation-direction:reverse}
    #adaptive-bg .ab-signal{fill:none;stroke:#c8ff3d;stroke-width:.55;opacity:0}
    #adaptive-bg .ab-signal.show{animation:ab-signal 2.4s ease-out forwards}
    #adaptive-bg .ab-scan{stroke:#c8ff3d;stroke-width:.65;opacity:0;animation:ab-scan 2.8s ease-out forwards}
    #adaptive-bg .ab-starlink-orbit{fill:none;stroke:#dbe5df;stroke-width:.42;stroke-dasharray:2 18;opacity:.08}
    #adaptive-bg .ab-depth{fill:none;stroke:#9fb69a;stroke-width:.34;opacity:.045;filter:url(#blur2)}
    .ab-handoff-overlay{position:fixed;inset:0;z-index:15;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(200,255,61,.16),transparent 22%,rgba(0,0,0,0) 58%);transition:opacity .18s}
    .ab-handoff-overlay.show{opacity:1}
    .ab-handoff-label{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);z-index:16;pointer-events:none;color:#c8ff3d;font:700 11px/1 Menlo,monospace;letter-spacing:.22em;text-shadow:0 0 18px rgba(200,255,61,.5);opacity:0;transition:opacity .16s,transform .16s}
    .ab-handoff-label.show{opacity:.88;transform:translate(-50%,-50%) scale(1)}
    @keyframes ab-memory{0%{opacity:.22;transform:scale(.55)}100%{opacity:0;transform:scale(2)}}
    @keyframes ab-burst{0%{opacity:0;transform:scale(.35)}26%{opacity:.42}100%{opacity:0;transform:scale(2)}}
    @keyframes ab-signal{0%{opacity:0;stroke-dasharray:1 100}24%{opacity:.28}100%{opacity:0;stroke-dasharray:26 20}}
    @keyframes ab-scan{0%{opacity:0;transform:translateY(-180px)}22%{opacity:.12}75%{opacity:.05}100%{opacity:0;transform:translateY(980px)}}
    @keyframes ab-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .ab-memory.show,#adaptive-bg .ab-burst,#adaptive-bg .ab-core-ring,#adaptive-bg .ab-signal.show,#adaptive-bg .ab-scan{animation:none!important}.ab-handoff-overlay,.ab-handoff-label{transition:none!important}}
    @media(max-width:740px){#adaptive-bg .ab-relay{opacity:.06}#adaptive-bg .ab-link{opacity:.045}}
  `;
  svg.appendChild(css);

  let seed=448461;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
  const anchors=[[160,195],[1440,195],[150,790],[1450,790],[800,790]];
  const colours=['#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  const personalities=[{bend:70,speed:5.1},{bend:44,speed:5.9},{bend:88,speed:6.7},{bend:56,speed:5.5},{bend:122,speed:7.4}];
  const relays=[];
  const relayGroup=make('g'),links=make('g'),routes=make('g'),packets=make('g'),memory=make('g'),bursts=make('g'),depth=make('g'),scans=make('g');
  g.append(depth,relayGroup,links,routes,packets,memory,bursts,scans);

  for(let i=0;i<30;i++){
    let x=110+rand()*1380,y=120+rand()*650;
    if(Math.hypot(x-800,y-450)<128){x+=rand()>.5?150:-150;y+=rand()>.5?90:-90}
    const hot=i%13===0;
    const r=make('rect',{x:x.toFixed(1),y:y.toFixed(1),width:hot?5:3,height:hot?5:3,rx:'1',class:hot?'ab-relay hot':'ab-relay'});
    relayGroup.appendChild(r); relays.push({x,y,r,hot});
  }
  for(let i=0;i<6;i++){
    const x=170+i*245, y=150+(i%2)*520;
    depth.appendChild(make('path',{d:`M${x} ${y} C${x+90} ${y-60} ${x+160} ${y+70} ${x+250} ${y}`,class:'ab-depth'}));
  }

  const starOrbit=make('ellipse',{cx:800,cy:450,rx:390,ry:155,class:'ab-starlink-orbit'});
  g.appendChild(starOrbit);

  function routePath(i,variant){
    const [ex,ey]=anchors[i],sx=800,sy=450,vx=ex-sx,vy=ey-sy,len=Math.hypot(vx,vy)||1;
    const px=-vy/len,py=vx/len,base=personalities[i].bend,sign=variant%2?-1:1;
    const bend=(base+variant*18)*sign,drift=(rand()-.5)*24;
    const c1=[sx+vx*.19+px*bend+drift,sy+vy*.19+py*bend-drift*.3];
    const c2=[sx+vx*.48-px*bend*.60-drift,sy+vy*.48-py*bend*.60+drift*.3];
    const c3=[sx+vx*.77+px*bend*.30+drift*.4,sy+vy*.77+py*bend*.30-drift*.2];
    return `M${sx} ${sy} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c3[0].toFixed(1)} ${c3[1].toFixed(1)} S${ex} ${ey} ${ex} ${ey}`;
  }
  function rebuildLinks(){
    links.innerHTML='';
    for(let i=0;i<relays.length;i++){
      const a=relays[i],b=relays[(i*11+7)%relays.length],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      links.appendChild(make('path',{d:`M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${mx.toFixed(1)} ${(my-28).toFixed(1)} ${mx.toFixed(1)} ${(my+28).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,class:'ab-link'}));
    }
  }
  rebuildLinks();

  const routeVariants=[];
  for(let i=0;i<5;i++){
    routeVariants[i]=[];
    for(let v=0;v<4;v++){
      const p=make('path',{d:routePath(i,v),class:'ab-route',stroke:colours[i]});
      routes.appendChild(p); routeVariants[i].push(p);
    }
    const dot=make('circle',{r:i===4?'3.6':'3',class:`ab-packet ${i===4?'slow':''}`,fill:colours[i]});
    const motion=make('animateMotion',{dur:(personalities[i].speed+rand()*1.6).toFixed(1)+'s',repeatCount:'indefinite',path:routePath(i,Math.floor(rand()*4)),begin:(rand()*2).toFixed(2)+'s'});
    dot.appendChild(motion);dot.dataset.route=i;packets.appendChild(dot);
    if(i%2===0){
      const dot2=make('circle',{r:'2',class:'ab-packet',fill:colours[i]});
      const motion2=make('animateMotion',{dur:(personalities[i].speed+1.8+rand()*1.8).toFixed(1)+'s',repeatCount:'indefinite',path:routePath(i,Math.floor(rand()*4)),begin:(1+rand()*2).toFixed(2)+'s'});
      dot2.appendChild(motion2);dot2.dataset.route=i;packets.appendChild(dot2);
    }
  }
  g.append(make('circle',{cx:800,cy:450,r:235,class:'ab-core-ring'}),make('circle',{cx:800,cy:450,r:162,class:'ab-core-ring r2'}));

  const state={variant:0,focus:-1};
  function reroute(){
    state.variant=Math.floor(rand()*4);
    routeVariants.forEach((group,i)=>group.forEach((p,v)=>{p.setAttribute('d',routePath(i,v));p.style.opacity=state.focus===i?(v===state.variant?'.56':'.035'):'.085'}));
    packets.querySelectorAll('.ab-packet').forEach(p=>{
      const r=Number(p.dataset.route),v=Math.floor(rand()*4),m=p.firstElementChild;
      m.setAttribute('path',routePath(r,v));m.setAttribute('dur',(personalities[r].speed+1+rand()*2.2).toFixed(1)+'s');m.setAttribute('begin',(rand()*1.7).toFixed(2)+'s');
    });
    links.querySelectorAll('.ab-link').forEach((l,i)=>l.classList.toggle('hot',i%9===state.variant));
  }
  function topologyShift(){
    for(let i=0;i<4;i++){
      const r=relays[Math.floor(rand()*relays.length)],oldX=r.x,oldY=r.y;
      r.x=Math.max(80,Math.min(1520,r.x+(rand()-.5)*120));r.y=Math.max(100,Math.min(800,r.y+(rand()-.5)*95));
      r.r.setAttribute('x',r.x.toFixed(1));r.r.setAttribute('y',r.y.toFixed(1));
      const trace=make('line',{x1:oldX,y1:oldY,x2:r.x,y2:r.y,class:'ab-signal show'});g.appendChild(trace);setTimeout(()=>trace.remove(),2500);
    }
    rebuildLinks();
  }
  function memoryPulse(){
    for(let i=0;i<4;i++){
      const r=relays[Math.floor(rand()*relays.length)];
      r.r.classList.add('hot');setTimeout(()=>r.r.classList.remove('hot'),1000);
      const c=make('circle',{cx:r.x,cy:r.y,r:(6+rand()*9).toFixed(1),class:'ab-memory show'});memory.appendChild(c);setTimeout(()=>c.remove(),5200);
    }
  }
  function eventBurst(){
    const n=4+Math.floor(rand()*5);
    for(let i=0;i<n;i++){const r=relays[Math.floor(rand()*relays.length)],q=make('rect',{x:r.x-2,y:r.y-2,width:'4',height:'4',class:'ab-burst'});bursts.appendChild(q);setTimeout(()=>q.remove(),1300)}
  }
  function scan(){scans.appendChild(make('line',{x1:'0',y1:'0',x2:'1600',y2:'0',class:'ab-scan'})) ;setTimeout(()=>scans.lastElementChild?.remove(),3000)}
  function decisionEvent(){reroute();topologyShift();if(rand()>.25)memoryPulse();if(rand()>.70)eventBurst();if(rand()>.45)scan()}
  function setFocus(index){
    state.focus=index;
    routeVariants.forEach((group,i)=>group.forEach((p,v)=>p.style.opacity=index>=0?(i===index&&v===state.variant?'.68':'.018'):'.085'));
    relayGroup.querySelectorAll('.ab-relay').forEach((r,i)=>r.classList.toggle('dim',index>=0 && i%5!==index));
  }
  [...document.querySelectorAll('.card')].forEach((c,i)=>{
    c.addEventListener('mouseenter',()=>setFocus(i));
    c.addEventListener('focusin',()=>setFocus(i));
    c.addEventListener('mouseleave',()=>{if(!c.matches(':focus-within'))setFocus(-1)});
  });

  const overlay=document.createElement('div');overlay.className='ab-handoff-overlay';document.body.appendChild(overlay);
  const label=document.createElement('div');label.className='ab-handoff-label';label.textContent='ROUTE LOCK // HANDOFF';document.body.appendChild(label);
  function handoff(card){
    const i=[...document.querySelectorAll('.card')].indexOf(card);
    if(i<0)return;
    setFocus(i);
    overlay.classList.add('show');label.classList.add('show');
    const p=make('circle',{r:'4.6',class:'ab-packet handoff',fill:colours[i]});
    const m=make('animateMotion',{dur:'.55s',repeatCount:'1',path:routePath(i,state.variant)});p.appendChild(m);packets.appendChild(p);
    setTimeout(()=>{overlay.classList.remove('show');label.classList.remove('show');p.remove()},720);
  }
  document.addEventListener('click',e=>{
    const primary=e.target.closest?.('.card .primary');
    if(!primary)return;
    const card=primary.closest('.card');
    if(!card)return;
    e.preventDefault();e.stopImmediatePropagation();
    handoff(card);
    const url=card.dataset.u;
    setTimeout(()=>window.open(url,'_blank','noopener,noreferrer'),560);
  },true);

  reroute();
  setTimeout(decisionEvent,3200);
  setInterval(decisionEvent,9800+Math.floor(rand()*5200));
  setInterval(()=>{if(rand()>.3)memoryPulse()},5600+Math.floor(rand()*2600));
  setInterval(()=>{if(rand()>.58)eventBurst()},9000+Math.floor(rand()*4000));
  setInterval(()=>{if(rand()>.4)scan()},17000+Math.floor(rand()*9000));

  const media=matchMedia('(max-width:740px), (prefers-reduced-motion: reduce)');
  const updateMode=()=>{if(media.matches){svg.style.setProperty('--ab-lowpower','1');packets.style.opacity='.72'}else{svg.style.removeProperty('--ab-lowpower');packets.style.opacity=''}};
  media.addEventListener?.('change',updateMode);updateMode();
  window.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;svg.style.transform=`translate(${(-x*2.2).toFixed(2)}px,${(-y*1.4).toFixed(2)}px)`});
  window.addEventListener('pointerleave',()=>svg.style.transform='');
})();