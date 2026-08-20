/* ROUTER 448461 adaptive background engine: visual-only, independent from referral UI. */
(()=>{
  const svg=document.querySelector('.scene svg');
  if(!svg || svg.querySelector('#adaptive-bg')) return;
  const NS='http://www.w3.org/2000/svg';
  const g=document.createElementNS(NS,'g'); g.id='adaptive-bg'; g.setAttribute('aria-hidden','true'); svg.appendChild(g);
  const css=document.createElement('style'); css.textContent=`
    #adaptive-bg .ab-link{fill:none;stroke:#9fb69a;stroke-width:.42;stroke-dasharray:2 15;opacity:.10}
    #adaptive-bg .ab-route{fill:none;stroke-width:.9;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:8 24;opacity:.12}
    #adaptive-bg .ab-route.active{opacity:.42}
    #adaptive-bg .ab-relay{fill:#b8c9b1;opacity:.12}
    #adaptive-bg .ab-relay.hot{fill:#c8ff3d;opacity:.34}
    #adaptive-bg .ab-relay.dim{opacity:.04}
    #adaptive-bg .ab-packet{opacity:.7;filter:url(#blur2)}
    #adaptive-bg .ab-packet.slow{opacity:.45}
    #adaptive-bg .ab-memory{fill:none;stroke:#d6e2d2;stroke-width:.42;opacity:0}
    #adaptive-bg .ab-memory.show{animation:ab-memory 4.6s ease-out forwards}
    #adaptive-bg .ab-burst{fill:#dce7d9;opacity:0;animation:ab-burst 1.15s ease-out forwards}
    #adaptive-bg .ab-core-ring{fill:none;stroke:#9fb69a;stroke-width:.46;stroke-dasharray:2 18;opacity:.13;transform-origin:800px 450px;animation:ab-spin 28s linear infinite}
    #adaptive-bg .ab-core-ring.r2{stroke:#c8ff3d;stroke-dasharray:1 24;opacity:.16;animation-duration:19s;animation-direction:reverse}
    #adaptive-bg .ab-signal{fill:none;stroke:#c8ff3d;stroke-width:.6;opacity:0}
    #adaptive-bg .ab-signal.show{animation:ab-signal 2.2s ease-out forwards}
    #adaptive-bg .ab-glyph{fill:#b9c8b4;opacity:.08;font:9px Menlo,monospace}
    @keyframes ab-memory{0%{opacity:.28;transform:scale(.55)}100%{opacity:0;transform:scale(1.9)}}
    @keyframes ab-burst{0%{opacity:0;transform:scale(.35)}28%{opacity:.52}100%{opacity:0;transform:scale(1.9)}}
    @keyframes ab-signal{0%{opacity:0;stroke-dasharray:1 100}25%{opacity:.35}100%{opacity:0;stroke-dasharray:26 20}}
    @keyframes ab-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .ab-memory.show,#adaptive-bg .ab-burst,#adaptive-bg .ab-core-ring,#adaptive-bg .ab-signal.show{animation:none!important}}
  `; svg.appendChild(css);
  let seed=448461; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
  const anchors=[[160,195],[1440,195],[150,790],[1450,790],[800,790]];
  const colours=['#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  const personalities=[{bend:72,speed:4.7},{bend:46,speed:5.6},{bend:92,speed:6.4},{bend:58,speed:5.15},{bend:118,speed:7.2}];
  const relays=[]; const relayGroup=make('g',{class:'relayField'}),links=make('g',{class:'linkField'}),routes=make('g',{class:'routeField'}),packets=make('g',{class:'packetField'}),memory=make('g',{class:'memoryField'}),bursts=make('g',{class:'burstField'}),glyphs=make('g',{class:'glyphField'}); g.append(relayGroup,links,routes,packets,memory,bursts,glyphs);
  for(let i=0;i<34;i++){let x=95+rand()*1410,y=108+rand()*680;if(Math.hypot(x-800,y-450)<125){x+=rand()>.5?155:-155;y+=rand()>.5?95:-95}const hot=i%11===0;const r=make('rect',{x:x.toFixed(1),y:y.toFixed(1),width:hot?5:3,height:hot?5:3,rx:'1',class:hot?'ab-relay hot':'ab-relay'});relayGroup.appendChild(r);relays.push({x,y,r,hot});}
  const glyphChars=['0','1','A','F','7','C','Λ','∑','⊕']; for(let i=0;i<18;i++){const x=130+rand()*1340,y=130+rand()*640;const t=make('text',{x,y,class:'ab-glyph'});t.textContent=glyphChars[Math.floor(rand()*glyphChars.length)];glyphs.appendChild(t)}
  function routePath(i,variant){const [ex,ey]=anchors[i],sx=800,sy=450,vx=ex-sx,vy=ey-sy,len=Math.hypot(vx,vy)||1,px=-vy/len,py=vx/len,base=personalities[i].bend,sign=variant%2?-1:1,bend=(base+variant*21)*sign,drift=(rand()-.5)*34,c1=[sx+vx*.19+px*bend+drift,sy+vy*.19+py*bend-drift*.3],c2=[sx+vx*.48-px*bend*.62-drift,sy+vy*.48-py*bend*.62+drift*.3],c3=[sx+vx*.76+px*bend*.32+drift*.5,sy+vy*.76+py*bend*.32-drift*.2];return `M${sx} ${sy} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c3[0].toFixed(1)} ${c3[1].toFixed(1)} S${ex} ${ey} ${ex} ${ey}`}
  function rebuildLinks(){links.innerHTML='';for(let i=0;i<relays.length;i++){const a=relays[i],b=relays[(i*13+5)%relays.length],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;links.appendChild(make('path',{d:`M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${mx.toFixed(1)} ${(my-32).toFixed(1)} ${mx.toFixed(1)} ${(my+32).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,class:'ab-link'}))}}
  rebuildLinks();
  const routeVariants=[];
  for(let i=0;i<5;i++){routeVariants[i]=[];for(let v=0;v<4;v++){const p=make('path',{d:routePath(i,v),class:'ab-route',stroke:colours[i]});routes.appendChild(p);routeVariants[i].push(p)}const dot=make('circle',{r:i===4?'3.8':'3.1',class:`ab-packet ${i===4?'slow':''}`,fill:colours[i]}),m=make('animateMotion',{dur:(personalities[i].speed+rand()*1.8).toFixed(1)+'s',repeatCount:'indefinite',path:routePath(i,Math.floor(rand()*4)),begin:(rand()*2.2).toFixed(2)+'s'});dot.appendChild(m);dot.dataset.route=i;packets.appendChild(dot);if(i%2===0){const dot2=make('circle',{r:'2.1',class:'ab-packet',fill:colours[i]}),m2=make('animateMotion',{dur:(personalities[i].speed+1.7+rand()*2).toFixed(1)+'s',repeatCount:'indefinite',path:routePath(i,Math.floor(rand()*4)),begin:(1.2+rand()*2).toFixed(2)+'s'});dot2.appendChild(m2);dot2.dataset.route=i;packets.appendChild(dot2)}}
  g.append(make('circle',{cx:800,cy:450,r:235,class:'ab-core-ring'}),make('circle',{cx:800,cy:450,r:162,class:'ab-core-ring r2'}));
  const state={variant:0,focus:-1};
  function reroute(){state.variant=Math.floor(rand()*4);routeVariants.forEach((group,i)=>group.forEach((p,v)=>{p.setAttribute('d',routePath(i,v));p.style.opacity=state.focus===i?(v===state.variant?.56:.08):'.12'}));packets.querySelectorAll('.ab-packet').forEach(p=>{const r=Number(p.dataset.route),v=Math.floor(rand()*4),m=p.firstElementChild;m.setAttribute('path',routePath(r,v));m.setAttribute('dur',(personalities[r].speed+1+rand()*2.6).toFixed(1)+'s');m.setAttribute('begin',(rand()*1.9).toFixed(2)+'s')});links.querySelectorAll('.ab-link').forEach((l,i)=>l.style.opacity=i%7===state.variant?.23:.10)}
  function topologyShift(){for(let i=0;i<6;i++){const r=relays[Math.floor(rand()*relays.length)],oldX=r.x,oldY=r.y;r.x=Math.max(70,Math.min(1530,r.x+(rand()-.5)*160));r.y=Math.max(95,Math.min(805,r.y+(rand()-.5)*120));r.r.setAttribute('x',r.x.toFixed(1));r.r.setAttribute('y',r.y.toFixed(1));const trace=make('line',{x1:oldX,y1:oldY,x2:r.x,y2:r.y,class:'ab-signal show'});g.appendChild(trace);setTimeout(()=>trace.remove(),2300)}rebuildLinks()}
  function memoryPulse(){for(let i=0;i<6;i++){const r=relays[Math.floor(rand()*relays.length)];r.r.classList.add('hot');setTimeout(()=>r.r.classList.remove('hot'),900);const c=make('circle',{cx:r.x,cy:r.y,r:(6+rand()*10).toFixed(1),class:'ab-memory show'});memory.appendChild(c);setTimeout(()=>c.remove(),4700)}}
  function eventBurst(){for(let i=0,n=6+Math.floor(rand()*7);i<n;i++){const r=relays[Math.floor(rand()*relays.length)];const q=make('rect',{x:r.x-2,y:r.y-2,width:'4',height:'4',class:'ab-burst'});bursts.appendChild(q);setTimeout(()=>q.remove(),1200)}}
  function decisionEvent(){reroute();topologyShift();memoryPulse();if(rand()>.45)eventBurst()}
  function setFocus(index){state.focus=index;if(index>=0){routeVariants.forEach((group,i)=>group.forEach((p,v)=>p.style.opacity=i===index&&v===state.variant?'.72':'.035'));relayGroup.querySelectorAll('.ab-relay').forEach((r,i)=>r.classList.toggle('dim',i%5!==index))}else{routeVariants.forEach(group=>group.forEach(p=>p.style.opacity='.12'));relayGroup.querySelectorAll('.ab-relay').forEach(r=>r.classList.remove('dim'))}}
  [...document.querySelectorAll('.card')].forEach((c,i)=>{c.addEventListener('mouseenter',()=>setFocus(i));c.addEventListener('focusin',()=>setFocus(i));c.addEventListener('mouseleave',()=>{if(!c.matches(':focus-within'))setFocus(-1)})});
  reroute();setTimeout(decisionEvent,2600);setInterval(decisionEvent,9200+Math.floor(rand()*4200));setInterval(memoryPulse,5100+Math.floor(rand()*2200));setInterval(()=>{if(rand()>.35)eventBurst()},7600+Math.floor(rand()*3000));
  const media=matchMedia('(max-width:740px), (prefers-reduced-motion: reduce)'); media.addEventListener?.('change',()=>{});
  window.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;svg.style.transform=`translate(${(-x*2.5).toFixed(2)}px,${(-y*1.6).toFixed(2)}px)`});window.addEventListener('pointerleave',()=>svg.style.transform='');
})();
