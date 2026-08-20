/* ROUTER 448461 adaptive background engine: visual-only, no referral logic. */
(()=>{
  const svg=document.querySelector('.scene svg');
  if(!svg || svg.querySelector('#adaptive-bg')) return;
  const NS='http://www.w3.org/2000/svg';
  const g=document.createElementNS(NS,'g'); g.id='adaptive-bg'; g.setAttribute('aria-hidden','true'); svg.appendChild(g);
  const css=document.createElement('style'); css.textContent=`
    #adaptive-bg .ab-link{fill:none;stroke:#9fb69a;stroke-width:.45;stroke-dasharray:2 13;opacity:.12}
    #adaptive-bg .ab-route{fill:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:10 22;opacity:.16}
    #adaptive-bg .ab-relay{fill:#b8c9b1;opacity:.16}
    #adaptive-bg .ab-relay.hot{fill:#c8ff3d;opacity:.36}
    #adaptive-bg .ab-packet{opacity:.72;filter:url(#blur2)}
    #adaptive-bg .ab-memory{fill:none;stroke:#d6e2d2;stroke-width:.45;opacity:0}
    #adaptive-bg .ab-memory.show{animation:ab-memory 3.8s ease-out forwards}
    #adaptive-bg .ab-burst{fill:#dce7d9;opacity:0;animation:ab-burst .9s ease-out forwards}
    #adaptive-bg .ab-core-ring{fill:none;stroke:#9fb69a;stroke-width:.5;stroke-dasharray:2 15;opacity:.18;transform-origin:800px 450px;animation:ab-spin 22s linear infinite}
    @keyframes ab-memory{0%{opacity:.34;transform:scale(.6)}100%{opacity:0;transform:scale(1.8)}}
    @keyframes ab-burst{0%{opacity:0;transform:scale(.4)}30%{opacity:.55}100%{opacity:0;transform:scale(1.8)}}
    @keyframes ab-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .ab-memory.show,#adaptive-bg .ab-burst,#adaptive-bg .ab-core-ring{animation:none!important}}
  `; svg.appendChild(css);
  let seed=448461; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
  const anchors=[[160,195],[1440,195],[150,790],[1450,790],[800,790]];
  const relays=[]; const links=make('g'), routes=make('g'), packets=make('g'), memory=make('g'), bursts=make('g');
  g.append(routes,links,relays.length?relays:make('g'),packets,memory,bursts); const relayGroup=make('g'); g.insertBefore(relayGroup,packets);
  for(let i=0;i<28;i++){
    let x=110+rand()*1380,y=125+rand()*650;
    if(Math.hypot(x-800,y-450)<125){x+=rand()>.5?150:-150;y+=rand()>.5?90:-90}
    const r=make('rect',{x:x.toFixed(1),y:y.toFixed(1),width:i%6===0?5:3.2,height:i%6===0?5:3.2,rx:'1',class:i%9===0?'ab-relay hot':'ab-relay'});
    relayGroup.appendChild(r); relays.push([x,y,r]);
  }
  for(let i=0;i<relays.length;i++){
    const a=relays[i], b=relays[(i*11+7)%relays.length];
    const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
    links.appendChild(make('path',{d:`M${a[0].toFixed(1)} ${a[1].toFixed(1)} C${mx.toFixed(1)} ${(my-26).toFixed(1)} ${mx.toFixed(1)} ${(my+26).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`,class:'ab-link'}));
  }
  const colours=['#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  function routePath(i,variant){
    const [ex,ey]=anchors[i], sx=800, sy=450, vx=ex-sx, vy=ey-sy, len=Math.hypot(vx,vy)||1;
    const px=-vy/len, py=vx/len, bend=(variant%2?1:-1)*(55+variant*26);
    const c1=[sx+vx*.20+px*bend,sy+vy*.20+py*bend], c2=[sx+vx*.48-px*bend*.65,sy+vy*.48-py*bend*.65], c3=[sx+vx*.78+px*bend*.35,sy+vy*.78+py*bend*.35];
    return `M${sx} ${sy} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c3[0].toFixed(1)} ${c3[1].toFixed(1)} S${ex} ${ey} ${ex} ${ey}`;
  }
  for(let i=0;i<5;i++){
    const pg=[];
    for(let v=0;v<3;v++){
      const p=make('path',{d:routePath(i,v),class:'ab-route',stroke:colours[i]}); routes.appendChild(p); pg.push(p);
    }
    const dot=make('circle',{r:'3.2',class:'ab-packet',fill:colours[i]});
    const motion=make('animateMotion',{dur:(5.2+i*.55).toFixed(1)+'s',repeatCount:'indefinite',path:routePath(i,i%3),begin:(i*.4).toFixed(2)+'s'}); dot.appendChild(motion); packets.appendChild(dot); dot.dataset.route=i;
  }
  g.appendChild(make('circle',{cx:800,cy:450,r:220,class:'ab-core-ring'}));
  function reroute(){
    document.querySelectorAll('#adaptive-bg .ab-route').forEach((p,idx)=>{const i=Math.floor(idx/3),v=Math.floor(rand()*3);p.setAttribute('d',routePath(i,v));});
    document.querySelectorAll('#adaptive-bg .ab-packet').forEach((p,i)=>{const r=Number(p.dataset.route),v=Math.floor(rand()*3),m=p.firstElementChild;m.setAttribute('path',routePath(r,v));m.setAttribute('begin',(rand()*1.8).toFixed(2)+'s');});
  }
  function memoryPulse(){for(let i=0;i<5;i++){const [x,y]=relays[Math.floor(rand()*relays.length)];const c=make('circle',{cx:x,cy:y,r:(6+rand()*7).toFixed(1),class:'ab-memory show'});memory.appendChild(c);setTimeout(()=>c.remove(),3900);}}
  function burst(){for(let i=0;i<7;i++){const [x,y]=relays[Math.floor(rand()*relays.length)];const q=make('rect',{x:x-2,y:y-2,width:'4',height:'4',class:'ab-burst'});bursts.appendChild(q);setTimeout(()=>q.remove(),1000);}}
  reroute(); setInterval(reroute,7800); setInterval(memoryPulse,6100); setInterval(burst,11200); setTimeout(burst,2500);
  window.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;scene.setProperty('--abx',`${x*6}px`);scene.setProperty('--aby',`${y*3}px`)});
})();